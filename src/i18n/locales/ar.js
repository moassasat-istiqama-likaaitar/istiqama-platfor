export default {
  app: { name: 'منصة الاستقامة الرقمية', short: 'الاستقامة', tagline: 'منصة تعليمية موحّدة تجمع بين التعليم الحضوري والتعلم عن بعد' },
  common: {
    save: 'حفظ', cancel: 'إلغاء', send: 'إرسال', search: 'بحث', back: 'رجوع', close: 'إغلاق', all: 'الكل',
    unread: 'غير مقروء', loading: 'جاري التحميل...', required: 'هذا الحقل مطلوب', saved: 'تم الحفظ',
    comingSoon: 'متاح بعد الربط بالخلفية', yes: 'نعم', no: 'لا', open: 'فتح', new: 'جديد', details: 'التفاصيل'
  },
  roles: {
    super_admin: 'المدير العام', admin: 'المشرف العام', editor: 'المحرر', school_manager: 'مدير المدرسة',
    teacher: 'معلم', student: 'تلميذ', parent: 'ولي', support: 'الدعم الفني'
  },
  themes: { staff: 'الطاقم', kids: 'البراعم', juniors: 'المستكشفون', teens: 'الشباب' },
  menu: {
    teaching: 'أقسامي', 'my-library': 'مكتبة القسم',
    home: 'الرئيسية', users: 'المستخدمون', 'users-list': 'قائمة المستخدمين', 'users-import': 'الاستيراد الجماعي',
    'users-duplicates': 'الحسابات المكررة', 'activity-log': 'سجل العمليات', 'reports-contributors': 'المساهمون في المكتبة', 'reports-ratings': 'تقديرات المحتوى', 'reports-activity': 'نشاط التلاميذ', 'reports-teachers': 'نشاط المعلمين', notices: 'الإعلانات', library: 'المكتبة', content: 'المحتوى', review: 'المراجعة والمصادقة', banks: 'بنوك التقييم', production: 'إنتاجي',
    'library-manage': 'المكتبة المركزية', 'lesson-opening': 'فتح الدروس', 'activities-review': 'مراجعة الواجبات والتقييمات', 'library-review': 'مراجعة المحتوى', activities: 'بنك الواجبات والتقييمات',
    'activities-group': 'الواجبات والتقييمات', reports: 'التقارير', 'reports-general': 'تقارير عامة',
    'reports-schools': 'أداء المدارس', 'reports-files': 'إحصائيات المحتوى', 'reports-engagement': 'جودة التفاعل',
    settings: 'الإعدادات العامة', schools: 'المدارس', levels: 'الأطوار والمستويات', seasons: 'المواسم الدراسية',
    'classes-all': 'الأقسام', subjects: 'المواد والدروس', permissions: 'الأدوار والصلاحيات',
    customization: 'تخصيص المنصة', announcements: 'الإعلانات', calendar: 'الرزنامة', communication: 'إعدادات التواصل',
    'import-export': 'الاستيراد والتصدير', tickets: 'البلاغات', 'quiz-builder': 'منشئ التقييمات',
    'editor-reports': 'التقارير', teachers: 'المعلمون', students: 'التلاميذ', parents: 'الأولياء',
    activation: 'تفعيل الحسابات', 'login-sheets': 'أوراق الدخول', 'school-classes': 'الأقسام', 'teacher-files-review': 'مصادقة محتوى المعلمين',
    'content-follow': 'متابعة المحتوى والواجبات والتقييمات', performance: 'تقارير الأداء', 'school-notice': 'إعلانات المدرسة', 'school-identity': 'هوية المدرسة', 'branding-requests': 'اعتماد هويات المدارس',
    'my-classes': 'أقسامي', 'class-library': 'مكتبة القسم', submissions: 'التسليمات والتصحيح',
    'central-library': 'المكتبة المركزية', 'upload-content': 'رفع محتوى', 'new-homework': 'واجب منزلي جديد',
    'my-files': 'محتواي وواجباتي وتقييماتي', 'offline-tests': 'بنك الاختبارات الحضورية', 'my-lessons': 'دروسي',
    'my-assignments': 'واجباتي وتقييماتي', 'my-progress': 'تقدمي', children: 'الأبناء',
    'child-report': 'تقارير الأبناء', incidents: 'سجل الأعطال', 'support-team': 'فريق الدعم',
    feedback: 'البلاغات والمقترحات', profile: 'الملف الشخصي', notifications: 'الإشعارات', messages: 'الرسائل'
  },
  layout: {
    switchRole: 'تبديل الدور', currentRole: 'الدور الحالي', myRoles: 'أدواري', profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج', language: 'اللغة', openMenu: 'القائمة', demoMode: 'نموذج تجريبي',
    allSchools: 'كل المدارس', viewAll: 'عرض الكل', allNotices: 'كل الإعلانات', noNotifications: 'لا توجد إشعارات'
  },
  auth: {
    welcome: 'مرحباً بكم', loginTitle: 'تسجيل الدخول', loginHint: 'ادخل بحسابك للوصول إلى فضائك',
    login: 'اسم المستخدم أو البريد الإلكتروني', password: 'كلمة المرور', remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟', submit: 'دخول', or: 'أو', google: 'الدخول بحساب Google',
    demoTitle: 'حسابات العرض', demoHint: 'اضغط على أي حساب للدخول مباشرة (كلمة المرور: 1234)',
    forgotTitle: 'استرجاع كلمة المرور', forgotHint: 'أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل لك رابط إعادة التعيين',
    contact: 'البريد الإلكتروني أو رقم الهاتف', sendLink: 'إرسال الرابط', sent: 'تم الإرسال',
    sentHint: 'إن كان الحساب موجوداً فستصلك رسالة خلال دقائق.', backToLogin: 'العودة لتسجيل الدخول',
    chooseTitle: 'اختر دورك', chooseHint: 'لديك أكثر من دور في المنصة. بأي دور تريد الدخول؟',
    hello: 'أهلاً {name}', switchLater: 'يمكنك التبديل بين أدوارك في أي وقت من أعلى الصفحة.'
  },
  assignment: {
    classes: 'الأقسام: {list}', class: 'القسم: {name}', children: 'الأبناء: {list}', subjects: 'المواد: {list}',
    allPlatform: 'كل المدارس', levels: 'المستويات: {list}'
  },
  home: {
    greeting: 'السلام عليكم، {name}', as: 'دورك الآن: {role}', quickAccess: 'الوصول السريع',
    phaseNote: 'لوحة هذا الدور تُبنى في المرحلة {phase}. هذه نسخة مبدئية للتنقل.'
  },
  profile: {
    title: 'الملف الشخصي', personal: 'البيانات الشخصية', lastName: 'اللقب', firstName: 'الاسم',
    email: 'البريد الإلكتروني', phone: 'رقم الهاتف', username: 'اسم المستخدم', photo: 'الصورة الشخصية',
    changePhoto: 'تغيير الصورة', security: 'كلمة المرور', currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة', confirmPassword: 'تأكيد كلمة المرور', changePassword: 'تغيير كلمة المرور',
    mismatch: 'كلمتا المرور غير متطابقتين', passwordChanged: 'تم تغيير كلمة المرور', myRoles: 'أدواري في المنصة'
  },
  notifications: {
    title: 'الإشعارات', markAll: 'تعليم الكل كمقروء', empty: 'لا توجد إشعارات هنا',
    general: 'عام',
    types: {
      lesson: 'درس', content: 'محتوى', assignment: 'واجب', result: 'نتيجة', message: 'رسالة',
      comment: 'تعليق', submission: 'تسليم', announcement: 'إعلان', report: 'بلاغ'
    }
  },
  messages: {
    title: 'الرسائل', newMessage: 'رسالة جديدة', search: 'ابحث في المحادثات', empty: 'لا توجد محادثات',
    select: 'اختر محادثة لعرضها', placeholder: 'اكتب رسالتك...', to: 'إلى', subject: 'الموضوع', body: 'الرسالة',
    as: 'بدور', noContacts: 'لا توجد جهات اتصال متاحة لهذا الدور', you: 'أنت', start: 'بدء المحادثة'
  },
  feedback: {
    title: 'البلاغات والمقترحات', newTab: 'بلاغ أو مقترح جديد', mineTab: 'بلاغاتي', type: 'النوع',
    subject: 'العنوان', description: 'الوصف', attach: 'إرفاق صورة أو ملف', submit: 'إرسال',
    sent: 'تم إرسال بلاغك، شكراً لك', empty: 'لم ترسل أي بلاغ بعد',
    types: { content: 'حول المحتوى', technical: 'عطل تقني', suggestion: 'مقترح' },
    status: { new: 'جديد', in_progress: 'قيد المعالجة', done: 'منجز' }
  },
  placeholder: {
    title: 'قيد البناء', body: 'هذه الشاشة ضمن المرحلة {phase} من خطة البناء.', codes: 'رموز الشاشات: {codes}',
    phases: {
      1: 'الأساس', 2: 'التلميذ', 3: 'الولي', 4: 'المعلم', 5: 'المحرر', 6: 'مدير المدرسة', 7: 'الإدارة العامة', 8: 'الدعم الفني'
    }
  },
  errors: {
    notFound: 'الصفحة غير موجودة', notFoundHint: 'ربما تغيّر الرابط أو حُذفت الصفحة.',
    forbidden: 'لا تملك صلاحية الوصول', forbiddenHint: 'هذه الصفحة غير متاحة لدورك الحالية.', goHome: 'العودة للرئيسية'
  },
  student: {
    nav: { home: 'الرئيسية', lessons: 'دروسي', assignments: 'واجباتي', progress: 'تقدمي' },
    stars: 'نجمة', points: 'نقطة', streak: 'يوم متتالي', streakShort: 'أيام',
    hello: { kids: 'مرحباً يا بطل!', juniors: 'أهلاً أيها المستكشف!', teens: 'أهلاً بعودتك' },
    helloName: 'مرحباً {name}', todayGoal: 'هدف اليوم', goalHint: 'درسان وواجب أو تقييم', goalDone: 'أنجزت هدف اليوم! رائع',
    continue: 'تابع من حيث توقفت', start: 'ابدأ', resume: 'تابع', mySubjects: 'موادي', seeAll: 'عرض الكل',
    upcoming: 'ينتظرك', noUpcoming: 'لا واجبات حالياً، أحسنت!', badges: 'شاراتي', overall: 'تقدّمك العام',
    lessonsDone: '{done} من {total} درس', newLessons: '{n} جديد', lessonsCount: '{n} دروس',
    searchPlaceholder: 'ابحث في دروسك: فيديو، عرض، صورة...', searchEmpty: 'لم نجد شيئاً، جرّب كلمة أخرى',
    path: 'رحلة الدرس', lesson: 'الدرس {n}', minutes: '{n} د', done: 'مكتمل', current: 'أنت هنا', open: 'مفتوح', new: 'جديد',
    types: { video: 'فيديو', slides: 'عرض', pdf: 'مذكرة', image: 'صورة', quiz: 'تقييم', homework: 'واجب' },
    classification: { main: 'رئيسي', enrichment: 'إثرائي', activity: 'نشاط' },
    markDone: 'أكملت الدرس', alreadyDone: 'درس مكتمل', prev: 'الدرس السابق', next: 'الدرس التالي',
    lessonContent: 'محتوى الدرس', lessonActivities: 'واجبات الدرس وتقييماته', comments: 'التعليقات', commentPlaceholder: 'اكتب سؤالك أو تعليقك...',
    rate: 'ما مدى استفادتك؟', report: 'إبلاغ', reportSent: 'شكراً، وصل بلاغك', thanksRating: 'شكراً على تقديرك',
    gained: '+{n}', bravo: { kids: 'رائع يا بطل!', juniors: 'إنجاز رائع!', teens: 'أحسنت!' }, newBadge: 'شارة جديدة!',
    tabs: { todo: 'للإنجاز', submitted: 'مُسلّمة', graded: 'مصحّحة' },
    state: { todo: 'للإنجاز', late: 'متأخر', submitted: 'بانتظار التصحيح', graded: 'مصحّح' },
    due: 'آخر أجل: {d}', dueIn: 'باقي {n} يوم', dueToday: 'اليوم', overdue: 'تأخّر {n} يوم', required: 'إلزامي',
    startQuiz: 'ابدأ التقييم', question: 'السؤال {n} من {total}', check: 'تحقّق', nextQ: 'التالي', finish: 'إنهاء',
    correct: 'إجابة صحيحة!', wrong: 'ليست هذه', score: 'علامتك', yourAnswer: 'إجابتك', rightAnswer: 'الإجابة الصحيحة',
    viewResult: 'عرض النتيجة', backToAssignments: 'العودة إلى واجباتي', retryLater: 'راجع الدرس',
    instructions: 'التعليمات', attachments: 'المرفقات', myAnswer: 'إجابتي', writeAnswer: 'اكتب إجابتك هنا...',
    attachFile: 'أرفق صورة أو ملفاً', submit: 'تسليم الواجب', submitted: 'تم التسليم! سيصححه معلمك قريباً',
    teacherNote: 'ملاحظة المعلم', modelAnswer: 'الإجابة النموذجية', submittedAt: 'سُلّم {d}',
    report_: { title: 'تقريري الشخصي', lessons: 'دروس مكتملة', activities: 'واجبات وتقييمات منجزة', average: 'المعدل', quizzes: 'التقييمات',
      homework: 'الواجبات', interactions: 'التفاعلات', bySubject: 'حسب المادة', allBadges: 'كل الشارات', locked: 'لم تُفتح بعد' }
  },
  library: {
    title: 'المكتبة المركزية', subtitle: 'المحتوى التعليمي المعتمد، مرتباً كمكتبة القسم: المادة ← المحور ← الدرس',
    search: 'ابحث بالعنوان أو الكلمات المفتاحية', level: 'المستوى', subject: 'المادة', type: 'النوع', classification: 'التصنيف',
    status: 'الحالة', all: 'الكل', results: '{n} عنصر', empty: 'لا توجد نتائج بهذه المرشحات', reset: 'مسح المرشحات',
    statuses: { approved: 'معتمد', temp: 'معتمد مؤقتاً', pending: 'قيد المراجعة', draft: 'مسودة', rejected: 'غير معتمد' },
    stats: { total: 'عنصر في المكتبة', videos: 'فيديو', pending: 'بانتظار المراجعة' },
    addToClass: 'أدرج في قسمي', added: 'أُدرج في القسم (تجريبي)', author: 'المؤلف', views: '{n} مشاهدة', lesson: 'الدرس',
    preview: 'معاينة', questions: '{n} أسئلة', grid: 'شبكة', listView: 'قائمة'
  },
  time: { now: 'الآن', minutes: 'منذ {n} د', hours: 'منذ {n} سا', days: 'منذ {n} يوم' }
}
