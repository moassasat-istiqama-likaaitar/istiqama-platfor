<template>
  <div class="cv">
    <VideoPlayer v-if="item.type === 'video'" :payload="item.payload" :color="color" :accent="accent" :art="art" @ended="$emit('ended')" />
    <SlidesViewer v-else-if="item.type === 'slides'" :payload="item.payload" :color="color" :accent="accent" :art="art" @ended="$emit('ended')" />
    <DocViewer v-else-if="item.type === 'pdf'" :payload="item.payload" :title="item.title" :color="color" @ended="$emit('ended')" @download="download" />
    <figure v-else-if="item.type === 'image'" class="cv__img" @click="zoom = true">
      <div class="cv__img-art"><LessonArt :kind="item.payload.art" :color="color" :accent="accent" /></div>
      <figcaption><i class="pi pi-search-plus" /> {{ item.payload.caption }}</figcaption>
    </figure>
    <Dialog v-model:visible="zoom" modal dismissable-mask :header="item.payload?.caption" :style="{ width: 'min(900px, 96vw)' }">
      <LessonArt :kind="item.payload?.art" :color="color" :accent="accent" />
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import VideoPlayer from './VideoPlayer.vue'
import SlidesViewer from './SlidesViewer.vue'
import DocViewer from './DocViewer.vue'
import LessonArt from '@/components/art/LessonArt.vue'

defineProps({
  item: { type: Object, required: true },
  color: { type: String, default: '#3159e8' },
  accent: { type: String, default: '#ffc93c' },
  art: { type: String, default: 'book' }
})
defineEmits(['ended'])
const { t } = useI18n()
const toast = useToast()
const zoom = ref(false)
const download = () => toast.add({ severity: 'info', summary: t('common.comingSoon'), life: 2000 })
</script>

<style scoped>
.cv__img { margin: 0; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); cursor: zoom-in; background: #fff; }
.cv__img-art { aspect-ratio: 200 / 140; }
.cv__img figcaption { padding: 0.6rem 0.9rem; font-weight: 700; font-size: 0.9rem; display: flex; gap: 0.4rem; align-items: center; color: var(--muted); }
</style>
