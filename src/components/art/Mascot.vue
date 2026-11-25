<template>
  <!-- "نُور": شخصية المنصة — نجمة صغيرة تحمل كتاباً (تصميم أصلي) -->
  <svg viewBox="0 0 160 160" class="mascot" :class="[`mascot--${mood}`, { 'mascot--bounce': bounce }]" role="img" aria-label="نور">
    <ellipse cx="80" cy="148" rx="38" ry="6" fill="rgba(0,0,0,0.10)" />
    <g class="mascot__body">
      <path
        d="M80 12 C88 12 92 40 100 46 C108 52 140 50 144 58 C148 66 124 84 122 94 C120 104 132 134 126 140 C120 146 92 128 80 128 C68 128 40 146 34 140 C28 134 40 104 38 94 C36 84 12 66 16 58 C20 50 52 52 60 46 C68 40 72 12 80 12Z"
        :fill="color"
      />
      <path d="M56 54 C62 50 66 36 72 28" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.35" />
      <!-- العينان -->
      <g class="mascot__eyes">
        <ellipse cx="66" cy="80" rx="7" :ry="mood === 'happy' ? 4 : 8" fill="#2b2b3a" />
        <ellipse cx="94" cy="80" rx="7" :ry="mood === 'happy' ? 4 : 8" fill="#2b2b3a" />
        <circle v-if="mood !== 'happy'" cx="68" cy="77" r="2.5" fill="#fff" />
        <circle v-if="mood !== 'happy'" cx="96" cy="77" r="2.5" fill="#fff" />
      </g>
      <circle cx="56" cy="94" r="6" fill="#ff8fa3" opacity="0.6" />
      <circle cx="104" cy="94" r="6" fill="#ff8fa3" opacity="0.6" />
      <path :d="mood === 'think' ? 'M72 100 h16' : 'M70 96 Q80 108 90 96'" stroke="#2b2b3a" stroke-width="4" stroke-linecap="round" fill="none" />
      <!-- الكتاب -->
      <g transform="translate(96 104) rotate(-12)">
        <rect width="34" height="26" rx="4" :fill="accent" />
        <rect x="15" width="4" height="26" fill="rgba(0,0,0,0.15)" />
      </g>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  color: { type: String, default: '#ffc93c' },
  accent: { type: String, default: '#ff6b4a' },
  mood: { type: String, default: 'normal' }, // normal | happy | think
  bounce: { type: Boolean, default: false }
})
</script>

<style scoped>
.mascot { display: block; width: 100%; height: 100%; overflow: visible; }
.mascot--bounce .mascot__body { animation: bob 2.6s ease-in-out infinite; transform-origin: 80px 140px; }
.mascot__eyes { animation: blink 4.5s infinite; transform-origin: 80px 80px; }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-6px) rotate(2deg); } }
@keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
@media (prefers-reduced-motion: reduce) { .mascot--bounce .mascot__body, .mascot__eyes { animation: none; } }
</style>
