<script setup lang="ts">
import { Check, ChevronLeft, ChevronRight } from '@lucide/vue';
import type { ScheduleEntry, ScheduleLegendEntry } from '~/types/api';

const props = defineProps<{
  year: number;
  month: number;
  schedules: ScheduleEntry[];
  legend: ScheduleLegendEntry[];
  loading: boolean;
}>();
const emit = defineEmits<{
  changeMonth: [offset: number];
  selectDate: [date: string];
}>();

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthLabel = computed(() =>
  new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(props.year, props.month - 1, 1))),
);
const dayCount = computed(
  () => new Date(Date.UTC(props.year, props.month, 0)).getUTCDate(),
);
const leadingBlankDays = computed(
  () => (new Date(Date.UTC(props.year, props.month - 1, 1)).getUTCDay() + 6) % 7,
);
const scheduleByDate = computed(
  () => new Map(props.schedules.map((schedule) => [schedule.duty_date, schedule])),
);

const days = computed(() => {
  const entries: Array<{ date: string; day: number; schedule?: ScheduleEntry }> = [];
  for (let day = 1; day <= dayCount.value; day += 1) {
    const date = `${props.year}-${String(props.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    entries.push({ date, day, schedule: scheduleByDate.value.get(date) });
  }
  return entries;
});
</script>

<template>
  <section class="calendar-card surface">
    <header class="calendar-header">
      <button
        type="button"
        class="month-button"
        aria-label="Previous month"
        @click="emit('changeMonth', -1)"
      >
        <ChevronLeft :size="19" />
      </button>
      <h2>{{ monthLabel }}</h2>
      <button
        type="button"
        class="month-button"
        aria-label="Next month"
        @click="emit('changeMonth', 1)"
      >
        <ChevronRight :size="19" />
      </button>
    </header>
    <div class="calendar-grid calendar-grid--weekdays">
      <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
    </div>
    <div class="calendar-grid calendar-grid--days" :aria-busy="loading">
      <span v-for="blank in leadingBlankDays" :key="`blank-${blank}`" class="calendar-blank" />
      <button
        v-for="entry in days"
        :key="entry.date"
        type="button"
        class="calendar-day"
        :class="{ 'calendar-day--scheduled': entry.schedule }"
        :style="entry.schedule ? { '--day-color': entry.schedule.base_color } : undefined"
        :aria-label="entry.schedule ? `${entry.date}, ${entry.schedule.base_name}, ${entry.schedule.count_schedules - entry.schedule.count_logbooks} duties remaining` : entry.date"
        @click="emit('selectDate', entry.date)"
      >
        <span class="calendar-day__number">{{ entry.day }}</span>
        <span v-if="entry.schedule" class="calendar-day__base">
          {{ entry.schedule.base_name }}
        </span>
        <span v-if="entry.schedule" class="calendar-day__status">
          <Check
            v-if="entry.schedule.count_logbooks === entry.schedule.count_schedules"
            :size="11"
            :stroke-width="3"
          />
          <template v-else>
            {{ entry.schedule.count_schedules - entry.schedule.count_logbooks }}
          </template>
        </span>
      </button>
    </div>
    <p v-if="loading" class="calendar-loading">Updating schedule…</p>
    <footer class="calendar-legend">
      <span v-for="item in legend" :key="item.code">
        <i :style="{ backgroundColor: item.color }" />
        {{ item.label }}
      </span>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.calendar-card {
  padding: 16px 13px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
  }
}

.month-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 11px;
  background: #f3f5f7;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;

  &--weekdays {
    margin-bottom: 7px;
    color: #88919c;
    font-size: 9px;
    font-weight: 700;
    text-align: center;
  }

  &--days {
    position: relative;
  }
}

.calendar-day {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 52px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 4px 1px;
  border: 0;
  border-radius: 10px;
  background: #f7f8fa;
  cursor: pointer;

  &--scheduled {
    color: #fff;
    background: var(--day-color);
  }

  &__number {
    font-size: 11px;
    font-weight: 700;
  }

  &__base {
    max-width: 100%;
    overflow: hidden;
    font-size: 8px;
    font-weight: 700;
    text-overflow: ellipsis;
  }

  &__status {
    position: absolute;
    top: 2px;
    right: 3px;
    display: grid;
    min-width: 13px;
    height: 13px;
    place-items: center;
    border-radius: 999px;
    color: var(--navy);
    background: #fff;
    font-size: 8px;
    font-weight: 800;
  }
}

.calendar-blank {
  min-height: 52px;
}

.calendar-loading {
  margin: 12px 0 0;
  color: var(--text-secondary);
  font-size: 11px;
  text-align: center;
}

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 13px;
  margin-top: 19px;
  padding-top: 15px;
  border-top: 1px solid #eff1f3;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #5f6873;
    font-size: 9px;
    font-weight: 600;
  }

  i {
    width: 9px;
    height: 9px;
    border-radius: 3px;
  }
}
</style>
