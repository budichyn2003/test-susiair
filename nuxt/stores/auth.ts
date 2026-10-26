import { defineStore } from 'pinia';

interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
}

interface ApiError {
  statusCode?: number;
  data?: {
    message?: string | string[];
  };
  message?: string;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token: string | null): void {
      this.token = token;
    },
    async login(username: string, password: string): Promise<void> {
      const config = useRuntimeConfig();
      try {
        const response = await $fetch<LoginResponse>('/auth/login', {
          baseURL: config.public.apiBase,
          method: 'POST',
          body: { username, password },
        });
        this.setToken(response.accessToken);
      } catch (error) {
        if (!isApiError(error)) {
          throw new Error('Login gagal. Periksa koneksi dan coba lagi.');
        }
        const apiError = error;
        const message = apiError.data?.message;
        if (
          Array.isArray(message) &&
          message.some((item) => item.includes('username') || item.includes('password'))
        ) {
          throw new Error('Username dan password wajib diisi.');
        }
        if ('statusCode' in apiError && apiError.statusCode === 401) {
          throw new Error('Username atau password salah. Silakan coba lagi.');
        }
        throw new Error('Login gagal. Periksa koneksi dan coba lagi.');
      }
    },
    logout(): void {
      this.setToken(null);
    },
  },
});
