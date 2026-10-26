<script setup lang="ts">
import { CalendarDays, ClipboardList, Home, MoreHorizontal } from '@lucide/vue';

defineProps<{ active: 'home' | 'schedule' }>();
</script>

<template>
  <nav class="bottom-nav" aria-label="Main navigation">
    <NuxtLink to="/home" :class="{ active: active === 'home' }">
      <Home :size="19" :stroke-width="2" />
      <span>Home</span>
    </NuxtLink>
    <NuxtLink to="/schedule" :class="{ active: active === 'schedule' }">
      <CalendarDays :size="19" :stroke-width="2" />
      <span>Schedule</span>
    </NuxtLink>
    <button type="button" disabled aria-disabled="true">
      <ClipboardList :size="19" :stroke-width="2" />
      <span>Logbook</span>
    </button>
    <button type="button" disabled aria-disabled="true">
      <MoreHorizontal :size="19" :stroke-width="2" />
      <span>More</span>
    </button>
  </nav>
</template>
