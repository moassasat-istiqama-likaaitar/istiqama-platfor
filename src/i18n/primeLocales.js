// نصوص مكونات PrimeVue الداخلية (التقويم، الأزرار، الجداول...) لكل لغة
export const primeLocales = {
  ar: {
    accept: 'نعم', reject: 'لا', choose: 'اختيار', upload: 'رفع', cancel: 'إلغاء', clear: 'مسح',
    dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    dayNamesShort: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    dayNamesMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    monthNames: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    monthNamesShort: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    today: 'اليوم', weekHeader: 'أسبوع', firstDayOfWeek: 6, dateFormat: 'dd/mm/yy',
    weak: 'ضعيفة', medium: 'متوسطة', strong: 'قوية', passwordPrompt: 'أدخل كلمة المرور',
    emptyMessage: 'لا توجد نتائج', emptyFilterMessage: 'لا توجد نتائج', searchMessage: '{0} نتيجة',
    selectionMessage: '{0} عناصر مختارة', emptySelectionMessage: 'لا شيء مختار', emptySearchMessage: 'لا توجد نتائج',
    aria: { close: 'إغلاق', previous: 'السابق', next: 'التالي' }
  },
  fr: {
    accept: 'Oui', reject: 'Non', choose: 'Choisir', upload: 'Téléverser', cancel: 'Annuler', clear: 'Effacer',
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    today: "Aujourd'hui", weekHeader: 'Sem', firstDayOfWeek: 0, dateFormat: 'dd/mm/yy',
    weak: 'Faible', medium: 'Moyen', strong: 'Fort', passwordPrompt: 'Saisissez un mot de passe',
    emptyMessage: 'Aucun résultat', emptyFilterMessage: 'Aucun résultat', searchMessage: '{0} résultats',
    selectionMessage: '{0} sélectionnés', emptySelectionMessage: 'Aucune sélection', emptySearchMessage: 'Aucun résultat',
    aria: { close: 'Fermer', previous: 'Précédent', next: 'Suivant' }
  },
  en: {
    accept: 'Yes', reject: 'No', choose: 'Choose', upload: 'Upload', cancel: 'Cancel', clear: 'Clear',
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today', weekHeader: 'Wk', firstDayOfWeek: 0, dateFormat: 'dd/mm/yy',
    weak: 'Weak', medium: 'Medium', strong: 'Strong', passwordPrompt: 'Enter a password',
    emptyMessage: 'No results', emptyFilterMessage: 'No results', searchMessage: '{0} results',
    selectionMessage: '{0} selected', emptySelectionMessage: 'Nothing selected', emptySearchMessage: 'No results',
    aria: { close: 'Close', previous: 'Previous', next: 'Next' }
  }
}
