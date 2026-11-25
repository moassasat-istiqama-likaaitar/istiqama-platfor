import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from './useCatalog'

/**
 * أين يُدرج المحتوى أو النشاط:
 *  المعلم ← أقسامه.  المحرر ← «المستوى كقسم واحد» (كل أقسام المستوى) أو قسم بعينه من مستوياته.
 * القيمة نص مرمّز: 'L:M4' (مستوى) أو 'C:c2' (قسم).
 */
export function useTargets() {
  const auth = useAuthStore()
  const cat = useCatalog()
  const isEditor = computed(() => auth.role === 'editor')
  const options = (levelId = null) => {
    const out = []
    if (isEditor.value) {
      ;(auth.active.levels || []).filter((l) => !levelId || l.id === levelId).forEach((l) => out.push({ label: `كل أقسام ${l.name} (المستوى كقسم واحد)`, value: `L:${l.id}`, group: 'level' }))
    }
    cat.classOptions(auth.active.classIds || []).filter((o) => !levelId || cat.levelOfClass(o.value) === levelId).forEach((o) => out.push({ ...o, value: `C:${o.value}`, group: 'class' }))
    return out
  }
  const decode = (vals) => vals.map((v) => (v.startsWith('L:') ? { scope: 'level', levelId: v.slice(2) } : { scope: 'class', classId: v.slice(2) }))
  const levelOf = (v) => (!v ? null : v.startsWith('L:') ? v.slice(2) : cat.levelOfClass(v.slice(2)))
  return { options, decode, levelOf, isEditor }
}
