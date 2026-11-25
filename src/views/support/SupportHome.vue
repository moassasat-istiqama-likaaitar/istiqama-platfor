<template>
  <!-- SU01: لوحة الدعم الفني -->
  <div>
    <PageHeader :title="`السلام عليكم، ${auth.person.firstName}`" subtitle="لوحة الدعم الفني: البلاغات المفتوحة والحوادث الجارية." />
    <StatTiles :items="[
      { label: 'بلاغات مفتوحة', value: tickets.filter((x) => x.status === 'open').length, icon: 'pi pi-ticket', tone: 'blue', to: '/app/tickets' },
      { label: 'مسندة إليّ', value: tickets.filter((x) => x.assignee === fullName && x.status !== 'resolved').length, icon: 'pi pi-user', tone: 'purple' },
      { label: 'أولوية عالية', value: tickets.filter((x) => x.priority === 'high' && x.status !== 'resolved').length, icon: 'pi pi-exclamation-triangle', tone: 'red' },
      { label: 'حوادث جارية', value: incidents.filter((x) => x.status !== 'resolved').length, icon: 'pi pi-bolt', tone: 'amber', to: '/app/incidents' }
    ]" />
    <div class="g">
      <section class="panel">
        <h3>أحدث البلاغات</h3>
        <ul class="list"><li v-for="tk in tickets.slice(0, 6)" :key="tk.id"><RouterLink to="/app/tickets"><b>{{ tk.title }}</b><small class="muted">{{ tk.id }} · {{ tk.person }} · {{ tk.school }}</small></RouterLink><StatusTag :status="tk.status" /></li></ul>
      </section>
      <section class="panel">
        <h3>البلاغات حسب النوع</h3>
        <BarList :rows="byType" suffix=" بلاغ" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import BarList from '@/components/ui/BarList.vue'
import { useAuthStore } from '@/stores/auth'
import { listTickets, listIncidents } from '@/api/support'

const auth = useAuthStore()
const tickets = ref([])
const incidents = ref([])
const fullName = computed(() => `${auth.person.firstName} ${auth.person.lastName}`)
onMounted(async () => ([tickets.value, incidents.value] = await Promise.all([listTickets(), listIncidents()])))
const byType = computed(() => Object.entries({ technical: 'تقني', content: 'محتوى', account: 'حساب', suggestion: 'مقترح' }).map(([k, label]) => ({ label, value: tickets.value.filter((x) => x.type === k).length })))
</script>

<style scoped>
.g { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; }
.g h3 { margin: 0 0 0.85rem; font-size: 1rem; }
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; }
.list li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.list a { text-decoration: none; color: inherit; }
.list b { display: block; font-size: 0.9rem; }
.list small { font-size: 0.76rem; }
@media (max-width: 900px) { .g { grid-template-columns: 1fr; } }
</style>
