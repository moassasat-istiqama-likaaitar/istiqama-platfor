<template>
  <!-- شريط برتقالي ثابت ما دام المستخدم يعمل في موسم مؤرشف مفتوح مؤقتاً -->
  <div v-if="season.current" class="sbn" role="status">
    <i class="pi pi-unlock" />
    <span class="lg">أنت تعمل في موسم <b>{{ season.current.name }}</b> — مفتوح للتصحيح حتى {{ until }}. كل تعديل مسجَّل. المراسلات للقراءة فقط.</span>
    <span class="sm">موسم <b>{{ season.current.name }}</b> · تصحيح حتى {{ untilShort }}</span>
    <Button label="العودة إلى الموسم النشط" size="small" text class="lg" @click="season.leave()" />
    <Button label="عودة" size="small" text class="sm" @click="season.leave()" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useSeasonStore } from '@/stores/season'

const season = useSeasonStore()
const toast = useToast()
const untilShort = computed(() => new Date(season.current.reopen.until).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'short' }))
const until = computed(() => new Date(season.current.reopen.until).toLocaleString('ar-DZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }))
let timer
onMounted(() => {
  timer = setInterval(() => {
    if (season.check()) toast.add({ severity: 'info', summary: 'انتهت مدة الفتح المؤقت', detail: 'عدت إلى الموسم النشط.', life: 4000 })
  }, 30000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.sbn { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; background: #fff1dc; color: #7a4a00; border-bottom: 2px solid #e08a00; padding: 0.5rem 1rem; font-size: 0.88rem; }
.sbn span { flex: 1; min-width: 0; }
.sm { display: none; }
@media (max-width: 600px) {
  .sbn { padding: 0.35rem 0.6rem; gap: 0.4rem; flex-wrap: nowrap; font-size: 0.8rem; }
  .lg { display: none !important; }
  .sm { display: block; }
  button.sm { display: inline-flex; flex-shrink: 0; }
}
</style>
