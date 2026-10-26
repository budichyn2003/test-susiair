import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  if (to.path !== '/' && !auth.isAuthenticated) {
    return navigateTo('/');
  }
  if (to.path === '/' && auth.isAuthenticated) {
    return navigateTo('/home');
  }
});
