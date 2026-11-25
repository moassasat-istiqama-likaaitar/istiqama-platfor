<template>
  <section class="lc">
    <h3><i class="pi pi-comments" /> {{ title }} <small>({{ comments.length }})</small></h3>
    <form class="lc__form" @submit.prevent="send">
      <input v-model="draft" :placeholder="placeholder" />
      <button type="submit" :disabled="!draft.trim()"><i class="pi pi-send" /></button>
    </form>
    <div v-for="c in comments" :key="c.id" class="lc__item" :class="{ teacher: c.role === 'teacher' }">
      <span class="lc__av">{{ c.author.charAt(0) }}</span>
      <div class="lc__b"><strong>{{ c.author }}</strong> <small>{{ timeAgo(c.at, t) }}</small><p>{{ c.body }}</p></div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { timeAgo } from '@/utils/dates'

defineProps({ comments: { type: Array, default: () => [] }, title: { type: String, default: 'التعليقات' }, placeholder: { type: String, default: 'اكتب سؤالك أو تعليقك...' } })
const emit = defineEmits(['send'])
const { t } = useI18n()
const draft = ref('')
function send() {
  emit('send', draft.value.trim())
  draft.value = ''
}
</script>

<style scoped>
.lc h3 { margin: 0 0 0.75rem; font-size: 1rem; display: flex; gap: 0.45rem; align-items: center; }
.lc h3 i { color: var(--c, var(--brand)); }
.lc h3 small { color: var(--muted); font-weight: 600; }
.lc__form { display: flex; gap: 0.5rem; margin-bottom: 0.9rem; }
.lc__form input { flex: 1; padding: 0.65rem 0.95rem; border-radius: 999px; border: 1.5px solid var(--line); background: var(--bg); font: inherit; color: var(--ink); outline: none; }
.lc__form input:focus { border-color: var(--c, var(--brand)); }
.lc__form button { width: 42px; height: 42px; border-radius: 50%; border: 0; background: var(--c, var(--brand)); color: #fff; cursor: pointer; }
.lc__form button:disabled { opacity: 0.4; }
.lc__item { display: flex; gap: 0.6rem; margin-bottom: 0.65rem; }
.lc__av { width: 34px; height: 34px; border-radius: 50%; background: var(--c, var(--brand)); color: #fff; display: grid; place-items: center; font-weight: 800; flex-shrink: 0; }
.lc__item.teacher .lc__av { background: #f5a400; }
.lc__b { flex: 1; background: var(--bg); padding: 0.5rem 0.85rem; border-radius: 14px; }
.lc__b small { color: var(--muted); font-size: 0.72rem; }
.lc__b p { margin: 0.15rem 0 0; }
</style>
