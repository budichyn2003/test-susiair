<script setup lang="ts">
import { computed } from 'vue';
import type { FlightHoursSummary } from '~/types/api';

const props = defineProps<{
  summary: FlightHoursSummary;
  selectedRange: string;
}>();
const emit = defineEmits<{ selectRange: [range: string] }>();

const ranges = ['1w', '1m', '3m', '6m', '1y'];
const chart = { width: 360, height: 190, left: 36, right: 10, top: 12, bottom: 30 };
const plotWidth = chart.width - chart.left - chart.right;
const plotHeight = chart.height - chart.top - chart.bottom;
const yTicks = computed(() => [0, props.summary.max / 2, props.summary.max]);
const points = computed(() =>
  props.summary.series.map((point, index) => ({
    ...point,
    x: chart.left + (index / Math.max(1, props.summary.series.length - 1)) * plotWidth,
    y: chart.top + (1 - point.rollingSum / props.summary.max) * plotHeight,
  })),
);
const linePath = computed(() =>
  points.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' '),
);
const limitY = computed(
  () => chart.top + (1 - props.summary.limit / props.summary.max) * plotHeight,
);

function labelDate(date: string): string {
  return new Intl.DateTimeFormat('en', { day: 'numeric' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
</script>

<template>
  <section class="chart-card surface" aria-label="Rolling flight hours chart">
    <div class="range-toggle" aria-label="Chart range">
      <button
        v-for="range in ranges"
        :key="range"
        type="button"
        :class="{ selected: selectedRange === range }"
        :aria-pressed="selectedRange === range"
        @click="emit('selectRange', range)"
      >
        {{ range }}
      </button>
    </div>
    <div class="chart-legend">
      <span><i class="chart-legend__line" />Rolling hours</span>
      <span><i class="chart-legend__line chart-legend__line--limit" />Limit {{ summary.limit }}h</span>
    </div>
    <div class="chart-scroll">
      <svg
        :viewBox="`0 0 ${chart.width} ${chart.height}`"
        role="img"
        :aria-label="`Rolling sum for ${selectedRange}, limit ${summary.limit} hours`"
      >
        <g v-for="tick in yTicks" :key="tick">
          <line
            :x1="chart.left"
            :x2="chart.width - chart.right"
            :y1="chart.top + (1 - tick / summary.max) * plotHeight"
            :y2="chart.top + (1 - tick / summary.max) * plotHeight"
            class="chart-grid"
          />
          <text
            :x="chart.left - 8"
            :y="chart.top + (1 - tick / summary.max) * plotHeight + 4"
            class="chart-axis"
            text-anchor="end"
          >
            {{ Math.round(tick) }}
          </text>
        </g>
        <line
          :x1="chart.left"
          :x2="chart.width - chart.right"
          :y1="limitY"
          :y2="limitY"
          class="chart-limit"
        />
        <path :d="linePath" class="chart-line" />
        <g v-for="(point, index) in points" :key="point.date">
          <circle
            :cx="point.x"
            :cy="point.y"
            :r="point.date === summary.today ? 4.5 : 2.5"
            :class="{ 'chart-point--today': point.date === summary.today }"
            class="chart-point"
          >
            <title>{{ point.date }}: {{ point.rollingSum.toFixed(1) }}h</title>
          </circle>
          <text
            v-if="index % 2 === 0 || point.date === summary.today"
            :x="point.x"
            :y="chart.height - 8"
            class="chart-axis"
            text-anchor="middle"
          >
            {{ labelDate(point.date) }}
          </text>
        </g>
      </svg>
    </div>
  </section>
</template>

<style scoped lang="scss">
.chart-card {
  padding: 16px 12px 10px;
}

.range-toggle {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: #f3f5f7;

  button {
    flex: 1;
    min-height: 34px;
    border: 0;
    border-radius: 999px;
    color: #6b7280;
    background: transparent;
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
  }

  .selected {
    color: white;
    background: var(--navy);
  }
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 18px 0 2px;
  color: #6b7280;
  font-size: 10px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  &__line {
    width: 15px;
    border-top: 2px solid var(--cyan);

    &--limit {
      border-color: var(--red);
      border-top-style: dashed;
    }
  }
}

.chart-scroll {
  overflow-x: auto;

  svg {
    display: block;
    width: 100%;
    min-width: 320px;
    overflow: visible;
  }
}

.chart-grid {
  stroke: #edf0f3;
  stroke-width: 1;
}

.chart-limit {
  stroke: var(--red);
  stroke-dasharray: 5 4;
  stroke-width: 1.5;
}

.chart-line {
  fill: none;
  stroke: var(--cyan);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.chart-point {
  fill: var(--cyan);
  stroke: #fff;
  stroke-width: 1.5;

  &--today {
    fill: var(--red);
    stroke-width: 2;
  }
}

.chart-axis {
  fill: #86909c;
  font-family: inherit;
  font-size: 9px;
}
</style>
