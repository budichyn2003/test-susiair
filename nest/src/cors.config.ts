const LOCAL_FRONTEND_ORIGIN = 'http://localhost:3000';

export function getCorsOrigins(configuredOrigins = process.env.CORS_ORIGIN): string[] {
  const origins = configuredOrigins
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins?.length) {
    return [LOCAL_FRONTEND_ORIGIN];
  }

  return [...new Set(origins.map(normalizeOrigin))];
}

function normalizeOrigin(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `Invalid CORS_ORIGIN value "${value}". Use an origin such as https://app.example.com without a path.`,
    );
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      `Invalid CORS_ORIGIN value "${value}". Use an http(s) origin without a path.`,
    );
  }

  return url.origin;
}
