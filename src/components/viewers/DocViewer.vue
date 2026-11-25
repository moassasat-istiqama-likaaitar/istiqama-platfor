<template>
  <div class="dv" :style="{ '--c': color }">
    <div class="dv__toolbar">
      <span class="dv__name"><i class="pi pi-file-pdf" /> {{ title }}.pdf</span>
      <span class="dv__pager">
        <button type="button" :disabled="p === 0" @click="p--"><i class="pi pi-angle-right flip" /></button>
        {{ p + 1 }} / {{ pages.length }}
        <button type="button" :disabled="p === pages.length - 1" @click="next"><i class="pi pi-angle-left flip" /></button>
      </span>
      <button type="button" class="dv__dl" @click="$emit('download')"><i class="pi pi-download" /></button>
    </div>
    <div class="dv__desk">
      <article class="dv__page">
        <header class="dv__head">
          <span>منصة الاستقامة</span><span>{{ p + 1 }}</span>
        </header>
        <h3>{{ page.heading }}</h3>
        <p v-for="(t, k) in page.paragraphs" :key="k">{{ t }}</p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ payload: { type: Object, required: true }, title: String, color: { type: String, default: '#3159e8' } })
const emit = defineEmits(['ended', 'download'])
const pages = computed(() => props.payload.pages || [])
const p = ref(0)
const page = computed(() => pages.value[p.value] || { heading: '', paragraphs: [] })
function next() {
  p.value++
  if (p.value === pages.value.length - 1) emit('ended')
}
</script>

<style scoped>
.dv { border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); background: #e9ebf0; }
.dv__toolbar { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.8rem; background: #2b2f3a; color: #fff; font-size: 0.85rem; }
.dv__name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; gap: 0.4rem; align-items: center; }
.dv__name i { color: #ff6b6b; }
.dv__pager { display: flex; align-items: center; gap: 0.4rem; direction: ltr; }
.dv__pager button, .dv__dl { border: 0; background: rgba(255, 255, 255, 0.12); color: #fff; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; }
.dv__pager button:disabled { opacity: 0.3; }
.dv__desk { padding: 1.25rem; max-height: 560px; overflow: auto; }
.dv__page { background: #fff; max-width: 620px; margin: 0 auto; min-height: 420px; padding: 2rem 2.25rem; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12); font-family: 'Cairo', sans-serif; color: #222; }
.dv__head { display: flex; justify-content: space-between; font-size: 0.7rem; color: #999; border-bottom: 2px solid var(--c); padding-bottom: 0.4rem; margin-bottom: 1.25rem; }
.dv__page h3 { color: var(--c); font-family: 'Cairo', sans-serif; margin: 0 0 1rem; }
.dv__page p { line-height: 2; margin: 0 0 0.9rem; text-align: justify; }
@media (max-width: 560px) { .dv__page { padding: 1.25rem; } .dv__desk { padding: 0.6rem; } }
</style>
