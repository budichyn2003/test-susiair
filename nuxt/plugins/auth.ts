import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  const tokenCookie = useCookie<string | null>('susiair-access-token', {
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7,
  });

  auth.setToken(tokenCookie.value);
  auth.$subscribe((_mutation, state) => {
    tokenCookie.value = state.token;
  });
});
