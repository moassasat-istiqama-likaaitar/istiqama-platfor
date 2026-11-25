<template>
  <!-- AD11: المواد والدروس — من «سيرورة الدروس» -->
  <div>
    <PageHeader title="المواد والدروس" subtitle="المواد ومحاورها ودروسها لكل مستوى (البرنامج الموحد — سيرورة الدروس)." />
    <RecordTable :rows="rows" :columns="[{ field: 'name', label: 'المادة' }, { field: 'levels', label: 'المستويات', type: 'list' }, { field: 'axes', label: 'المحاور' }, { field: 'lessons', label: 'الدروس' }, { field: 'contents', label: 'المحتويات' }]" unit="مادة">
      <template #cell-name="{ row }"><span class="sn"><span class="ic" :style="{ background: row.color }"><i :class="row.icon" /></span><b>{{ row.name }}</b></span></template>
      <template #actions="{ row }"><Button label="المحاور والدروس" size="small" text icon="pi pi-sitemap" @click="open(row)" /></template>
    </RecordTable>
    <Dialog :visible="!!tree" modal :header="cur?.name" :style="{ width: 'min(760px, 96vw)' }" @update:visible="tree = null">
      <div v-if="tree">
        <details v-for="lv in tree" :key="lv.level" class="lv" open>
          <summary><b>{{ lv.level }}</b> <small class="muted">{{ lv.axes.length }} محاور</small></summary>
          <div v-for="ax in lv.axes" :key="ax.name" class="ax">
            <h4>{{ ax.name }}</h4>
            <ol><li v-for="l in ax.lessons" :key="l.title">{{ l.label ? l.label + ': ' : '' }}{{ l.title }} <span v-if="l.gender === 'female'" class="g">إناث</span></li></ol>
          </div>
        </details>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { listSubjects, subjectTree } from '@/api/admin'

const rows = ref([])
const tree = ref(null)
const cur = ref(null)
onMounted(async () => (rows.value = await listSubjects()))
async function open(row) {
  cur.value = row
  tree.value = await subjectTree(row.name)
}
</script>

<style scoped>
.sn { display: inline-flex; align-items: center; gap: 0.5rem; }
.ic { width: 28px; height: 28px; border-radius: 8px; color: #fff; display: grid; place-items: center; font-size: 0.85rem; }
.lv { margin-bottom: 0.75rem; border: 1px solid var(--line); border-radius: 12px; padding: 0.6rem 0.9rem; }
.lv summary { cursor: pointer; }
.ax h4 { margin: 0.75rem 0 0.3rem; font-size: 0.92rem; color: var(--brand); }
.ax ol { margin: 0; padding-inline-start: 1.3rem; font-size: 0.88rem; line-height: 1.9; }
.g { font-size: 0.72rem; background: #fde7f1; color: #b0306c; border-radius: 999px; padding: 0 0.45rem; }
</style>
