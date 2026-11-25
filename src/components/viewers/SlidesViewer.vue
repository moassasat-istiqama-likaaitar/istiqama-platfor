<template>
  <div class="sv" :style="{ '--c': color, '--a': accent }" tabindex="0" @keydown.left="isRtl ? next() : prev()" @keydown.right="isRtl ? prev() : next()">
    <div class="sv__stage">
      <Transition :name="dirName" mode="out-in">
        <div :key="i" class="sv__slide" :class="{ 'sv__slide--cover': i === 0 }">
          <div class="sv__text">
            <span class="sv__num">{{ i + 1 }} / {{ slides.length }}</span>
            <h3>{{ slide.title }}</h3>
            <ul><li v-for="(b, k) in slide.bullets" :key="k">{{ b }}</li></ul>
          </div>
          <div class="sv__art"><LessonArt :kind="slide.art || art" :color="color" :accent="accent" bare /></div>
        </div>
      </Transition>
    </div>
    <div class="sv__bar">
      <button type="button" class="sv__nav" :disabled="i === 0" @click="prev"><i class="pi pi-angle-right flip" /></button>
      <div class="sv__dots">
        <button v-for="(s, k) in slides" :key="k" type="button" :class="{ on: k === i }" :aria-label="`${k + 1}`" @click="go(k)" />
      </div>
      <button type="button" class="sv__nav" :disabled="i === slides.length - 1" @click="next"><i class="pi pi-angle-left flip" /></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LessonArt from '@/components/art/LessonArt.vue'

const props = defineProps({
  payload: { type: Object, required: true },
  color: { type: String, default: '#3159e8' },
  accent: { type: String, default: '#ffc93c' },
  art: { type: String, default: 'book' }
})
const emit = defineEmits(['ended'])
const { locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const slides = computed(() => props.payload.slides || [])
const i = ref(0)
const forward = ref(true)
const slide = computed(() => slides.value[i.value] || { title: '', bullets: [] })
const dirName = computed(() => (forward.value ? 'slide-f' : 'slide-b'))

function go(k) {
  forward.value = k > i.value
  i.value = k
  if (k === slides.value.length - 1) emit('ended')
}
const next = () => i.value < slides.value.length - 1 && go(i.value + 1)
const prev = () => i.value > 0 && go(i.value - 1)
</script>

<style scoped>
.sv { border-radius: var(--radius); overflow: hidden; background: #fff; border: 1px solid var(--line); outline: none; }
.sv__stage { aspect-ratio: 16 / 9; position: relative; overflow: hidden; background: #fff; }
.sv__slide { position: absolute; inset: 0; display: grid; grid-template-columns: 1.2fr 1fr; align-items: center; gap: 4%; padding: 5% 6%; }
.sv__slide--cover { background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 70%, #000)); color: #fff; }
.sv__slide--cover h3 { color: #fff !important; font-size: clamp(1.4rem, 4.5vw, 2.6rem) !important; }
.sv__slide--cover li { background: rgba(255, 255, 255, 0.15) !important; color: #fff; }
.sv__num { font-size: 0.75rem; font-weight: 700; opacity: 0.6; }
.sv__text h3 { margin: 0.2em 0 0.6em; font-size: clamp(1.1rem, 3vw, 1.9rem); color: color-mix(in srgb, var(--c) 75%, #000); }
.sv__text ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5em; }
.sv__text li { font-size: clamp(0.82rem, 1.9vw, 1.08rem); font-weight: 600; padding: 0.35em 0.8em; border-radius: 10px; background: color-mix(in srgb, var(--c) 8%, #fff); }
.sv__art { aspect-ratio: 200 / 140; }
.sv__bar { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0.75rem; border-top: 1px solid var(--line); background: color-mix(in srgb, var(--c) 4%, #fff); }
.sv__nav { width: 38px; height: 38px; border-radius: 50%; border: 0; background: var(--c); color: #fff; cursor: pointer; }
.sv__nav:disabled { opacity: 0.3; cursor: default; }
.sv__dots { display: flex; gap: 6px; }
.sv__dots button { width: 10px; height: 10px; border-radius: 999px; border: 0; background: color-mix(in srgb, var(--c) 25%, #fff); cursor: pointer; transition: all 0.2s; padding: 0; }
.sv__dots button.on { width: 26px; background: var(--c); }
.slide-f-enter-active, .slide-f-leave-active, .slide-b-enter-active, .slide-b-leave-active { transition: all 0.3s ease; }
.slide-f-enter-from, .slide-b-leave-to { opacity: 0; transform: translateX(-40px); }
.slide-f-leave-to, .slide-b-enter-from { opacity: 0; transform: translateX(40px); }
@media (max-width: 600px) { .sv__slide { grid-template-columns: 1fr; grid-template-rows: auto 1fr; } .sv__art { display: none; } }
</style>
