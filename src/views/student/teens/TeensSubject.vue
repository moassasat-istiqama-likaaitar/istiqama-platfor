<template>
  <div class="ts" :style="{ '--c': s.color }">
    <header class="ts__head">
      <div>
        <small class="muted">المقرر</small>
        <h1><span class="sq" />{{ s.name }}</h1>
      </div>
      <div class="ts__meta">
        <div><b>{{ s.progress }}%</b><small>مُنجز</small></div>
        <div><b>{{ s.doneCount }}/{{ s.lessonsCount }}</b><small>دروس</small></div>
        <div><b>{{ s.axes.length }}</b><small>محاور</small></div>
      </div>
    </header>

    <!-- مخطط المقرر: محاور ودروس في جدول -->
    <section v-for="(ax, i) in s.axes" :key="i" class="sec">
      <header class="sec__head">
        <span class="sec__n">{{ i + 1 }}</span>
        <strong>{{ axisName(ax.name) }}</strong>
        <span class="sec__p">{{ ax.done }}/{{ ax.total }}</span>
        <div class="sec__bar"><span :style="{ width: (ax.done / ax.total) * 100 + '%' }" /></div>
      </header>
      <table class="tbl">
        <thead><tr><th>#</th><th>الدرس</th><th class="hide-sm">المحتوى</th><th class="hide-sm">المدة</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="l in lessonsOf(ax.name)" :key="l.id" :class="`r--${l.state}`" @click="$router.push(`/app/lesson/${l.id}`)">
            <td class="num">{{ l.order }}</td>
            <td>
              <RouterLink :to="`/app/lesson/${l.id}`" class="lt" @click.stop>{{ l.title }}</RouterLink>
              <span v-if="l.isNew && l.state !== 'done'" class="new">جديد</span>
              <span v-if="l.gender === 'female'" class="g">مقرر الإناث</span>
            </td>
            <td class="hide-sm types"><i v-for="ty in l.types" :key="ty" :class="typeIcon[ty]" v-tooltip.top="ty" /></td>
            <td class="hide-sm num">{{ l.minutes }} د</td>
            <td><span class="st" :class="`st--${l.state}`">{{ stateLabel[l.state] }}</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
const props = defineProps({ s: { type: Object, required: true } })
const lessonsOf = (ax) => props.s.lessons.filter((l) => l.axis === ax)
const axisName = (n) => n
const typeIcon = { video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
const stateLabel = { done: 'مكتمل', current: 'التالي', open: 'لم يبدأ' }
</script>

<style scoped>
.ts { display: flex; flex-direction: column; gap: 1rem; }
.ts__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; padding-bottom: 0.9rem; border-bottom: 1px solid var(--line); }
.ts__head h1 { margin: 0; font-size: 1.7rem; display: flex; align-items: center; gap: 0.6rem; }
.sq { width: 14px; height: 14px; border-radius: 4px; background: var(--c); }
.ts__meta { display: flex; gap: 1.5rem; }
.ts__meta div { display: flex; flex-direction: column; }
.ts__meta b { font-size: 1.25rem; font-variant-numeric: tabular-nums; }
.ts__meta small { color: var(--muted); font-size: 0.75rem; }
.sec { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.sec__head { display: grid; grid-template-columns: auto 1fr auto 120px; gap: 0.75rem; align-items: center; padding: 0.75rem 1rem; background: color-mix(in srgb, var(--c) 5%, #fff); border-bottom: 1px solid var(--line); }
.sec__n { width: 28px; height: 28px; border-radius: 8px; background: var(--c); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 0.85rem; }
.sec__p { font-size: 0.82rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.sec__bar { height: 6px; border-radius: 999px; background: var(--line); overflow: hidden; }
.sec__bar span { display: block; height: 100%; background: var(--c); }
.tbl { width: 100%; border-collapse: collapse; font-size: 0.9rem; table-layout: fixed; }
.tbl th:nth-child(1) { width: 56px; } .tbl th:nth-child(3) { width: 130px; } .tbl th:nth-child(4) { width: 90px; } .tbl th:nth-child(5) { width: 110px; }
.tbl th { text-align: start; font-size: 0.72rem; color: var(--muted); font-weight: 700; padding: 0.5rem 1rem; border-bottom: 1px solid var(--line); }
.tbl td { padding: 0.6rem 1rem; border-bottom: 1px solid var(--line); }
.tbl tr:last-child td { border-bottom: 0; }
.tbl tbody tr { cursor: pointer; }
.tbl tbody tr:hover { background: var(--bg); }
.num { color: var(--muted); font-variant-numeric: tabular-nums; width: 50px; }
.lt { color: inherit; text-decoration: none; font-weight: 600; }
.r--done .lt { color: var(--muted); }
.types i { color: var(--muted); margin-inline-end: 0.4rem; font-size: 0.85rem; }
.new, .g { font-size: 0.66rem; font-weight: 700; padding: 0.05rem 0.4rem; border-radius: 6px; margin-inline-start: 0.4rem; }
.new { background: color-mix(in srgb, var(--brand) 12%, #fff); color: var(--brand); }
.g { background: #fde7f1; color: #b4236a; }
.st { font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 6px; white-space: nowrap; }
.st--done { background: #e7f8ee; color: #15803d; }
.st--current { background: var(--c); color: #fff; }
.st--open { background: var(--bg); color: var(--muted); }
@media (max-width: 640px) { .tbl th:nth-child(5) { width: 90px; } .hide-sm { display: none; } .sec__head { grid-template-columns: auto 1fr auto; } .sec__bar { display: none; } .tbl td, .tbl th { padding: 0.55rem 0.6rem; } }
</style>
