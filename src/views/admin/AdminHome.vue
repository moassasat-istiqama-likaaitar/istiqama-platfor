<template>
  <!-- AD01: لوحة الإدارة العامة — كل المدارس في نظرة واحدة -->
  <div v-if="r">
    <PageHeader :title="`السلام عليكم، ${auth.person.firstName}`" :subtitle="`${t('roles.' + auth.role)} — ${r.schools.length} مدرسة في المنصة`" />
    <StatTiles :items="[
      { label: 'التلاميذ', value: r.totals.students.toLocaleString('ar-DZ'), icon: 'pi pi-users', to: '/app/users-list' },
      { label: 'المعلمون', value: r.totals.teachers, icon: 'pi pi-graduation-cap', tone: 'purple' },
      { label: 'الأولياء', value: r.totals.parents.toLocaleString('ar-DZ'), icon: 'pi pi-heart', tone: 'red' },
      { label: 'نشطون هذا الأسبوع', value: Math.round((r.totals.active / Math.max(1, r.totals.students)) * 100) + '%', icon: 'pi pi-bolt', tone: 'amber' },
      { label: 'ينتظر المراجعة', value: r.pendingReview, icon: 'pi pi-inbox', tone: 'blue', to: '/app/library-review' }
    ]" />
    <div class="g">
      <section class="panel">
        <h3>التلاميذ النشطون أسبوعياً</h3>
        <TrendLine :data="r.weekly" label="النشطون أسبوعياً" />
      </section>
      <section class="panel">
        <h3>يحتاج قرارك</h3>
        <ul class="todo">
          <li><RouterLink to="/app/branding-requests"><i class="pi pi-verified" /> طلبات هويات المدارس <b>{{ brandingPending }}</b></RouterLink></li>
          <li><RouterLink to="/app/library-review"><i class="pi pi-check-square" /> محتوى ينتظر المراجعة <b>{{ r.pendingReview }}</b></RouterLink></li>
          <li><RouterLink to="/app/tickets"><i class="pi pi-ticket" /> بلاغات مفتوحة <b>{{ openTickets }}</b></RouterLink></li>
          <li><RouterLink to="/app/users-duplicates"><i class="pi pi-clone" /> حسابات محتملة التكرار</RouterLink></li>
        </ul>
      </section>
      <RecordTable class="span" :rows="r.schools" :columns="[
        { field: 'name', label: 'المدرسة' }, { field: 'students', label: 'التلاميذ' }, { field: 'teachers', label: 'المعلمون' }, { field: 'classes', label: 'الأقسام' },
        { field: 'progress', label: 'التقدّم', type: 'progress' }, { field: 'average', label: 'المعدل' }, { field: 'active', label: 'النشاط %' }, { field: 'atRisk', label: 'متعثرون' }
      ]" :search-keys="['name']" unit="مدرسة" :page-size="10">
        <template #toolbar><RouterLink to="/app/reports-schools" class="p-button p-component p-button-sm p-button-outlined">تقرير المدارس</RouterLink></template>
      </RecordTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import TrendLine from '@/components/ui/TrendLine.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { globalReport } from '@/api/admin'
import { listRequests } from '@/api/branding'
import { listTickets } from '@/api/support'

const { t } = useI18n()
const auth = useAuthStore()
const r = ref(null)
const brandingPending = ref(0)
const openTickets = ref(0)
onMounted(async () => {
  const [g, br, tk] = await Promise.all([globalReport(), listRequests(), listTickets()])
  brandingPending.value = br.filter((x) => x.status === 'pending').length
  openTickets.value = tk.filter((x) => !['done', 'resolved'].includes(x.status)).length
  r.value = g
})
</script>

<style scoped>
.g { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; }
.g h3 { margin: 0 0 0.85rem; font-size: 1rem; }
.span { grid-column: 1 / -1; }
.todo { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.todo a { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.8rem; border: 1px solid var(--line); border-radius: 10px; text-decoration: none; color: inherit; }
.todo a:hover { border-color: var(--brand); }
.todo i { color: var(--brand); }
.todo b { margin-inline-start: auto; background: var(--bg); padding: 0 0.55rem; border-radius: 999px; }
@media (max-width: 900px) { .g { grid-template-columns: 1fr; } }
</style>
