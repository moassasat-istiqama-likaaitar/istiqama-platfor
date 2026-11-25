/** وصف موعد التسليم: "باقي 3 يوم" / "اليوم" / "تأخّر يومين" */
export function dueInfo(due, t) {
  const d = new Date(due)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  const diff = Math.round((day - today) / 86400000)
  if (diff === 0) return { text: t('student.dueToday'), hue: 'orange' }
  if (diff > 0) return { text: t('student.dueIn', { n: diff }), hue: diff <= 2 ? 'yellow' : 'green' }
  return { text: t('student.overdue', { n: -diff }), hue: 'red' }
}
