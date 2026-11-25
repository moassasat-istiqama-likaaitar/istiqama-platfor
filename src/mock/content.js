/**
 * المحتوى التعليمي التجريبي.
 * المواد والمحاور وعناوين الدروس مأخوذة من شيت "سيرورة الدروس" (البرنامج الموحد) للمؤسسة.
 * المحتوى نفسه (فيديو، عروض، مذكرات، صور، اختبارات) تجريبي ويُستبدل بمحتوى المعلمين.
 */
import CURRICULUM from './curriculum.json'

// ——— المواد: لون وأيقونة ثابتان (الصور الحقيقية للمواد تُرفع لاحقاً من الإدارة) ———
export const SUBJECT_KINDS = {
  'التربية الإيمانية': { key: 'iman', icon: 'pi pi-heart', color: '#e0457b', accent: '#ffc23c', art: 'heart' },
  'اللغة العربية': { key: 'arabic', icon: 'pi pi-pencil', color: '#ef7d32', accent: '#3b7cf0', art: 'letters' },
  الفقه: { key: 'fiqh', icon: 'pi pi-book', color: '#1590c7', accent: '#ffc23c', art: 'water' },
  التاريخ: { key: 'history', icon: 'pi pi-globe', color: '#8457d6', accent: '#ffb020', art: 'globe' },
  'أحكام التجويد': { key: 'tajwid', icon: 'pi pi-volume-up', color: '#17a077', accent: '#ffc23c', art: 'quran' }
}

const AUTHORS = [
  { id: 'p5', name: 'عمر باعمر' }, { id: 'p6', name: 'عائشة الشيخ' }, { id: 'x1', name: 'صالح بوكامل' },
  { id: 'x2', name: 'فاطمة حمّو' }, { id: 'x3', name: 'بكير قاسم' }, { id: 'x4', name: 'زينب عمّي' }, { id: 'p3', name: 'يوسف حاج سعيد' }
]

/** "الدرس الثالث: التاء المربوطة" → { label: 'الدرس الثالث', name: 'التاء المربوطة' } */
export function splitTitle(t) {
  const i = t.indexOf(':')
  if (i > 0 && /^(الدرس|المحور|مقرر)/.test(t.trim())) return { label: t.slice(0, i).trim(), name: t.slice(i + 1).trim() }
  return { label: '', name: t.trim() }
}

// ——— دروس مميزة: محتوى مكتوب يدوياً لعرض قدرات المنصة ———
const FEATURED = {
  'التاء المربوطة': {
    video: { src: 'media/taa-marbuta.mp4', poster: 'media/taa-poster.jpg', duration: 14, title: 'التاء المربوطة — نتعلّمها معاً' },
    slides: [
      { title: 'التاء المربوطة', bullets: ['تُكتب في آخر الاسم: ة أو ـة', 'نقف عليها بالهاء', 'مثال: مدرسة، شجرة، فاطمة'], art: 'letters' },
      { title: 'كيف أعرفها؟', bullets: ['أقف على الكلمة', 'إذا نطقتها هاءً فهي مربوطة', 'مدرسة ← مدرسه'], art: 'idea' },
      { title: 'هيا نتدرّب', bullets: ['حديقـ...', 'سيّار...', 'معلّمـ...'], art: 'letters' }
    ],
    quiz: [
      { q: 'أين تُكتب التاء المربوطة؟', options: ['في أول الكلمة', 'في آخر الاسم', 'في وسط الكلمة'], answer: 1 },
      { q: 'أي كلمة فيها تاء مربوطة؟', options: ['بيت', 'شجرة', 'كتب'], answer: 1 },
      { q: 'عند الوقف على "مدرسة" ننطقها:', options: ['مدرسه', 'مدرست', 'مدرسا'], answer: 0 }
    ]
  },
  'أنظف جسمي': {
    slides: [
      { title: 'أنظف جسمي', bullets: ['النظافة من الإيمان', 'أغسل يديّ قبل الأكل وبعده', 'أستحم وأقص أظافري'], art: 'water' },
      { title: 'أدوات نظافتي', bullets: ['الصابون', 'فرشاة الأسنان والسواك', 'المنشفة الخاصة بي'], art: 'heart' }
    ],
    quiz: [
      { q: 'متى أغسل يديّ؟', options: ['قبل الأكل وبعده', 'مرة في الأسبوع', 'لا أغسلهما'], answer: 0 },
      { q: 'النظافة من الإيمان.', options: ['صحيح', 'خطأ'], answer: 0 }
    ]
  },
  'فرائض الصوم وسننه': {
    video: { src: 'media/sawm.mp4', poster: 'media/sawm-poster.jpg', duration: 14, title: 'فرائض الصوم وسننه' },
    slides: [
      { title: 'فرائض الصوم', bullets: ['النية', 'الإمساك عن المفطرات من الفجر إلى الغروب'], art: 'water' },
      { title: 'سنن الصوم', bullets: ['السحور وتأخيره', 'تعجيل الفطر', 'الدعاء عند الإفطار', 'كثرة الذكر وتلاوة القرآن'], art: 'heart' }
    ],
    pdf: [
      { heading: 'فرائض الصوم وسننه', paragraphs: ['الصوم ركن من أركان الإسلام، وله فرائض لا يصح إلا بها، وسنن يُستحب الإتيان بها.', 'فرائضه: النية من الليل، والإمساك عن المفطرات من طلوع الفجر الصادق إلى غروب الشمس.'] },
      { heading: 'تقويم', paragraphs: ['1. اذكر فرائض الصوم.', '2. عدّد ثلاثاً من سنن الصوم.', '3. ما الحكمة من تعجيل الفطر؟'] }
    ],
    quiz: [
      { q: 'من فرائض الصوم:', options: ['السحور', 'النية', 'تعجيل الفطر'], answer: 1 },
      { q: 'يبدأ الإمساك من:', options: ['طلوع الشمس', 'طلوع الفجر', 'منتصف الليل'], answer: 1 },
      { q: 'تأخير السحور سنّة.', options: ['صحيح', 'خطأ'], answer: 0 }
    ]
  },
  'البيع في الإسلام': {
    slides: [
      { title: 'البيع في الإسلام', bullets: ['مبادلة مال بمال على وجه التراضي', 'مشروع بالكتاب والسنة والإجماع'], art: 'idea' },
      { title: 'أركان البيع', bullets: ['العاقدان', 'الصيغة: الإيجاب والقبول', 'المعقود عليه: الثمن والمثمن'], art: 'book' }
    ],
    pdf: [
      { heading: 'البيع في الإسلام', paragraphs: ['البيع لغة مقابلة شيء بشيء، واصطلاحاً مبادلة مال بمال على وجه التراضي.', 'وقد شرعه الله تيسيراً لحاجات الناس، قال تعالى: ﴿وأحل الله البيع وحرم الربا﴾.'] }
    ],
    quiz: [
      { q: 'من أركان البيع:', options: ['الصيغة', 'الكفالة', 'الشهادة'], answer: 0 },
      { q: 'يشترط في البيع التراضي.', options: ['صحيح', 'خطأ'], answer: 0 }
    ]
  },
  'نظام الإرث في الإسلام': {
    slides: [
      { title: 'نظام الإرث في الإسلام', bullets: ['تولّى الله تقسيم المواريث بنفسه', 'يقوم على العدل والمسؤولية'], art: 'idea' },
      { title: 'أسباب الإرث', bullets: ['النسب', 'النكاح', 'الولاء'], art: 'book' }
    ],
    quiz: [
      { q: 'من أسباب الإرث:', options: ['الصداقة', 'النسب', 'الجوار'], answer: 1 },
      { q: 'تقسيم المواريث مفصّل في القرآن الكريم.', options: ['صحيح', 'خطأ'], answer: 0 }
    ]
  }
}

const GENERIC_QUIZ = (name) => [
  { q: `ما الفكرة الأساسية في درس «${name}»؟`, options: ['ما شرحه المعلم في الحصة', 'موضوع آخر', 'لا أعرف'], answer: 0 },
  { q: 'شاهدتُ محتوى الدرس كاملاً قبل حل هذا التمرين.', options: ['صحيح', 'خطأ'], answer: 0 },
  { q: 'أفضل طريقة للمراجعة:', options: ['المراجعة المنتظمة', 'ليلة الاختبار فقط', 'عدم المراجعة'], answer: 0 }
]

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const daysFromNow = (d, h = 23) => {
  const x = new Date()
  x.setDate(x.getDate() + d)
  x.setHours(h, 59, 0, 0)
  return x.toISOString()
}
const genericSlides = (name, art, subjectName) => [
  { title: name, bullets: [subjectName, 'درس تفاعلي'], art },
  { title: 'أهداف الدرس', bullets: ['أفهم الفكرة الأساسية', 'أطبّق على أمثلة', 'أتحقق من فهمي'], art: 'idea' },
  { title: 'الخلاصة', bullets: ['أراجع النقاط الأساسية', 'أحل نشاط الدرس', 'أسأل معلمي في الرسائل'], art: 'heart' }
]
const genericPdf = (name, subjectName) => [
  { heading: `${subjectName} — ${name}`, paragraphs: [`يتناول هذا الدرس موضوع «${name}». نقرأ النص بتمعّن ونستخرج الأفكار الأساسية.`, 'نلاحظ الأمثلة، ثم نصوغ الخلاصة بأسلوبنا.'] },
  { heading: 'أنشطة', paragraphs: ['النشاط الأول: اقرأ ثم أجب.', 'النشاط الثاني: لخّص الدرس في ثلاثة أسطر.'] }
]

export const subjects = []
export const lessons = []
export const contents = []
export const activities = []

const STATUSES = ['approved', 'approved', 'approved', 'temp', 'pending', 'approved', 'draft', 'rejected']
const MAIN_TYPES = ['video', 'slides', 'pdf', 'slides', 'video']

Object.entries(CURRICULUM).forEach(([levelId, rows]) => {
  const bySubject = {}
  rows.forEach(([subjectName, axis, title, gender]) => {
    ;(bySubject[subjectName] = bySubject[subjectName] || []).push({ axis, title, gender })
  })
  Object.entries(bySubject).forEach(([subjectName, list], si) => {
    const kind = SUBJECT_KINDS[subjectName] || { key: `s${si}`, icon: 'pi pi-book', color: '#3159e8', accent: '#ffc23c', art: 'book' }
    const subjectId = `${levelId}-${kind.key}`
    const axes = [...new Set(list.map((x) => x.axis))]
    subjects.push({ id: subjectId, levelId, key: kind.key, name: subjectName, icon: kind.icon, color: kind.color, accent: kind.accent, art: kind.art, order: si, axes })

    list.forEach(({ axis, title, gender }, li) => {
      const { label, name } = splitTitle(title)
      const lessonId = `${subjectId}-${li + 1}`
      const f = FEATURED[name]
      lessons.push({ id: lessonId, subjectId, levelId, axis, axisIndex: axes.indexOf(axis), label, title: name, order: li + 1, gender: gender || null, minutes: 8 + (hash(name) % 12) })

      const author = AUTHORS[hash(lessonId) % AUTHORS.length]
      const createdAt = daysFromNow(-(40 - li), 10)
      const push = (type, classification, payload, ctitle) => {
        const id = `ct-${lessonId}-${contents.filter((c) => c.lessonId === lessonId).length + 1}`
        const status = f || classification === 'main' ? 'approved' : STATUSES[hash(id) % STATUSES.length]
        contents.push({
          id, lessonId, subjectId, levelId, type, classification, status, title: ctitle || name,
          keywords: [subjectName, name, ...name.split(' ').filter((w) => w.length > 3)].slice(0, 5),
          authorId: author.id, authorName: author.name, mandatory: classification === 'main',
          createdAt, rating: 3.5 + (hash(id) % 15) / 10, views: 20 + (hash(id) % 300), payload
        })
      }

      if (f) {
        if (f.video) push('video', 'main', f.video, f.video.title)
        if (f.slides) push('slides', 'main', { slides: f.slides }, `${name} — عرض الدرس`)
        if (f.pdf) push('pdf', 'enrichment', { pages: f.pdf }, `${name} — المذكرة`)
      } else {
        const mt = MAIN_TYPES[(li + si) % MAIN_TYPES.length]
        push(mt, 'main', {
          video: { duration: 90 + (hash(name) % 200), scenes: genericSlides(name, kind.art, subjectName) },
          slides: { slides: genericSlides(name, kind.art, subjectName) },
          pdf: { pages: genericPdf(name, subjectName) }
        }[mt])
        if ((li + si) % 3 === 0) push('pdf', 'enrichment', { pages: genericPdf(name, subjectName) }, `${name} — ورقة عمل`)
        else if ((li + si) % 4 === 1) push('image', 'enrichment', { art: kind.art, caption: `${name}: بطاقة تلخيصية` }, `${name}: بطاقة تلخيصية`)
      }

      // مواعيد موزّعة: بعضها متأخر، وأغلبها خلال الأسبوع القادم
      const due = daysFromNow(((li * 3 + si) % 10) - 2)
      if (f?.quiz || li % 3 === 0) {
        activities.push({
          id: `ac-${lessonId}-q`, lessonId, subjectId, levelId, type: 'quiz', title: `اختبار: ${name}`,
          required: li % 2 === 0, mandatory: true, authorId: author.id, authorName: author.name, status: 'approved',
          questions: f?.quiz || GENERIC_QUIZ(name), due, maxScore: 10
        })
      }
      if (li % 4 === 2) {
        activities.push({
          id: `ac-${lessonId}-h`, lessonId, subjectId, levelId, type: 'homework', title: `واجب: ${name}`,
          required: true, mandatory: true, authorId: author.id, authorName: author.name, status: 'approved',
          instructions: `أنجز أنشطة ورقة العمل الخاصة بدرس «${name}»، ثم اكتب إجابتك أو أرفق صورة لكراسك.`,
          attachments: [{ name: `ورقة عمل - ${name}.pdf`, size: '240 KB' }],
          modelAnswer: 'تُنشر الإجابة النموذجية بعد التصحيح.', due: daysFromNow(((li * 5 + si) % 9) - 1), maxScore: 20
        })
      }
    })
  })
})

export const AUTHORS_LIST = AUTHORS

/** محتوى معاينة لما يرفعه المعلمون (في الإنتاج: الملف الفعلي) */
export function makePayload(type, title, subjectName) {
  const kind = SUBJECT_KINDS[subjectName] || { art: 'book' }
  if (type === 'video') return { duration: 120, scenes: genericSlides(title, kind.art, subjectName) }
  if (type === 'slides') return { slides: genericSlides(title, kind.art, subjectName) }
  if (type === 'image') return { art: kind.art, caption: title }
  return { pages: genericPdf(title, subjectName) }
}
