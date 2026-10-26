import { useAuthStore } from '~/stores/auth';

export function usePilotApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  async function request<T>(
    path: string,
    options: { method?: 'GET' | 'POST'; body?: unknown; headers?: HeadersInit } = {},
  ) {
    if (!auth.token) {
      throw new Error('Sesi login tidak tersedia. Silakan masuk kembali.');
    }

    return await $fetch<T>(path, {
      ...options,
      baseURL: config.public.apiBase,
      headers: {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${auth.token}`,
      },
    });
  }

  return { request };
}
