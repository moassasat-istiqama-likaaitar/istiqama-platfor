<template>
  <!-- AD09: المواسم الدراسية -->
  <div>
    <PageHeader title="المواسم الدراسية" subtitle="الموسم النشط وفصوله. أرشفة الموسم تحفظ كل بياناته للقراءة فقط." />
    <div class="ss">
      <div v-for="s in rows" :key="s.id" class="panel se" :class="{ active: s.status === 'active' }">
        <header><h3>{{ s.name }}</h3><StatusTag :status="s.status === 'active' ? 'active' : 'archived'" /></header>
        <p class="muted">{{ fmt(s.start) }} ← {{ fmt(s.end) }}</p>
        <ol v-if="s.terms?.length" class="terms"><li v-for="tm in s.terms" :key="tm.name"><b>{{ tm.name }}</b><small class="muted">{{ fmt(tm.start) }} – {{ fmt(tm.end) }}</small></li></ol>
        <footer>
          <Button label="تعديل" icon="pi pi-pencil" text size="small" @click="edit(s)" />
          <Button v-if="s.status !== 'active'" label="تفعيل" icon="pi pi-play" text size="small" @click="persist({ ...s, status: 'active' })" />
        </footer>
      </div>
      <button type="button" class="panel add" @click="edit(null)"><i class="pi pi-plus" /> موسم جديد</button>
    </div>
    <FormDialog v-model:visible="dlg" :title="cur ? 'تعديل الموسم' : 'موسم جديد'" :fields="[{ key: 'name', label: 'الاسم', required: true, placeholder: '2027 / 2028' }, { key: 'start', label: 'البداية', type: 'date', required: true }, { key: 'end', label: 'النهاية', type: 'date', required: true }]" :value="cur || { status: 'archived' }" @save="(v) => persist({ ...(cur || { status: 'archived' }), ...v })" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { listSeasons, saveSeason } from '@/api/admin'

const rows = ref([])
const dlg = ref(false)
const cur = ref(null)
const fmt = (d) => (d ? new Date(d).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')
const load = async () => (rows.value = await listSeasons())
onMounted(load)
function edit(s) {
  cur.value = s ? { ...s } : null
  dlg.value = true
}
async function persist(v) {
  await saveSeason(v)
  dlg.value = false
  load()
}
</script>

<style scoped>
.ss { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
.se.active { border: 2px solid var(--brand); }
.se header { display: flex; justify-content: space-between; align-items: center; }
.se h3 { margin: 0; }
.terms { padding-inline-start: 1.1rem; display: flex; flex-direction: column; gap: 0.35rem; }
.terms small { display: block; font-size: 0.78rem; }
.se footer { display: flex; gap: 0.25rem; }
.add { border: 2px dashed var(--line); background: none; font: inherit; cursor: pointer; color: var(--brand); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem; min-height: 150px; }
</style>
