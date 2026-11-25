/**
 * قاعدة بيانات تجريبية (Mock Data) — تعيش في الذاكرة فقط.
 *
 * المبدأ الأساسي: شخص واحد = حساب واحد، وله صفة أو أكثر.
 *   persons      : الأشخاص (الحسابات) — بيانات الدخول مرة واحدة لكل شخص
 *   assignments  : الصفات — شخص + دور + مدرسة + (أقسام | أبناء | مستويات)
 *
 * كلمة مرور كل الحسابات التجريبية: 1234
 */

export const ROLES = ['super_admin', 'admin', 'editor', 'school_manager', 'teacher', 'student', 'parent', 'support']

export const schools = [
  { id: 's1', name: 'مدرسة النور', wilaya: 'غرداية', commune: 'غرداية', code: 'IST-001', status: 'active' },
  { id: 's2', name: 'مدرسة الفتح', wilaya: 'غرداية', commune: 'بريان', code: 'IST-002', status: 'active' },
  { id: 's3', name: 'مدرسة الهدى', wilaya: 'الجزائر', commune: 'باب الزوار', code: 'IST-003', status: 'active' }
]

// الأطوار: primary | middle | secondary  (تحدد ثيم التلميذ)
export const levels = [
  { id: 'P1', name: 'الأولى ابتدائي', phase: 'primary', order: 1 },
  { id: 'P3', name: 'الثالثة ابتدائي', phase: 'primary', order: 3 },
  { id: 'P5', name: 'الخامسة ابتدائي', phase: 'primary', order: 5 },
  { id: 'M1', name: 'الأولى متوسط', phase: 'middle', order: 6 },
  { id: 'M4', name: 'الرابعة متوسط', phase: 'middle', order: 9 },
  { id: 'S2', name: 'الثانية ثانوي', phase: 'secondary', order: 11 }
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
  { id: 'p12', username: 'support', email: 'support@istiqama.dz', password: '1234', lastName: 'أولاد سعيد', firstName: 'سليمان', gender: 'male', phone: '0550 00 00 12', status: 'active' }
]

/**
 * الصفات. لاحظ الحالات المتعددة:
 *  - p4 مدير مدرسة النور + ولي إسحاق
 *  - p5 معلم في مدرستين (النور والفتح) + ولي سلمى
 *  - p11 ولية لابنين في مدرستين مختلفتين
 */
export const assignments = [
  { id: 'a1', personId: 'p1', role: 'super_admin', schoolId: null },
  { id: 'a2', personId: 'p2', role: 'admin', schoolId: null },
  { id: 'a3', personId: 'p3', role: 'editor', schoolId: null, subjects: ['الفقه', 'العقيدة'], levelIds: ['M1', 'M4', 'S2'] },
  { id: 'a4', personId: 'p4', role: 'school_manager', schoolId: 's1' },
  { id: 'a5', personId: 'p4', role: 'parent', schoolId: null, childIds: ['p9'] },
  { id: 'a6', personId: 'p5', role: 'teacher', schoolId: 's1', classIds: ['c1', 'c3'], subjects: ['القرآن الكريم', 'الفقه'] },
  { id: 'a7', personId: 'p5', role: 'teacher', schoolId: 's2', classIds: ['c2'], subjects: ['الفقه'] },
  { id: 'a8', personId: 'p5', role: 'parent', schoolId: null, childIds: ['p10'] },
  { id: 'a9', personId: 'p6', role: 'teacher', schoolId: 's2', classIds: ['c2', 'c4', 'c5'], subjects: ['اللغة العربية'] },
  { id: 'a10', personId: 'p7', role: 'student', schoolId: 's1', classId: 'c1' },
  { id: 'a11', personId: 'p8', role: 'student', schoolId: 's2', classId: 'c2' },
  { id: 'a12', personId: 'p9', role: 'student', schoolId: 's1', classId: 'c3' },
  { id: 'a13', personId: 'p10', role: 'student', schoolId: 's2', classId: 'c4' },
  { id: 'a14', personId: 'p11', role: 'parent', schoolId: null, childIds: ['p7', 'p8'] },
  { id: 'a15', personId: 'p12', role: 'support', schoolId: null }
]

const now = Date.now()
const ago = (min) => new Date(now - min * 60000).toISOString()

/** الإشعارات: مرتبطة بالشخص، وموسومة بالصفة (assignmentId) التي تخصها */
export const notifications = [
  { id: 'n1', personId: 'p7', assignmentId: 'a10', type: 'lesson', title: 'درس جديد في القرآن الكريم', body: 'سورة الفيل — الحفظ والتجويد', read: false, at: ago(12) },
  { id: 'n2', personId: 'p7', assignmentId: 'a10', type: 'assignment', title: 'واجب جديد', body: 'تمرين في الحساب: الجمع بالاحتفاظ', read: false, at: ago(90) },
  { id: 'n3', personId: 'p7', assignmentId: 'a10', type: 'result', title: 'نتيجة اختبار', body: 'حصلت على 9/10 في اختبار الإملاء', read: true, at: ago(60 * 26) },
  { id: 'n4', personId: 'p7', assignmentId: null, type: 'announcement', title: 'إعلان عام', body: 'عطلة الشتاء تبدأ يوم الخميس 18 ديسمبر', read: true, at: ago(60 * 50) },
  { id: 'n5', personId: 'p5', assignmentId: 'a6', type: 'submission', title: 'تسليم جديد', body: 'أنس بلحاج سلّم واجب الحفظ', read: false, at: ago(25) },
  { id: 'n6', personId: 'p5', assignmentId: 'a7', type: 'comment', title: 'تعليق جديد', body: 'المحرر علّق على ملف "أحكام الطهارة"', read: false, at: ago(140) },
  { id: 'n7', personId: 'p5', assignmentId: 'a8', type: 'assignment', title: 'واجب جديد لسلمى', body: 'تلوين الحروف الهجائية', read: false, at: ago(200) },
  { id: 'n8', personId: 'p5', assignmentId: null, type: 'announcement', title: 'إعلان عام', body: 'اجتماع المعلمين يوم السبت', read: true, at: ago(60 * 30) },
  { id: 'n9', personId: 'p4', assignmentId: 'a4', type: 'content', title: 'محتوى ينتظر المصادقة', body: '3 ملفات جديدة من معلمي مدرسة النور', read: false, at: ago(45) },
  { id: 'n10', personId: 'p4', assignmentId: 'a5', type: 'result', title: 'نتيجة لإسحاق', body: 'علامة واجب الفقه: 16/20', read: false, at: ago(300) },
  { id: 'n11', personId: 'p11', assignmentId: 'a14', type: 'lesson', title: 'درس جديد لأنس', body: 'سورة الفيل', read: false, at: ago(12) },
  { id: 'n12', personId: 'p11', assignmentId: 'a14', type: 'result', title: 'نتيجة لمريم', body: 'Quiz الفقه: 8/10', read: false, at: ago(180) },
  { id: 'n13', personId: 'p3', assignmentId: 'a3', type: 'content', title: 'ملف ينتظر المراجعة', body: 'أحكام الطهارة — الرابعة متوسط', read: false, at: ago(140) },
  { id: 'n14', personId: 'p1', assignmentId: 'a1', type: 'report', title: 'بلاغ جديد', body: 'عطل في تشغيل الفيديو', read: false, at: ago(35) },
  { id: 'n15', personId: 'p12', assignmentId: 'a15', type: 'report', title: 'بلاغ جديد', body: 'عطل في تشغيل الفيديو', read: false, at: ago(35) },
  { id: 'n16', personId: 'p8', assignmentId: 'a11', type: 'assignment', title: 'Quiz جديد', body: 'الفقه: أحكام الطهارة', read: false, at: ago(70) },
  { id: 'n17', personId: 'p9', assignmentId: 'a12', type: 'message', title: 'رسالة من الأستاذ عمر', body: 'أحسنت في العرض الأخير', read: false, at: ago(400) },
  { id: 'n18', personId: 'p6', assignmentId: 'a9', type: 'submission', title: 'تسليم جديد', body: 'مريم بلحاج سلّمت التعبير الكتابي', read: false, at: ago(55) },
  { id: 'n19', personId: 'p2', assignmentId: 'a2', type: 'report', title: 'مقترح جديد', body: 'إضافة وضع ليلي للمنصة', read: false, at: ago(500) }
]

/** المحادثات: المشاركون أشخاص، وكل طرف يشارك بصفة محددة */
export const conversations = [
  {
    id: 'cv1',
    participants: [{ personId: 'p5', assignmentId: 'a6' }, { personId: 'p11', assignmentId: 'a14' }],
    subject: 'متابعة أنس',
    messages: [
      { id: 'm1', from: 'p11', body: 'السلام عليكم أستاذ، كيف مستوى أنس في الحفظ؟', at: ago(60 * 20) },
      { id: 'm2', from: 'p5', body: 'وعليكم السلام، أنس مجتهد ما شاء الله، يحتاج فقط إلى مراجعة سورة قريش.', at: ago(60 * 19) },
      { id: 'm3', from: 'p11', body: 'جزاكم الله خيراً، سنراجعها معه في البيت.', at: ago(60 * 18) }
    ]
  },
  {
    id: 'cv2',
    participants: [{ personId: 'p5', assignmentId: 'a6' }, { personId: 'p9', assignmentId: 'a12' }],
    subject: 'العرض الأخير',
    messages: [
      { id: 'm4', from: 'p9', body: 'أستاذ، هل يمكنني إعادة رفع العرض بعد التصحيح؟', at: ago(500) },
      { id: 'm5', from: 'p5', body: 'أحسنت في العرض الأخير، نعم يمكنك ذلك قبل الخميس.', at: ago(400) }
    ]
  },
  {
    id: 'cv3',
    participants: [{ personId: 'p4', assignmentId: 'a4' }, { personId: 'p5', assignmentId: 'a6' }],
    subject: 'ملفات الفقه',
    messages: [{ id: 'm6', from: 'p4', body: 'أستاذ عمر، رفعتَ ملفين للفقه؛ سأصادق عليهما اليوم إن شاء الله.', at: ago(90) }]
  },
  {
    id: 'cv4',
    participants: [{ personId: 'p6', assignmentId: 'a9' }, { personId: 'p8', assignmentId: 'a11' }],
    subject: 'التعبير الكتابي',
    messages: [{ id: 'm7', from: 'p8', body: 'أستاذة، أرسلت التعبير الكتابي، هل وصلك؟', at: ago(56) }]
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
