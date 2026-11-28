<template>
  <!-- جدول موحّد: بحث + مرشحات + ترتيب + ترقيم صفحات + أعمدة قابلة للتخصيص -->
  <div class="rt panel">
    <div class="rt__bar">
      <span v-if="searchKeys.length" class="rt__search">
        <i class="pi pi-search" />
        <input v-model="q" :placeholder="searchPlaceholder" />
      </span>
      <Select v-for="f in filters" :key="f.key" v-model="active[f.key]" :options="f.options" option-label="label" option-value="value" :placeholder="f.label" show-clear class="rt__filter" />
      <span class="rt__count muted">{{ shown.length }} {{ unit }}</span>
      <label v-if="shown.length > PER_OPTS[0].value" class="rt__per"><span class="muted">في الصفحة</span><Select v-model="per" :options="PER_OPTS" option-label="label" option-value="value" class="rt__per-sel" @change="savePer" /></label>
      <div class="rt__tools"><slot name="toolbar" /></div>
    </div>
    <DataTable :value="shown" :data-key="rowKey" :paginator="per > 0 && shown.length > per" :rows="per > 0 ? per : shown.length || 1" :loading="loading" striped-rows removable-sort size="small" :row-class="rowClass" :selection="selection" :selection-mode="selectable ? 'multiple' : undefined" @update:selection="$emit('update:selection', $event)" @row-click="$emit('row-click', $event.data)">
      <Column v-if="selectable" selection-mode="multiple" header-style="width: 3rem" />
      <Column v-for="c in columns" :key="c.field" :field="c.field" :header="c.label" :sortable="c.sortable !== false" :style="c.width ? { width: c.width } : null">
        <template #body="{ data }">
          <slot :name="'cell-' + c.field" :row="data" :value="data[c.field]">
            <template v-if="c.type === 'person'">
              <span class="rt__person"><span class="rt__av" :style="{ background: hue(data[c.field]) }">{{ (data[c.field] || '?').charAt(0) }}</span><span><b>{{ data[c.field] }}</b><small v-if="c.sub" class="muted">{{ data[c.sub] }}</small></span></span>
            </template>
            <template v-else-if="c.type === 'progress'">
              <span class="rt__prog"><span class="rt__bar2"><i :style="{ width: (data[c.field] || 0) + '%' }" :class="{ low: data[c.field] < 35 }" /></span><bdi dir="ltr">{{ data[c.field] }}%</bdi></span>
            </template>
            <template v-else-if="c.type === 'status'"><StatusTag :status="data[c.field]" /></template>
            <template v-else-if="c.type === 'date'">{{ fmtDate(data[c.field]) }}</template>
            <template v-else-if="c.type === 'list'">{{ (data[c.field] || []).join('، ') || '—' }}</template>
            <template v-else>{{ data[c.field] ?? '—' }}</template>
          </slot>
        </template>
      </Column>
      <Column v-if="$slots.actions" header="" style="width: 1%; white-space: nowrap">
        <template #body="{ data }"><div class="rt__actions"><slot name="actions" :row="data" /></div></template>
      </Column>
      <template #empty><div class="rt__empty"><i class="pi pi-inbox" /> {{ emptyText }}</div></template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import StatusTag from './StatusTag.vue'
import { storage } from '@/utils/storage'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  searchKeys: { type: Array, default: () => [] },
  searchPlaceholder: { type: String, default: 'بحث…' },
  filters: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  pageSize: { type: Number, default: 12 },
  loading: Boolean,
  unit: { type: String, default: 'عنصر' },
  emptyText: { type: String, default: 'لا توجد بيانات' },
  selectable: Boolean,
  selection: Array,
  rowClass: Function
})
defineEmits(['row-click', 'update:selection'])

const q = ref('')
const active = reactive({})
const norm = (v) => String(v ?? '').toLowerCase()
const shown = computed(() =>
  props.rows.filter((r) => {
    if (q.value && !props.searchKeys.some((k) => norm(r[k]).includes(norm(q.value)))) return false
    return props.filters.every((f) => active[f.key] === undefined || active[f.key] === null || (f.match ? f.match(r, active[f.key]) : r[f.key] === active[f.key]))
  })
)
const HUES = ['#3159e8', '#0a9bdc', '#17a077', '#8457d6', '#e0457b', '#ef7d32', '#1590c7']
const hue = (s) => HUES[[...String(s || '')].reduce((n, ch) => n + ch.charCodeAt(0), 0) % HUES.length]
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

/* عدد الصفوف في الصفحة يختاره المستخدم (أو «الكل»)، ويُحفظ اختياره لكل الجداول */
const PER_OPTS = [{ label: '12', value: 12 }, { label: '25', value: 25 }, { label: '50', value: 50 }, { label: '100', value: 100 }, { label: 'الكل', value: 0 }]
const per = ref(storage.get('ist.perPage') ?? props.pageSize)
const savePer = () => storage.set('ist.perPage', per.value)
</script>

<style scoped>
.rt__per { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; }
.rt__per-sel { min-width: 0; }
.rt { padding: 0; overflow: hidden; }
.rt__bar { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; padding: 0.85rem 1rem; border-bottom: 1px solid var(--line); }
.rt__search { display: flex; align-items: center; gap: 0.5rem; flex: 1 1 220px; max-width: 340px; border: 1px solid var(--line); border-radius: 10px; padding: 0.45rem 0.75rem; background: var(--surface); }
.rt__search input { border: 0; outline: 0; flex: 1; font: inherit; background: none; color: var(--ink); min-width: 0; }
.rt__filter { min-width: 150px; }
.rt__count { font-size: 0.82rem; }
.rt__tools { margin-inline-start: auto; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.rt__person { display: inline-flex; align-items: center; gap: 0.6rem; }
.rt__person b { display: block; font-weight: 700; }
.rt__person small { display: block; font-size: 0.78rem; }
.rt__av { width: 32px; height: 32px; border-radius: 50%; color: #fff; display: grid; place-items: center; font-weight: 800; flex-shrink: 0; }
.rt__prog { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
.rt__bar2 { width: 80px; height: 6px; border-radius: 3px; background: var(--line); overflow: hidden; display: inline-block; }
.rt__bar2 i { display: block; height: 100%; background: var(--brand); border-radius: 3px; }
.rt__bar2 i.low { background: #e5484d; }
.rt__actions { display: flex; gap: 0.25rem; justify-content: flex-end; }
.rt__empty { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
.rt :deep(.p-datatable-table-container) { overflow-x: auto; }
.rt :deep(tr) { cursor: default; }
</style>
