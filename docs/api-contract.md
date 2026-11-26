# عقد الـ API — المرحلة 1 (مسودة)

وثيقة حيّة تُستكمل مع كل مرحلة. المصدر الدقيق هو دوال `src/api/`.
كل الطلبات (عدا الدخول واسترجاع كلمة المرور) تحمل الرمز: `Authorization: Bearer <token>`.
الطلبات المرتبطة بدور معيّن يحمل أيضاً: `X-Assignment-Id: <assignmentId>`.

## نموذج البيانات الأساسي: الشخص والأدوار

```jsonc
// Person — حساب واحد لكل شخص
{ "id": "p5", "username": "teacher", "email": "…", "firstName": "عمر", "lastName": "باعمر",
  "gender": "male", "phone": "…", "status": "active" }

// Assignment — دور: دور + نطاق
{ "id": "a6", "personId": "p5", "role": "teacher", "schoolId": "s1",
  "classIds": ["c1","c3"], "subjects": ["القرآن الكريم","الفقه"] }
{ "id": "a8", "personId": "p5", "role": "parent", "schoolId": null, "childIds": ["p10"] }
```

الأدوار: `super_admin`, `admin`, `editor`, `school_manager`, `teacher`, `student`, `parent`, `support`.

> ⚠️ يختلف هذا عن هيكلة البيانات في دفتر الشروط الحالي (جدول مستقل بكلمة مرور لكل دور). يجب تعديل الدفتر ليعتمد جدول الأشخاص + جدول الأدوار.

## المصادقة

| الطريقة | المسار | المدخلات | المخرجات |
|---|---|---|---|
| POST | `/api/auth/login` | `{ login, password }` | `{ token, person, assignments[] }` |
| GET | `/api/auth/me` | — | `{ token, person, assignments[] }` |
| POST | `/api/auth/forgot-password` | `{ contact }` | `{ sent: true }` |
| PUT | `/api/me` | `{ firstName, lastName, email, phone }` | `person` |
| PUT | `/api/me/password` | `{ current, next }` | `{ ok: true }` |

`assignments[]` تُعاد مكمَّلة للعرض: `school {id,name}`، و`classes[]` أو `class` + `level {id,name,phase}` أو `children[] {id,name,className,schoolName}`.

## الإشعارات

| الطريقة | المسار | المخرجات |
|---|---|---|
| GET | `/api/notifications` | `[{ id, assignmentId|null, type, title, body, read, at }]` |
| POST | `/api/notifications/{id}/read` | `{ ok }` |
| POST | `/api/notifications/read-all` | `{ ok }` |

الأنواع: `lesson, content, assignment, result, message, comment, submission, announcement, report`.
`assignmentId = null` يعني إشعاراً عاماً.

## الرسائل

| الطريقة | المسار | المدخلات / المخرجات |
|---|---|---|
| GET | `/api/conversations` | `[{ id, subject, with {personId,name,role}, myAssignmentId, lastMessage, unread }]` |
| GET | `/api/conversations/{id}` | المحادثة + `messages[] { id, body, at, fromMe, fromName }` |
| POST | `/api/conversations/{id}/messages` | `{ body }` → message |
| POST | `/api/conversations` | `{ assignmentId, toPersonId, subject, body }` → conversation |
| GET | `/api/contacts?assignment={id}` | من يمكن مراسلته بهذا الدور |

قواعد المراسلة المبدئية (تُضبط لاحقاً من إعدادات التواصل AD16):
المعلم ← تلاميذ أقسامه وأولياؤهم ومدير مدرسته · التلميذ ← معلمو قسمه · الولي ← معلمو أبنائه ومديرو مدارسهم · المدير ← معلمو مدرسته · الإدارة ← كل الطاقم.

## البلاغات والمقترحات

| الطريقة | المسار | المدخلات / المخرجات |
|---|---|---|
| GET | `/api/reports/mine` | `[{ id, type, title, description, status, at }]` |
| POST | `/api/reports` | `{ type, title, description, assignmentId }` → report |

الأنواع: `content, technical, suggestion` · الحالات: `new, in_progress, done`.
