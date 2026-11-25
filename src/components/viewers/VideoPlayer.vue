<template>
  <!-- فيديو حقيقي -->
  <div v-if="payload.src" class="vp">
    <video :src="payload.src" :poster="payload.poster" controls playsinline preload="metadata" class="vp__video" @ended="$emit('ended')" />
  </div>

  <!-- درس متحرك (يُستبدل لاحقاً بفيديو المعلم المرفوع) -->
  <div v-else class="vp vp--motion" :style="{ '--c': color, '--a': accent }">
    <div class="motion" @click="toggle">
      <Transition name="scene" mode="out-in">
        <div :key="idx" class="motion__scene">
          <div class="motion__art"><LessonArt :kind="scene.art || art" :color="color" :accent="accent" bare /></div>
          <div class="motion__text">
            <h3>{{ scene.title }}</h3>
            <ul>
              <li v-for="(b, i) in scene.bullets" :key="i" :style="{ animationDelay: 0.25 + i * 0.35 + 's' }">{{ b }}</li>
            </ul>
          </div>
        </div>
      </Transition>
      <button v-if="!playing" type="button" class="motion__play" :aria-label="'play'"><i class="pi pi-play" /></button>
    </div>
    <div class="vp__controls">
      <button type="button" class="vp__btn" @click="toggle"><i :class="playing ? 'pi pi-pause' : 'pi pi-play'" /></button>
      <div class="vp__track" @click="seek">
        <span :style="{ width: progress + '%' }" />
      </div>
      <span class="vp__time">{{ fmt(elapsed) }} / {{ fmt(total) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import LessonArt from '@/components/art/LessonArt.vue'

const props = defineProps({
  payload: { type: Object, required: true },
  color: { type: String, default: '#3159e8' },
  accent: { type: String, default: '#ffc93c' },
  art: { type: String, default: 'book' }
})
const emit = defineEmits(['ended'])

const SCENE = 5 // ثوانٍ لكل مشهد
const scenes = computed(() => props.payload.scenes || [])
const total = computed(() => scenes.value.length * SCENE)
const elapsed = ref(0)
const playing = ref(false)
let timer = null

const idx = computed(() => Math.min(scenes.value.length - 1, Math.floor(elapsed.value / SCENE)))
const scene = computed(() => scenes.value[idx.value] || { title: '', bullets: [] })
const progress = computed(() => (total.value ? (elapsed.value / total.value) * 100 : 0))

function toggle() {
  playing.value ? pause() : play()
}
function play() {
  if (elapsed.value >= total.value) elapsed.value = 0
  playing.value = true
  timer = setInterval(() => {
    elapsed.value = Math.min(total.value, elapsed.value + 0.25)
    if (elapsed.value >= total.value) {
      pause()
      emit('ended')
    }
  }, 250)
}
function pause() {
  playing.value = false
  clearInterval(timer)
}
function seek(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const rtl = getComputedStyle(e.currentTarget).direction === 'rtl'
  const ratio = rtl ? (rect.right - e.clientX) / rect.width : (e.clientX - rect.left) / rect.width
  elapsed.value = Math.max(0, Math.min(total.value, ratio * total.value))
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.vp { border-radius: var(--radius); overflow: hidden; background: #0e1320; }
.vp__video { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; }

.vp--motion { background: color-mix(in srgb, var(--c) 10%, #fff); }
.motion { position: relative; aspect-ratio: 16 / 9; cursor: pointer; overflow: hidden; background: linear-gradient(135deg, color-mix(in srgb, var(--c) 14%, #fff), color-mix(in srgb, var(--a) 22%, #fff)); }
.motion__scene { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1.1fr; align-items: center; gap: 4%; padding: 5% 7%; }
.motion__art { aspect-ratio: 200 / 140; }
.motion__text h3 { margin: 0 0 0.6em; font-size: clamp(1.1rem, 3.2vw, 2rem); color: color-mix(in srgb, var(--c) 70%, #000); }
.motion__text ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.45em; }
.motion__text li { font-size: clamp(0.85rem, 2vw, 1.15rem); font-weight: 600; background: rgba(255, 255, 255, 0.75); padding: 0.35em 0.8em; border-radius: 12px; opacity: 0; animation: rise 0.5s forwards; border-inline-start: 4px solid var(--a); }
@keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.motion__play { position: absolute; inset: 0; margin: auto; width: 76px; height: 76px; border-radius: 50%; border: 0; background: var(--c); color: #fff; font-size: 1.6rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); cursor: pointer; }
.motion__play i { font-size: 1.8rem; margin-inline-start: 4px; }
.scene-enter-active, .scene-leave-active { transition: opacity 0.35s, transform 0.35s; }
.scene-enter-from { opacity: 0; transform: translateX(-20px); }
.scene-leave-to { opacity: 0; transform: translateX(20px); }

.vp__controls { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0.8rem; background: #0e1320; color: #fff; }
.vp__btn { width: 34px; height: 34px; border-radius: 50%; border: 0; background: rgba(255, 255, 255, 0.12); color: #fff; cursor: pointer; }
.vp__track { flex: 1; height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.2); cursor: pointer; overflow: hidden; }
.vp__track span { display: block; height: 100%; background: var(--a); border-radius: inherit; transition: width 0.25s linear; }
.vp__time { font-size: 0.78rem; font-variant-numeric: tabular-nums; direction: ltr; opacity: 0.85; }
@media (max-width: 600px) { .motion__scene { grid-template-columns: 0.8fr 1.2fr; padding: 4%; } }
</style>
