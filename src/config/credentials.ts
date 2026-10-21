import { envOr } from './env';

export const credentials = {
    standardUser: envOr('STANDARD_USER', 'standard_user'),
    password: envOr('TTA_SECRET', 'tta_secret'),
} as const;

// We can also hardcode the credentials in this file,
// but it's better to keep them in environment variables
// for security reasons.

// export const credentials = {
//standardUser: "standard_user",
//password: "tta_secret"
// } as const;