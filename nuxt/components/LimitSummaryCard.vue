<script setup lang="ts">
import { Clock3 } from '@lucide/vue';
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  hours: number;
  limit: number;
}>();

const progress = computed(() =>
  Math.min(100, Math.max(0, (props.hours / props.limit) * 100)),
);
const exceeded = computed(() => props.hours > props.limit);
</script>

<template>
  <article class="limit-card surface">
    <div class="limit-card__top">
      <span>{{ label }}</span>
      <span class="limit-card__icon"><Clock3 :size="16" /></span>
    </div>
    <div class="limit-card__value">
      <strong>{{ hours.toFixed(1) }}</strong>
      <span>/ {{ limit }}h</span>
    </div>
    <div class="limit-card__track" role="progressbar" :aria-valuenow="progress" :aria-valuemax="100">
      <span :class="{ 'is-exceeded': exceeded }" :style="{ width: `${progress}%` }" />
    </div>
    <p>{{ exceeded ? 'Over limit' : `${(limit - hours).toFixed(1)}h remaining` }}</p>
  </article>
</template>

<style scoped lang="scss">
.limit-card {
  min-width: 0;
  padding: 14px;

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
  }

  &__icon {
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border-radius: 10px;
    color: var(--red);
    background: #fff0f2;
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin: 12px 0 10px;

    strong {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.05em;
    }

    span {
      color: var(--text-secondary);
      font-size: 10px;
      font-weight: 600;
    }
  }

  &__track {
    height: 5px;
    overflow: hidden;
    border-radius: 5px;
    background: #edf0f3;

    span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--success);
    }

    .is-exceeded {
      background: var(--danger);
    }
  }

  p {
    margin: 8px 0 0;
    color: var(--text-secondary);
    font-size: 9px;
  }
}
</style>
