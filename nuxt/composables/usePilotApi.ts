import { useAuthStore } from '~/stores/auth';

export function usePilotApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  async function request<T>(
    path: string,
    options: { method?: 'GET' | 'POST'; body?: unknown; headers?: HeadersInit } = {},
  ) {
    if (!auth.token) {
      throw new Error('Your session is not available. Please sign in again.');
    }

    try {
      return await $fetch<T>(path, {
        ...options,
        baseURL: config.public.apiBase,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${auth.token}`,
        },
      });
    } catch (error) {
      const statusCode =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof error.statusCode === 'number'
          ? error.statusCode
          : undefined;
      if (
        statusCode === undefined ||
        statusCode === 0 ||
        [502, 503, 504].includes(statusCode)
      ) {
        throw new Error(
          'Cannot reach the server. It may be waking up; please try again in a moment.',
        );
      }
      throw error;
    }
  }

  return { request };
}
