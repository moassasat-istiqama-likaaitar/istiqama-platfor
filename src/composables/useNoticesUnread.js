import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { myNoticesSync } from '@/api/school'

/** عدد الإعلانات غير المقروءة (لرمز الإعلانات بجانب الجرس)، يُحدَّث عند كل تنقّل */
export function useNoticesUnread() {
  const route = useRoute()
  const auth = useAuthStore()
  const unread = ref(0)
  watch(() => [route.fullPath, auth.activeAssignmentId], () => (unread.value = auth.person ? myNoticesSync(auth.person.id).filter((n) => !n.read).length : 0), { immediate: true })
  return unread
}
