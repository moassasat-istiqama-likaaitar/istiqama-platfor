<template>
  <!-- ED06 / ED01: تقارير المحتوى — الحجم، الحالات، التغطية، الأكثر مشاهدة، الأقل تقديراً -->
  <div v-if="s">
    <PageHeader :title="home ? `السلام عليكم، ${auth.person.firstName}` : 'تقارير المحتوى'" :subtitle="home ? 'لوحة المحرر: ما ينتظر المراجعة وصحة المكتبة المركزية' : 'صحة المكتبة المركزية وتغطيتها للمنهاج'" />
    <StatTiles :items="[
      { label: 'محتويات المكتبة', value: s.total, icon: 'pi pi-book' },
      { label: 'الواجبات والتقييمات', value: s.activities, icon: 'pi pi-question-circle', tone: 'purple' },
      { label: 'قيد المراجعة', value: (s.byStatus.pending || 0) + (s.byStatus.draft || 0), icon: 'pi pi-inbox', tone: 'amber', to: '/app/library-review' },
      { label: 'معتمد مؤقتاً', value: s.byStatus.temp || 0, icon: 'pi pi-hourglass', tone: 'blue', hint: 'يحتاج اعتماداً نهائياً' }
    ]" />
    <div class="g">
      <section class="panel">
        <h3>حالات المحتوى</h3>
        <BarList :rows="Object.entries(s.byStatus).map(([k, v]) => ({ label: STATUS[k] || k, value: v }))" />
      </section>
      <section class="panel">
        <h3>أنواع المحتوى</h3>
        <BarList :rows="Object.entries(s.byType).map(([k, v]) => ({ label: cat.TYPE_LABEL[k] || k, value: v }))" />
      </section>
      <section class="panel">
        <h3>تغطية الدروس بمحتوى إثرائي معتمد</h3>
        <BarList :rows="s.levels.map((l) => ({ label: l.label, sub: `${l.lessons} درساً`, value: l.enrich }))" :max="100" suffix="%" :warn-below="40" />
      </section>
      <section class="panel">
        <h3>أكثر المؤلفين إنتاجاً</h3>
        <BarList :rows="s.authors" suffix=" محتوى" />
      </section>
      <RecordTable class="span" :rows="s.topViewed" :columns="[{ field: 'title', label: 'الأكثر مشاهدة' }, { field: 'subjectName', label: 'المادة' }, { field: 'levelName', label: 'المستوى' }, { field: 'views', label: 'مشاهدات' }, { field: 'rating', label: 'التقييم' }]" :page-size="8" unit="" />
      <RecordTable class="span" :rows="s.lowRated" :columns="[{ field: 'title', label: 'الأقل تقديراً (للمراجعة)' }, { field: 'subjectName', label: 'المادة' }, { field: 'levelName', label: 'المستوى' }, { field: 'rating', label: 'التقييم' }, { field: 'views', label: 'مشاهدات' }]" :page-size="8" unit="" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import BarList from '@/components/ui/BarList.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { contentStats } from '@/api/editorial'

defineProps({ home: Boolean })
const auth = useAuthStore()
const cat = useCatalog()
const STATUS = { approved: 'معتمد', temp: 'معتمد مؤقتاً', pending: 'قيد المراجعة', draft: 'مسودة / تعديل', rejected: 'مرفوض' }
const s = ref(null)
onMounted(async () => (s.value = await contentStats()))
</script>

<style scoped>
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.g h3 { margin: 0 0 0.85rem; font-size: 1rem; }
.span { grid-column: 1 / -1; }
@media (max-width: 900px) { .g { grid-template-columns: 1fr; } }
</style>
