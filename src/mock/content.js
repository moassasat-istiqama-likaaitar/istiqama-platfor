/**
 * المحتوى التعليمي التجريبي: المواد، الدروس، المحتوى (فيديو، عروض، وثائق، صور)، الأنشطة (Quiz، واجبات).
 * يُولَّد جزء كبير منه آلياً من قوائم العناوين، مع دروس "مميزة" محتواها مكتوب يدوياً.
 */

// ——— المواد (اللون والرسم ثابتان للمادة في كل المستويات) ———
export const SUBJECT_KINDS = {
  quran: { name: 'القرآن الكريم', art: 'quran', color: '#c98a1b', accent: '#2fb67c' },
  arabic: { name: 'اللغة العربية', art: 'letters', color: '#ec5a5a', accent: '#ffc23c' },
  math: { name: 'الرياضيات', art: 'numbers', color: '#3b7cf0', accent: '#ffb020' },
  geometry: { name: 'الرياضيات', art: 'shapes', color: '#3b7cf0', accent: '#ffb020' },
  analysis: { name: 'الرياضيات', art: 'graph', color: '#3b7cf0', accent: '#ff7a59' },
  science: { name: 'التربية العلمية', art: 'plant', color: '#26a65b', accent: '#ffcf3c' },
  biology: { name: 'العلوم الطبيعية', art: 'cell', color: '#26a65b', accent: '#ff8a5b' },
  islamic: { name: 'التربية الإسلامية', art: 'heart', color: '#d6478e', accent: '#ffc23c' },
  fiqh: { name: 'الفقه', art: 'water', color: '#0e93b8', accent: '#ffc23c' },
  physics: { name: 'العلوم الفيزيائية', art: 'bolt', color: '#7a4fe0', accent: '#ffc23c' },
  history: { name: 'التاريخ والجغرافيا', art: 'globe', color: '#e8871a', accent: '#3b7cf0' },
  literature: { name: 'الأدب العربي', art: 'pen', color: '#ec5a5a', accent: '#3b7cf0' },
  aqida: { name: 'العقيدة', art: 'idea', color: '#c98a1b', accent: '#7a4fe0' }
}

// ——— المناهج حسب المستوى ———
const CURRICULUM = {
  P1: [
    ['quran', ['سورة الفاتحة', 'سورة الناس', 'سورة الفلق', 'سورة الإخلاص', 'سورة المسد']],
    ['arabic', ['حرف الألف', 'حرف الباء', 'حرف التاء', 'حرف الثاء', 'حرف الجيم']],
    ['math', ['الأعداد من 1 إلى 5', 'الأعداد من 6 إلى 10', 'أكبر وأصغر', 'الجمع البسيط', 'الأشكال من حولنا']],
    ['islamic', ['أركان الإسلام', 'آداب الطعام', 'أتعلم الوضوء', 'بر الوالدين']]
  ],
  P3: [
    ['quran', ['سورة الفيل', 'سورة قريش', 'سورة الماعون', 'سورة الكوثر', 'سورة الكافرون']],
    ['arabic', ['الجملة الاسمية', 'الجملة الفعلية', 'المفرد والمثنى', 'التاء المربوطة والمفتوحة', 'قراءة: يوم في السوق']],
    ['math', ['الجمع بالاحتفاظ', 'الطرح بالاستلاف', 'جدول الضرب في 2 و3', 'قياس الأطوال', 'قراءة الساعة']],
    ['science', ['أجزاء النبتة', 'الحيوانات الأليفة والبرية', 'حالات الماء', 'الحواس الخمس']],
    ['islamic', ['الصلاة عماد الدين', 'الصدق', 'آداب المسجد', 'قصة النبي يونس']]
  ],
  M1: [
    ['quran', ['سورة النبأ', 'سورة النازعات', 'سورة عبس', 'سورة التكوير']],
    ['arabic', ['الفعل الماضي', 'الفعل المضارع', 'فعل الأمر', 'النعت', 'التعبير: وصف مشهد طبيعي']],
    ['geometry', ['الأعداد العشرية', 'الكسور', 'الزوايا', 'المثلث', 'التناسبية']],
    ['biology', ['الخلية وحدة الحياة', 'التنفس عند النبات', 'السلسلة الغذائية', 'الكائنات الدقيقة']],
    ['history', ['الحضارة الإسلامية', 'الجزائر: الموقع والتضاريس', 'المناخ في الجزائر', 'الفتوحات الإسلامية']]
  ],
  M4: [
    ['fiqh', ['أحكام الطهارة', 'الصلاة: شروطها وأركانها', 'الزكاة', 'الصيام', 'الحج والعمرة']],
    ['arabic', ['الممنوع من الصرف', 'أسلوب الشرط', 'البدل', 'العروض: البحر الكامل']],
    ['geometry', ['نظرية فيثاغورس', 'المعادلات من الدرجة الأولى', 'الحساب الحرفي', 'الإحصاء', 'الدوال الخطية']],
    ['physics', ['الدارة الكهربائية', 'الضوء والظل', 'الكتلة والحجم', 'الطاقة']],
    ['history', ['الثورة التحريرية', 'الحرب العالمية الثانية', 'الاقتصاد الجزائري']]
  ],
  S2: [
    ['aqida', ['الإيمان بالله', 'الإيمان بالملائكة', 'الإيمان بالكتب', 'القضاء والقدر']],
    ['analysis', ['الدوال المرجعية', 'الاشتقاقية', 'المتتاليات العددية', 'الهندسة في الفضاء', 'الاحتمالات']],
    ['physics', ['الحركة المستقيمة', 'القوى والتأثيرات', 'الطاقة الحركية', 'التحولات الكيميائية']],
    ['literature', ['الشعر في العصر العباسي', 'المتنبي', 'النثر الفني', 'المقامة']]
  ]
}

// أسماء معلمين إضافيين لإثراء المكتبة
const AUTHORS = [
  { id: 'p5', name: 'عمر باعمر' }, { id: 'p6', name: 'عائشة الشيخ' }, { id: 'x1', name: 'صالح بوكامل' },
  { id: 'x2', name: 'فاطمة حمّو' }, { id: 'x3', name: 'بكير قاسم' }, { id: 'x4', name: 'زينب عمّي' }, { id: 'p3', name: 'يوسف حاج سعيد' }
]

// ——— الدروس المميزة: محتوى مكتوب يدوياً ———
const FEATURED = {
  'سورة الفيل': {
    video: { src: 'media/surat-al-fil.mp4', poster: 'media/fil-poster.jpg', duration: 14, title: 'سورة الفيل — تلاوة مع التتبع' },
    slides: [
      { title: 'سورة الفيل', bullets: ['سورة مكية', 'عدد آياتها 5 آيات', 'ترتيبها في المصحف 105'], art: 'quran' },
      { title: 'معاني الكلمات', bullets: ['كَيْدَهُمْ: مكرهم وخطتهم', 'تَضْلِيلٍ: ضياع وبطلان', 'أَبَابِيلَ: جماعات متتابعة', 'سِجِّيلٍ: طين متحجر'], art: 'book' },
      { title: 'قصة أصحاب الفيل', bullets: ['جاء أبرهة بجيش وفيل ليهدم الكعبة', 'أرسل الله طيراً أبابيل', 'رمتهم بحجارة من سجيل', 'فحمى الله بيته الحرام'], art: 'globe' },
      { title: 'ماذا نتعلم؟', bullets: ['الله يحمي بيته', 'عاقبة الظلم والتكبر وخيمة', 'نثق في قدرة الله'], art: 'heart' }
    ],
    image: { art: 'quran', caption: 'سورة الفيل: لوحة الحفظ' }
  },
  'الجمع بالاحتفاظ': {
    video: { src: 'media/addition-carry.mp4', poster: 'media/add-poster.jpg', duration: 14, title: 'الجمع بالاحتفاظ خطوة بخطوة' },
    slides: [
      { title: 'الجمع بالاحتفاظ', bullets: ['نجمع الآحاد أولاً', 'إذا تجاوز المجموع 9 نحتفظ بالعشرة', 'ثم نجمع العشرات مع ما احتفظنا به'], art: 'numbers' },
      { title: 'مثال: 47 + 38', bullets: ['7 + 8 = 15', 'نكتب 5 ونحتفظ بـ 1', '4 + 3 + 1 = 8', 'النتيجة: 85'], art: 'numbers' },
      { title: 'تدرّب', bullets: ['26 + 17 = ؟', '58 + 35 = ؟', '69 + 24 = ؟'], art: 'idea' }
    ],
    image: { art: 'numbers', caption: 'جدول الآحاد والعشرات' }
  },
  'الخلية وحدة الحياة': {
    video: { src: 'media/cell.mp4', poster: 'media/cell-poster.jpg', duration: 14, title: 'مكونات الخلية' },
    slides: [
      { title: 'الخلية وحدة الحياة', bullets: ['كل الكائنات الحية تتكون من خلايا', 'الخلية أصغر وحدة حية', 'نراها بالمجهر'], art: 'cell' },
      { title: 'مكونات الخلية', bullets: ['الغشاء الهيولي: يحيط بالخلية', 'الهيولى: سائل داخلي', 'النواة: مركز التحكم'], art: 'cell' },
      { title: 'الخلية النباتية والحيوانية', bullets: ['النباتية لها جدار خلوي', 'النباتية بها صانعات خضراء', 'الحيوانية أكثر مرونة'], art: 'plant' }
    ],
    image: { art: 'cell', caption: 'رسم تخطيطي للخلية تحت المجهر' }
  },
  'أحكام الطهارة': {
    slides: [
      { title: 'أحكام الطهارة', bullets: ['الطهارة شرط لصحة الصلاة', 'نوعان: طهارة من الحدث وطهارة من الخبث'], art: 'water' },
      { title: 'أقسام المياه', bullets: ['ماء طهور: طاهر مطهّر', 'ماء طاهر غير مطهّر', 'ماء نجس'], art: 'water' },
      { title: 'فرائض الوضوء', bullets: ['النية', 'غسل الوجه واليدين إلى المرفقين', 'مسح الرأس', 'غسل الرجلين إلى الكعبين', 'الموالاة والدلك'], art: 'water' }
    ],
    pdf: [
      { heading: 'الدرس الأول: أحكام الطهارة', paragraphs: ['الطهارة في اللغة النظافة والنزاهة من الأقذار، وفي الاصطلاح صفة حكمية تبيح للموصوف بها الصلاة.', 'وتنقسم الطهارة إلى قسمين: طهارة من الحدث، وتكون بالوضوء أو الغسل أو التيمم، وطهارة من الخبث، وتكون بإزالة النجاسة عن البدن والثوب والمكان.'] },
      { heading: 'أقسام المياه', paragraphs: ['الماء الطهور هو الباقي على أصل خلقته، كماء المطر والآبار والبحار، ويصح به الوضوء والغسل.', 'الماء الطاهر غير المطهّر هو ما تغيّر أحد أوصافه بشيء طاهر، كالماء المخلوط بالحليب، فلا يُتطهّر به.', 'الماء النجس هو ما تغيّر أحد أوصافه بنجاسة.'] },
      { heading: 'تقويم', paragraphs: ['1. عرّف الطهارة لغة واصطلاحاً.', '2. اذكر أقسام المياه مع مثال لكل قسم.', '3. لماذا كانت الطهارة شرطاً لصحة الصلاة؟'] }
    ],
    image: { art: 'water', caption: 'خريطة ذهنية: أقسام المياه' }
  },
  'الدوال المرجعية': {
    slides: [
      { title: 'الدوال المرجعية', bullets: ['الدالة المربع: x ↦ x²', 'الدالة المكعب: x ↦ x³', 'الدالة مقلوب: x ↦ 1/x', 'الدالة الجذر: x ↦ √x'], art: 'graph' },
      { title: 'اتجاه التغير', bullets: ['x² متناقصة على ]-∞;0] ومتزايدة على [0;+∞[', '1/x متناقصة على كل من مجالي تعريفها', '√x متزايدة على [0;+∞['], art: 'graph' }
    ],
    image: { art: 'graph', caption: 'تمثيل بياني للدالة المربع' }
  }
}

// ——— بنوك أسئلة Quiz ———
const QUIZZES = {
  'سورة الفيل': [
    { q: 'كم عدد آيات سورة الفيل؟', options: ['3', '5', '7'], answer: 1 },
    { q: 'ماذا أرسل الله على أصحاب الفيل؟', options: ['ريحاً شديدة', 'طيراً أبابيل', 'مطراً غزيراً'], answer: 1 },
    { q: 'معنى "سِجِّيل":', options: ['طين متحجر', 'ماء بارد', 'رمل ناعم'], answer: 0 },
    { q: 'سورة الفيل سورة مكية.', options: ['صحيح', 'خطأ'], answer: 0 }
  ],
  'الجمع بالاحتفاظ': [
    { q: '47 + 38 = ؟', options: ['75', '85', '815'], answer: 1 },
    { q: '26 + 17 = ؟', options: ['43', '33', '313'], answer: 0 },
    { q: 'عندما يكون مجموع الآحاد 15 نكتب:', options: ['15', '5 ونحتفظ بـ 1', '1 ونحتفظ بـ 5'], answer: 1 },
    { q: '59 + 31 = ؟', options: ['80', '90', '810'], answer: 1 }
  ],
  'الخلية وحدة الحياة': [
    { q: 'أصغر وحدة حية هي:', options: ['النسيج', 'الخلية', 'العضو'], answer: 1 },
    { q: 'مركز التحكم في الخلية:', options: ['النواة', 'الهيولى', 'الغشاء'], answer: 0 },
    { q: 'الجدار الخلوي يوجد في الخلية:', options: ['الحيوانية', 'النباتية', 'كلتيهما'], answer: 1 }
  ],
  'أحكام الطهارة': [
    { q: 'الماء الباقي على أصل خلقته يسمى:', options: ['طاهراً', 'طهوراً', 'نجساً'], answer: 1 },
    { q: 'من فرائض الوضوء:', options: ['المضمضة', 'النية', 'الاستنشاق'], answer: 1 },
    { q: 'الماء المخلوط بالحليب يصح به الوضوء.', options: ['صحيح', 'خطأ'], answer: 1 },
    { q: 'الطهارة من الخبث تكون بـ:', options: ['الوضوء', 'إزالة النجاسة', 'التيمم'], answer: 1 }
  ],
  'الدوال المرجعية': [
    { q: 'الدالة x ↦ x² على [0;+∞[ هي:', options: ['متزايدة', 'متناقصة', 'ثابتة'], answer: 0 },
    { q: 'مجموعة تعريف x ↦ √x:', options: ['ℝ', '[0;+∞[', ']0;+∞['], answer: 1 },
    { q: 'الدالة مقلوب معرّفة عند 0.', options: ['صحيح', 'خطأ'], answer: 1 }
  ]
}

const GENERIC_QUIZ = (title) => [
  { q: `ما الفكرة الأساسية في درس «${title}»؟`, options: ['ما شرحه المعلم في الحصة', 'موضوع آخر', 'لا أعرف'], answer: 0 },
  { q: 'شاهدتُ محتوى الدرس كاملاً قبل حل هذا التمرين.', options: ['صحيح', 'خطأ'], answer: 0 },
  { q: 'أفضل طريقة للمراجعة:', options: ['المراجعة المنتظمة', 'المراجعة ليلة الاختبار فقط', 'عدم المراجعة'], answer: 0 }
]

// ——— أدوات مساعدة ———
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const daysFromNow = (d, h = 23) => {
  const x = new Date()
  x.setDate(x.getDate() + d)
  x.setHours(h, 59, 0, 0)
  return x.toISOString()
}

function genericSlides(title, art, subjectName) {
  return [
    { title, bullets: [subjectName, 'درس تفاعلي', 'مدة المشاهدة: 5 دقائق'], art },
    { title: 'أهداف الدرس', bullets: ['أفهم المفهوم الأساسي', 'أطبّق على أمثلة', 'أتحقق من فهمي بتمرين قصير'], art: 'idea' },
    { title: 'لنتعلّم', bullets: ['نبدأ بمثال من حياتنا اليومية', 'نستخرج القاعدة معاً', 'نلاحظ الحالات الخاصة'], art },
    { title: 'الخلاصة', bullets: ['راجع النقاط الأساسية', 'حلّ تمارين الدرس', 'اسأل معلمك في الرسائل'], art: 'heart' }
  ]
}

function genericPdf(title, subjectName) {
  return [
    { heading: `${subjectName} — ${title}`, paragraphs: [`يتناول هذا الدرس موضوع «${title}». نقرأ النص بتمعّن ونستخرج الأفكار الأساسية.`, 'نلاحظ الأمثلة المرفقة، ثم نحاول صياغة القاعدة بأسلوبنا.'] },
    { heading: 'أنشطة وتطبيقات', paragraphs: ['النشاط الأول: اقرأ ثم أجب عن الأسئلة.', 'النشاط الثاني: أكمل الجدول بما يناسب.', 'النشاط الثالث: لخّص الدرس في ثلاثة أسطر.'] }
  ]
}

// ——— توليد البيانات ———
export const subjects = []
export const lessons = []
export const contents = []
export const activities = []

const STATUSES = ['approved', 'approved', 'approved', 'approved', 'approved', 'temp', 'pending', 'approved', 'draft', 'rejected']
const MAIN_TYPES = ['video', 'slides', 'video', 'pdf', 'slides']
const EXTRA_TYPES = ['image', 'pdf', 'slides', 'image']

Object.entries(CURRICULUM).forEach(([levelId, list]) => {
  list.forEach(([key, titles], si) => {
    const kind = SUBJECT_KINDS[key]
    const subjectId = `${levelId}-${key}`
    subjects.push({ id: subjectId, levelId, key, name: kind.name, art: kind.art, color: kind.color, accent: kind.accent, order: si })

    titles.forEach((title, li) => {
      const lessonId = `${subjectId}-${li + 1}`
      const f = FEATURED[title]
      lessons.push({ id: lessonId, subjectId, levelId, title, order: li + 1, minutes: 8 + (hash(title) % 12) })

      const author = AUTHORS[hash(lessonId) % AUTHORS.length]
      const baseDate = daysFromNow(-(30 - li * 5 - si), 10)
      const push = (type, classification, payload, extraTitle) => {
        const id = `ct-${lessonId}-${contents.filter((c) => c.lessonId === lessonId).length + 1}`
        // المحتوى الأساسي معتمد دائماً حتى لا يبقى درس فارغاً عند التلميذ
        const status = f || classification === 'main' ? 'approved' : STATUSES[hash(id) % STATUSES.length]
        contents.push({
          id, lessonId, subjectId, levelId, type, classification, status,
          title: extraTitle || title,
          keywords: [kind.name, title, ...title.split(' ').filter((w) => w.length > 3)].slice(0, 5),
          authorId: author.id, authorName: author.name,
          mandatory: classification === 'main',
          createdAt: baseDate,
          rating: 3.5 + (hash(id) % 15) / 10,
          views: 20 + (hash(id) % 300),
          payload
        })
      }

      // المحتوى الرئيسي
      const mainType = f?.video ? 'video' : f?.slides ? 'slides' : MAIN_TYPES[(li + si) % MAIN_TYPES.length]
      const mainPayload = {
        video: f?.video || { duration: 120 + (hash(title) % 240), scenes: genericSlides(title, kind.art, kind.name) },
        slides: { slides: f?.slides || genericSlides(title, kind.art, kind.name) },
        pdf: { pages: f?.pdf || genericPdf(title, kind.name) }
      }[mainType]
      push(mainType, 'main', mainPayload, f?.video?.title)

      // محتوى إضافي
      if (f) {
        if (f.slides && mainType !== 'slides') push('slides', 'main', { slides: f.slides }, `${title} — عرض الدرس`)
        if (f.pdf) push('pdf', 'enrichment', { pages: f.pdf }, `${title} — المذكرة`)
        if (f.image) push('image', 'enrichment', { art: f.image.art, caption: f.image.caption }, f.image.caption)
      } else if ((li + si) % 2 === 0) {
        const et = EXTRA_TYPES[(li + si) % EXTRA_TYPES.length]
        const payload = {
          image: { art: kind.art, caption: `${title}: بطاقة تلخيصية` },
          pdf: { pages: genericPdf(title, kind.name) },
          slides: { slides: genericSlides(title, kind.art, kind.name) }
        }[et]
        push(et, 'enrichment', payload, { image: `${title}: بطاقة تلخيصية`, pdf: `${title} — ورقة عمل`, slides: `${title} — مراجعة` }[et])
      }

      // الأنشطة
      if (QUIZZES[title] || li % 2 === 0) {
        activities.push({
          id: `ac-${lessonId}-q`, lessonId, subjectId, levelId, type: 'quiz',
          title: `اختبار: ${title}`, required: li === 0, mandatory: true,
          authorId: author.id, authorName: author.name,
          status: 'approved', questions: QUIZZES[title] || GENERIC_QUIZ(title),
          due: daysFromNow(li - 1), maxScore: 10
        })
      }
      if (li % 2 === 1 || title === 'الجمع بالاحتفاظ') {
        activities.push({
          id: `ac-${lessonId}-h`, lessonId, subjectId, levelId, type: 'homework',
          title: `واجب: ${title}`, required: true, mandatory: true,
          authorId: author.id, authorName: author.name, status: 'approved',
          instructions: title === 'الجمع بالاحتفاظ'
            ? 'احسب العمليات التالية في كراسك ثم صوّر الصفحة وأرسلها:\n1) 36 + 47\n2) 58 + 25\n3) 69 + 18'
            : `أنجز الأنشطة الموجودة في ورقة العمل الخاصة بدرس «${title}»، ثم اكتب إجابتك أو أرفق صورة لكراسك.`,
          attachments: [{ name: `ورقة عمل - ${title}.pdf`, size: '240 KB' }],
          modelAnswer: title === 'الجمع بالاحتفاظ' ? '1) 83   2) 83   3) 87' : 'تُنشر الإجابة النموذجية بعد التصحيح.',
          due: daysFromNow(li + 1), maxScore: 20
        })
      }
    })
  })
})

export const AUTHORS_LIST = AUTHORS
