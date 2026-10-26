<script setup lang="ts">
import { ArrowRight, Plane, ShieldCheck } from '@lucide/vue';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({ layout: false });

const auth = useAuthStore();
const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

async function submitLogin(): Promise<void> {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    await auth.login(username.value.trim(), password.value);
    await navigateTo('/home');
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main class="sign-in-page">
    <section class="sign-in-card surface">
      <div class="brand-mark" aria-label="Susi Air">
        <img
          src="https://susiair.com/images/susiair-logo.png"
          alt="Susi Air"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <span>YOUR COMPLETE AIR TRANSPORT SOLUTION</span>
      </div>
      <div class="sign-in-card__intro">
        <div class="welcome-icon"><Plane :size="23" /></div>
        <p class="eyebrow">Pilot operations</p>
        <h1>Welcome back</h1>
        <p class="muted">Sign in to view your flight activity and schedule.</p>
      </div>
      <form class="login-form" @submit.prevent="submitLogin">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          autocomplete="username"
          name="username"
          placeholder="Enter your username"
          required
          type="text"
        />
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          autocomplete="current-password"
          name="password"
          placeholder="Enter your password"
          required
          type="password"
        />
        <div v-if="errorMessage" class="error-banner" role="alert">
          <ShieldCheck :size="17" />
          {{ errorMessage }}
        </div>
        <button class="primary-button login-form__submit" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Signing in…' : 'Sign in' }}
          <ArrowRight v-if="!isLoading" :size="17" />
        </button>
      </form>
      <p class="sign-in-card__footer">
        <ShieldCheck :size="14" />
        Secure pilot access
      </p>
    </section>
  </main>
</template>

<style scoped lang="scss">
.sign-in-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px 18px;
  background:
    radial-gradient(circle at 10% 0%, rgba(34, 197, 232, 0.1), transparent 32%),
    var(--background);
}

.sign-in-card {
  width: min(100%, 420px);
  padding: 30px 26px 23px;

  &__intro {
    margin-top: 42px;

    h1 {
      margin: 8px 0;
      font-size: 27px;
      font-weight: 800;
      letter-spacing: -0.05em;
    }

    > .muted {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 22px 0 0;
    color: #87909a;
    font-size: 11px;
  }
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--navy);

  img {
    width: 92px;
    height: auto;
    object-fit: contain;
  }

  span {
    max-width: 128px;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.08em;
    line-height: 1.5;
  }
}

.welcome-icon {
  display: grid;
  width: 46px;
  height: 46px;
  margin-bottom: 17px;
  place-items: center;
  border-radius: 15px;
  color: var(--red);
  background: #fff0f2;
}

.login-form {
  display: grid;
  gap: 10px;
  margin-top: 28px;

  label {
    margin-top: 5px;
    font-size: 12px;
    font-weight: 700;
  }

  input {
    width: 100%;
    min-height: 49px;
    padding: 0 14px;
    border: 1px solid #e5e8ec;
    border-radius: 12px;
    outline: none;
    background: #fff;
    font-size: 13px;

    &:focus {
      border-color: var(--navy);
      box-shadow: 0 0 0 3px rgba(14, 33, 56, 0.08);
    }
  }

  &__submit {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
