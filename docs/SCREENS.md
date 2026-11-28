# خريطة الكود — من الواجهة إلى الملف

كل شاشة: اسمها كما يظهر في القائمة، رمزها في دفتر الشروط، رابطها، والملف الذي يحتويها. في أول كل ملف تعليق بالاسم نفسه.

| الشاشة (كما في الواجهة) | الرمز | الرابط | الملف | الأدوار |
|---|---|---|---|---|
| تسجيل الدخول | AU01 | `#/login` | `src/views/auth/LoginView.vue` | الكل |
| دخول مدرسة | AU01 | `#/s/:slug` | `src/views/auth/LoginView.vue` | الكل |
| نسيت كلمة المرور | AU03 | `#/forgot-password` | `src/views/auth/ForgotPasswordView.vue` | الكل |
| اختيار الدور | AU02 | `#/choose-role` | `src/views/auth/ChooseRoleView.vue` | الكل |
| الرئيسية | SU01 | `#/app/home` | `src/views/common/HomeView.vue` | الكل |
| الملف الشخصي |  | `#/app/profile` | `src/views/common/ProfileView.vue` | الكل |
| الإشعارات |  | `#/app/notifications` | `src/views/common/NotificationsView.vue` | الكل |
| الإعلانات (المستلَمة) | C07 | `#/app/notices` | `src/views/common/NoticesView.vue` | الكل — تُفتح من الجرس «كل الإعلانات»، ليست في القائمة |
| الرسائل |  | `#/app/messages/:id?` | `src/views/common/MessagesView.vue` | الكل |
| البلاغات والمقترحات | F08 | `#/app/feedback` | `src/views/common/FeedbackView.vue` | الكل |
| دروسي | ST02,ST03,ST04,ST05 | `#/app/my-lessons` | `src/views/student/StudentLessons.vue` | student |
| صفحة المادة | ST03 | `#/app/subject/:id` | `src/views/student/StudentSubject.vue` | student |
| صفحة الدرس | ST04 | `#/app/lesson/:id` | `src/views/student/LessonView.vue` | student |
| واجباتي واختباراتي | ST06,ST07,ST08,ST09 | `#/app/my-assignments` | `src/views/student/StudentAssignments.vue` | student |
| الواجب / الاختبار | ST07,ST08 | `#/app/activity/:id` | `src/views/student/ActivityView.vue` | student |
| تتبعي الدراسي | ST10 | `#/app/my-progress` | `src/views/student/StudentProgress.vue` | student |
| مكتبة القسم | ST05 | `#/app/my-library` | `src/views/student/StudentLibrary.vue` | student |
| الأبناء | PA02,PA03,PA04 | `#/app/children` | `src/views/parent/ChildrenView.vue` | parent |
| تقارير الأبناء | PA05 | `#/app/child-report` | `src/views/parent/ChildReportView.vue` | parent |
| أقسامي | TE02,TE03,TE06,TE07 | `#/app/my-classes` | `src/views/teacher/MyClassesView.vue` | teacher, editor |
| مكتبة القسم | TE04,TE05 | `#/app/class-library` | `src/views/teacher/ClassLibraryView.vue` | teacher, editor |
| التسليمات والتصحيح | TE09,TE10 | `#/app/submissions` | `src/views/teacher/SubmissionsView.vue` | teacher, editor |
| رفع محتوى | TE13 | `#/app/upload-content` | `src/views/teacher/UploadContentView.vue` | teacher, editor |
| واجب منزلي جديد | TE14 | `#/app/new-homework` | `src/views/teacher/NewHomeworkView.vue` | teacher, editor |
| منشئ التقييمات | TE15 | `#/app/quiz-builder` | `src/views/teacher/QuizBuilderView.vue` | teacher, editor |
| محتواي وواجباتي وتقييماتي | TE16 | `#/app/my-files` | `src/views/teacher/MyFilesView.vue` | teacher, editor |
| بنك الاختبارات الحضورية | TE17 | `#/app/offline-tests` | `src/views/teacher/OfflineTestsView.vue` | teacher, editor |
| فتح الدروس | ED07 | `#/app/lesson-opening` | `src/views/editor/LessonOpeningView.vue` | editor |
| مراجعة الواجبات والتقييمات | ED03 | `#/app/activities-review` | `src/views/editor/ReviewView.vue` | editor, admin, super_admin |
| مراجعة المحتوى | ED03,ED04 | `#/app/library-review` | `src/views/editor/ReviewView.vue` | editor, admin, super_admin |
| بنك الواجبات والتقييمات | ED05 | `#/app/activities` | `src/views/library/ActivitiesBankView.vue` | teacher, editor, admin, super_admin |
| التقارير | ED06 | `#/app/editor-reports` | `src/views/editor/EditorReports.vue` | editor |
| المعلمون | SM02 | `#/app/teachers` | `src/views/users/UsersView.vue` | الكل |
| التلاميذ | SM03 | `#/app/students` | `src/views/users/UsersView.vue` | الكل |
| الأولياء | SM04 | `#/app/parents` | `src/views/users/UsersView.vue` | الكل |
| أوراق الدخول | SM12 / AD21 | `#/app/login-sheets` (والطباعة `#/print/login-sheets`) | `src/views/manager/LoginSheetsView.vue`، `src/views/print/LoginSheetsPrint.vue` | school_manager، super_admin، admin |
| الأقسام | SM06 | `#/app/school-classes` | `src/views/manager/SchoolClassesView.vue` | school_manager |
| مصادقة محتوى المعلمين | SM07 | `#/app/teacher-files-review` | `src/views/manager/TeacherFilesReview.vue` | school_manager |
| متابعة المحتوى والواجبات والتقييمات | SM08 | `#/app/content-follow` | `src/views/manager/ContentFollowView.vue` | school_manager |
| تقارير الأداء | SM09 | `#/app/performance` | `src/views/manager/PerformanceView.vue` | school_manager |
| إعلانات المدرسة (الإرسال) | SM10 | `#/app/school-notice` | `src/views/manager/SchoolNoticeView.vue` | school_manager |
| قائمة المستخدمين | AD02,AD03 | `#/app/users-list` | `src/views/users/UsersView.vue` | الكل |
| الاستيراد الجماعي | AD04 | `#/app/users-import` | `src/views/admin/ImportView.vue` | admin, super_admin |
| الحسابات المكررة | AD05 | `#/app/users-duplicates` | `src/views/admin/DuplicatesView.vue` | admin, super_admin |
| سجل العمليات | AD06 | `#/app/activity-log` | `src/views/admin/ActivityLogView.vue` | admin, super_admin |
| تقارير عامة | AD17 | `#/app/reports-general` | `src/views/admin/ReportsView.vue` | الكل |
| أداء المدارس | AD17 | `#/app/reports-schools` | `src/views/admin/ReportsView.vue` | الكل |
| إحصائيات الملفات | AD17 | `#/app/reports-files` | `src/views/admin/ReportsView.vue` | الكل |
| جودة التفاعل | AD17 | `#/app/reports-engagement` | `src/views/admin/ReportsView.vue` | الكل |
| المساهمون في المكتبة | RP01 | `#/app/reports-contributors` | `src/views/reports/InsightsView.vue` | admin, super_admin, editor (مستوياته) |
| نشاط التلاميذ | RP02 | `#/app/reports-activity` | `src/views/reports/InsightsView.vue` | admin, super_admin (حسب المدرسة)، teacher (تلاميذ أقسامه) |
| نشاط المعلمين | RP03 | `#/app/reports-teachers` | `src/views/reports/InsightsView.vue` | admin, super_admin |
| تقديرات المحتوى | RP04 | `#/app/reports-ratings` | `src/views/reports/InsightsView.vue` | admin, super_admin, editor (مستوياته) |
| المدارس | AD07 | `#/app/schools` | `src/views/admin/SchoolsView.vue` | admin, super_admin |
| الأطوار والمستويات | AD08 | `#/app/levels` | `src/views/admin/LevelsView.vue` | admin, super_admin |
| المواسم الدراسية | AD09 | `#/app/seasons` | `src/views/admin/SeasonsView.vue` | admin, super_admin — إعادة فتح موجَّهة + مصفوفة رؤية الأرشيف |
| الأقسام | AD10 | `#/app/classes-all` | `src/views/manager/SchoolClassesView.vue` | الكل |
| المواد والدروس | AD11 | `#/app/subjects` | `src/views/admin/SubjectsView.vue` | admin, super_admin |
| الأدوار والصلاحيات | AD12 | `#/app/permissions` | `src/views/admin/PermissionsView.vue` | admin, super_admin |
| تخصيص المنصة | AD13 | `#/app/customization` | `src/views/admin/CustomizationView.vue` | admin, super_admin |
| الإعلانات | AD14 | `#/app/announcements` | `src/views/manager/SchoolNoticeView.vue` | الكل |
| الرزنامة | AD15 | `#/app/calendar` | `src/views/admin/CalendarView.vue` | admin, super_admin |
| إعدادات التواصل | AD16 | `#/app/communication` | `src/views/admin/CommunicationView.vue` | admin, super_admin |
| الاستيراد والتصدير | AD18 | `#/app/import-export` | `src/views/admin/ImportExportView.vue` | admin, super_admin |
| البلاغات | SU02 | `#/app/tickets` | `src/views/support/TicketsView.vue` | support (تقني وحسابات)، editor (المحتوى)، admin, super_admin (الكل والمقترحات) |
| سجل الأعطال | SU03 | `#/app/incidents` | `src/views/support/IncidentsView.vue` | support |
| فريق الدعم | SU04 | `#/app/support-team` | `src/views/support/SupportTeamView.vue` | support |
| المكتبة المركزية | TE11,TE12 | `#/app/central-library` | `src/views/library/LibraryView.vue` | teacher, editor, admin, super_admin |
| المكتبة المركزية | ED02 | `#/app/library-manage` | `src/views/library/LibraryView.vue` | editor, admin, super_admin |
| هوية المدرسة | SM11 | `#/app/school-identity` | `src/views/branding/SchoolIdentityView.vue` | school_manager |
| اعتماد هويات المدارس | AD19 | `#/app/branding-requests` | `src/views/branding/BrandingRequestsView.vue` | admin, super_admin |
| لا صلاحية (403) |  | `#/forbidden` | `src/views/errors/ForbiddenView.vue` | الكل |
| شاشة مؤقتة |  | `#/app/:key` | `src/views/common/PlaceholderView.vue` | الكل |
| طباعة اختبار حضوري |  | `#/print/offline-test/:id` | `src/views/print/OfflineTestPrint.vue` | teacher, editor |
| طباعة كشف النقاط | PA05 | `#/print/report-card` | `src/views/print/ReportCardView.vue` | student, parent |
| صفحة غير موجودة (404) |  | —  | `src/views/errors/NotFoundView.vue` | الكل |

## الطبقات

| المجلد | ماذا فيه |
|---|---|
| `src/views/<الدور>/` | الشاشات، مجمّعة حسب الدور (admin, editor, manager, teacher, student, parent, support, common) |
| `src/layouts/` | الهياكل: الطاقم (AppLayout) والتلاميذ (KidsShell / JuniorsShell / TeensShell / FocusShell) |
| `src/components/` | مكوّنات مشتركة: ui (جداول، حالات)، quiz (الأسئلة)، library (الإدراج)، plan (فتح الدروس)، brand (الشعارات) |
| `src/api/` | طبقة الخدمات الوهمية — كل دالة تمثّل نقطة API سيبنيها المطوّر (التعليق فوقها يذكر المسار) |
| `src/mock/` | البيانات التجريبية (المدارس، الأشخاص، المحتوى) والتخزين المحلي |
| `src/config/` | القوائم، الثيمات، الصلاحيات (roles.js)، مصفوفة المراسلة (messaging.js)، التأثيرات (effects.js) |
| `src/stores/` | الحالة المشتركة (Pinia): الدخول، الهوية، المنصة، التلميذ، الإشعارات، سياق الموسم (season) |
| `src/utils/` | أدوات: التصحيح الآلي للأسئلة (quiz.js)، نموذج الاستيراد (importTemplate.js)، التواريخ... |
| `src/i18n/` | النصوص بالعربية والفرنسية والإنجليزية |
