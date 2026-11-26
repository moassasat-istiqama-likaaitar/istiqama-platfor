import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

/** أفعال الدرس المشتركة بين القوالب الثلاثة */
export function useLesson(l) {
  const student = useStudentStore()
  const toast = useToast()
  const completing = ref(false)

  async function complete() {
    if (l.value.done) return
    completing.value = true
    try {
      const r = await learning.completeLesson(student.personId, l.value.id)
      l.value.done = true
      student.reward(r)
    } finally {
      completing.value = false
    }
  }
  async function rate(item, n) {
    item.myRating = n
    await learning.rateContent(student.personId, item.id, n)
    toast.add({ severity: 'success', summary: 'شكراً على تقديرك', life: 1500 })
  }
  async function comment(text) {
    const r = await learning.addComment(student.personId, l.value.id, text)
    l.value.comments.unshift(r.comment)
    if (r.badges.length) student.reward({ badges: r.badges })
  }
  async function saveNote(text) {
    return learning.saveNote(student.personId, l.value.id, text)
  }
  const report = () => toast.add({ severity: 'info', summary: 'شكراً، وصل بلاغك', life: 2000 })

  return { completing, complete, rate, comment, saveNote, report }
}
