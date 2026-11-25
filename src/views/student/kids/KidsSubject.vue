<template>
  <div class="ks" :style="{ '--c': s.color, '--a': s.accent }">
    <header class="ks__head">
      <RouterLink to="/app/my-lessons" class="ks__back" aria-label="رجوع"><i class="pi pi-arrow-right flip" /></RouterLink>
      <span class="ks__icon"><i :class="s.icon" /></span>
      <div>
        <h1>{{ s.name }}</h1>
        <div class="ks__stars"><i v-for="n in 5" :key="n" class="pi" :class="n <= Math.round(s.progress / 20) ? 'pi-star-fill' : 'pi-star'" /></div>
      </div>
    </header>

    <!-- خريطة: كل محور جزيرة، وكل درس محطة -->
    <div v-for="(ax, ai) in groups" :key="ai" class="island">
      <div class="island__title"><span>{{ ai + 1 }}</span>{{ axisName(ax.name) }}</div>
      <div class="path">
        <div v-for="(l, i) in ax.lessons" :key="l.id" class="node" :class="`node--${l.state}`" :style="{ '--x': offset(i) }">
          <RouterLink :to="`/app/lesson/${l.id}`" class="node__btn" @click="tap">
            <i v-if="l.state === 'done'" class="pi pi-star-fill" />
            <i v-else-if="l.state === 'current'" class="pi pi-play" />
            <span v-else>{{ i + 1 }}</span>
          </RouterLink>
          <span class="node__name">{{ l.title }}</span>
        </div>
      </div>
    </div>
    <div class="finish"><i class="pi pi-trophy" /></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { chime } from '@/utils/celebrate'

const props = defineProps({ s: { type: Object, required: true } })
const groups = computed(() => props.s.axes.map((a) => ({ name: a.name, lessons: props.s.lessons.filter((l) => l.axis === a.name) })))
const axisName = (n) => (n.includes(':') ? n.split(':').slice(1).join(':').trim() : n)
const offset = (i) => `${[0, 60, 90, 60, 0, -60, -90, -60][i % 8]}px`
const tap = () => chime('tap', 'kids')
</script>

<style scoped>
.ks { display: flex; flex-direction: column; gap: 1rem; }
.ks__head { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; border-radius: 32px; background: var(--c); color: #fff; box-shadow: 0 8px 0 color-mix(in srgb, var(--c) 60%, #000); }
.ks__back { width: 52px; height: 52px; border-radius: 50%; background: rgba(255, 255, 255, 0.25); color: #fff; display: grid; place-items: center; text-decoration: none; font-size: 1.3rem; }
.ks__icon { width: 72px; height: 72px; border-radius: 50%; background: #fff; color: var(--c); display: grid; place-items: center; }
.ks__icon i { font-size: 2rem; }
.ks__head h1 { margin: 0; font-size: 2rem; }
.ks__stars i { color: #ffe066; font-size: 1.2rem; margin-inline-end: 2px; }
.island { background: var(--surface); border-radius: 32px; padding: 1.25rem 1rem 1.5rem; box-shadow: var(--shadow); }
.island__title { display: flex; align-items: center; gap: 0.6rem; font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; color: color-mix(in srgb, var(--c) 75%, #000); margin-bottom: 1rem; }
.island__title span { width: 40px; height: 40px; border-radius: 50%; background: var(--a); color: #fff; display: grid; place-items: center; }
.path { display: flex; flex-direction: column; align-items: center; gap: 1.1rem; position: relative; }
.node { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; transform: translateX(var(--x)); max-width: 220px; text-align: center; }
.node__btn { display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; text-decoration: none; font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; background: #fff; color: var(--c); border: 5px solid color-mix(in srgb, var(--c) 25%, #fff); box-shadow: 0 7px 0 color-mix(in srgb, var(--c) 22%, #ddd); transition: transform 0.12s; }
.node__btn:active { transform: translateY(5px); box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 22%, #ddd); }
.node--done .node__btn { background: #ffc93c; color: #fff; border-color: #fff; box-shadow: 0 7px 0 #d99a00; }
.node--current .node__btn { background: var(--c); color: #fff; border-color: #fff; box-shadow: 0 7px 0 color-mix(in srgb, var(--c) 60%, #000); animation: pulse 1.6s infinite; }
.node__btn i { font-size: 1.8rem; }
@keyframes pulse { 50% { transform: scale(1.08); } }
.node__name { font-weight: 700; font-size: 1rem; line-height: 1.3; }
.finish { align-self: center; width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, #ffd54a, #ff9f1c); color: #fff; display: grid; place-items: center; box-shadow: 0 7px 0 #c77700; }
.finish i { font-size: 2rem; }
@media (max-width: 560px) { .node { transform: translateX(calc(var(--x) * 0.5)); } .ks__icon { display: none; } }
</style>
