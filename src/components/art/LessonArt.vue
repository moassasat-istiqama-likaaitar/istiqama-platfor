<template>
  <svg :viewBox="'0 0 200 140'" class="art" role="img" :aria-label="label || kind" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="tint(0.82)" />
        <stop offset="1" :stop-color="tint(0.62)" />
      </linearGradient>
    </defs>
    <rect v-if="!bare" width="200" height="140" rx="18" :fill="`url(#${gid})`" />
    <!-- نقاط زخرفية -->
    <g v-if="!bare" :fill="tint(0.9)" opacity="0.9">
      <circle cx="22" cy="24" r="5" /><circle cx="180" cy="30" r="3" /><circle cx="170" cy="118" r="6" /><circle cx="30" cy="114" r="3" />
    </g>

    <!-- القرآن: مصحف مفتوح على حامل -->
    <g v-if="kind === 'quran'">
      <path d="M60 98 L100 112 L140 98 L140 104 L100 118 L60 104Z" :fill="shade(0.35)" />
      <path d="M58 46 Q80 40 100 50 L100 108 Q80 98 58 104Z" fill="#fff" :stroke="color" stroke-width="2.5" />
      <path d="M142 46 Q120 40 100 50 L100 108 Q120 98 142 104Z" fill="#fff" :stroke="color" stroke-width="2.5" />
      <g :stroke="tint(0.45)" stroke-width="2.4" stroke-linecap="round">
        <line x1="66" y1="60" x2="92" y2="64" /><line x1="66" y1="70" x2="92" y2="74" /><line x1="66" y1="80" x2="92" y2="84" />
        <line x1="108" y1="64" x2="134" y2="60" /><line x1="108" y1="74" x2="134" y2="70" /><line x1="108" y1="84" x2="134" y2="80" />
      </g>
      <path d="M100 22 l4 9 10 1 -7.5 7 2 10 -8.5 -5 -8.5 5 2 -10 -7.5 -7 10 -1z" :fill="accent" />
    </g>

    <!-- الحروف -->
    <g v-else-if="kind === 'letters'" font-family="'Baloo Bhaijaan 2', Cairo, sans-serif" font-weight="700" text-anchor="middle">
      <rect x="38" y="40" width="40" height="40" rx="10" :fill="color" transform="rotate(-8 58 60)" />
      <text x="58" y="72" font-size="30" fill="#fff" transform="rotate(-8 58 60)">أ</text>
      <rect x="82" y="58" width="40" height="40" rx="10" :fill="accent" />
      <text x="102" y="90" font-size="30" fill="#fff">ب</text>
      <rect x="126" y="36" width="40" height="40" rx="10" :fill="shade(0.2)" transform="rotate(8 146 56)" />
      <text x="146" y="68" font-size="30" fill="#fff" transform="rotate(8 146 56)">ت</text>
    </g>

    <!-- الأعداد -->
    <g v-else-if="kind === 'numbers'" font-family="'Baloo Bhaijaan 2', Cairo, sans-serif" font-weight="700" text-anchor="middle">
      <circle cx="62" cy="62" r="24" :fill="color" /><text x="62" y="73" font-size="30" fill="#fff">4</text>
      <circle cx="104" cy="82" r="18" :fill="accent" /><text x="104" y="91" font-size="24" fill="#fff">+</text>
      <circle cx="144" cy="58" r="24" :fill="shade(0.2)" /><text x="144" y="69" font-size="30" fill="#fff">7</text>
      <rect x="70" y="108" width="62" height="8" rx="4" :fill="shade(0.3)" opacity="0.5" />
    </g>

    <!-- الأشكال الهندسية -->
    <g v-else-if="kind === 'shapes'">
      <polygon points="60,96 82,52 104,96" :fill="color" />
      <rect x="108" y="58" width="38" height="38" rx="6" :fill="accent" />
      <circle cx="132" cy="44" r="14" :fill="shade(0.2)" opacity="0.85" />
      <line x1="48" y1="104" x2="156" y2="104" :stroke="shade(0.3)" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- النبتة -->
    <g v-else-if="kind === 'plant'">
      <path d="M78 96 h44 l-6 24 h-32z" :fill="shade(0.15)" />
      <rect x="74" y="90" width="52" height="10" rx="4" :fill="shade(0.3)" />
      <path d="M100 90 V48" stroke="#3a9a4a" stroke-width="4" stroke-linecap="round" />
      <path d="M100 66 C80 64 70 50 72 38 C88 40 98 52 100 66Z" fill="#4cc46a" />
      <path d="M100 56 C118 54 130 40 128 28 C110 30 102 42 100 56Z" fill="#3fb35d" />
      <circle cx="150" cy="34" r="12" :fill="accent" />
    </g>

    <!-- الخلية -->
    <g v-else-if="kind === 'cell'">
      <ellipse cx="100" cy="72" rx="62" ry="44" fill="#fff" :stroke="color" stroke-width="4" />
      <ellipse cx="100" cy="72" rx="56" ry="38" :fill="tint(0.85)" />
      <circle cx="108" cy="70" r="16" :fill="color" /><circle cx="112" cy="66" r="5" :fill="tint(0.6)" />
      <ellipse cx="70" cy="60" rx="10" ry="5" :fill="accent" transform="rotate(-20 70 60)" />
      <ellipse cx="76" cy="90" rx="9" ry="4.5" :fill="accent" transform="rotate(15 76 90)" />
      <circle cx="136" cy="88" r="4" :fill="shade(0.2)" /><circle cx="140" cy="56" r="3" :fill="shade(0.2)" />
    </g>

    <!-- الذرة / الفيزياء -->
    <g v-else-if="kind === 'atom'" fill="none" :stroke="color" stroke-width="3.5">
      <ellipse cx="100" cy="70" rx="54" ry="18" />
      <ellipse cx="100" cy="70" rx="54" ry="18" transform="rotate(60 100 70)" />
      <ellipse cx="100" cy="70" rx="54" ry="18" transform="rotate(-60 100 70)" />
      <circle cx="100" cy="70" r="9" :fill="accent" stroke="none" />
      <circle cx="154" cy="70" r="5" :fill="shade(0.2)" stroke="none" />
    </g>

    <!-- الكرة الأرضية / التاريخ والجغرافيا -->
    <g v-else-if="kind === 'globe'">
      <circle cx="100" cy="68" r="42" :fill="color" />
      <path d="M78 46 q14 -6 22 4 q-6 10 4 16 q12 4 6 16 q-10 6 -18 -4 q-8 -10 -18 -6 q-4 -14 4 -26z" fill="#7ad27a" />
      <path d="M118 84 q10 -4 16 4 q-4 10 -14 8z" fill="#7ad27a" />
      <path d="M72 116 h56" :stroke="shade(0.3)" stroke-width="5" stroke-linecap="round" />
      <path d="M100 110 v6" :stroke="shade(0.3)" stroke-width="5" />
    </g>

    <!-- الساعة -->
    <g v-else-if="kind === 'clock'">
      <circle cx="100" cy="70" r="44" fill="#fff" :stroke="color" stroke-width="6" />
      <g :fill="shade(0.2)"><circle cx="100" cy="34" r="3" /><circle cx="136" cy="70" r="3" /><circle cx="100" cy="106" r="3" /><circle cx="64" cy="70" r="3" /></g>
      <path d="M100 70 V46" :stroke="shade(0.3)" stroke-width="5" stroke-linecap="round" />
      <path d="M100 70 L120 80" :stroke="accent" stroke-width="5" stroke-linecap="round" />
      <circle cx="100" cy="70" r="5" :fill="color" />
    </g>

    <!-- الماء -->
    <g v-else-if="kind === 'water'">
      <path d="M100 26 C120 54 132 70 132 86 a32 32 0 0 1 -64 0 C68 70 80 54 100 26Z" :fill="color" />
      <path d="M86 84 a14 14 0 0 0 14 14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
      <path d="M150 40 C156 50 160 56 160 62 a10 10 0 0 1 -20 0 C140 56 144 50 150 40Z" :fill="accent" />
    </g>

    <!-- المصباح / الفكرة -->
    <g v-else-if="kind === 'idea'">
      <circle cx="100" cy="60" r="30" :fill="accent" />
      <rect x="88" y="88" width="24" height="16" rx="4" :fill="shade(0.3)" />
      <rect x="92" y="106" width="16" height="6" rx="3" :fill="shade(0.4)" />
      <g :stroke="color" stroke-width="4" stroke-linecap="round">
        <line x1="100" y1="16" x2="100" y2="24" /><line x1="58" y1="32" x2="64" y2="38" /><line x1="142" y1="32" x2="136" y2="38" />
        <line x1="50" y1="62" x2="58" y2="62" /><line x1="150" y1="62" x2="142" y2="62" />
      </g>
    </g>

    <!-- القلب / الأخلاق والتربية -->
    <g v-else-if="kind === 'heart'">
      <path d="M100 112 C60 86 48 66 56 50 C64 34 88 34 100 52 C112 34 136 34 144 50 C152 66 140 86 100 112Z" :fill="color" />
      <path d="M74 54 q6 -8 14 -4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
      <circle cx="150" cy="30" r="8" :fill="accent" />
    </g>

    <!-- القلم / الأدب -->
    <g v-else-if="kind === 'pen'">
      <rect x="54" y="34" width="70" height="86" rx="8" fill="#fff" :stroke="color" stroke-width="3" />
      <g :stroke="tint(0.45)" stroke-width="3" stroke-linecap="round">
        <line x1="66" y1="54" x2="112" y2="54" /><line x1="66" y1="66" x2="112" y2="66" /><line x1="66" y1="78" x2="100" y2="78" />
      </g>
      <path d="M150 30 l10 10 -40 52 -14 4 4 -14z" :fill="accent" />
    </g>

    <!-- منحنى دالة / رياضيات متقدمة -->
    <g v-else-if="kind === 'graph'">
      <line x1="40" y1="112" x2="164" y2="112" :stroke="shade(0.3)" stroke-width="3" />
      <line x1="52" y1="120" x2="52" y2="24" :stroke="shade(0.3)" stroke-width="3" />
      <path d="M56 104 C80 104 90 40 112 40 C134 40 140 84 160 70" fill="none" :stroke="color" stroke-width="5" stroke-linecap="round" />
      <circle cx="112" cy="40" r="7" :fill="accent" />
    </g>

    <!-- الصاعقة / الكهرباء -->
    <g v-else-if="kind === 'bolt'">
      <path d="M110 18 L70 78 H98 L88 122 L134 56 H104Z" :fill="accent" :stroke="shade(0.2)" stroke-width="3" stroke-linejoin="round" />
    </g>

    <!-- كتاب (افتراضي) -->
    <g v-else>
      <rect x="62" y="36" width="76" height="80" rx="8" :fill="color" />
      <rect x="70" y="36" width="8" height="80" :fill="shade(0.2)" />
      <rect x="86" y="54" width="42" height="8" rx="4" fill="#fff" opacity="0.85" />
      <rect x="86" y="68" width="30" height="6" rx="3" fill="#fff" opacity="0.6" />
      <circle cx="146" cy="38" r="9" :fill="accent" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  kind: { type: String, default: 'book' },
  color: { type: String, default: '#3159e8' },
  accent: { type: String, default: '#ffc93c' },
  label: { type: String, default: '' },
  bare: { type: Boolean, default: false }
})

let counter = 0
const gid = `g${Math.random().toString(36).slice(2, 8)}${counter++}`

function mix(hex, target, amount) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const m = (c) => Math.round(c + (target - c) * amount)
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`
}
const tint = (a) => mix(props.color, 255, a)
const shade = (a) => mix(props.color, 0, a)
const color = computed(() => props.color)
</script>

<style scoped>
.art { display: block; width: 100%; height: 100%; }
</style>
