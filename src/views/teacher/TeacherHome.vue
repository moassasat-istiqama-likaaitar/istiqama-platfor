<template>
  <!-- TE01: لوحة المعلم — ما ينتظرني اليوم -->
  <div v-if="d">
    <PageHeader :title="`السلام عليكم، ${auth.person.gender === 'female' ? 'المعلمة' : 'المعلم'} ${auth.person.firstName}`" :subtitle="`${auth.active.school?.name} — ${d.classes.length} أقسام`" />
    <StatTiles :items="[
      { label: 'أقسامي', value: d.classes.length, icon: 'pi pi-th-large', to: { name: 'screen', params: { key: 'my-classes' } } },
      { label: 'تلاميذي', value: d.students, icon: 'pi pi-users', tone: 'purple' },
      { label: 'بانتظار التصحيح', value: d.pendingCount, icon: 'pi pi-inbox', tone: d.pendingCount ? 'amber' : 'green', to: { name: 'screen', params: { key: 'submissions' } } },
      { label: 'محتواي قيد المراجعة', value: d.uploads.review, icon: 'pi pi-clock', tone: 'blue', hint: `من ${d.uploads.total} عنصراً`, to: { name: 'screen', params: { key: 'my-files' } } }
    ]" />

    <div class="th-grid">
      <section class="panel">
        <header class="sec"><h2><i class="pi pi-inbox" /> تسليمات تنتظر التصحيح</h2><RouterLink to="/app/submissions" class="lnk">الكل</RouterLink></header>
        <ul v-if="d.pending.length" class="list">
          <li v-for="s in d.pending" :key="s.id">
            <span class="av">{{ s.student.charAt(0) }}</span>
            <div><b>{{ s.student }}</b><small>{{ s.title }} · {{ s.className }}</small></div>
            <RouterLink :to="{ path: '/app/submissions', query: { open: s.id } }" class="go">صحّح</RouterLink>
          </li>
        </ul>
        <p v-else class="muted"><i class="pi pi-check-circle" /> لا تسليمات معلّقة.</p>
      </section>

      <section class="panel">
        <header class="sec"><h2><i class="pi pi-exclamation-triangle" /> تلاميذ يحتاجون متابعة</h2></header>
        <ul v-if="d.atRisk.length" class="list">
          <li v-for="s in d.atRisk" :key="s.id">
            <span class="av warn">{{ s.name.charAt(0) }}</span>
            <div><b>{{ s.name }}</b><small>{{ s.className }} · تقدّم {{ s.progress }}%{{ s.late ? ` · ${s.late} متأخرة` : '' }}</small></div>
          </li>
        </ul>
        <p v-else class="muted">كل التلاميذ في المسار.</p>
      </section>

      <section class="panel span2">
        <header class="sec"><h2><i class="pi pi-th-large" /> أقسامي</h2></header>
        <div class="classes">
          <RouterLink v-for="c in d.classes" :key="c.id" :to="{ path: '/app/my-classes', query: { class: c.id } }" class="cl">
            <b>{{ c.name }}</b>
            <small class="muted">{{ c.students }} تلميذاً · {{ c.genderLabel }}</small>
            <div class="cl__bar"><i :style="{ width: c.progress + '%' }" /></div>
            <small>تقدّم القسم <bdi dir="ltr">{{ c.progress }}%</bdi> · المعدل {{ c.average }}/20</small>
            <span v-if="c.atRisk" class="cl__risk"><i class="pi pi-exclamation-circle" /> {{ c.atRisk }} يحتاجون متابعة</span>
          </RouterLink>
        </div>
      </section>

      <section class="panel span2">
        <header class="sec"><h2><i class="pi pi-calendar" /> واجبات وتقييمات قادمة في أقسامي</h2><RouterLink to="/app/new-homework" class="lnk">+ واجب جديد</RouterLink></header>
        <ul class="list">
          <li v-for="a in d.upcoming" :key="a.id">
            <span class="av ic"><i :class="a.type === 'quiz' ? 'pi pi-question' : 'pi pi-pencil'" /></span>
            <div><b>{{ a.title }}</b><small>{{ a.className }} · {{ new Date(a.due).toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' }) }}</small></div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import { useAuthStore } from '@/stores/auth'
import { teacherHome } from '@/api/teaching'

const auth = useAuthStore()
const d = ref(null)
watch(() => auth.activeAssignmentId, async () => (d.value = await teacherHome(auth.active)), { immediate: true })
</script>

<style scoped>
.th-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.span2 { grid-column: 1 / -1; }
.sec { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
.sec h2 { font-size: 1rem; margin: 0; display: flex; gap: 0.5rem; align-items: center; }
.sec h2 i { color: var(--brand); }
.lnk { font-size: 0.85rem; color: var(--brand); text-decoration: none; font-weight: 700; }
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.list li { display: flex; align-items: center; gap: 0.7rem; }
.list b { display: block; font-size: 0.9rem; }
.list small { color: var(--p-text-muted-color); font-size: 0.78rem; }
.av { width: 34px; height: 34px; border-radius: 50%; background: color-mix(in srgb, var(--brand) 14%, #fff); color: var(--brand); display: grid; place-items: center; font-weight: 800; flex-shrink: 0; }
.av.warn { background: #fdeeee; color: #b42318; }
.av.ic { border-radius: 10px; }
.go { margin-inline-start: auto; font-size: 0.82rem; font-weight: 700; color: #fff; background: var(--brand); padding: 0.3rem 0.8rem; border-radius: 8px; text-decoration: none; }
.classes { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(230px, 100%), 1fr)); gap: 0.75rem; }
.cl { display: flex; flex-direction: column; gap: 0.3rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 12px; text-decoration: none; color: inherit; }
.cl:hover { border-color: var(--brand); }
.cl__bar { height: 6px; background: var(--line); border-radius: 3px; overflow: hidden; margin-top: 0.4rem; }
.cl__bar i { display: block; height: 100%; background: var(--brand); }
.cl__risk { font-size: 0.78rem; color: #b42318; }
@media (max-width: 900px) { .th-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
