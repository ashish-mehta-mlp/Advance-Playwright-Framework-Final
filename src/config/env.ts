/** Reads `.env` values. Importing this module loads `.env` into process.env once. */
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const projectRoot = path.resolve(__dirname, '../..');
const envExamplePath = path.resolve(projectRoot, '.env.example');
const envCandidates = [
    path.resolve(projectRoot, '.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env'),
    envExamplePath,
];


function getEnvValue(key: string): string | undefined {
    const direct = process.env[key];
    if (typeof direct === 'string') {
        return direct;
    }

    const normalizedKey = key.toLowerCase();
    for (const [envKey, envValue] of Object.entries(process.env)) {
        if (envKey.toLowerCase() === normalizedKey && typeof envValue === 'string') {
            return envValue;
        }
    }

    return undefined;
}

function hasNonBlankEnvValue(key: string): boolean {
    const value = getEnvValue(key);
    return typeof value === 'string' && value.trim().length > 0;
}

// Load all candidates without replacing values already provided by the shell/CI.
// This lets missing keys be supplied by another .env when started elsewhere.
for (const envPath of new Set(envCandidates)) {
    if (!fs.existsSync(envPath)) {
        continue;
    }

    // `dotenv.config` is more robust than parsing raw files by hand because it
    // handles standard .env syntax and still preserves shell/CI precedence.
    const loaded = dotenv.config({
        path: envPath,
        override: false,
        processEnv: process.env,
    });

    // Keep the manual fallback for blank shell values because dotenv treats an empty
    // string as "set" and will not replace it when `override: false`.
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    for (const [key, value] of Object.entries(parsed)) {
        if (!hasNonBlankEnvValue(key) && typeof value === 'string') {
            process.env[key] = value;
        }
    }

    if (loaded.error && loaded.error.name === 'MissedEnvFileError') {
        // Ignore missing file errors here since we already guard with existsSync.
    }
}

function read(key: string): string | undefined {
    const value = getEnvValue(key);
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
}

/** Required value; throws when unset or blank. */
export function requireEnv(key: string): string {
    const value = read(key);
    if (!value) {
        throw new Error(
            `Missing required env var ${key}. Set a nonblank ${key} value in one of: ${[...new Set(envCandidates)].join(', ')} (see ${envExamplePath})`,
        );
    }
    return value;
}

/** Optional value with a fallback. */
export function envOr(key: string, fallback: string): string {
    return read(key) ?? fallback;
}

/** Asserts keys exist without returning them; reports all missing keys at once. */
export function assertEnv(...keys: string[]): void {
    const missing = keys.filter((key) => !read(key));
    if (missing.length > 0) {
        throw new Error(
            `Missing required env var(s) ${missing.join(', ')}. Set nonblank values in one of: ${[...new Set(envCandidates)].join(', ')} (see ${envExamplePath})`,
        );
    }
}