/**
 * نموذج الاستيراد الجماعي كملف Excel حقيقي (يُحمَّل عند الطلب فقط):
 *  ورقة «البيانات»: العناوين + 3 أمثلة مملوءة + قوائم منسدلة (الجنس، القسم، المواد...)
 *  ورقة «قوائم»: مصادر القوائم المنسدلة (مخفية)
 *  ورقة «تعليمات»: شرح كل عمود
 */
const SPECS = {
  students: {
    title: 'التلاميذ',
    cols: [
      { h: 'اللقب', w: 16, req: true, help: 'لقب التلميذ بالعربية' },
      { h: 'الاسم', w: 16, req: true, help: 'اسم التلميذ بالعربية' },
      { h: 'تاريخ الميلاد', w: 15, req: true, help: 'بصيغة يوم/شهر/سنة، مثال 14/03/2015' },
      { h: 'الجنس', w: 10, req: true, list: 'gender', help: 'اختر من القائمة: ذكر / أنثى' },
      { h: 'القسم', w: 28, req: true, list: 'classes', help: 'اختر من أقسام المدرسة المحددة' },
      { h: 'هاتف الولي', w: 16, req: true, help: '10 أرقام تبدأ بـ 05 أو 06 أو 07 — يُربط به حساب الولي (أو يُنشأ)' }
    ],
    examples: [
      ['بن عيسى', 'إسحاق', '14/03/2010', 'ذكر', 0, '0661234567'],
      ['الشيخ', 'مريم', '02/11/2011', 'أنثى', 0, '0770112233'],
      ['حمودة', 'يحيى', '25/06/2013', 'ذكر', 1, '0550998877']
    ]
  },
  teachers: {
    title: 'المعلمون',
    cols: [
      { h: 'اللقب', w: 16, req: true, help: 'لقب المعلم' },
      { h: 'الاسم', w: 16, req: true, help: 'اسم المعلم' },
      { h: 'الجنس', w: 10, req: true, list: 'gender', help: 'ذكر / أنثى' },
      { h: 'الهاتف', w: 16, req: true, help: '10 أرقام — يُستعمل لتسجيل الدخول' },
      { h: 'البريد', w: 26, req: false, help: 'اختياري — لاستعادة كلمة المرور' },
      { h: 'المواد', w: 28, req: true, list: 'subjects', help: 'مادة من القائمة؛ لأكثر من مادة افصل بفاصلة' },
      { h: 'الأقسام', w: 30, req: true, list: 'classes', help: 'قسم من القائمة؛ لأكثر من قسم افصل بفاصلة' }
    ],
    examples: [
      ['باعمر', 'عمر', 'ذكر', '0661000111', 'omar@example.dz', 0, 0],
      ['الشيخ', 'عائشة', 'أنثى', '0770000222', '', 1, 1],
      ['قاسم', 'بكير', 'ذكر', '0550000333', '', 2, 0]
    ]
  },
  parents: {
    title: 'الأولياء',
    cols: [
      { h: 'اللقب', w: 16, req: true, help: 'لقب الولي' },
      { h: 'الاسم', w: 16, req: true, help: 'اسم الولي' },
      { h: 'صلة القرابة', w: 12, req: true, list: 'relation', help: 'أب / أم / وصيّ' },
      { h: 'الهاتف', w: 16, req: true, help: '10 أرقام — يُستعمل لتسجيل الدخول' },
      { h: 'أسماء الأبناء', w: 34, req: true, help: 'الاسم واللقب كما في ملف التلاميذ؛ افصل بين الأبناء بفاصلة' }
    ],
    examples: [
      ['بن عيسى', 'محمد', 'أب', '0661234567', 'إسحاق بن عيسى'],
      ['بلحاج', 'خديجة', 'أم', '0770112233', 'سلمى بلحاج، أنس بلحاج'],
      ['حمودة', 'إبراهيم', 'أب', '0550998877', 'يحيى حمودة']
    ]
  }
}

export async function downloadImportTemplate(entity, { schoolName = '', classes = [], subjects = [] } = {}) {
  const { default: ExcelJS } = await import('exceljs')
  const spec = SPECS[entity]
  const wb = new ExcelJS.Workbook()
  wb.creator = 'منصة الاستقامة الرقمية'
  const lists = {
    gender: ['ذكر', 'أنثى'],
    relation: ['أب', 'أم', 'وصيّ'],
    classes: classes.length ? classes : ['(اختر المدرسة أولاً)'],
    subjects: subjects.length ? subjects : ['—']
  }

  // ورقة البيانات
  const ws = wb.addWorksheet('البيانات', { views: [{ rightToLeft: true, state: 'frozen', ySplit: 2 }] })
  ws.columns = spec.cols.map((c) => ({ width: c.w }))
  ws.mergeCells(1, 1, 1, spec.cols.length)
  const t = ws.getCell(1, 1)
  t.value = `استيراد ${spec.title}${schoolName ? ' — ' + schoolName : ''}  ·  الأعمدة الملوّنة إجبارية · احذف الأمثلة قبل الرفع`
  t.font = { bold: true, size: 12, color: { argb: 'FF1F3A93' } }
  t.alignment = { horizontal: 'right', vertical: 'middle' }
  ws.getRow(1).height = 24
  const head = ws.getRow(2)
  spec.cols.forEach((c, i) => {
    const cell = head.getCell(i + 1)
    cell.value = c.h + (c.req ? ' *' : '')
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.req ? 'FF3159E8' : 'FF8A94A6' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.note = c.help
  })
  head.height = 22
  spec.examples.forEach((ex, r) => {
    const row = ws.getRow(3 + r)
    ex.forEach((v, i) => {
      const col = spec.cols[i]
      row.getCell(i + 1).value = typeof v === 'number' && col.list ? lists[col.list][Math.min(v, lists[col.list].length - 1)] : v
      row.getCell(i + 1).font = { color: { argb: 'FF7A7A8C' }, italic: true }
    })
  })
  // الهاتف كنص حتى لا يضيع الصفر الأول
  spec.cols.forEach((c, i) => { if (/هاتف|الهاتف/.test(c.h)) ws.getColumn(i + 1).numFmt = '@' })

  // القوائم المنسدلة من ورقة «قوائم»
  const ls = wb.addWorksheet('قوائم', { state: 'hidden' })
  const keys = Object.keys(lists)
  keys.forEach((k, ci) => lists[k].forEach((v, ri) => (ls.getCell(ri + 1, ci + 1).value = v)))
  const colL = (n) => String.fromCharCode(64 + n)
  spec.cols.forEach((c, i) => {
    if (!c.list) return
    const ci = keys.indexOf(c.list) + 1
    const ref = `'قوائم'!$${colL(ci)}$1:$${colL(ci)}$${lists[c.list].length}`
    for (let r = 3; r <= 1000; r++) {
      ws.getCell(r, i + 1).dataValidation = { type: 'list', allowBlank: !c.req, formulae: [ref], showErrorMessage: !['subjects', 'classes'].includes(c.list) || entity === 'students', errorTitle: 'قيمة غير صالحة', error: 'اختر من القائمة' }
    }
  })

  // التعليمات
  const ins = wb.addWorksheet('تعليمات', { views: [{ rightToLeft: true }] })
  ins.columns = [{ width: 22 }, { width: 12 }, { width: 70 }]
  ins.addRow(['العمود', 'إجباري؟', 'الشرح']).font = { bold: true }
  spec.cols.forEach((c) => ins.addRow([c.h, c.req ? 'نعم' : 'لا', c.help]))
  ins.addRow([])
  ;['املأ ورقة «البيانات» ابتداءً من السطر 3، واحذف الأسطر الرمادية (أمثلة).', 'لا تغيّر أسماء الأعمدة ولا ترتيبها.', 'الحساب المكرر (نفس الهاتف أو الاسم وتاريخ الميلاد) يظهر في المعاينة قبل التأكيد.', 'بعد الرفع تظهر معاينة بالأخطاء لتصحيحها أو استبعادها قبل الاستيراد.'].forEach((x) => ins.addRow(['•', '', x]))

  const buf = await wb.xlsx.writeBuffer()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  a.download = `نموذج-استيراد-${spec.title}.xlsx`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1500)
}
