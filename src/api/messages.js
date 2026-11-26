import { respond, newId, ApiError } from './client'
import { conversations, persons, assignments, classes } from '@/mock/db'
import { seasonReadOnly, activeSeason, messagingMatrix } from './admin'
import { msgRoleOf } from '@/config/messaging'

/** أقسام الصفة (null = عامّ بلا قيد قسم) */
function classSetOf(a) {
  if (a.role === 'teacher') return a.classIds || []
  if (a.role === 'student') return [a.classId]
  if (a.role === 'parent') return (a.childIds || []).map((cid) => assignments.find((x) => x.personId === cid && x.role === 'student')?.classId).filter(Boolean)
  if (a.role === 'school_manager') return classes.filter((c) => c.schoolId === a.schoolId).map((c) => c.id)
  if (a.role === 'editor') return classes.filter((c) => (a.levelIds || []).includes(c.levelId)).map((c) => c.id)
  return null
}
/** مدارس الصفة (null = عامّ) */
function schoolSetOf(a) {
  if (a.schoolId) return [a.schoolId]
  const cs = classSetOf(a)
  return cs ? [...new Set(cs.map((id) => classes.find((c) => c.id === id)?.schoolId).filter(Boolean))] : null
}

// كل محادثة تنتمي لموسم؛ محادثات المواسم المؤرشفة للقراءة فقط
const seasonOf = (cv) => cv.seasonId || 'y2026'

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
    unread: last ? last.from !== personId && !last.readBy?.includes(personId) : false,
    seasonId: seasonOf(cv),
    archived: seasonReadOnly(seasonOf(cv))
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
    if (seasonReadOnly(seasonOf(cv))) throw new ApiError('readonly', 'محادثة موسم مؤرشف — للقراءة فقط')
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
      seasonId: activeSeason()?.id,
      messages: [{ id: newId('m'), from: personId, body, at: new Date().toISOString(), readBy: [personId] }]
    }
    conversations.push(cv)
    return summarize(cv, personId)
  })
}

/** جهات الاتصال المسموح بها لصفة ما — حسب مصفوفة المراسلة */
function contactsFor(assignmentId) {
  const me = assignments.find((a) => a.id === assignmentId)
  if (!me) return []
  /*
   * من يراسل من: حسب «مصفوفة المراسلة» التي تضبطها الإدارة العامة (إعدادات التواصل).
   * النطاق: نفس القسم = يشتركان في قسم؛ نفس المدرسة = يشتركان في مدرسة؛ الإدارة والدعم بلا قسم ولا مدرسة (عامّون).
   */
  const matrix = messagingMatrix()
  const row = matrix[msgRoleOf(me.role)] || {}
  const list = assignments.filter((t) => {
    if (t.personId === me.personId) return false
    const scope = row[msgRoleOf(t.role)] || 'off'
    if (scope === 'off') return false
    if (scope === 'all') return true
    const [A, B] = scope === 'class' ? [classSetOf(me), classSetOf(t)] : [schoolSetOf(me), schoolSetOf(t)]
    return !A || !B || A.some((x) => B.includes(x))
  })
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
