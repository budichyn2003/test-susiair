export const LOGIC_TODAY = '2026-05-15';

const DEFAULT_AVATAR_URL =
  'https://ui-avatars.com/api/?name=John+Doe&background=0E2138&color=fff';

export function getPilotAvatarUrl(): string {
  return process.env.PILOT_AVATAR_URL ?? DEFAULT_AVATAR_URL;
}
