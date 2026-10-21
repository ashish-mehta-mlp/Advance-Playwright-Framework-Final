/**
 * First Groq-backed data-generation agent: create and validate a booking payload.
 * The generated booking is reported, but deliberately is not posted to the live API.
 */
import { test, expect } from '@playwright/test';
import type { Booking } from '../../api/BookingAPI';

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const ALLOWED_NEEDS = new Set(['Breakfast', 'Late checkout', 'Extra bed']);

interface GroqChatCompletion {
    choices?: Array<{
        message?: { content?: string | null };
    }>;
}

function isValidIsoDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateBooking(value: unknown): asserts value is Booking {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Groq returned a booking value that is not a JSON object.');
    }

    const booking = value as Record<string, unknown>;
    const dates = booking.bookingdates;
    if (
        typeof booking.firstname !== 'string' || !booking.firstname.trim() ||
        typeof booking.lastname !== 'string' || !booking.lastname.trim() ||
        typeof booking.totalprice !== 'number' || !Number.isFinite(booking.totalprice) || booking.totalprice < 0 ||
        typeof booking.depositpaid !== 'boolean' ||
        typeof dates !== 'object' || dates === null || Array.isArray(dates)
    ) {
        throw new Error('Groq returned a booking with missing or invalid required fields.');
    }

    const bookingDates = dates as Record<string, unknown>;
    if (
        typeof bookingDates.checkin !== 'string' || !isValidIsoDate(bookingDates.checkin) ||
        typeof bookingDates.checkout !== 'string' || !isValidIsoDate(bookingDates.checkout) ||
        bookingDates.checkout <= bookingDates.checkin
    ) {
        throw new Error('Groq returned invalid booking dates; expected ISO dates with checkout after check-in.');
    }

    if (
        booking.additionalneeds !== undefined &&
        (typeof booking.additionalneeds !== 'string' || !ALLOWED_NEEDS.has(booking.additionalneeds))
    ) {
        throw new Error('Groq returned an unsupported additionalneeds value.');
    }
}

test('Groq CustomDataGenerator creates three valid booking payloads', async ({ }, testInfo) => {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    expect(apiKey, 'Set GROQ_API_KEY in .env to run the Groq data generator.').toBeTruthy();

    const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            temperature: 0.2,
            max_tokens: 1200,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: 'Generate realistic test data. Return only a JSON object with a bookings array containing exactly three booking objects. Do not include markdown or extra fields.',
                },
                {
                    role: 'user',
                    content: [
                        'Generate exactly three distinct RESTful Booker booking payloads in a JSON object shaped as {"bookings": [...]}.',
                        'Each booking must have firstname and lastname (non-empty strings), totalprice (number from 100 to 1000),',
                        'depositpaid (boolean), bookingdates (object with checkin and checkout as YYYY-MM-DD),',
                        'additionalneeds (one of: Breakfast, Late checkout, Extra bed).',
                        'Use future check-in dates and make checkout three nights after check-in for each booking.',
                        'Use distinct guest names across all three bookings.',
                    ].join(' '),
                },
            ],
        }),
        signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => undefined) as
            { error?: { message?: unknown } } | undefined;
        const providerMessage = typeof errorPayload?.error?.message === 'string'
            ? (apiKey ? errorPayload.error.message.replaceAll(apiKey, '[REDACTED]') : errorPayload.error.message)
                .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
                .slice(0, 300)
            : undefined;
        throw new Error(
            `Groq chat completion failed with HTTP ${response.status}` +
            (providerMessage ? `: ${providerMessage}` : '. Check GROQ_API_KEY and GROQ_MODEL.'),
        );
    }

    const completion = await response.json() as GroqChatCompletion;
    const content = completion.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('Groq returned an empty chat completion.');
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error('Groq returned content that was not valid JSON.');
    }

    if (typeof parsed !== 'object' || parsed === null || !('bookings' in parsed) || !Array.isArray(parsed.bookings)) {
        throw new Error('Groq response must contain a bookings array.');
    }
    const generatedBookings: Booking[] = parsed.bookings;
    expect(generatedBookings, 'Groq should generate exactly three booking payloads.').toHaveLength(3);

    for (const [index, generated] of generatedBookings.entries()) {
        validateBooking(generated);
        expect(new Date(`${generated.bookingdates.checkin}T00:00:00.000Z`).getTime())
            .toBeGreaterThan(Date.now() - 24 * 60 * 60 * 1000);

        const generatedJson = JSON.stringify(generated, null, 2);
        await testInfo.attach('ai-data', {
            body: generatedJson,
            contentType: 'application/json',
        });
        console.log(`Groq-generated booking ${index + 1} (validated):`);
        console.log(generatedJson);
    }

    expect(new Set(generatedBookings.map((booking) => JSON.stringify(booking))).size)
        .toBe(3);
});
