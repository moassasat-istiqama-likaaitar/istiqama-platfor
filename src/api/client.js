/**
 * طبقة الاتصال.
 *
 * كل دالة في مجلد api/ تمثل نقطة في عقد الـ API (مكتوبة فوقها في تعليق: الطريقة والمسار).
 * حالياً تُجيب من البيانات التجريبية. عند الربط بالخلفية (Laravel) يُستبدل جسم الدالة
 * بطلب HTTP حقيقي إلى نفس المسار، دون أي تغيير في الشاشات.
 */

const LATENCY = 250

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

/** يحاكي ردّ الخادم: تأخير قصير + نسخة مستقلة من البيانات */
export function respond(producer, latency = LATENCY) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const value = typeof producer === 'function' ? producer() : producer
        resolve(value === undefined ? undefined : structuredClone(value))
      } catch (err) {
        reject(err)
      }
    }, latency)
  })
}

export const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
