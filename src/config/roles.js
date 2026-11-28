/**
 * الإدارة العامة: المدير العام (super_admin) والمشرف العام (admin) متساويان في كل الصلاحيات،
 * إلا أن المدير العام وحده يستطيع:
 *   1) نزع دور المدير العام أو تعطيل حسابه
 *   2) إضافة مشرف عام (أو مدير عام)
 * والعكس غير صحيح.
 */
export const TOP_ROLES = ['super_admin', 'admin']
export const isTop = (role) => TOP_ROLES.includes(role)

/** أدوار حساسة لا يمنحها إلا الإشراف العام (الدعم الفني خطير: يطّلع على البلاغات والأعطال) */
export const TOP_GRANTED = ['editor', 'school_manager', 'support']
/** هل يستطيع actorRole منح دور targetRole لشخص؟ المدير يمنح المعلم/التلميذ/الولي داخل مدرسته فقط */
export const canGrantRole = (actorRole, targetRole) => {
  if (TOP_ROLES.includes(targetRole)) return actorRole === 'super_admin'
  if (TOP_GRANTED.includes(targetRole)) return TOP_ROLES.includes(actorRole)
  return TOP_ROLES.includes(actorRole) || actorRole === 'school_manager'
}
/** هل يستطيع actorRole نزع/تعطيل شخص يحمل الأدوار targetRoles؟ */
export const canRemoveHolder = (actorRole, targetRoles = []) => !targetRoles.includes('super_admin') || actorRole === 'super_admin'
