<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue';
import { computed, onMounted, ref, watch } from 'vue';
import PilotBottomNav from '~/components/PilotBottomNav.vue';
import ScheduleCalendar from '~/components/ScheduleCalendar.vue';
import { useAuthStore } from '~/stores/auth';
import type { SchedulesResponse } from '~/types/api';

const api = usePilotApi();
const auth = useAuthStore();
const year = ref(2026);
const month = ref(5);
const scheduleData = ref<SchedulesResponse | null>(null);
const displayedSchedules = computed(() => {
  const data = scheduleData.value;
  if (!data || data.year !== year.value || data.month !== month.value) {
    return [];
  }
  return data.schedules;
});
const isLoading = ref(true);
const errorMessage = ref('');
let latestRequest = 0;

async function loadMonth(): Promise<void> {
  const requestId = ++latestRequest;
  const requestedYear = year.value;
  const requestedMonth = month.value;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.request<SchedulesResponse>(
      `/schedules?year=${requestedYear}&month=${String(requestedMonth).padStart(2, '0')}`,
    );
    if (requestId === latestRequest) {
      scheduleData.value = response;
    }
  } catch (error) {
    if (requestId !== latestRequest) {
      return;
    }
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? error.statusCode
        : undefined;
    if (statusCode === 401) {
      auth.logout();
      await navigateTo('/');
      return;
    }
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load this schedule.';
  } finally {
    if (requestId === latestRequest) {
      isLoading.value = false;
    }
  }
}

function changeMonth(offset: number): void {
  const date = new Date(Date.UTC(year.value, month.value - 1 + offset, 1));
  year.value = date.getUTCFullYear();
  month.value = date.getUTCMonth() + 1;
}

function openDate(date: string): void {
  void navigateTo(`/schedule/${date}`);
}

watch([year, month], loadMonth);
onMounted(loadMonth);
</script>

<template>
  <main class="page-shell schedule-page">
    <header class="schedule-topbar">
      <NuxtLink to="/home" class="back-button" aria-label="Back to home">
        <ArrowLeft :size="18" />
      </NuxtLink>
      <div>
        <p class="eyebrow">Pilot operations</p>
        <h1>My schedule</h1>
      </div>
      <span class="calendar-avatar">JD</span>
    </header>

    <div class="schedule-intro">
      <p>Monthly duty overview</p>
      <span>Tap any date to view details</span>
    </div>

    <div v-if="errorMessage" class="schedule-error" role="alert">
      <p class="error-banner">{{ errorMessage }}</p>
      <button type="button" class="retry-button" @click="loadMonth">Try again</button>
    </div>
    <ScheduleCalendar
      :year="year"
      :month="month"
      :schedules="displayedSchedules"
      :legend="scheduleData?.legend ?? []"
      :loading="isLoading"
      @change-month="changeMonth"
      @select-date="openDate"
    />

    <PilotBottomNav active="schedule" />
  </main>
</template>

<style scoped lang="scss">
.schedule-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 5px 0 29px;

  h1 {
    margin: 4px 0 0;
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.04em;
  }
}

.back-button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  background: white;
}

.calendar-avatar {
  display: grid;
  width: 37px;
  height: 37px;
  margin-left: auto;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: var(--navy);
  font-size: 11px;
  font-weight: 800;
}

.schedule-intro {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;

  p {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
  }

  span {
    color: var(--text-secondary);
    font-size: 9px;
  }
}

.schedule-error {
  margin-bottom: 14px;
}

.retry-button {
  margin: 8px 0 0 4px;
  padding: 4px 0;
  border: 0;
  color: var(--navy);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}
</style>
