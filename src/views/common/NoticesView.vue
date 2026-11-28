<template>
  <!-- C07: الإعلانات — ما وصل المستخدم من إعلانات إدارة مدرسته والإدارة العامة (باتجاه واحد، بلا رد). تُفتح من رمز الإعلانات بجانب الجرس -->
  <div>
    <PageHeader title="الإعلانات" subtitle="إعلانات إدارة المدرسة والإدارة العامة (رمز المكبّر في الشريط العلوي)." />
    <div v-if="list.length" class="nl">
      <article v-for="n in list" :id="`n-${n.id}`" :key="n.id" class="panel ni" :class="{ hl: n.id === route.query.id, unread: !n.read }">
        <header>
          <span class="ni__ic"><i class="pi pi-megaphone" /></span>
          <div class="ni__t"><b>{{ n.title }}</b><small>{{ n.from }} · {{ fmt(n.at) }}</small></div>
          <span v-if="!n.read" class="dot" aria-label="جديد" />
        </header>
        <p>{{ n.body }}</p>
      </article>
    </div>
    <EmptyState v-else icon="pi pi-megaphone" title="لا إعلانات" text="ستظهر هنا إعلانات إدارة المدرسة والإدارة العامة." />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { myNotices } from '@/api/school'
import { markNoticeRead } from '@/api/school'

const route = useRoute()
const auth = useAuthStore()
const list = ref([])
const fmt = (d) => new Date(d).toLocaleString('ar-DZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

onMounted(async () => {
  list.value = await myNotices(auth.person.id)
  // فتح الصفحة = قراءة إعلاناتها (يختفي عدّادها من الجرس)
  const unread = list.value.filter((x) => !x.read)
  unread.forEach((n) => markNoticeRead(n.id, auth.person.id))
  await nextTick()
  if (route.query.id) document.getElementById(`n-${route.query.id}`)?.scrollIntoView({ block: 'center' })
})
</script>

<style scoped>
.nl { display: flex; flex-direction: column; gap: 0.8rem; max-width: 760px; }
.ni header { display: flex; gap: 0.7rem; align-items: center; }
.ni__ic { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--p-primary-color) 12%, transparent); color: var(--p-primary-color); flex-shrink: 0; }
.ni__t { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.ni__t small { color: var(--muted); font-size: 0.8rem; }
.ni p { margin: 0.6rem 0 0; white-space: pre-line; line-height: 1.8; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--p-primary-color); }
.ni.hl { outline: 2px solid var(--p-primary-color); }
</style>
