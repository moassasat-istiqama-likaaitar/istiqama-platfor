/**
 * قاعدة بيانات تجريبية (Mock Data) — تعيش في الذاكرة فقط.
 *
 * المبدأ الأساسي: شخص واحد = حساب واحد، وله دور أو أكثر.
 *   persons      : الأشخاص (الحسابات) — بيانات الدخول مرة واحدة لكل شخص
 *   assignments  : الأدوار — شخص + دور + مدرسة + (أقسام | أبناء | مستويات)
 *
 * كلمة مرور كل الحسابات التجريبية: 1234
 */

export const ROLES = ['super_admin', 'admin', 'editor', 'school_manager', 'teacher', 'student', 'parent', 'support']

/** المدارس — من شيت «الزيارات التربوية — البيانات» (27 مدرسة). s1–s3 فيها حسابات تجريبية */
export const schools = [
  { id: 's1', slug: 'nour', code: '4', name: 'النور القرآنية - برج البحري', short: 'النور القرآنية', commune: 'برج البحري', gender: 'mixed', status: 'active' },
  { id: 's2', slug: 'furqan', code: '3', name: 'الفرقان القرآنية - القبة', short: 'الفرقان القرآنية', commune: 'القبة', gender: 'mixed', status: 'active' },
  { id: 's3', slug: 'huda', code: '16', name: 'الهدى القرآنية - حي الورود', short: 'الهدى القرآنية', commune: 'حي الورود', gender: 'mixed', status: 'active' },
  { id: 's4', slug: 'm1', code: '1', name: 'الهداية القرآنية - القصبة', short: 'الهداية القرآنية', commune: 'القصبة', gender: 'mixed', status: 'active' },
  { id: 's5', slug: 'm2', code: '2', name: 'الرضوان القرآنية - القليعة', short: 'الرضوان القرآنية', commune: 'القليعة', gender: 'mixed', status: 'active' },
  { id: 's6', slug: 'm5', code: '5', name: 'الإخلاص القرآنية - العالية', short: 'الإخلاص القرآنية', commune: 'العالية', gender: 'mixed', status: 'active' },
  { id: 's7', slug: 'm6', code: '6', name: 'النور القرآنية - سيدي بنور', short: 'النور القرآنية', commune: 'سيدي بنور', gender: 'mixed', status: 'active' },
  { id: 's8', slug: 'm7', code: '7', name: 'السلام القرآنية - برج الكيفان', short: 'السلام القرآنية', commune: 'برج الكيفان', gender: 'mixed', status: 'active' },
  { id: 's9', slug: 'm8', code: '8', name: 'الرشاد القرآنية - الشراقة', short: 'الرشاد القرآنية', commune: 'الشراقة', gender: 'mixed', status: 'active' },
  { id: 's10', slug: 'm9', code: '9', name: 'ابتدائية المنار القرآنية ذكور - الحميز', short: 'ابتدائية المنار القرآنية ذكور', commune: 'الحميز', gender: 'male', status: 'active' },
  { id: 's11', slug: 'm10', code: '10', name: 'ابتدائية المنار القرآنية إناث - الحميز', short: 'ابتدائية المنار القرآنية إناث', commune: 'الحميز', gender: 'female', status: 'active' },
  { id: 's12', slug: 'm11', code: '11', name: 'متوسطة المنار القرآنية ذكور - الحميز', short: 'متوسطة المنار القرآنية ذكور', commune: 'الحميز', gender: 'male', status: 'active' },
  { id: 's13', slug: 'm12', code: '12', name: 'متوسطة المنار القرآنية إناث - الحميز', short: 'متوسطة المنار القرآنية إناث', commune: 'الحميز', gender: 'female', status: 'active' },
  { id: 's14', slug: 'm13', code: '13', name: 'الإيمان القرآنية - براقي', short: 'الإيمان القرآنية', commune: 'براقي', gender: 'mixed', status: 'active' },
  { id: 's15', slug: 'm14', code: '14', name: 'البدر القرآنية - بودواو', short: 'البدر القرآنية', commune: 'بودواو', gender: 'mixed', status: 'active' },
  { id: 's16', slug: 'm15', code: '15', name: 'دار السلام القرآنية - علي صادق', short: 'دار السلام القرآنية', commune: 'علي صادق', gender: 'mixed', status: 'active' },
  { id: 's17', slug: 'm17', code: '17', name: 'الإحسان القرآنية - بوفاريك', short: 'الإحسان القرآنية', commune: 'بوفاريك', gender: 'mixed', status: 'active' },
  { id: 's18', slug: 'm18', code: '18', name: 'الحمد القرآنية - حمادي', short: 'الحمد القرآنية', commune: 'حمادي', gender: 'mixed', status: 'active' },
  { id: 's19', slug: 'm19', code: '19', name: 'الفلاح القرآنية ذكور - الحميز', short: 'الفلاح القرآنية ذكور', commune: 'الحميز', gender: 'male', status: 'active' },
  { id: 's20', slug: 'm20', code: '20', name: 'الفلاح القرآنية إناث - الحميز', short: 'الفلاح القرآنية إناث', commune: 'الحميز', gender: 'female', status: 'active' },
  { id: 's21', slug: 'm21', code: '21', name: 'قباء القرآنية - الدار البيضاء', short: 'قباء القرآنية', commune: 'الدار البيضاء', gender: 'mixed', status: 'active' },
  { id: 's22', slug: 'm22', code: '22', name: 'الريان القرآنية - حمادي', short: 'الريان القرآنية', commune: 'حمادي', gender: 'mixed', status: 'active' },
  { id: 's23', slug: 'm23', code: '23', name: 'الرضوان القرآنية - بئر خادم', short: 'الرضوان القرآنية', commune: 'بئر خادم', gender: 'mixed', status: 'active' },
  { id: 's24', slug: 'm24', code: '24', name: 'نور السلام القرآنية - خميس الخشنة', short: 'نور السلام القرآنية', commune: 'خميس الخشنة', gender: 'mixed', status: 'active' },
  { id: 's25', slug: 'm25', code: '25', name: 'الرحمن القرآنية - حي اسطنبول', short: 'الرحمن القرآنية', commune: 'حي اسطنبول', gender: 'mixed', status: 'active' },
  { id: 's26', slug: 'm26', code: '26', name: 'الفردوس القرآنية - الدار البيضاء', short: 'الفردوس القرآنية', commune: 'الدار البيضاء', gender: 'mixed', status: 'active' },
  { id: 's27', slug: 'm27', code: '27', name: 'دار السلام القرآنية فرع التقوى - بن رضوان', short: 'دار السلام القرآنية فرع التقوى', commune: 'بن رضوان', gender: 'mixed', status: 'active' }
]

/**
 * هوية كل مدرسة المعتمدة (يعدّلها مدير المدرسة ويعتمدها المدير العام — انظر api/branding.js)
 *  logo: صورة (dataURL/رابط) أو null فيُرسم حرف أول المدرسة
 *  primary / secondary: لونا المدرسة — يُستعملان في مساحات محددة فقط ولا يغيّران ثيم الطور
 *  cover: 'pattern:<name>' (زخرفة جاهزة بألوان المدرسة) أو صورة مرفوعة
 */
export const schoolBranding = {
  s1: { logo: null, primary: '#0f7b5a', secondary: '#e8b54a', cover: 'pattern:arches', welcome: 'أهلاً بكم في مدرسة النور القرآنية… نتعلّم لنرتقي.' },
  s2: { logo: null, primary: '#8e2445', secondary: '#f0a35e', cover: 'pattern:waves', welcome: 'مدرسة الفرقان ترحّب بأبنائها.' },
  s3: { logo: null, primary: '#1f5f8b', secondary: '#f2cf5b', cover: 'pattern:stars', welcome: 'مدرسة الهدى القرآنية: علمٌ وخُلق.' }
}
// بقية المدارس: هوية افتراضية إلى أن يخصصها مديروها
const DEFAULT_PAIRS = [['#14213d', '#fca311'], ['#1b4332', '#95d5b2'], ['#6d2c91', '#f7b538'], ['#005f73', '#ee9b00'], ['#7f4f24', '#ddb892'], ['#8e2445', '#f0a35e']]
const COVERS = ['arches', 'waves', 'stars', 'dunes']
schools.forEach((sc, i) => {
  if (schoolBranding[sc.id]) return
  const [primary, secondary] = DEFAULT_PAIRS[i % DEFAULT_PAIRS.length]
  schoolBranding[sc.id] = { logo: null, primary, secondary, cover: 'pattern:' + COVERS[i % 4], welcome: `مرحباً بكم في ${sc.short}.` }
})

// الأطوار: primary | middle | secondary — والترتيب order يحدد ثيم التلميذ (انظر config/theme.js)
export const levels = [
  { id: 'P1', name: 'الأولى ابتدائي', phase: 'primary', order: 1 },
  { id: 'P2', name: 'الثانية ابتدائي', phase: 'primary', order: 2 },
  { id: 'P3', name: 'الثالثة ابتدائي', phase: 'primary', order: 3 },
  { id: 'P4', name: 'الرابعة ابتدائي', phase: 'primary', order: 4 },
  { id: 'P5', name: 'الخامسة ابتدائي', phase: 'primary', order: 5 },
  { id: 'M1', name: 'الأولى متوسط', phase: 'middle', order: 6 },
  { id: 'M2', name: 'الثانية متوسط', phase: 'middle', order: 7 },
  { id: 'M3', name: 'الثالثة متوسط', phase: 'middle', order: 8 },
  { id: 'M4', name: 'الرابعة متوسط', phase: 'middle', order: 9 },
  { id: 'S1', name: 'الأولى ثانوي', phase: 'secondary', order: 10 },
  { id: 'S2', name: 'الثانية ثانوي', phase: 'secondary', order: 11 },
  { id: 'S3', name: 'الثالثة ثانوي', phase: 'secondary', order: 12 }
]

export const seasons = [{ id: 'y2026', name: '2026 / 2027', start: '2026-09-13', end: '2027-06-30', status: 'active' }]

export const classes = [
  { id: 'c1', name: 'الثالثة ابتدائي أ', levelId: 'P3', schoolId: 's1', gender: 'mixed', seasonId: 'y2026' },
  { id: 'c2', name: 'الرابعة متوسط - إناث', levelId: 'M4', schoolId: 's2', gender: 'female', seasonId: 'y2026' },
  { id: 'c3', name: 'الثانية ثانوي - ذكور', levelId: 'S2', schoolId: 's1', gender: 'male', seasonId: 'y2026' },
  { id: 'c4', name: 'الأولى ابتدائي ب', levelId: 'P1', schoolId: 's2', gender: 'mixed', seasonId: 'y2026' },
  { id: 'c5', name: 'الأولى متوسط أ', levelId: 'M1', schoolId: 's2', gender: 'mixed', seasonId: 'y2026' }
]

export const persons = [
  { id: 'p1', username: 'admin', email: 'admin@istiqama.dz', password: '1234', lastName: 'بكير', firstName: 'عبد الرحمن', gender: 'male', phone: '0550 00 00 01', status: 'active' },
  { id: 'p2', username: 'supervisor', email: 'supervisor@istiqama.dz', password: '1234', lastName: 'حمودة', firstName: 'إبراهيم', gender: 'male', phone: '0550 00 00 02', status: 'active' },
  { id: 'p3', username: 'editor', email: 'editor@istiqama.dz', password: '1234', lastName: 'حاج سعيد', firstName: 'يوسف', gender: 'male', phone: '0550 00 00 03', status: 'active' },
  { id: 'p4', username: 'manager', email: 'manager@istiqama.dz', password: '1234', lastName: 'بن عيسى', firstName: 'محمد', gender: 'male', phone: '0550 00 00 04', status: 'active' },
  { id: 'p5', username: 'teacher', email: 'teacher@istiqama.dz', password: '1234', lastName: 'باعمر', firstName: 'عمر', gender: 'male', phone: '0550 00 00 05', status: 'active' },
  { id: 'p6', username: 'aicha', email: 'aicha@istiqama.dz', password: '1234', lastName: 'الشيخ', firstName: 'عائشة', gender: 'female', phone: '0550 00 00 06', status: 'active' },
  { id: 'p7', username: 'anas', email: '', password: '1234', lastName: 'بلحاج', firstName: 'أنس', gender: 'male', birthDate: '2018-03-11', status: 'active' },
  { id: 'p8', username: 'maryam', email: '', password: '1234', lastName: 'بلحاج', firstName: 'مريم', gender: 'female', birthDate: '2012-07-02', status: 'active' },
  { id: 'p9', username: 'ishaq', email: '', password: '1234', lastName: 'بن عيسى', firstName: 'إسحاق', gender: 'male', birthDate: '2009-01-20', status: 'active' },
  { id: 'p10', username: 'salma', email: '', password: '1234', lastName: 'باعمر', firstName: 'سلمى', gender: 'female', birthDate: '2020-05-14', status: 'active' },
  { id: 'p11', username: 'khadija', email: 'khadija@mail.dz', password: '1234', lastName: 'بلحاج', firstName: 'خديجة', gender: 'female', phone: '0660 11 22 33', status: 'active' },
  { id: 'p13', username: 'yahya', email: '', password: '1234', lastName: 'بلحاج', firstName: 'يحيى', gender: 'male', birthDate: '2014-09-30', status: 'active' },
  { id: 'p12', username: 'support', email: 'support@istiqama.dz', password: '1234', lastName: 'أولاد سعيد', firstName: 'سليمان', gender: 'male', phone: '0550 00 00 12', status: 'active' }
]

/**
 * الأدوار. لاحظ الحالات المتعددة:
 *  - p4 مدير مدرسة النور (برج البحري) + ولي إسحاق
 *  - p5 معلم في مدرستين (النور والفرقان) + ولي سلمى
 *  - p11 ولية لثلاثة أبناء في مدرستين (وكل ابن بثيم مختلف حسب طوره)
 */
export const assignments = [
  { id: 'a1', personId: 'p1', role: 'super_admin', schoolId: null },
  { id: 'a2', personId: 'p2', role: 'admin', schoolId: null },
  { id: 'a3', personId: 'p3', role: 'editor', schoolId: null, subjects: ['الفقه', 'التربية الإيمانية'], levelIds: ['M1', 'M4', 'S2'] },
  { id: 'a4', personId: 'p4', role: 'school_manager', schoolId: 's1' },
  { id: 'a5', personId: 'p4', role: 'parent', schoolId: null, childIds: ['p9'] },
  { id: 'a6', personId: 'p5', role: 'teacher', schoolId: 's1', classIds: ['c1', 'c3'], subjects: ['التربية الإيمانية', 'الفقه'] },
  { id: 'a7', personId: 'p5', role: 'teacher', schoolId: 's2', classIds: ['c2'], subjects: ['الفقه'] },
  { id: 'a8', personId: 'p5', role: 'parent', schoolId: null, childIds: ['p10'] },
  { id: 'a9', personId: 'p6', role: 'teacher', schoolId: 's2', classIds: ['c2', 'c4', 'c5'], subjects: ['اللغة العربية'] },
  { id: 'a10', personId: 'p7', role: 'student', schoolId: 's1', classId: 'c1' },
  { id: 'a11', personId: 'p8', role: 'student', schoolId: 's2', classId: 'c2' },
  { id: 'a12', personId: 'p9', role: 'student', schoolId: 's1', classId: 'c3' },
  { id: 'a13', personId: 'p10', role: 'student', schoolId: 's2', classId: 'c4' },
  { id: 'a14', personId: 'p11', role: 'parent', schoolId: null, childIds: ['p7', 'p13', 'p8'] },
  { id: 'a16', personId: 'p13', role: 'student', schoolId: 's2', classId: 'c5' },
  { id: 'a15', personId: 'p12', role: 'support', schoolId: null }
]

const now = Date.now()
const ago = (min) => new Date(now - min * 60000).toISOString()

/** الإشعارات: مرتبطة بالشخص، وموسومة بالدور (assignmentId) الذي يخصها */
export const notifications = [
  { id: 'n1', personId: 'p7', assignmentId: 'a10', type: 'lesson', title: 'درس جديد في التربية الإيمانية', body: 'من وصايا لقمان الحكيم', read: false, at: ago(12) },
  { id: 'n2', personId: 'p7', assignmentId: 'a10', type: 'assignment', title: 'واجب جديد', body: 'اللغة العربية: التاء المربوطة', read: false, at: ago(90) },
  { id: 'n3', personId: 'p7', assignmentId: 'a10', type: 'result', title: 'نتيجة تقييم', body: 'حصلت على 9/10 في تقييم الإملاء', read: true, at: ago(60 * 26) },
  { id: 'n5', personId: 'p5', assignmentId: 'a6', type: 'submission', title: 'تسليم جديد', body: 'أنس بلحاج سلّم واجب التربية الإيمانية', read: false, at: ago(25) },
  { id: 'n6', personId: 'p5', assignmentId: 'a7', type: 'comment', title: 'تعليق جديد', body: 'المحرر علّق على ملف "أحكام الطهارة"', read: false, at: ago(140) },
  { id: 'n7', personId: 'p5', assignmentId: 'a8', type: 'assignment', title: 'واجب جديد لسلمى', body: 'تلوين الحروف الهجائية', read: false, at: ago(200) },
  { id: 'n9', personId: 'p4', assignmentId: 'a4', type: 'content', title: 'محتوى ينتظر المصادقة', body: '3 ملفات جديدة من معلمي مدرستك', read: false, at: ago(45) },
  { id: 'n10', personId: 'p4', assignmentId: 'a5', type: 'result', title: 'نتيجة لإسحاق', body: 'علامة واجب الفقه: 16/20', read: false, at: ago(300) },
  { id: 'n11', personId: 'p11', assignmentId: 'a14', type: 'lesson', title: 'درس جديد لأنس', body: 'من وصايا لقمان الحكيم', read: false, at: ago(12) },
  { id: 'n12', personId: 'p11', assignmentId: 'a14', type: 'result', title: 'نتيجة لمريم', body: 'تقييم الفقه: 8/10', read: false, at: ago(180) },
  { id: 'n13', personId: 'p3', assignmentId: 'a3', type: 'content', title: 'ملف ينتظر المراجعة', body: 'أحكام الطهارة — الرابعة متوسط', read: false, at: ago(140) },
  { id: 'n14', personId: 'p1', assignmentId: 'a1', type: 'report', title: 'بلاغ جديد', body: 'عطل في تشغيل الفيديو', read: false, at: ago(35) },
  { id: 'n15', personId: 'p12', assignmentId: 'a15', type: 'report', title: 'بلاغ جديد', body: 'عطل في تشغيل الفيديو', read: false, at: ago(35) },
  { id: 'n16', personId: 'p8', assignmentId: 'a11', type: 'assignment', title: 'تقييم جديد', body: 'الفقه: أحكام الطهارة', read: false, at: ago(70) },
  { id: 'n17', personId: 'p9', assignmentId: 'a12', type: 'message', title: 'رسالة من المعلم عمر', body: 'أحسنت في العرض الأخير', read: false, at: ago(400) },
  { id: 'n18', personId: 'p6', assignmentId: 'a9', type: 'submission', title: 'تسليم جديد', body: 'مريم بلحاج سلّمت التعبير الكتابي', read: false, at: ago(55) },
  { id: 'n19', personId: 'p2', assignmentId: 'a2', type: 'report', title: 'مقترح جديد', body: 'إضافة وضع ليلي للمنصة', read: false, at: ago(500) }
]

/** المحادثات: المشاركون أشخاص، وكل طرف يشارك بدور محدد */
export const conversations = [
  {
    id: 'cv0',
    seasonId: 'y2025',
    participants: [{ personId: 'p5', assignmentId: 'a6' }, { personId: 'p11', assignmentId: 'a14' }],
    subject: 'نتائج السداسي الثاني (الموسم الماضي)',
    messages: [
      { id: 'm0a', from: 'p11', body: 'السلام عليكم، شكراً على متابعتكم لأنس هذا الموسم.', at: ago(60 * 24 * 160), readBy: ['p11', 'p5'] },
      { id: 'm0b', from: 'p5', body: 'وعليكم السلام، بارك الله فيه، نتائجه ممتازة.', at: ago(60 * 24 * 159), readBy: ['p11', 'p5'] }
    ]
  },
  {
    id: 'cv1',
    participants: [{ personId: 'p5', assignmentId: 'a6' }, { personId: 'p11', assignmentId: 'a14' }],
    subject: 'متابعة أنس',
    messages: [
      { id: 'm1', from: 'p11', body: 'السلام عليكم يا معلم، كيف مستوى أنس في الدروس؟', at: ago(60 * 20) },
      { id: 'm2', from: 'p5', body: 'وعليكم السلام، أنس مجتهد ما شاء الله، يحتاج فقط إلى مراجعة درس التاء المربوطة.', at: ago(60 * 19) },
      { id: 'm3', from: 'p11', body: 'جزاكم الله خيراً، سنراجعها معه في البيت.', at: ago(60 * 18) }
    ]
  },
  {
    id: 'cv2',
    participants: [{ personId: 'p5', assignmentId: 'a6' }, { personId: 'p9', assignmentId: 'a12' }],
    subject: 'العرض الأخير',
    messages: [
      { id: 'm4', from: 'p9', body: 'يا معلم، هل يمكنني إعادة رفع العرض بعد التصحيح؟', at: ago(500) },
      { id: 'm5', from: 'p5', body: 'أحسنت في العرض الأخير، نعم يمكنك ذلك قبل الخميس.', at: ago(400) }
    ]
  },
  {
    id: 'cv3',
    participants: [{ personId: 'p4', assignmentId: 'a4' }, { personId: 'p5', assignmentId: 'a6' }],
    subject: 'ملفات الفقه',
    messages: [{ id: 'm6', from: 'p4', body: 'المعلم عمر، رفعتَ ملفين للفقه؛ سأصادق عليهما اليوم إن شاء الله.', at: ago(90) }]
  },
  {
    id: 'cv4',
    participants: [{ personId: 'p6', assignmentId: 'a9' }, { personId: 'p8', assignmentId: 'a11' }],
    subject: 'التعبير الكتابي',
    messages: [{ id: 'm7', from: 'p8', body: 'يا معلمة، أرسلت التعبير الكتابي، هل وصلك؟', at: ago(56) }]
  }
]

/** البلاغات والمقترحات */
export const reports = [
  { id: 'r1', personId: 'p7', assignmentId: 'a10', type: 'technical', title: 'الفيديو لا يعمل', description: 'فيديو درس سورة الفيل يتوقف بعد دقيقة.', status: 'in_progress', at: ago(35) },
  { id: 'r2', personId: 'p5', assignmentId: 'a6', type: 'suggestion', title: 'وضع ليلي', description: 'نقترح إضافة وضع ليلي للمنصة.', status: 'new', at: ago(500) },
  { id: 'r3', personId: 'p11', assignmentId: 'a14', type: 'content', title: 'خطأ في تمرين', description: 'في تمرين الحساب الثالث الإجابة النموذجية غير صحيحة.', status: 'done', at: ago(60 * 72) }
]

export const announcements = [
  { id: 'an1', title: 'انطلاق الموسم الدراسي', body: 'نرحب بجميع التلاميذ والأولياء في الموسم الجديد.', audience: 'all', at: ago(60 * 24 * 60) }
]
