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
          throw new Error(
            'Cannot reach the server. It may be waking up; please try again in a moment.',
          );
        }
        const apiError = error;
        const statusCode =
          'statusCode' in apiError && typeof apiError.statusCode === 'number'
            ? apiError.statusCode
            : undefined;
        const message = apiError.data?.message;
        if (
          Array.isArray(message) &&
          message.some((item) => item.includes('username') || item.includes('password'))
        ) {
          throw new Error('Username and password are required.');
        }
        if (statusCode === 401) {
          throw new Error('Incorrect username or password. Please try again.');
        }
        if (
          statusCode === undefined ||
          statusCode === 0 ||
          [502, 503, 504].includes(statusCode)
        ) {
          throw new Error(
            'Cannot reach the server. It may be waking up; please try again in a moment.',
          );
        }
        throw new Error('Unable to sign in. Please try again.');
      }
    },
    logout(): void {
      this.setToken(null);
    },
  },
});
