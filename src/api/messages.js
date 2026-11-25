import { respond, newId, ApiError } from './client'
import { conversations, persons, assignments, classes } from '@/mock/db'

const personName = (id) => {
  const p = persons.find((x) => x.id === id)
  return p ? `${p.firstName} ${p.lastName}` : '—'
}

function summarize(cv, personId) {
  const other = cv.participants.find((p) => p.personId !== personId) || cv.participants[0]
  const mine = cv.participants.find((p) => p.personId === personId)
  const otherAssignment = assignments.find((a) => a.id === other.assignmentId)
  const last = cv.messages[cv.messages.length - 1]
  return {
    id: cv.id,
    subject: cv.subject,
    with: { personId: other.personId, name: personName(other.personId), role: otherAssignment?.role },
    myAssignmentId: mine?.assignmentId,
    lastMessage: last ? { body: last.body, at: last.at, fromMe: last.from === personId } : null,
    unread: last ? last.from !== personId && !last.readBy?.includes(personId) : false
  }
}

/** GET /api/conversations → محادثات الشخص في كل صفاته */
export function listConversations(personId) {
  return respond(() =>
    conversations
      .filter((cv) => cv.participants.some((p) => p.personId === personId))
      .map((cv) => summarize(cv, personId))
      .sort((a, b) => (b.lastMessage?.at || '').localeCompare(a.lastMessage?.at || ''))
  )
}

/** GET /api/conversations/{id} → المحادثة بكل رسائلها (وتُعلَّم مقروءة) */
export function getConversation(id, personId) {
  return respond(() => {
    const cv = conversations.find((x) => x.id === id)
    if (!cv) throw new ApiError('not_found', 'المحادثة غير موجودة')
    cv.messages.forEach((m) => {
      m.readBy = Array.from(new Set([...(m.readBy || []), personId]))
    })
    return {
      ...summarize(cv, personId),
      messages: cv.messages.map((m) => ({ id: m.id, body: m.body, at: m.at, fromMe: m.from === personId, fromName: personName(m.from) }))
    }
  })
}

/** POST /api/conversations/{id}/messages  { body } → message */
export function sendMessage(conversationId, personId, body) {
  return respond(() => {
    const cv = conversations.find((x) => x.id === conversationId)
    const msg = { id: newId('m'), from: personId, body, at: new Date().toISOString(), readBy: [personId] }
    cv.messages.push(msg)
    return { id: msg.id, body, at: msg.at, fromMe: true, fromName: personName(personId) }
  }, 150)
}

/** POST /api/conversations  { assignmentId, toPersonId, subject, body } → conversation summary */
export function startConversation(personId, assignmentId, toPersonId, subject, body) {
  return respond(() => {
    const target = contactsFor(assignmentId).find((c) => c.personId === toPersonId)
    if (!target) throw new ApiError('forbidden', 'لا يمكنك مراسلة هذا الشخص بهذه الصفة')
    const cv = {
      id: newId('cv'),
      participants: [{ personId, assignmentId }, { personId: toPersonId, assignmentId: target.assignmentId }],
      subject,
      messages: [{ id: newId('m'), from: personId, body, at: new Date().toISOString(), readBy: [personId] }]
    }
    conversations.push(cv)
    return summarize(cv, personId)
  })
}

/**
 * من يمكن مراسلته حسب الصفة الحالية (قاعدة مبدئية، تُضبط من إعدادات التواصل AD16):
 *  - المعلم: تلاميذ أقسامه وأولياؤهم + مدير مدرسته
 *  - التلميذ: معلمو قسمه
 *  - الولي: معلمو أبنائه + مديرو مدارسهم
 *  - مدير المدرسة: معلمو مدرسته
 *  - الإدارة/المحرر/الدعم: كل الطاقم
 */
function contactsFor(assignmentId) {
  const me = assignments.find((a) => a.id === assignmentId)
  if (!me) return []
  const teachersOfClass = (classId) => assignments.filter((a) => a.role === 'teacher' && a.classIds?.includes(classId))
  const managerOf = (schoolId) => assignments.filter((a) => a.role === 'school_manager' && a.schoolId === schoolId)
  /*
   * قواعد المراسلة:
   *  التلميذ ← معلمو قسمه.  المعلم ← تلاميذ أقسامه وأولياؤهم + مدير مدرسته.
   *  الولي ← مدير مدرسة ابنه فقط (لا يبدأ مراسلة المعلم؛ يردّ إن راسله المعلم).
   *  المدير ← معلمو مدرسته + أولياء تلاميذها.  المحرر ← معلمو مستوياته + الإدارة.
   */
  const parentsOfSchool = (schoolId) => {
    const kids = assignments.filter((a) => a.role === 'student' && a.schoolId === schoolId).map((a) => a.personId)
    return assignments.filter((a) => a.role === 'parent' && a.childIds?.some((c) => kids.includes(c)))
  }
  let list = []
  if (me.role === 'teacher') {
    const students = assignments.filter((a) => a.role === 'student' && me.classIds.includes(a.classId))
    const parents = assignments.filter((a) => a.role === 'parent' && a.childIds.some((cid) => students.some((s) => s.personId === cid)))
    list = [...students, ...parents, ...managerOf(me.schoolId)]
  } else if (me.role === 'student') {
    list = teachersOfClass(me.classId)
  } else if (me.role === 'parent') {
    me.childIds.forEach((cid) => {
      const s = assignments.find((a) => a.personId === cid && a.role === 'student')
      if (s) list.push(...managerOf(s.schoolId))
    })
  } else if (me.role === 'school_manager') {
    list = [...assignments.filter((a) => a.role === 'teacher' && a.schoolId === me.schoolId), ...parentsOfSchool(me.schoolId)]
  } else if (me.role === 'editor') {
    const cls = classes.filter((c) => (me.levelIds || []).includes(c.levelId)).map((c) => c.id)
    list = [...assignments.filter((a) => a.role === 'teacher' && a.classIds?.some((c) => cls.includes(c))), ...assignments.filter((a) => ['super_admin', 'admin', 'editor'].includes(a.role))]
  } else {
    list = assignments.filter((a) => ['super_admin', 'admin', 'editor', 'school_manager', 'teacher', 'support'].includes(a.role))
  }
  const seen = new Set()
  return list
    .filter((a) => a.personId !== me.personId && !seen.has(a.personId) && seen.add(a.personId))
    .map((a) => {
      const cls = classes.find((c) => c.id === a.classId)
      return { personId: a.personId, assignmentId: a.id, name: personName(a.personId), role: a.role, detail: cls?.name || '' }
    })
}

/** GET /api/contacts?assignment={id} → جهات الاتصال المسموح بها */
export function contacts(assignmentId) {
  return respond(() => contactsFor(assignmentId), 100)
}
