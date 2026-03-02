<script setup>
defineProps({
  size: {
    type: Number,
    default: 24,
  },
});
</script>

<template>
  <svg
    :height="size"
    :width="size * (20 / 24)"
    viewBox="0 0 20 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <filter
        id="forge-flame-glow"
        x="-40%"
        y="-20%"
        width="180%"
        height="140%"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#forge-flame-glow)">
      <!-- Purple flame (back layer, wider, left-oriented) -->
      <path
        d="M 9,22 C 2,20 1,12 5,7 C 6,4 8,2 9,2 C 10,2 12,4 13,7 C 17,12 16,20 9,22 Z"
        fill="var(--purple-accent)"
        opacity="0.9"
      />
      <!-- Amber flame (front layer, taller, right-oriented) -->
      <path
        d="M 11,22 C 6,20 5,15 8,10 C 9,7 10,4 11,1 C 12,4 13,7 16,10 C 19,15 16,20 11,22 Z"
        fill="var(--primary-color)"
      />
    </g>
  </svg>
</template>
