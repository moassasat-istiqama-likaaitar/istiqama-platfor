/**
 * الإدارة العامة: المدير العام (super_admin) والمشرف العام (admin) متساويان في كل الصلاحيات،
 * إلا أن المدير العام وحده يستطيع:
 *   1) نزع دور المدير العام أو تعطيل حسابه
 *   2) إضافة مشرف عام (أو مدير عام)
 * والعكس غير صحيح.
 */
export const TOP_ROLES = ['super_admin', 'admin']
export const isTop = (role) => TOP_ROLES.includes(role)

/** هل يستطيع actorRole منح دور targetRole لشخص؟ */
export const canGrantRole = (actorRole, targetRole) => (TOP_ROLES.includes(targetRole) ? actorRole === 'super_admin' : true)
/** هل يستطيع actorRole نزع/تعطيل شخص يحمل الأدوار targetRoles؟ */
export const canRemoveHolder = (actorRole, targetRoles = []) => !targetRoles.includes('super_admin') || actorRole === 'super_admin'
