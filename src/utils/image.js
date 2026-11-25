/**
 * تصغير الصورة في المتصفح قبل حفظها (الشعار ≤ 256px، الغلاف ≤ 1600px).
 * في الإنتاج يُرفع الملف إلى الخادم الذي يتولى التصغير والتخزين.
 */
export function readImage(file, { maxSide = 256, type = 'image/png', quality = 0.85, maxBytes = 2 * 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('لم يُختر ملف'))
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) return reject(new Error('الصيغ المقبولة: PNG، JPG، WEBP، SVG'))
    if (file.size > maxBytes) return reject(new Error(`حجم الملف أكبر من ${Math.round(maxBytes / 1024 / 1024)} ميغابايت`))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('تعذّرت قراءة الملف'))
    reader.onload = () => {
      if (file.type === 'image/svg+xml') return resolve(reader.result)
      const img = new Image()
      img.onerror = () => reject(new Error('الملف ليس صورة صالحة'))
      img.onload = () => {
        const k = Math.min(1, maxSide / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * k)
        c.height = Math.round(img.height * k)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve({ url: c.toDataURL(type, quality), width: img.width, height: img.height })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }).then((r) => (typeof r === 'string' ? { url: r } : r))
}
