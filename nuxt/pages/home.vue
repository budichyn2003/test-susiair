<script setup lang="ts">
import { LogOut, Plane, RefreshCw } from '@lucide/vue';
import { onMounted, ref } from 'vue';
import DocumentList from '~/components/DocumentList.vue';
import FlightHoursChart from '~/components/FlightHoursChart.vue';
import LimitSummaryCard from '~/components/LimitSummaryCard.vue';
import PilotBottomNav from '~/components/PilotBottomNav.vue';
import { useAuthStore } from '~/stores/auth';
import type {
  DocumentsResponse,
  FlightHoursSummary,
  LimitSummary,
  PilotProfile,
} from '~/types/api';

const auth = useAuthStore();
const api = usePilotApi();
const profile = ref<PilotProfile | null>(null);
const documents = ref<DocumentsResponse | null>(null);
const summary = ref<FlightHoursSummary | null>(null);
const selectedRange = ref('1w');
const isLoading = ref(true);
const isChartLoading = ref(false);
const errorMessage = ref('');
const chartError = ref('');
const avatarFailed = ref(false);
let latestChartRequest = 0;
const cardLabels: Array<{ key: keyof LimitSummary; label: string }> = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'annual', label: 'Annual' },
];
const initials = computed(() =>
  (profile.value?.name ?? 'John Doe')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
);

async function loadSummary(range: string): Promise<void> {
  const requestId = ++latestChartRequest;
  selectedRange.value = range;
  isChartLoading.value = true;
  chartError.value = '';
  try {
    const nextSummary = await api.request<FlightHoursSummary>(
      `/flight-hours/summary?range=${range}`,
    );
    if (requestId === latestChartRequest) {
      summary.value = nextSummary;
    }
  } catch (error) {
    if (requestId !== latestChartRequest) {
      return;
    }
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? error.statusCode
        : undefined;
    if (statusCode === 401) {
      auth.logout();
      void navigateTo('/');
      return;
    }
    chartError.value =
      error instanceof Error ? error.message : 'Unable to load this chart range.';
  } finally {
    if (requestId === latestChartRequest) {
      isChartLoading.value = false;
    }
  }
}

async function loadHome(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const [pilot, docs, hoursSummary] = await Promise.all([
      api.request<PilotProfile>('/pilot/me'),
      api.request<DocumentsResponse>('/documents'),
      api.request<FlightHoursSummary>('/flight-hours/summary?range=1w'),
    ]);
    profile.value = pilot;
    documents.value = docs;
    summary.value = hoursSummary;
    selectedRange.value = hoursSummary.range;
    chartError.value = '';
  } catch (error) {
    handleApiError(error);
  } finally {
    isLoading.value = false;
  }
}

function handleApiError(error: unknown): void {
  const statusCode =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? error.statusCode
      : undefined;
  if (statusCode === 401) {
    auth.logout();
    void navigateTo('/');
    return;
  }
  errorMessage.value =
    error instanceof Error ? error.message : 'Unable to load pilot information.';
}

function retryChart(): void {
  void loadSummary(selectedRange.value);
}

function signOut(): void {
  auth.logout();
  void navigateTo('/');
}

onMounted(loadHome);
</script>

<template>
  <main class="page-shell home-page">
    <header class="home-header">
      <div>
        <p class="eyebrow">Welcome back, pilot</p>
        <h1>{{ profile?.name ?? 'Pilot' }}</h1>
      </div>
      <button class="logout-button" type="button" aria-label="Sign out" @click="signOut">
        <LogOut :size="18" />
      </button>
    </header>

    <section class="profile-hero surface">
      <div class="avatar-wrap">
        <img
          v-if="profile?.avatarUrl && !avatarFailed"
          :src="profile.avatarUrl"
          :alt="`${profile.name} avatar`"
          @error="avatarFailed = true"
        />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="profile-hero__details">
        <p class="eyebrow">Total flight hours</p>
        <strong>{{ profile ? profile.totalFlightHours.toLocaleString('en-US', { minimumFractionDigits: 1 }) : '—' }}</strong>
        <span>Hours logged</span>
      </div>
      <div class="profile-hero__plane"><Plane :size="25" /></div>
    </section>

    <div v-if="isLoading" class="loading-state surface" role="status">
      Loading pilot data…
    </div>
    <div v-else-if="errorMessage" class="error-panel surface">
      <p class="error-banner">{{ errorMessage }}</p>
      <button type="button" class="retry-button" @click="loadHome">
        <RefreshCw :size="15" /> Try again
      </button>
    </div>

    <template v-else-if="profile && summary && documents">
      <section>
        <div class="section-heading">
          <div>
            <p class="eyebrow">Flight activity</p>
            <h2>Hours to limit</h2>
          </div>
          <span class="today-label">Today · {{ summary.today }}</span>
        </div>
        <div class="limit-grid">
          <LimitSummaryCard
            v-for="card in cardLabels"
            :key="card.key"
            :label="card.label"
            :hours="summary.limitSummary[card.key].hours"
            :limit="summary.limitSummary[card.key].limit"
          />
        </div>
        <div class="section-heading chart-heading">
          <div>
            <p class="eyebrow">Flight hours trend</p>
            <h2>Rolling sum</h2>
          </div>
          <span v-if="isChartLoading" class="chart-refreshing">Updating…</span>
        </div>
        <div class="chart-wrapper">
          <FlightHoursChart
            :summary="summary"
            :selected-range="selectedRange"
            @select-range="loadSummary"
          />
          <div v-if="chartError" class="chart-error" role="alert">
            <span>{{ chartError }}</span>
            <button type="button" @click="retryChart">Try again</button>
          </div>
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <p class="eyebrow">Stay up to date</p>
            <h2>My documents</h2>
          </div>
          <span class="document-count">{{ documents.documents.length }} items</span>
        </div>
        <DocumentList :documents="documents.documents" />
      </section>
    </template>

    <PilotBottomNav active="home" />
  </main>
</template>

<style scoped lang="scss">
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px 0 22px;

  h1 {
    margin: 5px 0 0;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.04em;
  }
}

.logout-button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 0;
  border-radius: 14px;
  color: var(--navy);
  background: white;
  cursor: pointer;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px;
  overflow: hidden;
  color: white;
  background: var(--navy);

  .eyebrow,
  &__details > span {
    color: rgba(255, 255, 255, 0.65);
  }

  &__details {
    display: grid;
    gap: 4px;

    strong {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    > span {
      font-size: 10px;
    }
  }

  &__plane {
    display: grid;
    width: 52px;
    height: 52px;
    margin-left: auto;
    place-items: center;
    border-radius: 17px;
    color: #65d9ed;
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(-15deg);
  }
}

.avatar-wrap {
  display: grid;
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  overflow: hidden;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  color: var(--navy);
  background: #fff;
  font-size: 15px;
  font-weight: 800;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.today-label,
.document-count,
.chart-refreshing {
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
}

.limit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.chart-heading {
  margin-top: 24px;
}

.chart-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 8px 4px 0;
  color: #a61f37;
  font-size: 11px;

  button {
    flex: 0 0 auto;
    padding: 4px 0;
    border: 0;
    color: var(--navy);
    background: transparent;
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
  }
}

.error-panel {
  margin-top: 18px;
  padding: 16px;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding: 8px 0;
  border: 0;
  color: var(--navy);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}
</style>
