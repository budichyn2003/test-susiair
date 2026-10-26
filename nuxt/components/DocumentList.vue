<script setup lang="ts">
import { AlertCircle, CheckCircle2, Clock3 } from '@lucide/vue';
import type { PilotDocument } from '~/types/api';

defineProps<{ documents: PilotDocument[] }>();

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function statusLabel(status: PilotDocument['status']): string {
  return status === 'expired' ? 'Expired' : status === 'soon' ? 'Due soon' : 'Valid';
}
</script>

<template>
  <section class="document-list surface">
    <article v-for="document in documents" :key="document.id" class="document-row">
      <div class="document-row__icon">
        <AlertCircle v-if="document.status === 'expired'" :size="18" />
        <Clock3 v-else-if="document.status === 'soon'" :size="18" />
        <CheckCircle2 v-else :size="18" />
      </div>
      <div class="document-row__main">
        <strong>{{ document.label }}</strong>
        <span>Expires {{ formatDate(document.expiryDate) }}</span>
      </div>
      <span class="status-badge" :class="`status-badge--${document.status}`">
        {{ statusLabel(document.status) }}
      </span>
    </article>
  </section>
</template>

<style scoped lang="scss">
.document-list {
  padding: 0 15px;
}

.document-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px 0;

  & + & {
    border-top: 1px solid #f0f2f4;
  }

  &__icon {
    display: grid;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    place-items: center;
    border-radius: 12px;
    color: var(--navy);
    background: #f2f5f8;
  }

  &__main {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 4px;

    strong {
      overflow: hidden;
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      color: var(--text-secondary);
      font-size: 10px;
    }
  }
}

.status-badge {
  padding: 6px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;

  &--safe {
    color: #087f5b;
    background: #e6f8f2;
  }

  &--soon {
    color: #9a6200;
    background: #fff4d8;
  }

  &--expired {
    color: #b4233e;
    background: #ffebef;
  }
}
</style>
