<template>
  <!-- تبويب «المواسم السابقة» داخل الشاشة — يظهر فقط إن سمحت به مصفوفة رؤية الأرشيف لهذا الدور -->
  <div>
    <div v-if="allowed && past.length" class="pst">
      <button type="button" class="pill" :class="{ 'is-active': !showPast }" @click="showPast = false">الموسم الحالي</button>
      <button type="button" class="pill" :class="{ 'is-active': showPast }" @click="showPast = true"><i class="pi pi-box" /> المواسم السابقة</button>
    </div>
    <slot v-if="!showPast || !allowed" />
    <div v-else class="pst__list">
      <article v-for="s in past" :key="s.id" class="panel pst__item">
        <header><b>{{ s.name }}</b><small class="muted">{{ s.start }} ← {{ s.end }} · للقراءة فقط</small></header>
        <slot name="past" :season="s"><p class="muted small">{{ label }} لهذا الموسم محفوظة للقراءة، وتُعرض من بيانات الموسم المؤرشف.</p></slot>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { canSeeArchive, listSeasons } from '@/api/admin'

const props = defineProps({ dataKey: { type: String, required: true }, label: { type: String, default: 'البيانات' } })
const auth = useAuthStore()
const showPast = ref(false)
const past = ref([])
const allowed = computed(() => canSeeArchive(auth.role, props.dataKey))
onMounted(async () => (past.value = (await listSeasons()).filter((s) => s.status === 'archived')))
</script>

<style scoped>
.pst { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
.pill { border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 0.35rem 0.85rem; font: inherit; font-size: 0.86rem; cursor: pointer; display: inline-flex; gap: 0.35rem; align-items: center; }
.pill.is-active { background: var(--brand); color: #fff; border-color: var(--brand); }
.pst__list { display: flex; flex-direction: column; gap: 0.8rem; }
.pst__item header { display: flex; flex-direction: column; gap: 0.15rem; }
.small { font-size: 0.85rem; }
</style>
