<script setup lang="ts">
import { ArrowLeft, CalendarDays } from '@lucide/vue';

const route = useRoute();
const dateLabel = computed(() => {
  const date = Array.isArray(route.params.date)
    ? route.params.date[0]
    : route.params.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return '';
  }
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
});
</script>

<template>
  <main class="detail-page">
    <NuxtLink to="/schedule" class="detail-back">
      <ArrowLeft :size="18" />
      Back to schedule
    </NuxtLink>
    <section class="detail-placeholder surface">
      <div class="detail-icon"><CalendarDays :size="23" /></div>
      <p class="eyebrow">{{ dateLabel }}</p>
      <h1>Detail page coming soon</h1>
      <p class="muted">Schedule details for this date will be available here.</p>
    </section>
    <PilotBottomNav active="schedule" />
  </main>
</template>

<style scoped lang="scss">
.detail-page {
  width: min(100%, 520px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 22px 20px 110px;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--navy);
  font-size: 12px;
  font-weight: 700;
}

.detail-placeholder {
  display: grid;
  min-height: 310px;
  align-content: center;
  justify-items: center;
  margin-top: 42px;
  padding: 26px;
  text-align: center;

  h1 {
    margin: 8px 0;
    font-size: 21px;
    font-weight: 800;
  }

  > .muted {
    max-width: 250px;
    margin: 4px 0;
    font-size: 12px;
    line-height: 1.6;
  }
}

.detail-icon {
  display: grid;
  width: 52px;
  height: 52px;
  margin-bottom: 16px;
  place-items: center;
  border-radius: 17px;
  color: var(--red);
  background: #fff0f2;
}
</style>
