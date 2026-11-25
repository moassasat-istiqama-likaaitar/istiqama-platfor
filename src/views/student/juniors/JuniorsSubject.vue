<template>
  <div class="js" :style="{ '--c': s.color }">
    <RouterLink to="/app/my-lessons" class="back"><i class="pi pi-arrow-right flip" /> مناطق الاستكشاف</RouterLink>
    <header class="js__head">
      <span class="js__icon"><i :class="s.icon" /></span>
      <div class="js__info">
        <h1>{{ s.name }}</h1>
        <span>{{ s.axes.length }} فصول · {{ s.lessonsCount }} درساً · {{ s.doneCount }} مكتمل</span>
        <div class="js__bar"><span :style="{ width: s.progress + '%' }" /></div>
      </div>
      <div class="js__pct"><b>{{ s.progress }}%</b><small>مستكشف</small></div>
    </header>

    <!-- كل محور = فصل في المغامرة -->
    <section v-for="(ax, i) in s.axes" :key="i" class="chapter" :class="{ open: openIdx === i, complete: ax.done === ax.total }">
      <button type="button" class="chapter__head" @click="openIdx = openIdx === i ? -1 : i">
        <span class="chapter__num">{{ ax.done === ax.total ? '✓' : i + 1 }}</span>
        <div class="chapter__t">
          <small>الفصل {{ i + 1 }}</small>
          <strong>{{ axisName(ax.name) }}</strong>
        </div>
        <div class="chapter__dots">
          <span v-for="n in ax.total" :key="n" :class="{ on: n <= ax.done }" />
        </div>
        <span class="chapter__count">{{ ax.done }}/{{ ax.total }}</span>
        <i class="pi pi-angle-down chapter__caret" />
      </button>
      <div v-show="openIdx === i" class="chapter__body">
        <RouterLink v-for="l in lessonsOf(ax.name)" :key="l.id" :to="`/app/lesson/${l.id}`" class="cp" :class="`cp--${l.state}`">
          <span class="cp__mark"><i :class="l.state === 'done' ? 'pi pi-check' : l.state === 'current' ? 'pi pi-play' : l.state === 'locked' ? 'pi pi-lock' : 'pi pi-circle'" /></span>
          <div class="cp__body">
            <strong>{{ l.title }}</strong>
            <span class="cp__meta">
              <i v-for="ty in l.types" :key="ty" :class="typeIcon[ty]" />
              · {{ l.minutes }} د
              <span v-if="l.activities" class="cp__act"><i class="pi pi-flag" /> {{ l.activities }} مهمة</span>
              <span v-if="l.gender === 'female'" class="cp__g">مقرر الإناث</span>
            </span>
          </div>
          <span class="cp__xp">{{ l.state === 'done' ? 'مكتمل' : l.state === 'locked' ? 'لم يُفتح بعد' : '+20 XP' }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ s: { type: Object, required: true } })
const openIdx = ref(Math.max(0, props.s.axes.findIndex((a) => a.done < a.total)))
const lessonsOf = (ax) => props.s.lessons.filter((l) => l.axis === ax)
const axisName = (n) => (n.includes(':') ? n.split(':').slice(1).join(':').trim() : n)
const typeIcon = { video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
</script>

<style scoped>
.cp--locked { opacity: 0.5; pointer-events: none; }
.js { display: flex; flex-direction: column; gap: 0.9rem; }
.back { color: var(--muted); text-decoration: none; font-weight: 700; display: inline-flex; gap: 0.4rem; align-items: center; }
.js__head { display: flex; align-items: center; gap: 1rem; padding: 1.2rem 1.4rem; border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow); border-inline-start: 8px solid var(--c); }
.js__icon { width: 70px; height: 70px; border-radius: 20px; background: var(--c); color: #fff; display: grid; place-items: center; box-shadow: 0 5px 0 color-mix(in srgb, var(--c) 60%, #000); flex-shrink: 0; }
.js__icon i { font-size: 1.9rem; }
.js__info { flex: 1; min-width: 0; }
.js__info h1 { margin: 0; font-size: 1.7rem; }
.js__info span { color: var(--muted); font-size: 0.88rem; }
.js__bar { height: 10px; border-radius: 999px; background: color-mix(in srgb, var(--c) 15%, #fff); margin-top: 0.5rem; overflow: hidden; }
.js__bar span { display: block; height: 100%; background: var(--c); }
.js__pct { text-align: center; }
.js__pct b { font-size: 1.8rem; color: var(--c); display: block; line-height: 1; }
.js__pct small { color: var(--muted); font-weight: 700; }
.chapter { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.chapter__head { width: 100%; display: flex; align-items: center; gap: 0.9rem; padding: 0.9rem 1.1rem; border: 0; background: none; cursor: pointer; font: inherit; color: inherit; text-align: start; }
.chapter__num { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font-weight: 800; font-size: 1.15rem; background: color-mix(in srgb, var(--c) 12%, #fff); color: var(--c); flex-shrink: 0; }
.chapter.complete .chapter__num { background: #8ac926; color: #fff; }
.chapter__t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.chapter__t small { color: var(--muted); font-weight: 700; font-size: 0.72rem; }
.chapter__t strong { font-size: 1.02rem; }
.chapter__dots { display: flex; gap: 4px; flex-wrap: wrap; max-width: 160px; }
.chapter__dots span { width: 10px; height: 10px; border-radius: 3px; background: var(--line); }
.chapter__dots span.on { background: var(--c); }
.chapter__count { font-weight: 800; color: var(--muted); font-size: 0.85rem; }
.chapter__caret { transition: transform 0.2s; color: var(--muted); }
.chapter.open .chapter__caret { transform: rotate(180deg); }
.chapter__body { display: flex; flex-direction: column; gap: 0.4rem; padding: 0 1rem 1rem; }
.cp { display: flex; align-items: center; gap: 0.8rem; padding: 0.65rem 0.8rem; border-radius: 14px; background: var(--bg); text-decoration: none; color: inherit; border: 2px solid transparent; }
.cp:hover { border-color: var(--c); }
.cp--current { border-color: var(--c); background: color-mix(in srgb, var(--c) 7%, #fff); }
.cp__mark { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; border: 2px solid var(--c); color: var(--c); flex-shrink: 0; font-size: 0.8rem; }
.cp--done .cp__mark { background: var(--c); color: #fff; }
.cp--open .cp__mark { border-color: var(--line); color: var(--line); }
.cp__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.cp__meta { color: var(--muted); font-size: 0.78rem; display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.cp__act { color: #c2520c; font-weight: 700; }
.cp__g { background: #fde7f1; color: #b4236a; padding: 0 0.45rem; border-radius: 999px; font-weight: 700; }
.cp__xp { font-size: 0.75rem; font-weight: 800; color: #5f9a12; white-space: nowrap; }
.cp--done .cp__xp { color: var(--muted); }
@media (max-width: 640px) { .chapter__dots, .js__pct { display: none; } }
</style>
