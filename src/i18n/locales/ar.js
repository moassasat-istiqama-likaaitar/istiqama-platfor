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
  themes: { staff: 'الطاقم', primary: 'الابتدائي', middle: 'المتوسط', secondary: 'الثانوي' },
  menu: {
    home: 'الرئيسية', users: 'المستخدمون', 'users-list': 'قائمة المستخدمين', 'users-import': 'الاستيراد الجماعي',
    'users-duplicates': 'الحسابات المكررة', 'activity-log': 'سجل النشاطات', library: 'المكتبة',
    'library-manage': 'المحتوى الرقمي', 'library-review': 'المراجعة والمصادقة', activities: 'الأنشطة والتقييمات',
    'activities-group': 'الأنشطة والتقييمات', reports: 'التقارير', 'reports-general': 'تقارير عامة',
    'reports-schools': 'أداء المدارس', 'reports-files': 'إحصائيات الملفات', 'reports-engagement': 'جودة التفاعل',
    settings: 'الإعدادات العامة', schools: 'المدارس', levels: 'الأطوار والمستويات', seasons: 'المواسم الدراسية',
    'classes-all': 'الأقسام', subjects: 'المواد والدروس', permissions: 'الأدوار والصلاحيات',
    customization: 'تخصيص المنصة', announcements: 'الإعلانات', calendar: 'الرزنامة', communication: 'إعدادات التواصل',
    'import-export': 'الاستيراد والتصدير', tickets: 'البلاغات', 'quiz-builder': 'منشئ الاختبارات',
    'editor-reports': 'التقارير', teachers: 'المعلمون', students: 'التلاميذ', parents: 'الأولياء',
    activation: 'تفعيل الحسابات', 'school-classes': 'الأقسام', 'teacher-files-review': 'مصادقة ملفات المعلمين',
    'content-follow': 'متابعة المحتوى والأنشطة', performance: 'تقارير الأداء', 'school-notice': 'إشعار للمدرسة',
    'my-classes': 'أقسامي', 'class-library': 'مكتبة القسم', submissions: 'التسليمات والتصحيح',
    'central-library': 'المكتبة المركزية', 'upload-content': 'رفع محتوى', 'new-homework': 'واجب منزلي جديد',
    'my-files': 'ملفاتي وأنشطتي', 'offline-tests': 'الاختبارات الحضورية', 'my-lessons': 'دروسي',
    'my-assignments': 'واجباتي واختباراتي', 'my-progress': 'تتبعي الدراسي', children: 'الأبناء',
    'child-report': 'تقارير الأبناء', incidents: 'سجل الأعطال', 'support-team': 'فريق الدعم',
    feedback: 'البلاغات والمقترحات', profile: 'الملف الشخصي', notifications: 'الإشعارات', messages: 'الرسائل'
  },
  layout: {
    switchRole: 'تبديل الصفة', currentRole: 'الصفة الحالية', myRoles: 'صفاتي', profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج', language: 'اللغة', openMenu: 'القائمة', demoMode: 'نموذج تجريبي',
    allSchools: 'كل المدارس', viewAll: 'عرض الكل', noNotifications: 'لا توجد إشعارات'
  },
  auth: {
    welcome: 'مرحباً بكم', loginTitle: 'تسجيل الدخول', loginHint: 'ادخل بحسابك للوصول إلى فضائك',
    login: 'اسم المستخدم أو البريد الإلكتروني', password: 'كلمة المرور', remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟', submit: 'دخول', or: 'أو', google: 'الدخول بحساب Google',
    demoTitle: 'حسابات العرض', demoHint: 'اضغط على أي حساب للدخول مباشرة (كلمة المرور: 1234)',
    forgotTitle: 'استرجاع كلمة المرور', forgotHint: 'أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل لك رابط إعادة التعيين',
    contact: 'البريد الإلكتروني أو رقم الهاتف', sendLink: 'إرسال الرابط', sent: 'تم الإرسال',
    sentHint: 'إن كان الحساب موجوداً فستصلك رسالة خلال دقائق.', backToLogin: 'العودة لتسجيل الدخول',
    chooseTitle: 'اختر صفتك', chooseHint: 'لديك أكثر من صفة في المنصة. بأي صفة تريد الدخول؟',
    hello: 'أهلاً {name}', switchLater: 'يمكنك التبديل بين صفاتك في أي وقت من أعلى الصفحة.'
  },
  assignment: {
    classes: 'الأقسام: {list}', class: 'القسم: {name}', children: 'الأبناء: {list}', subjects: 'المواد: {list}',
    allPlatform: 'كل المدارس', levels: 'المستويات: {list}'
  },
  home: {
    greeting: 'السلام عليكم، {name}', as: 'أنت الآن بصفة: {role}', quickAccess: 'الوصول السريع',
    phaseNote: 'لوحة هذه الصفة تُبنى في المرحلة {phase}. هذه نسخة مبدئية للتنقل.'
  },
  profile: {
    title: 'الملف الشخصي', personal: 'البيانات الشخصية', lastName: 'اللقب', firstName: 'الاسم',
    email: 'البريد الإلكتروني', phone: 'رقم الهاتف', username: 'اسم المستخدم', photo: 'الصورة الشخصية',
    changePhoto: 'تغيير الصورة', security: 'كلمة المرور', currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة', confirmPassword: 'تأكيد كلمة المرور', changePassword: 'تغيير كلمة المرور',
    mismatch: 'كلمتا المرور غير متطابقتين', passwordChanged: 'تم تغيير كلمة المرور', myRoles: 'صفاتي في المنصة'
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
    as: 'بصفة', noContacts: 'لا توجد جهات اتصال متاحة لهذه الصفة', you: 'أنت', start: 'بدء المحادثة'
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
    forbidden: 'لا تملك صلاحية الوصول', forbiddenHint: 'هذه الصفحة غير متاحة لصفتك الحالية.', goHome: 'العودة للرئيسية'
  },
  time: { now: 'الآن', minutes: 'منذ {n} د', hours: 'منذ {n} سا', days: 'منذ {n} يوم' }
}
