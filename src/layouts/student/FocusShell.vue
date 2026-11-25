<template>
  <!-- وضع التركيز: داخل الدرس أو الاختبار لا إشعارات ولا نجوم ولا قوائم — فقط المحتوى وزر الخروج -->
  <div class="f-shell">
    <header class="f-top">
      <button type="button" class="f-exit" @click="exit"><i class="pi pi-times" /> <span>{{ isQuiz ? 'الخروج من الاختبار' : 'الخروج من الدرس' }}</span></button>
      <span class="f-mode"><i class="pi pi-eye" /> وضع التركيز</span>
    </header>
    <main class="f-main"><slot /></main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isQuiz = computed(() => route.name === 'activity')
function exit() {
  if (window.history.state?.back) router.back()
  else router.push({ name: isQuiz.value ? 'my-assignments' : 'my-lessons' })
}
</script>

<style scoped>
.f-shell { min-height: 100vh; background: var(--bg); }
.f-top { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.6rem 1.25rem; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.f-exit { display: inline-flex; align-items: center; gap: 0.45rem; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); border-radius: 999px; padding: 0.45rem 1rem; font: inherit; font-weight: 700; cursor: pointer; }
.f-exit:hover { border-color: var(--brand); color: var(--brand); }
.f-mode { font-size: 0.82rem; color: var(--p-text-muted-color); display: inline-flex; align-items: center; gap: 0.35rem; }
.f-main { max-width: 1100px; margin: 0 auto; padding: 1.25rem 1rem 3rem; }
@media (max-width: 640px) { .f-mode { display: none; } }
</style>
