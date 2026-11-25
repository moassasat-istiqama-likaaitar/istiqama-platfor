/** تسميات موحّدة لدورة الحالات والتصنيف */
export const LIFECYCLE = {
  draft: { label: 'مسودة', hint: 'عندك وحدك — لم تُرسل بعد' },
  review: { label: 'قيد المراجعة', hint: 'بانتظار مصادقة مدير المدرسة أو قرار المحرر' },
  temp: { label: 'معتمد مؤقتاً', hint: 'صادق عليه المدير: يظهر في أقسامك فقط، بانتظار المحرر' },
  approved: { label: 'معتمد', hint: 'في المكتبة المركزية لكل المعلمين' },
  rejected: { label: 'مرفوض', hint: 'رفضه المحرر — اطّلع على الملاحظة' }
}
export const CLASSIFICATIONS = [
  { label: 'رئيسي', value: 'main' },
  { label: 'إثرائي', value: 'enrichment' },
  { label: 'نشاط', value: 'activity' }
]
export const classLabel = (v) => CLASSIFICATIONS.find((c) => c.value === v)?.label || '—'
