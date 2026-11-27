<template>
  <!-- ED: فتح الدروس للمستوى — المحرر يفتح (فوراً أو بتاريخ) فيستطيع المعلمون الإدراج، ثم يفتح كل معلم لتلاميذه -->
  <div>
    <PageHeader title="فتح الدروس" subtitle="بداية الموسم كل الدروس مغلقة. ما تفتحه هنا يستطيع معلمو المستوى إدراج المحتوى والواجبات والتقييمات فيه، ثم يفتحه كل معلم لتلاميذه (تلقائياً أو بتاريخه)." />
    <div class="top panel">
      <div class="lv">
        <button v-for="l in auth.active.levels || []" :key="l.id" type="button" class="pill" :class="{ 'is-active': levelId === l.id }" @click="levelId = l.id">{{ l.name }}</button>
      </div>
      <div class="legend muted"><span><i class="pi pi-lock-open" /> مفتوح</span><span><i class="pi pi-clock" /> مجدول</span><span><i class="pi pi-lock" /> مغلق</span></div>
    </div>
    <details v-for="s in subjects" :key="s.id" class="panel subj" :open="s === subjects[0]">
      <summary>
        <span class="ic" :style="{ background: s.color }"><i :class="s.icon" /></span><b>{{ s.name }}</b>
        <small class="muted">{{ count(s, 'open') }} مفتوح · {{ count(s, 'scheduled') }} مجدول · {{ count(s, 'closed') }} مغلق</small>
      </summary>
      <table class="lt">
        <thead><tr><th>#</th><th>الدرس</th><th>الحالة</th><th></th></tr></thead>
        <tbody>
          <tr v-for="l in s.lessons" :key="l.id" :class="l.state">
            <td>{{ l.order }}</td>
            <td><b>{{ l.title }}</b><small class="muted"> · {{ l.axis }}<template v-if="l.gender"> · {{ l.gender === 'female' ? 'إناث' : 'ذكور' }}</template></small></td>
            <td><OpenControl :at="l.at" @set="(v) => setOne(s, l, v)" /></td>
            <td><Button label="افتح حتى هنا" text size="small" icon="pi pi-angle-double-up" @click="openUntil(s, l)" /></td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import OpenControl from '@/components/plan/OpenControl.vue'
import { useAuthStore } from '@/stores/auth'
import { levelPlan, saveLevelLessons } from '@/api/teaching'

const auth = useAuthStore()
const toast = useToast()
const levelId = ref(null)
const subjects = ref([])
const load = async () => (subjects.value = levelId.value ? await levelPlan(levelId.value) : [])
onMounted(() => (levelId.value = auth.active.levels?.[0]?.id || null))
watch(levelId, load)
const count = (s, st) => s.lessons.filter((l) => l.state === st).length
async function setOne(s, l, at) {
  await saveLevelLessons(s.id, { [l.id]: at })
  toast.add({ severity: 'success', summary: !at ? `أُغلق «${l.title}»` : at <= new Date().toISOString() ? `فُتح «${l.title}» للمعلمين` : `جُدول «${l.title}»`, life: 2000 })
  load()
}
async function openUntil(s, l) {
  const now = new Date().toISOString()
  const opens = Object.fromEntries(s.lessons.filter((x) => x.order <= l.order && x.state !== 'open').map((x) => [x.id, now]))
  await saveLevelLessons(s.id, opens)
  toast.add({ severity: 'success', summary: `فُتحت دروس «${s.name}» حتى: ${l.title}`, life: 2200 })
  load()
}
</script>

<style scoped>
.top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
.lv { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.legend { display: flex; gap: 1rem; font-size: 0.8rem; }
.subj { margin-bottom: 0.75rem; }
.subj summary { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; list-style: none; }
.ic { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; color: #fff; }
.subj summary small { margin-inline-start: auto; }
.lt { width: 100%; border-collapse: collapse; margin-top: 0.8rem; font-size: 0.88rem; }
@media (max-width: 700px) { .lt { display: block; overflow-x: auto; } }
.lt th { text-align: start; font-size: 0.78rem; color: var(--p-text-muted-color); padding: 0.4rem; border-bottom: 1px solid var(--line); }
.lt td { padding: 0.45rem 0.4rem; border-bottom: 1px solid var(--line); }
.lt tr.closed td:nth-child(2) { opacity: 0.6; }
</style>
