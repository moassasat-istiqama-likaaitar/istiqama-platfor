import { respond, ApiError, newId } from './client'
import { schools, levels, seasons, classes, assignments, persons, schoolBranding } from '@/mock/db'
import { subjects, lessons, contents, activities } from '@/mock/content'
import { collection } from '@/mock/collections'
import { isTop } from '@/config/roles'
import { DEFAULT_EFFECTS } from '@/config/effects'
import { DEFAULT_MATRIX as DEFAULT_MSG_MATRIX } from '@/config/messaging'
import { overviewSync } from './school'
import { fullName, personOf } from './people'

/**
 * الإدارة العامة: الإعدادات المرجعية، الصلاحيات، تخصيص المنصة، السجل، الرزنامة، التواصل، الاستيراد والتصدير، التقارير.
 */

/* ——— تخصيص المنصة ——— */
const platform = collection('platform', () => [{ id: 'main', name: 'منصة الاستقامة الرقمية', short: 'الاستقامة', logo: null, primary: '#233b85', tagline: 'فضاء تعليمي واحد لكل المدارس والأطوار', supportEmail: 'support@istiqama.dz', supportPhone: '0550 00 00 00', defaultLang: 'ar', loginNotice: '' }])
export function getPlatform() {
  return respond(() => getPlatformSync(), 60)
}
export function getPlatformSync() {
  const p = platform.find('main')
  // التأثيرات البصرية لكل ثيم (تُكمَّل بالقيم الافتراضية)
  return { ...p, effects: Object.fromEntries(Object.entries(DEFAULT_EFFECTS).map(([k, v]) => [k, { ...v, ...(p.effects?.[k] || {}) }])) }
}
export function savePlatform(patch, role) {
  return respond(() => {
    if (!isTop(role)) throw new ApiError('forbidden', 'تخصيص المنصة من صلاحية الإدارة العامة')
    return platform.update('main', patch)
  }, 400)
}

/* ——— المدارس / المستويات / المواسم / المواد ——— */
export function listSchools() {
  return respond(() => schools.map((s) => {
    const studs = assignments.filter((a) => a.role === 'student' && a.schoolId === s.id).length
    const mgr = assignments.find((a) => a.role === 'school_manager' && a.schoolId === s.id)
    return { ...s, students: studs, classes: classes.filter((c) => c.schoolId === s.id).length, manager: mgr ? fullName(personOf(mgr.personId)) : '—', genderLabel: { mixed: 'مختلطة', male: 'ذكور', female: 'إناث' }[s.gender], loginUrl: `#/s/${s.slug}` }
  }))
}
export function saveSchool(data) {
  return respond(() => {
    if (!data.name?.trim()) throw new ApiError('required', 'اسم المدرسة إجباري')
    const [short, commune] = data.name.split(' - ')
    if (data.id) {
      const s = schools.find((x) => x.id === data.id)
      Object.assign(s, { name: data.name, short: short?.trim(), commune: (data.commune || commune || '').trim(), gender: data.gender, status: data.status, code: data.code })
      return s
    }
    const id = newId('s')
    const s = { id, slug: data.slug || id, code: data.code || String(schools.length + 1), name: data.name, short: short?.trim(), commune: (data.commune || commune || '').trim(), gender: data.gender || 'mixed', status: 'active' }
    schools.push(s)
    schoolBranding[id] = { logo: null, primary: '#14213d', secondary: '#fca311', cover: 'pattern:arches', welcome: `مرحباً بكم في ${s.short}.` }
    return s
  })
}
export function listLevels() {
  return respond(() => levels.map((l) => ({ ...l, phaseLabel: { primary: 'ابتدائي', middle: 'متوسط', secondary: 'ثانوي' }[l.phase], theme: l.order <= 3 ? 'البراعم' : l.order <= 6 ? 'المستكشفون' : 'الشباب', classes: classes.filter((c) => c.levelId === l.id).length, subjects: subjects.filter((s) => s.levelId === l.id).length, lessons: lessons.filter((x) => x.levelId === l.id).length })))
}
export function saveLevel(data) {
  return respond(() => {
    const l = levels.find((x) => x.id === data.id)
    if (l) Object.assign(l, { name: data.name })
    return true
  })
}
/* ——— المواسم الدراسية: دورة حياة ———
 * قيد الإعداد (draft) ← نشط (active، موسم واحد فقط) ← إقفال (closing) ← مؤرشف (archived، للقراءة فقط)
 * الموسم الجديد يُعَدّ والقديم ما زال نشطاً، ثم «إطلاق الموسم» يؤرشف القديم ويفعّل الجديد.
 * المؤرشف لا يُعاد تفعيله؛ يمكن «إعادة فتحه مؤقتاً للتصحيح» بسبب ومدة، ويُسجَّل ذلك. */
const TERMS = (y) => [
  { name: 'الفصل الأول', start: `${y}-09-13`, end: `${y}-12-18` },
  { name: 'الفصل الثاني', start: `${y + 1}-01-04`, end: `${y + 1}-03-19` },
  { name: 'الفصل الثالث', start: `${y + 1}-04-04`, end: `${y + 1}-06-30` }
]
const seasonCol = collection('seasons2', () => [
  ...seasons.map((s) => ({ ...s, terms: TERMS(2026) })),
  { id: 'y2025', name: '2025 / 2026', start: '2025-09-14', end: '2026-06-30', status: 'archived', terms: TERMS(2025), archivedAt: '2026-07-05T10:00:00Z', snapshot: { classes: 74, students: 1912, submissions: 18430, messages: 2210, reportCards: 1890 } }
])
/** ما يُؤرشف مع الموسم وما يبقى خارجه (قابل للتعديل لاحقاً) */
export const ARCHIVE_SCOPE = {
  archived: ['الأقسام والتسجيلات', 'التسليمات والعلامات وكشوف النقاط', 'خطط الدروس وربط المحتوى بالأقسام', 'إشعارات المدارس', 'المراسلات (للقراءة)'],
  kept: ['حسابات الأشخاص', 'المكتبة المركزية', 'بنك الأنشطة', 'بنك الاختبارات الحضورية (مصنّف بالموسم)', 'الإعدادات والهوية']
}
const ADMINS = ['super_admin', 'admin']
const decorateSeason = (s) => ({ ...s, reopened: !!(s.reopen && s.reopen.until > new Date().toISOString()) })
export function listSeasons() {
  return respond(() => seasonCol.all().map(decorateSeason).sort((a, b) => b.start.localeCompare(a.start)))
}
export const activeSeason = () => seasonCol.all().find((s) => s.status === 'active')
/** هل بيانات الموسم للقراءة فقط؟ (مؤرشف ولم يُعَد فتحه مؤقتاً) */
export function seasonReadOnly(seasonId) {
  const s = seasonCol.find(seasonId)
  return !!s && s.status === 'archived' && !decorateSeason(s).reopened
}
/** POST /api/seasons — موسم جديد يبدأ «قيد الإعداد» */
export function createSeason(data) {
  return respond(() => {
    if (seasonCol.all().some((s) => s.status === 'draft')) throw new ApiError('exists', 'يوجد موسم قيد الإعداد بالفعل')
    const y = Number(String(data.start).slice(0, 4))
    return seasonCol.insert({ ...data, id: newId('y'), status: 'draft', terms: data.terms?.length ? data.terms : TERMS(y) })
  })
}
/** PUT /api/seasons/:id — التعديل ممنوع على المؤرشف (إلا إن أعيد فتحه مؤقتاً) */
export function updateSeason(id, data) {
  return respond(() => {
    if (seasonReadOnly(id)) throw new ApiError('readonly', 'الموسم مؤرشف — للقراءة فقط')
    const { status, ...rest } = data
    return seasonCol.update(id, rest)
  })
}
/** POST /api/seasons/:id/closing — بداية إقفال الموسم النشط (إقفال العلامات وطباعة الكشوف واعتماد الترقية) */
export function setClosing(id, on = true) {
  return respond(() => {
    const s = seasonCol.find(id)
    if (on && s.status !== 'active') throw new ApiError('state', 'الإقفال للموسم النشط فقط')
    return seasonCol.update(id, { status: on ? 'closing' : 'active' })
  })
}
/** GET /api/seasons/promotion-preview — اقتراح الترقية لكل مستوى: ناجح ← المستوى التالي، آخر مستوى ← متخرّج */
export function promotionPreview() {
  return respond(() => {
    const ordered = [...levels].sort((a, b) => a.order - b.order)
    return ordered.map((l, i) => {
      const n = classes.filter((c) => c.levelId === l.id).reduce((t, c) => t + assignments.filter((a) => a.role === 'student' && a.classId === c.id).length, 0)
      return { levelId: l.id, levelName: l.name, students: n, next: ordered[i + 1]?.name || 'متخرّج', repeat: 0, leave: 0 }
    })
  })
}
/** POST /api/seasons/:id/launch — يؤرشف النشط/المُقفل ويفعّل الموسم الجديد */
export function launchSeason(id, { promotion = [], copyClasses = true, proposeAssignments = true } = {}, role) {
  return respond(() => {
    if (!ADMINS.includes(role)) throw new ApiError('forbidden', 'إطلاق الموسم من صلاحية الإدارة العامة')
    const s = seasonCol.find(id)
    if (!s || s.status !== 'draft') throw new ApiError('state', 'يُطلق الموسم الذي هو قيد الإعداد فقط')
    const old = seasonCol.all().find((x) => ['active', 'closing'].includes(x.status))
    if (old) {
      const students = assignments.filter((a) => a.role === 'student').length
      seasonCol.update(old.id, { status: 'archived', archivedAt: new Date().toISOString(), snapshot: { classes: classes.length, students, submissions: 0, messages: 0, reportCards: students } })
    }
    const promoted = promotion.reduce((t, p) => t + Math.max(0, p.students - p.repeat - p.leave), 0)
    return seasonCol.update(id, { status: 'active', launchedAt: new Date().toISOString(), launch: { promoted, repeat: promotion.reduce((t, p) => t + p.repeat, 0), leave: promotion.reduce((t, p) => t + p.leave, 0), copyClasses, proposeAssignments } })
  }, 600)
}
/** POST /api/seasons/:id/reopen { reason, hours } — إعادة فتح مؤقت للتصحيح (يُسجَّل) */
export function reopenSeason(id, { reason, hours = 48 }, by, role) {
  return respond(() => {
    if (!ADMINS.includes(role)) throw new ApiError('forbidden', 'إعادة الفتح من صلاحية الإدارة العامة')
    if (!reason?.trim()) throw new ApiError('required', 'سبب إعادة الفتح إجباري')
    const until = new Date(Date.now() + hours * 36e5).toISOString()
    const s = seasonCol.find(id)
    return seasonCol.update(id, { reopen: { reason, until, by, at: new Date().toISOString() }, reopenLog: [...(s.reopenLog || []), { reason, hours, by, at: new Date().toISOString() }] })
  })
}
export function endReopen(id) {
  return respond(() => seasonCol.update(id, { reopen: null }))
}

export function listSubjects() {
  return respond(() => {
    const byName = {}
    subjects.forEach((s) => {
      const r = (byName[s.name] = byName[s.name] || { id: s.name, name: s.name, icon: s.icon, color: s.color, levels: [], lessons: 0, axes: 0, contents: 0 })
      r.levels.push(levels.find((l) => l.id === s.levelId)?.name)
      r.lessons += lessons.filter((l) => l.subjectId === s.id).length
      r.axes += s.axes.length
      r.contents += contents.filter((c) => c.subjectId === s.id).length
    })
    return Object.values(byName)
  })
}
export function subjectTree(name) {
  return respond(() => subjects.filter((s) => s.name === name).map((s) => ({ level: levels.find((l) => l.id === s.levelId)?.name, axes: s.axes.map((ax) => ({ name: ax, lessons: lessons.filter((l) => l.subjectId === s.id && l.axis === ax).map((l) => ({ title: l.title, label: l.label, gender: l.gender })) })) })))
}

/* ——— الصلاحيات ——— */
export const PERMISSIONS = [
  { key: 'users.manage', label: 'إدارة المستخدمين', group: 'المستخدمون' },
  { key: 'users.activate', label: 'تفعيل الحسابات', group: 'المستخدمون' },
  { key: 'users.import', label: 'الاستيراد الجماعي', group: 'المستخدمون' },
  { key: 'content.upload', label: 'رفع المحتوى', group: 'المحتوى' },
  { key: 'content.review', label: 'مراجعة المكتبة المركزية', group: 'المحتوى' },
  { key: 'content.school_approve', label: 'مصادقة ملفات المدرسة', group: 'المحتوى' },
  { key: 'activities.create', label: 'إنشاء الواجبات والتقييمات', group: 'الواجبات والتقييمات' },
  { key: 'activities.grade', label: 'التصحيح ووضع العلامات', group: 'الواجبات والتقييمات' },
  { key: 'reports.school', label: 'تقارير المدرسة', group: 'التقارير' },
  { key: 'reports.global', label: 'التقارير العامة', group: 'التقارير' },
  { key: 'messages.parents', label: 'مراسلة الأولياء', group: 'التواصل' },
  { key: 'notices.school', label: 'إعلانات المدرسة', group: 'التواصل' },
  { key: 'notices.global', label: 'الإعلانات العامة', group: 'التواصل' },
  { key: 'settings.platform', label: 'تخصيص المنصة', group: 'الإعدادات' },
  { key: 'settings.branding_approve', label: 'اعتماد هويات المدارس', group: 'الإعدادات' },
  { key: 'support.tickets', label: 'معالجة البلاغات', group: 'الدعم' }
]
const DEFAULT_MATRIX = {
  super_admin: PERMISSIONS.map((p) => p.key),
  admin: PERMISSIONS.map((p) => p.key), // المشرف العام = المدير العام (إلا نزع المدير العام وإضافة مشرف عام)
  editor: ['content.upload', 'content.review', 'activities.create', 'reports.global'],
  school_manager: ['users.manage', 'users.activate', 'content.school_approve', 'reports.school', 'messages.parents', 'notices.school'],
  teacher: ['content.upload', 'activities.create', 'activities.grade', 'messages.parents'],
  student: [],
  parent: [],
  support: ['support.tickets']
}
const perms = collection('permissions', () => [{ id: 'matrix', ...DEFAULT_MATRIX }])
export function getPermissions() {
  return respond(() => ({ permissions: PERMISSIONS, matrix: perms.find('matrix') }))
}
export function savePermissions(matrix, role) {
  return respond(() => {
    if (!isTop(role)) throw new ApiError('forbidden', 'تعديل الصلاحيات من صلاحية الإدارة العامة')
    return perms.update('matrix', matrix)
  }, 350)
}

/* ——— سجل النشاطات ——— */
const ACTIONS = [
  ['login', 'دخول إلى المنصة'], ['content.upload', 'رفع محتوى'], ['content.approve', 'اعتماد محتوى'], ['grade', 'تصحيح واجب'], ['user.create', 'إضافة مستخدم'],
  ['user.activate', 'تفعيل حساب'], ['notice.send', 'إرسال إعلان'], ['lesson.complete', 'إكمال درس'], ['quiz.submit', 'تسليم تقييم'], ['settings.update', 'تعديل الإعدادات']
]
export function activityLog() {
  return respond(() => {
    const ppl = persons.slice(0, 220)
    return [...Array(160)].map((_, i) => {
      const p = ppl[(i * 37) % ppl.length]
      const [code, label] = ACTIONS[(i * 7) % ACTIONS.length]
      const a = assignments.find((x) => x.personId === p.id)
      return { id: 'lg' + i, at: new Date(Date.now() - i * 23 * 60000).toISOString(), person: fullName(p), role: a?.role, school: schools.find((s) => s.id === a?.schoolId)?.short || '—', action: code, actionLabel: label, ip: `105.98.${(i * 13) % 255}.${(i * 29) % 255}`, device: ['هاتف', 'حاسوب', 'لوحي'][i % 3] }
    })
  })
}

/* ——— الرزنامة ——— */
const events = collection('events', () => {
  const d = (m, day) => `2026-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return [
    { id: 'ev1', title: 'عطلة الشتاء', type: 'holiday', start: d(12, 18), end: '2027-01-03', scope: 'all' },
    { id: 'ev2', title: 'اختبارات الفصل الأول', type: 'exam', start: d(12, 6), end: d(12, 14), scope: 'all' },
    { id: 'ev3', title: 'اجتماع المعلمين العام', type: 'meeting', start: d(11, 29), end: d(11, 29), scope: 'all' },
    { id: 'ev4', title: 'عطلة الربيع', type: 'holiday', start: '2027-03-19', end: '2027-04-04', scope: 'all' },
    { id: 'ev5', title: 'يوم مفتوح للأولياء', type: 'event', start: d(12, 2), end: d(12, 2), scope: 's1' },
    { id: 'ev6', title: 'دورة تكوينية: التعليم عن بعد', type: 'training', start: d(11, 27), end: d(11, 28), scope: 'all' }
  ]
})
export function listEvents() {
  return respond(() => events.all().slice().sort((a, b) => a.start.localeCompare(b.start)))
}
export function saveEvent(data) {
  return respond(() => (data.id && events.find(data.id) ? events.update(data.id, data) : events.insert({ ...data, id: newId('ev') })))
}
export function removeEvent(id) {
  return respond(() => events.remove(id))
}

/* ——— إعدادات التواصل ——— */
const comm = collection('communication2', () => [{
  id: 'rules',
  matrix: DEFAULT_MSG_MATRIX,
  hours: { enabled: true, from: '07:00', to: '20:00' },
  channels: { inapp: true, email: true, sms: false, push: true },
  moderation: { badWords: true, attachmentsStudents: false, maxFileMb: 10 }
}])
export function getCommunication() {
  return respond(() => comm.find('rules'))
}
/** المصفوفة الحالية (متزامنة) — تستعملها خدمة المراسلة */
export const messagingMatrix = () => comm.find('rules')?.matrix || DEFAULT_MSG_MATRIX
export function saveCommunication(data) {
  return respond(() => comm.update('rules', data), 350)
}

/* ——— الاستيراد والتصدير ——— */
const jobs = collection('importJobs', () => [
  { id: 'jb1', kind: 'import', entity: 'students', file: 'تلاميذ-النور-2026.xlsx', rows: 112, ok: 109, errors: 3, status: 'done', at: new Date(Date.now() - 9 * 864e5).toISOString(), by: 'عبد الرحمن بكير' },
  { id: 'jb2', kind: 'export', entity: 'grades', file: 'علامات-الفصل-الأول.xlsx', rows: 1840, ok: 1840, errors: 0, status: 'done', at: new Date(Date.now() - 2 * 864e5).toISOString(), by: 'إبراهيم حمودة' }
])
export function listJobs() {
  return respond(() => jobs.all())
}
export function addJob(job, by) {
  return respond(() => jobs.insert({ id: newId('jb'), status: 'done', at: new Date().toISOString(), by: fullName(by), ...job }), 600)
}
/** محاكاة تحليل ملف استيراد: يُرجع معاينة الأسطر مع الأخطاء */
export function previewImport(entity, schoolId) {
  return respond(() => {
    const cls = classes.filter((c) => !schoolId || c.schoolId === schoolId)
    return [...Array(14)].map((_, i) => {
      const err = i === 3 ? 'تاريخ الميلاد غير صالح' : i === 8 ? 'القسم غير موجود' : i === 11 ? 'مكرر: موجود مسبقاً' : null
      return { id: 'r' + i, line: i + 2, lastName: ['بن يوسف', 'حمو', 'قاسمي', 'شريفي', 'دحمان', 'بكوش', 'سعدي'][i % 7], firstName: ['أيمن', 'سارة', 'عمار', 'هاجر', 'مالك', 'إيمان', 'يونس'][i % 7], birthDate: i === 3 ? '31/02/2016' : `2016-0${(i % 9) + 1}-1${i % 9}`, className: i === 8 ? 'الرابعة ج' : cls[i % cls.length]?.name, parentPhone: `06${String(61234567 + i * 1111).slice(-8)}`, error: err }
    })
  }, 700)
}

/* ——— التقارير العامة ——— */
export function globalReport() {
  return respond(() => {
    const per = schools.map((s) => ({ ...overviewSync(s.id), id: s.id }))
    const totals = per.reduce((t, o) => ({ students: t.students + o.counts.students, teachers: t.teachers + o.counts.teachers, parents: t.parents + o.counts.parents, classes: t.classes + o.counts.classes, active: t.active + o.activeWeek, minutes: t.minutes + o.minutes }), { students: 0, teachers: 0, parents: 0, classes: 0, active: 0, minutes: 0 })
    return {
      totals,
      contents: contents.length,
      activities: activities.length,
      pendingReview: contents.filter((c) => c.status === 'pending').length + collection('uploads').all().filter((u) => u.status === 'review').length,
      schools: per.map((o) => ({ id: o.id, name: o.school.name, short: o.school.short, students: o.counts.students, teachers: o.counts.teachers, classes: o.counts.classes, progress: o.progress, average: o.average, active: o.counts.students ? Math.round((o.activeWeek / o.counts.students) * 100) : 0, atRisk: o.atRisk.length, minutes: o.minutes })),
      byType: Object.entries(contents.reduce((m, c) => ((m[c.type] = (m[c.type] || 0) + 1), m), {})).map(([k, v]) => ({ key: k, value: v })),
      byLevel: levels.filter((l) => contents.some((c) => c.levelId === l.id)).map((l) => ({ label: l.name, value: contents.filter((c) => c.levelId === l.id).length, views: contents.filter((c) => c.levelId === l.id).reduce((n, c) => n + c.views, 0) })),
      weekly: [...Array(10)].map((_, i) => ({ label: `أسبوع ${10 - i}`, value: Math.round(totals.active * (1 - i * 0.045) + ((i * 37) % 23)) })),
      engagement: {
        comments: 420 + totals.students, ratings: 1310, avgRating: 4.3,
        devices: [{ label: 'الهاتف', value: 64 }, { label: 'الحاسوب', value: 27 }, { label: 'اللوحي', value: 9 }],
        hours: [{ label: '6–9 صباحاً', value: 8 }, { label: '9–12', value: 14 }, { label: '12–15', value: 17 }, { label: '15–18', value: 26 }, { label: '18–21', value: 29 }, { label: '21–24', value: 6 }]
      }
    }
  }, 400)
}
