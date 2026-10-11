export type Language = 'en' | 'ar';

export interface I18nContent {
  appName: string;
  appSubtitle: string;
  disclaimerBanner: string;
  disclaimerBadge: string;
  microscopeNotice: string;
  navMicroscope: string;
  navAiClassifier: string;
  navDichotomous: string;
  navPhenotypic: string;
  navVirtualLab: string;
  navKirbyBauer: string;
  navMlClassifier: string;
  navQuiz: string;
  navEncyclopedia: string;
  quickSpecimens: string;
  searchPlaceholder: string;
  filterByDomain: string;
  allDomains: string;
  filterByGram: string;
  filterByBsl: string;
  reviewedOnly: string;
  reviewedBadge: string;
  unreviewedBadge: string;
  viewLens: string;
  viewDossier: string;
  compare: string;
  sourcesLabel: string;
  clinicalSafety: string;
  saveReport: string;
  exportPdf: string;
  savedReports: string;
  noSavedReports: string;
  delete: string;
  load: string;
  close: string;
  askAiQuestion: string;
  send: string;
  analyzing: string;
  askAiFloatingBtn: string;
  askAiAboutOrganism: string;
  askAiPanelTitle: string;
  askAiSelectContext: string;
  askAiGeneralContext: string;
  askAiDisclaimerText: string;
  askAiInputPlaceholder: string;
  askAiClearChat: string;
  askAiTryAgain: string;
}

export const TRANSLATIONS: Record<Language, I18nContent> = {
  en: {
    appName: 'MicrobeClassify',
    appSubtitle: 'Taxonomy, Phenotypic Classification & Diagnostic Identification of Microorganisms',
    disclaimerBanner: '⚠️ Educational and training use only. Not intended for clinical human or veterinary diagnosis.',
    disclaimerBadge: 'Educational Use Only',
    microscopeNotice: 'Simulated 3D illustration, not a real micrograph.',
    navMicroscope: 'Optical Microscope',
    navAiClassifier: 'AI Diagnostic Model',
    navDichotomous: 'Dichotomous Key',
    navPhenotypic: 'Phenotypic Classifier',
    navVirtualLab: 'Biochemical Bench',
    navKirbyBauer: 'Kirby-Bauer AST',
    navMlClassifier: 'ML Model Classifier',
    navQuiz: 'Microbiology Quiz',
    navEncyclopedia: 'Taxa Repository',
    quickSpecimens: 'Quick Specimen Load:',
    searchPlaceholder: 'Search by scientific name, disease, trait, or phylum...',
    filterByDomain: 'Filter by Domain:',
    allDomains: 'All Taxa',
    filterByGram: 'Gram Staining:',
    filterByBsl: 'Biosafety Level:',
    reviewedOnly: 'Reviewed Only',
    reviewedBadge: 'Peer Reviewed',
    unreviewedBadge: 'Pending Verification',
    viewLens: 'Lens View',
    viewDossier: 'Scientific Dossier',
    compare: 'Compare',
    sourcesLabel: 'Authoritative Sources & Literature:',
    clinicalSafety: 'Biosafety Containment:',
    saveReport: 'Save Diagnostic Report',
    exportPdf: 'Print / Export PDF',
    savedReports: 'Saved Case Reports',
    noSavedReports: 'No diagnostic reports saved yet.',
    delete: 'Delete',
    load: 'Load Report',
    close: 'Close',
    askAiQuestion: 'Ask AI Microbiology Specialist...',
    send: 'Submit Query',
    analyzing: 'Analyzing Microorganism...',
    askAiFloatingBtn: 'Ask AI',
    askAiAboutOrganism: 'Ask AI about this organism',
    askAiPanelTitle: 'Microbiology AI Specialist',
    askAiSelectContext: 'Select Context Organism:',
    askAiGeneralContext: 'General Microbiology (All Taxa)',
    askAiDisclaimerText: 'Educational use only. Not a medical diagnosis.',
    askAiInputPlaceholder: 'Ask any question on taxonomy, resistance, staining, or morphology...',
    askAiClearChat: 'Clear Chat',
    askAiTryAgain: 'Try again',
  },
  ar: {
    appName: 'ميكروب كلاسيفاي (MicrobeClassify)',
    appSubtitle: 'التصنيف الحيوي والتشخيص المظهري للكائنات الحية الدقيقة',
    disclaimerBanner: '⚠️ للاستخدام التعليمي والتدريبي فقط. ليس تشخيصاً طبياً بشرياً أو بيطرياً معتمداً.',
    disclaimerBadge: 'للاستخدام التعليمي فقط',
    microscopeNotice: 'رسم توضيحي محاكى، وليس صورة مجهرية حقيقية.',
    navMicroscope: 'المجهر الضوئي',
    navAiClassifier: 'نموذج التشخيص بالذكاء الاصطناعي',
    navDichotomous: 'المفتاح التفرعي الثنائي',
    navPhenotypic: 'المصنف المظهري',
    navVirtualLab: 'الفحوصات الكيميائية الحيوية',
    navKirbyBauer: 'فحص الحساسية (كيربي-باور)',
    navMlClassifier: 'مصنف تعلم الآلة (ML)',
    navQuiz: 'اختبار علم الأحياء الدقيقة',
    navEncyclopedia: 'موسوعة الميكروبات',
    quickSpecimens: 'تحميل عينة سريعة:',
    searchPlaceholder: 'ابحث بالاسم العلمي، المرض، الصفة أو الشعبة...',
    filterByDomain: 'تصفية حسب النطاق:',
    allDomains: 'جميع الكائنات',
    filterByGram: 'صبغة غرام:',
    filterByBsl: 'مستوى السلامة الحيوية:',
    reviewedOnly: 'البيانات المراجعة فقط',
    reviewedBadge: 'مراجعة علمياً',
    unreviewedBadge: 'قيد التدقيق',
    viewLens: 'عرض بالمجهر',
    viewDossier: 'الملف العلمي الكامل',
    compare: 'مقارنة',
    sourcesLabel: 'المراجع العلمية المعتمدة:',
    clinicalSafety: 'مستوى الأمان الحيوي:',
    saveReport: 'حفظ التقرير التشخيصي',
    exportPdf: 'طباعة / تصدير PDF',
    savedReports: 'التقارير المحفوظة',
    noSavedReports: 'لا توجد تقارير محفوظة حالياً.',
    delete: 'حذف',
    load: 'عرض التقرير',
    close: 'إغلاق',
    askAiQuestion: 'اسأل خبير الأحياء الدقيقة الاصطناعي...',
    send: 'إرسال السؤال',
    analyzing: 'جاري تحليل الكائن الدقيق...',
    askAiFloatingBtn: 'اسأل الذكاء الاصطناعي',
    askAiAboutOrganism: 'اسأل الذكاء الاصطناعي عن هذه العينة',
    askAiPanelTitle: 'مساعد الأحياء الدقيقة بالذكاء الاصطناعي',
    askAiSelectContext: 'تحديد سياق الكائن الدقيق:',
    askAiGeneralContext: 'علم الأحياء الدقيقة العام (كافة الأصناف)',
    askAiDisclaimerText: 'للاستخدام التعليمي فقط. ليس تشخيصاً طبياً.',
    askAiInputPlaceholder: 'اطرح أي سؤال حول التصنيف، المقاومة الحيوية، الصبغ، أو الخصائص المظهرية...',
    askAiClearChat: 'مسح المحادثة',
    askAiTryAgain: 'إعادة المحاولة',
  },
};
