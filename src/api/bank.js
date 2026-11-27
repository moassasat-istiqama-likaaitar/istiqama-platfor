import { respond, ApiError, newId } from './client'
import { classes, levels, assignments, persons } from '@/mock/db'
import { subjects, lessons, contents, activities, makePayload } from '@/mock/content'
import { collection } from '@/mock/collections'

/**
 * المكتبة المركزية (محتوى + أنشطة) وربطها بالأقسام.
 *
 * دورة الحالات لكل ما يرفعه المعلم (محتوى أو نشاط) — هدفه دائماً المكتبة المركزية:
 *   draft (مسودة: عند المعلم وحده)
 *   → review (قيد المراجعة)
 *   → temp (معتمد مؤقتاً: صادق عليه مدير المدرسة ← يظهر في أقسام المعلم فقط)
 *   → approved (معتمد: اعتمده المحرر ← في المكتبة المركزية لكل المعلمين)
 *   المحرر يستطيع البتّ في أي مرحلة: اعتماد، طلب تعديل (يعود مسودة + ملاحظة)، رفض (+ ملاحظة).
 *   «أساسي للمستوى» (essential): يُربط تلقائياً وإجبارياً بكل أقسام المستوى في درسه.
 *
 * الربط (classLinks): عنصر من المكتبة ← قسم واحد (scope=class) أو كل أقسام مستوى (scope=level، من المحرر)،
 *   في درس محدد أو «بلا درس»، مع آخر أجل للأنشطة. ما يربطه المحرر على المستوى إجباري.
 */

const L = (levelId, key, i) => lessons.filter((l) => l.subjectId === `${levelId}-${key}`)[i]
const ago = (h) => new Date(Date.now() - h * 36e5).toISOString()
const inDays = (d) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 16)

function SEED_UPLOADS() {
  const u = (id, authorId, authorName, title, type, levelId, key, li, classIds, status, proposedClass, note = '', h = 24) => {
    const l = L(levelId, key, li)
    return { id, authorId, authorName, title, type, levelId, subjectId: `${levelId}-${key}`, subjectName: subjectOf(`${levelId}-${key}`)?.name, lessonId: l?.id || null, classIds, status, proposedClass, classification: status === 'approved' ? proposedClass : null, essential: false, note, description: '', at: ago(h) }
  }
  return [
    u('up1', 'p5', 'عمر باعمر', 'خريطة ذهنية: البيع في الإسلام', 'image', 'S2', 'fiqh', 0, ['c3'], 'review', 'enrichment', '', 40),
    u('up6', 'p5', 'عمر باعمر', 'بطاقات مراجعة: أحكام البيع', 'slides', 'S2', 'fiqh', 1, ['c3'], 'review', 'main', '', 5),
    u('up2', 'p5', 'عمر باعمر', 'ملخص أحكام الطهارة', 'pdf', 'M4', 'fiqh', 0, ['c2'], 'temp', 'enrichment', '', 140),
    u('up7', 'p5', 'عمر باعمر', 'أسئلة تمهيدية للحصة القادمة', 'pdf', 'S2', 'fiqh', 2, ['c3'], 'draft', 'activity', '', 2),
    u('up3', 'p6', 'عائشة الشيخ', 'بطاقات التاء المربوطة والمفتوحة', 'slides', 'P1', 'arabic', 3, ['c4'], 'review', 'enrichment', '', 20),
    u('up4', 'p6', 'عائشة الشيخ', 'فيديو: قراءة جماعية', 'video', 'M1', 'iman', 0, ['c5'], 'draft', 'main', 'جودة الصوت ضعيفة في الدقيقة الأولى؛ أعيدي التسجيل في مكان هادئ ثم أرسليه.', 200),
    u('up8', 'p6', 'عائشة الشيخ', 'صور من الإنترنت للدرس', 'image', 'M1', 'iman', 1, ['c5'], 'rejected', 'enrichment', 'الصور محمية بحقوق النشر ومصدرها غير موثوق.', 300),
    u('up9', 'p6', 'عائشة الشيخ', 'ملصق: الحروف الشمسية والقمرية', 'image', 'P1', 'arabic', 5, ['c4'], 'approved', 'enrichment', '', 500)
  ]
}

/** تقييم نموذجي بالأنواع الثمانية (للتجربة الكاملة: المعلم ← التلميذ ← التصحيح) */
function SEED_ACTS() {
  const qs8 = [
    { type: 'mcq', q: 'البيع في اللغة هو:', options: ['مبادلة شيء بشيء', 'الهبة', 'القرض'], answer: 0, points: 1 },
    { type: 'tf', q: 'يجوز بيع ما لا يملكه البائع.', options: ['صح', 'خطأ'], answer: 1, points: 1 },
    { type: 'multi', q: 'من أركان البيع (اختر كل الصحيح):', options: ['العاقدان', 'الصيغة', 'المعقود عليه', 'الشهود'], answers: [0, 1, 2], points: 2 },
    { type: 'match', q: 'اربط كل مصطلح بمعناه:', pairs: [{ left: 'الإيجاب', right: 'لفظ البائع' }, { left: 'القبول', right: 'لفظ المشتري' }, { left: 'الثمن', right: 'ما يُدفع مقابل السلعة' }], points: 3 },
    { type: 'order', q: 'رتّب مراحل عقد البيع:', items: ['الاتفاق على السلعة والثمن', 'الإيجاب والقبول', 'تسليم السلعة وقبض الثمن'], points: 2 },
    { type: 'fill', q: 'قال تعالى: «وأحلّ الله ___ وحرّم ___».', blanks: [['البيع'], ['الربا']], points: 2 },
    { type: 'short', q: 'اذكر شرطاً من شروط المعقود عليه.', keywords: ['مملوك', 'معلوم', 'طاهر', 'مقدور'], points: 1 },
    { type: 'essay', q: 'بيّن بأسلوبك حكمة مشروعية البيع في الإسلام.', model: 'تيسير تبادل المنافع وسدّ الحاجات مع حفظ الحقوق.', points: 4 }
  ].map((q) => (q.type === 'short' ? { ...q, keywords: [q.keywords[0]] } : q))
  const qs4 = [
    { type: 'mcq', q: 'الطهارة شرط لصحة:', options: ['الصلاة', 'الصوم', 'الزكاة'], answer: 0, points: 1 },
    { type: 'multi', q: 'مما ينقض الوضوء:', options: ['النوم العميق', 'الأكل', 'الخارج من السبيلين', 'لمس المصحف'], answers: [0, 2], points: 2 },
    { type: 'order', q: 'رتّب فرائض الوضوء:', items: ['غسل الوجه', 'غسل اليدين إلى المرفقين', 'مسح الرأس', 'غسل الرجلين'], points: 2 },
    { type: 'fill', q: 'الماء ___ هو الطاهر في نفسه المطهّر لغيره.', blanks: [['المطلق', 'الطهور']], points: 1 },
    { type: 'essay', q: 'اشرحي بأسلوبك أثر الطهارة في حياة المسلمة.', points: 4 }
  ]
  return [
    { id: 'ta-s2-bay', kind: 'quiz', authorId: 'p5', authorName: 'عمر باعمر', title: 'تقييم شامل: البيع (8 أنواع من الأسئلة)', levelId: 'S2', subjectId: 'S2-fiqh', lessonId: L('S2', 'fiqh', 0)?.id, questions: qs8, minutes: 20, status: 'temp', note: '', at: ago(3) },
    { id: 'ta-m4-taha', kind: 'quiz', authorId: 'p5', authorName: 'عمر باعمر', title: 'تقييم: أحكام الطهارة', levelId: 'M4', subjectId: 'M4-fiqh', lessonId: L('M4', 'fiqh', 0)?.id, questions: qs4, minutes: 15, status: 'temp', note: '', at: ago(30) },
    { id: 'ta-m4-hw', kind: 'homework', authorId: 'p5', authorName: 'عمر باعمر', title: 'واجب: بطاقة أحكام المياه', levelId: 'M4', subjectId: 'M4-fiqh', lessonId: L('M4', 'fiqh', 1)?.id, instructions: 'صمّمي بطاقة تلخّص أقسام المياه مع مثال لكل قسم، ثم أرفقي صورتها.', maxScore: 20, mode: 'any', status: 'approved', note: '', at: ago(400) }
  ]
}
function SEED_LINKS() {
  return [
    { id: 'lk-s2', itemKind: 'activity', itemId: 'ta-s2-bay', scope: 'class', classId: 'c3', levelId: 'S2', lessonId: L('S2', 'fiqh', 0)?.id, due: inDays(4), mandatory: false, by: 'p5', byName: 'عمر باعمر', at: ago(3) },
    { id: 'lk-m4', itemKind: 'activity', itemId: 'ta-m4-taha', scope: 'class', classId: 'c2', levelId: 'M4', lessonId: L('M4', 'fiqh', 0)?.id, due: inDays(3), mandatory: false, by: 'p5', byName: 'عمر باعمر', at: ago(30) },
    { id: 'lk-m4h', itemKind: 'activity', itemId: 'ta-m4-hw', scope: 'class', classId: 'c2', levelId: 'M4', lessonId: L('M4', 'fiqh', 1)?.id, due: inDays(5), mandatory: false, by: 'p5', byName: 'عمر باعمر', at: ago(30) }
  ]
}

export const uploads = () => collection('uploads3', SEED_UPLOADS)
export const teacherActs = () => collection('teacherActivities3', SEED_ACTS)
const links = () => collection('classLinks2', SEED_LINKS)

const lessonOf = (id) => lessons.find((l) => l.id === id)
const subjectOf = (id) => subjects.find((s) => s.id === id)
const subjectByName = (name, levelId) => subjects.find((s) => s.name === name && s.levelId === levelId)
const VISIBLE = ['approved', 'temp']

/* ——— تطبيع العناصر ——— */

/** نشاط موحّد (من المنصة أو من معلم) */
export function normActivity(a) {
  if (!a) return null
  if (!a.kind) return { ...a, origin: 'platform' }
  const qs = a.questions || []
  return {
    id: a.id, origin: 'teacher', type: a.kind === 'quiz' ? 'quiz' : 'homework', title: a.title,
    subjectId: a.subjectId, levelId: a.levelId || subjectOf(a.subjectId)?.levelId, lessonId: a.lessonId || null,
    questions: qs, instructions: a.instructions, attachments: a.attachments || [], modelAnswer: a.modelAnswer || '',
    maxScore: a.kind === 'quiz' ? qs.reduce((n, q) => n + (Number(q.points) || 1), 0) || 1 : a.maxScore || 20,
    due: a.due || null, required: a.required !== false, mode: a.mode, minutes: a.minutes,
    authorId: a.authorId, authorName: a.authorName, status: a.status, note: a.note || '', at: a.at
  }
}
export function findActivity(id) {
  return normActivity(activities.find((x) => x.id === id) || teacherActs().find(id))
}

/** محتوى موحّد (من المكتبة أو مما رفعه معلم) */
export function normUpload(u) {
  const sub = subjectOf(u.subjectId) || subjectByName(u.subjectName, u.levelId)
  return {
    id: u.id, origin: 'teacher', type: u.type, title: u.title, classification: u.classification || u.proposedClass || 'enrichment',
    status: u.status, lessonId: u.lessonId || null, subjectId: sub?.id, levelId: u.levelId, authorId: u.authorId, authorName: u.authorName,
    createdAt: u.at, rating: 4, views: 0, keywords: [u.title], payload: u.payload || makePayload(u.type, u.title, sub?.name || u.subjectName),
    essential: !!u.essential, classIds: u.classIds || []
  }
}
export function findContent(id) {
  return contents.find((c) => c.id === id) || (uploads().find(id) && normUpload(uploads().find(id)))
}

/* ——— نطاق الربط ——— */

export const classesOfLevel = (levelId) => classes.filter((c) => c.levelId === levelId)
function linkTargets(l) {
  return l.scope === 'level' ? classesOfLevel(l.levelId).map((c) => c.id) : [l.classId]
}
export function linksForClass(classId, kind) {
  const c = classes.find((x) => x.id === classId)
  return links().all().filter((l) => (!kind || l.itemKind === kind) && (l.scope === 'level' ? l.levelId === c?.levelId : l.classId === classId))
}

/** معلّمو القسم (لإظهار ما صادق عليه المدير مؤقتاً في أقسام صاحبه فقط) */
const teacherIdsOf = (classId) => assignments.filter((a) => a.role === 'teacher' && a.classIds?.includes(classId)).map((a) => a.personId)

/**
 * كل محتوى قسم: الأساسي من المكتبة لدروس مستواه + الأساسي للمستوى مما اعتُمد + ما رُبط بالقسم أو مستواه
 * + ما رفعه معلمو القسم واعتُمد (مؤقتاً أو نهائياً) لأقسامهم.
 */
export function classContentItems(classId) {
  const c = classes.find((x) => x.id === classId)
  if (!c) return []
  const okLesson = (l) => !l || !l.gender || l.gender === c.gender
  const out = new Map()
  const add = (item, extra) => {
    // المربوط من مستوى آخر يأخذ درس القسم المختار فقط (أو بلا درس)، لا درسه الأصلي
    const lid = extra.cross ? extra.lessonId : (extra.lessonId ?? item.lessonId)
    const l = lid ? lessonOf(lid) : null
    if (!okLesson(l)) return
    const key = `${item.id}@${lid ?? 'none'}`
    if (!out.has(key)) out.set(key, { ...item, ...extra })
  }
  // محتوى المؤسسة في المكتبة (المعتمد) أساسي لكل أقسام المستوى
  contents.filter((x) => x.levelId === c.levelId && x.status === 'approved').forEach((x) => add(x, { source: 'essential', mandatory: true }))
  const tIds = teacherIdsOf(classId)
  uploads().all().forEach((u) => {
    if (u.levelId !== c.levelId) return
    if (u.status === 'approved' && u.essential) add(normUpload(u), { source: 'essential', mandatory: true })
    // ما رفعه المعلم لأقسامه: المعتمد، أو المؤقت (صادق عليه المدير) — يظهر في أقسام صاحبه فقط
    else if (VISIBLE.includes(u.status) && tIds.includes(u.authorId) && u.classIds?.includes(classId)) add(normUpload(u), { source: 'mine', mandatory: false, temp: u.status === 'temp', ownerId: u.authorId })
  })
  linksForClass(classId, 'content').forEach((l) => {
    const item = findContent(l.itemId)
    if (item) add(item, { source: l.scope === 'level' ? 'level' : 'link', mandatory: l.mandatory, lessonId: l.lessonId, linkId: l.id, linkedBy: l.byName, ...crossExtra(item, c.levelId, l.lessonId) })
  })
  return [...out.values()].map((x) => decorate(x))
}

/** أنشطة القسم: أنشطة المنصة لدروس المستوى + ما رُبط بالقسم/المستوى (بآخر أجل الربط) */
export function classActivityItems(classId) {
  const c = classes.find((x) => x.id === classId)
  if (!c) return []
  const out = activities.filter((a) => a.levelId === c.levelId).map((a) => ({ ...normActivity(a), source: 'essential', mandatory: true, visibleToStudents: true }))
  linksForClass(classId, 'activity').forEach((l) => {
    const a = findActivity(l.itemId)
    if (!a || out.some((x) => x.id === a.id)) return
    // لا يصل التلميذَ إلا ما صودق عليه: المعتمد، أو المؤقت في أقسام صاحبه
    const visible = a.origin === 'platform' || a.status === 'approved' || (a.status === 'temp' && teacherIdsOf(classId).includes(a.authorId))
    out.push({ ...a, lessonId: l.lessonId ?? a.lessonId, due: l.due || a.due, source: l.scope === 'level' ? 'level' : 'link', mandatory: l.mandatory, linkId: l.id, linkedBy: l.byName, visibleToStudents: visible, temp: a.status === 'temp', ownerId: a.authorId, ...crossExtra(a, c.levelId, l.lessonId) })
  })
  return out.filter((a) => {
    const l = a.lessonId && lessonOf(a.lessonId)
    return !l || !l.gender || l.gender === c.gender
  })
}

/**
 * عنصر من مستوى آخر رُبط بدرس من مستوى القسم (مثلاً محتوى الرابعة في درس من الثالثة):
 * يأخذ درس القسم المختار (أو بلا درس) ومادّته، ويُوسم «من مستوى آخر» للمعلم والمحرر.
 */
function crossExtra(item, levelId, lessonId) {
  if (!item?.levelId || item.levelId === levelId) return {}
  const l = lessonId ? lessonOf(lessonId) : null
  return { cross: true, lessonId: lessonId || null, ...(l ? { subjectId: l.subjectId } : {}) }
}

function decorate(x) {
  const sub = subjectOf(x.subjectId)
  const l = x.lessonId ? lessonOf(x.lessonId) : null
  return {
    ...x,
    subjectName: sub?.name || '—', subjectColor: sub?.color, subjectIcon: sub?.icon, subjectOrder: sub?.order ?? 99,
    axis: l?.axis || null, axisIndex: l?.axisIndex ?? 99, lessonTitle: l?.title || null, lessonOrder: l?.order ?? 999,
    levelName: levels.find((v) => v.id === x.levelId)?.name
  }
}

/* ——— واجهات الربط ——— */

/** GET /api/classes/:id/library → مكتبة القسم (محتوى + أنشطة) */
export function classLibrary(classId, viewerId = null) {
  // المؤقت يخصّ صاحبه: لا يراه زميله الذي يُدرّس في القسم نفسه
  const mineOnly = (x) => !viewerId || !x.temp || x.ownerId === viewerId
  return respond(() => ({
    contents: classContentItems(classId).filter(mineOnly),
    activities: classActivityItems(classId).filter((a) => mineOnly(a) && (a.visibleToStudents || a.ownerId === viewerId)).map((a) => decorate({ ...a, classification: 'activity' }))
  }))
}

/** GET /api/levels/:id/library → المستوى كقسم واحد (للمحرر): الأساسي + ما رُبط على المستوى */
export function levelLibrary(levelId) {
  return respond(() => {
    const cts = contents.filter((x) => x.levelId === levelId && x.status === 'approved').map((x) => decorate({ ...x, source: 'essential', mandatory: true }))
    const lk = links().all().filter((l) => l.scope === 'level' && l.levelId === levelId)
    lk.filter((l) => l.itemKind === 'content').forEach((l) => {
      const it = findContent(l.itemId)
      if (it) cts.push(decorate({ ...it, lessonId: l.lessonId, source: 'level', mandatory: true, linkId: l.id, linkedBy: l.byName, ...crossExtra(it, levelId, l.lessonId) }))
    })
    uploads().all().filter((u) => u.status === 'approved' && u.essential && u.levelId === levelId).forEach((u) => cts.push(decorate({ ...normUpload(u), source: 'essential', mandatory: true })))
    const acts = activities.filter((a) => a.levelId === levelId).map((a) => decorate({ ...normActivity(a), classification: 'activity', source: 'essential', mandatory: true }))
    lk.filter((l) => l.itemKind === 'activity').forEach((l) => {
      const a = findActivity(l.itemId)
      if (a) acts.push(decorate({ ...a, classification: 'activity', lessonId: l.lessonId ?? a.lessonId, due: l.due, source: 'level', mandatory: true, linkId: l.id, ...crossExtra(a, levelId, l.lessonId) }))
    })
    return { contents: cts, activities: acts }
  })
}

/**
 * POST /api/links { itemKind, itemId, targets:[{scope:'class',classId}|{scope:'level',levelId}], lessonId|null, due }
 * ما يربطه المحرر على المستوى إجباري.
 */
export function linkItem(by, byRole, args) {
  return respond(() => linkSync(by, byRole, args), 300)
}
export function linkSync(by, byRole, { itemKind, itemId, targets, lessonId = null, due = null }) {
  {
    if (!targets?.length) throw new ApiError('required', 'اختر القسم أو المستوى')
    const made = []
    if (itemKind === 'activity' && !due) due = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16)
    targets.forEach((t) => {
      const dup = links().all().find((l) => l.itemId === itemId && l.scope === t.scope && (t.scope === 'level' ? l.levelId === t.levelId : l.classId === t.classId) && (l.lessonId || null) === (lessonId || null))
      if (dup) return
      made.push(links().insert({ id: newId('lk'), itemKind, itemId, scope: t.scope, classId: t.classId || null, levelId: t.levelId || classes.find((c) => c.id === t.classId)?.levelId, lessonId, due, mandatory: t.scope === 'level' || byRole === 'editor', by: by.id, byName: `${by.firstName} ${by.lastName}`, at: new Date().toISOString() }))
    })
    return { created: made.length, classes: [...new Set(made.flatMap(linkTargets))].length }
  }
}

/** DELETE /api/links/:id — المعلم يزيل ما ربطه هو (لا الإجباري) */
export function unlinkItem(id, personId, role) {
  return respond(() => {
    const l = links().find(id)
    if (!l) throw new ApiError('not_found', 'الربط غير موجود')
    if (l.mandatory && role !== 'editor') throw new ApiError('forbidden', 'هذا محتوى إجباري ربطه المحرر للمستوى')
    if (role !== 'editor' && l.by !== personId) throw new ApiError('forbidden', 'لا يمكنك إزالة ما ربطه غيرك')
    links().remove(id)
    return true
  })
}

/* ——— بنك الواجبات والتقييمات ——— */

/** GET /api/activities-bank → أنشطة المنصة + أنشطة المعلمين المعتمدة (وما أنشأتُه بكل حالاته) */
export function activitiesBank({ personId, scopeLevels } = {}) {
  return respond(() => {
    const plat = activities.map(normActivity)
    const mine = teacherActs().all().map(normActivity).filter((a) => a.status === 'approved' || a.authorId === personId)
    return [...mine, ...plat]
      .filter((a) => !scopeLevels || scopeLevels.includes(a.levelId))
      .map((a) => decorate({ ...a, qtypes: [...new Set((a.questions || []).map((q) => q.type || (q.options?.length === 2 ? 'tf' : 'mcq')))] }))
  })
}

/* ——— التلميذ ——— */

/** مكتبة القسم كما يراها التلميذ */
let isOpenFor = () => true
/** يُحقن من teaching.js (تجنّباً للاستيراد الدائري) */
export const setOpenCheck = (fn) => (isOpenFor = fn)
export function studentLibrary(personId) {
  return respond(() => {
    const a = assignments.find((x) => x.personId === personId && x.role === 'student')
    return classContentItems(a?.classId).filter((c) => !c.lessonId || isOpenFor(a.classId, lessonOf(c.lessonId)))
  })
}

export { lessonOf, subjectOf, persons }
