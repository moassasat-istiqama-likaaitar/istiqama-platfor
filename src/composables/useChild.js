import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBrandStore } from '@/stores/brand'

/** الابن المعروض عند الولي — يحدد أيضاً هوية المدرسة الظاهرة (مدرسة الابن) */
export function useChild() {
  const auth = useAuthStore()
  const brand = useBrandStore()
  const route = useRoute()
  const router = useRouter()
  const children = computed(() => auth.active?.children || [])
  const child = computed(() => children.value.find((c) => c.id === (route.query.child || brand.childId)) || children.value[0] || null)
  const select = (id) => router.replace({ query: { ...route.query, child: id } })
  watch(child, (c) => c && brand.setChild(c.id, auth.active), { immediate: true })
  return { children, child, select }
}
