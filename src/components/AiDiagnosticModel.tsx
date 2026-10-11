import React, { useState, useEffect } from 'react';
import { ClassificationReport } from '../types/microbe';
import { MICROORGANISMS } from '../data/microorganisms';
import {
  Sparkles,
  Upload,
  FileText,
  Search,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ExternalLink,
  Printer,
  Bookmark,
  Trash2,
  Clock,
  FolderOpen,
  Image as ImageIcon,
  Download,
  Check,
  Info,
} from 'lucide-react';
import { Language } from '../data/i18n';

interface AiDiagnosticModelProps {
  onSelectKnownMicrobeName?: (name: string) => void;
  language?: Language;
}

interface SavedReportItem {
  id: string;
  timestamp: string;
  specimenOrigin: string;
  report: ClassificationReport;
}

const SAMPLE_VIGNETTES = [
  {
    title: 'Pulmonary Sputum (Acid-Fast)',
    preview: 'Slender beaded rods, slow growth on Lowenstein-Jensen',
    text: 'Patient presenting with chronic cough, night sweats, and weight loss. Sputum smear with Ziehl-Neelsen stain shows slender, slightly curved beaded fuchsia-red bacilli against a methylene blue background. Obligate aerobe requiring 3-4 weeks to grow rough, cauliflower-like buff colonies on Lowenstein-Jensen egg-based medium. Niacin test positive.',
  },
  {
    title: 'Surgical Wound Abscess (Gram+)',
    preview: 'Cocci in grape-like clusters, golden pigment, coagulase+',
    text: 'Purulent exudate from a post-operative surgical site. Gram stain demonstrates Gram-positive cocci arranged in irregular grape-like clusters. Colonies on sheep blood agar exhibit golden-yellow pigmentation and complete beta-hemolysis. Catalase test is positive (vigorous effervescence with 3% H2O2). Coagulase test in rabbit plasma is positive with dense clot formation.',
  },
  {
    title: 'Waterborne Rice-Water Diarrhea (Gram-)',
    preview: 'Comma-shaped rods, rapid darting motility, yellow on TCBS',
    text: 'Stool specimen from a patient experiencing sudden onset voluminous non-bloody watery diarrhea with mucus flecks ("rice-water" stool). Darkfield wet mount displays rapid darting "shooting star" motility. Gram stain reveals Gram-negative curved, comma-shaped rods with a single polar flagellum. Cultures on selective TCBS agar produce large yellow colonies due to sucrose fermentation. Oxidase positive.',
  },
  {
    title: 'Pediatric Meningitis CSF (Diplococci)',
    preview: 'Gram-negative coffee-bean diplococci, oxidase+',
    text: 'Lumbar puncture performed on a college student with high fever, neck stiffness, and petechial skin rash. Cerebrospinal fluid analysis reveals high opening pressure, elevated neutrophils, and intracellular Gram-negative diplococci with adjacent flattened surfaces resembling coffee beans. Oxidase positive. Grows well on enriched chocolate and Thayer-Martin agar under 5% CO2.',
  },
  {
    title: 'Hiker Intestinal Distress (Protist)',
    preview: 'Pear-shaped binucleated organism with falling leaf motility',
    text: 'Stool examination from a wilderness hiker with persistent foul-smelling greasy diarrhea, bloating, and sulfurous belching following ingestion of untreated stream water. Microscopic wet mount reveals bilaterally symmetrical, pear-shaped flagellated trophozoites measuring 15 µm with two anterior nuclei and a ventral sucking disc, exhibiting characteristic "falling leaf" tumbling motility.',
  },
  {
    title: 'Deep Puncture Spore Wound (Anaerobe)',
    preview: 'Terminal drumstick spores, strict anaerobic paralysis',
    text: 'Puncture wound sustained on a rusty outdoor agricultural nail followed by masseter muscle spasm (trismus / lockjaw) and sustained facial contraction (risus sardonicus). Smear of deep wound debridement shows slender Gram-positive rods with prominent round terminal endospores producing a "drumstick" or "tennis racquet" appearance. Strict obligate anaerobe.',
  },
];

// Client-side image compressor: downsizes photos to max 1024px and produces clean lightweight JPEG (~80% quality)
const compressAndResizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1024;
        let { width, height } = img;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        canvas.width = Math.max(width, 100);
        canvas.height = Math.max(height, 100);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.80);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

// Generates synthetic standard slide images for 1-click test scenarios
const generateSampleSlideUrl = (type: 'staph' | 'ecoli' | 'tb' | 'spores'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background ocular brightfield
  const grad = ctx.createRadialGradient(200, 200, 30, 200, 200, 200);
  grad.addColorStop(0, '#fef9c3');
  grad.addColorStop(0.7, '#fef08a');
  grad.addColorStop(1, '#eab308');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 400);

  if (type === 'staph') {
    // Gram-positive purple cocci in clusters
    ctx.fillStyle = '#6d28d9';
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 1.5;
    const clusters = [
      [180, 190], [195, 185], [210, 195], [190, 205], [205, 210],
      [220, 200], [175, 205], [200, 225], [185, 220], [215, 225],
      [140, 150], [152, 142], [160, 155], [145, 162],
      [260, 240], [275, 235], [270, 250], [285, 248],
      [200, 150], [215, 145], [210, 160]
    ];
    clusters.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (type === 'ecoli') {
    // Gram-negative pink/red bacilli
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 1.5;
    const rods = [
      [150, 180, 25], [220, 160, -15], [180, 240, 45], [250, 220, -30],
      [130, 230, 10], [270, 170, 60], [190, 130, -45], [160, 270, 20],
      [220, 260, 75], [130, 140, -10]
    ];
    rods.forEach(([cx, cy, rot]) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.beginPath();
      ctx.roundRect(-16, -6, 32, 12, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  } else if (type === 'tb') {
    // Acid-fast bright red slender beaded rods on blue background
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#e11d48';
    ctx.strokeStyle = '#9f1239';
    ctx.lineWidth = 2;
    const tbRods = [
      [160, 180, 30], [210, 190, -20], [180, 230, 40], [240, 150, 65],
      [130, 210, -10], [260, 230, -45], [190, 120, 15]
    ];
    tbRods.forEach(([cx, cy, rot]) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.beginPath();
      ctx.roundRect(-20, -4, 40, 8, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  } else if (type === 'spores') {
    // Bacillus with green endospores inside red rods
    ctx.fillStyle = '#f43f5e';
    const bacilli = [
      [160, 190, 15], [230, 180, -25], [190, 240, 40], [250, 250, -10]
    ];
    bacilli.forEach(([cx, cy, rot]) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.beginPath();
      ctx.roundRect(-24, -8, 48, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(8, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  return canvas.toDataURL('image/jpeg', 0.88);
};

export const AiDiagnosticModel: React.FC<AiDiagnosticModelProps> = ({
  onSelectKnownMicrobeName,
  language = 'en',
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [promptText, setPromptText] = useState<string>('');
  const [specimenOrigin, setSpecimenOrigin] = useState<string>('Clinical Sputum / Wound / Culture');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalDetail, setTechnicalDetail] = useState<string | null>(null);
  const [report, setReport] = useState<ClassificationReport | null>(null);

  // Saved reports state
  const [savedReports, setSavedReports] = useState<SavedReportItem[]>([]);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const [microscopeNotFoundMsg, setMicroscopeNotFoundMsg] = useState<string | null>(null);

  // Auto-dismiss save toast
  useEffect(() => {
    if (!saveToast) return;
    const timer = setTimeout(() => setSaveToast(null), 4500);
    return () => clearTimeout(timer);
  }, [saveToast]);

  // Auto-dismiss microscope message
  useEffect(() => {
    if (!microscopeNotFoundMsg) return;
    const timer = setTimeout(() => setMicroscopeNotFoundMsg(null), 5000);
    return () => clearTimeout(timer);
  }, [microscopeNotFoundMsg]);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageNotes, setImageNotes] = useState<string>('Gram stain 1000x oil immersion microscopic field');

  // Load saved reports from localStorage with try/catch
  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved_microbe_reports');
      if (stored) {
        setSavedReports(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read saved reports from localStorage (iframe sandbox policy)', e);
    }
  }, []);

  const saveReportToStorage = () => {
    if (!report) return;
    const newItem: SavedReportItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      specimenOrigin,
      report,
    };
    // Always save in memory state
    const updated = [newItem, ...savedReports.slice(0, 29)];
    setSavedReports(updated);

    // Also attempt localStorage in try/catch (it may be blocked in sandboxed iframe)
    let localStorageOk = false;
    try {
      localStorage.setItem('saved_microbe_reports', JSON.stringify(updated));
      localStorageOk = true;
    } catch (e) {
      console.warn('localStorage is blocked in this preview iframe', e);
      localStorageOk = false;
    }

    if (localStorageOk) {
      setSaveToast({
        message: isAr
          ? 'تم حفظ التقرير بنجاح في ذاكرة المتصفح!'
          : 'Report saved successfully!',
        type: 'success',
      });
    } else {
      setSaveToast({
        message: isAr
          ? 'تم حفظ التقرير في الجلسة الحالية. (التخزين المحلي محظور في هذه المعاينة؛ استخدم زر التحميل للتنزيل)'
          : 'Report saved in current session. (Saving is blocked in this preview; use Download instead)',
        type: 'warning',
      });
    }
  };

  const deleteSavedReport = (id: string) => {
    const updated = savedReports.filter((r) => r.id !== id);
    setSavedReports(updated);
    try {
      localStorage.setItem('saved_microbe_reports', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not update localStorage', e);
    }
  };

  // Helper to generate standalone print-friendly HTML report blob
  const generateReportHtml = (targetReport: ClassificationReport): string => {
    return `<!DOCTYPE html>
<html lang="${language}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>Diagnostic Report - ${targetReport.scientificName}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px; background: #ffffff; }
    .header-bar { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .app-title { font-size: 20px; font-weight: 800; color: #0369a1; }
    .doc-type { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .disclaimer-box { background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 12px; font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-right: 8px; }
    .badge-confidence { background: #e0f2fe; color: #0369a1; }
    .badge-group { background: #f1f5f9; color: #334155; }
    .organism-name { font-size: 26px; font-weight: 800; font-style: italic; color: #0f172a; margin: 8px 0 4px 0; }
    .common-name { font-size: 14px; color: #475569; margin-bottom: 16px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 18px 0 10px 0; }
    .tax-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
    .tax-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; font-size: 12px; }
    .tax-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .tax-val { font-weight: 700; color: #0f172a; margin-top: 2px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    .data-table th, .data-table td { padding: 8px 10px; border: 1px solid #e2e8f0; text-align: left; }
    .data-table th { background: #f1f5f9; font-weight: 700; color: #334155; width: 30%; }
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="app-title">MicrobeClassify AI Diagnostic Dossier</div>
      <div class="doc-type">Microbiological Classification & Pathological Assessment</div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #64748b;">
      Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
    </div>
  </div>

  <div class="disclaimer-box">
    ⚠️ Educational use only. Not a medical diagnosis. (للاستخدام التعليمي فقط. ليس تشخيصاً طبياً)
  </div>

  <div>
    <span class="badge badge-confidence">${targetReport.confidenceScore}% Confidence</span>
    <span class="badge badge-group">Group: ${targetReport.microbeGroup}</span>
    <span class="badge badge-group">BSL: ${targetReport.clinicalOrEcologicalSignificance?.biosafetyLevel || 'BSL-1'}</span>
  </div>

  <div class="organism-name">${targetReport.scientificName}</div>
  <div class="common-name">
    Common Name: <strong>${targetReport.commonName}</strong>
    ${targetReport.strainOrGroup ? ' &bull; ' + targetReport.strainOrGroup : ''}
  </div>

  <div class="section-title">Taxonomic Classification Lineage</div>
  <div class="tax-grid">
    <div class="tax-card"><div class="tax-label">Domain</div><div class="tax-val">${targetReport.domain || 'N/A'}</div></div>
    <div class="tax-card"><div class="tax-label">Phylum</div><div class="tax-val">${targetReport.phylum || 'N/A'}</div></div>
    <div class="tax-card"><div class="tax-label">Class</div><div class="tax-val">${targetReport.classTaxon || 'N/A'}</div></div>
    <div class="tax-card"><div class="tax-label">Order</div><div class="tax-val">${targetReport.orderTaxon || 'N/A'}</div></div>
    <div class="tax-card"><div class="tax-label">Family</div><div class="tax-val">${targetReport.family || 'N/A'}</div></div>
    <div class="tax-card"><div class="tax-label">Genus</div><div class="tax-val">${targetReport.genus || 'N/A'}</div></div>
    <div class="tax-card"><div class="tax-label">Species</div><div class="tax-val">${targetReport.species || 'N/A'}</div></div>
    <div class="tax-card"><div class="tax-label">Group</div><div class="tax-val">${targetReport.microbeGroup || 'N/A'}</div></div>
  </div>

  <div class="section-title">Microscopic Morphology & Staining</div>
  <table class="data-table">
    <tr><th>Cellular Shape</th><td>${targetReport.morphology?.shape || 'N/A'}</td></tr>
    <tr><th>Arrangement</th><td>${targetReport.morphology?.arrangement || 'N/A'}</td></tr>
    <tr><th>Gram / Cell Wall Stain</th><td>${targetReport.morphology?.gramStatus || 'N/A'}</td></tr>
    <tr><th>Envelope Details</th><td>${targetReport.morphology?.cellWallStructure || 'N/A'}</td></tr>
    <tr><th>Dimensions</th><td>${targetReport.morphology?.dimensions || 'N/A'}</td></tr>
    <tr><th>Motility</th><td>${targetReport.morphology?.motility || 'N/A'}</td></tr>
    <tr><th>Endospore Formation</th><td>${targetReport.morphology?.sporeFormation || 'Non-sporing'}</td></tr>
  </table>

  <div class="section-title">Physiological & Biochemical Profile</div>
  <table class="data-table">
    <tr><th>Respiration / Oxygen</th><td>${targetReport.physiology?.respiration || 'N/A'}</td></tr>
    <tr><th>Trophic Mechanism</th><td>${targetReport.physiology?.trophicType || 'N/A'}</td></tr>
    <tr><th>Catalase Reaction</th><td>${targetReport.physiology?.catalase || 'N/A'}</td></tr>
    <tr><th>Oxidase Reaction</th><td>${targetReport.physiology?.oxidase || 'N/A'}</td></tr>
  </table>

  <div class="section-title">Clinical Pathology & Treatment Targets</div>
  <table class="data-table">
    <tr><th>Clinical Role</th><td>${targetReport.clinicalOrEcologicalSignificance?.clinicalRole || 'N/A'}</td></tr>
    <tr><th>Associated Pathology</th><td>${(targetReport.clinicalOrEcologicalSignificance?.associatedDiseases || []).join(', ') || 'None reported'}</td></tr>
    <tr><th>Virulence Factors</th><td>${(targetReport.clinicalOrEcologicalSignificance?.virulenceFactors || []).join(', ') || 'None reported'}</td></tr>
    <tr><th>Treatment / Control</th><td>${(targetReport.clinicalOrEcologicalSignificance?.treatmentOrControl || []).join(', ') || 'N/A'}</td></tr>
  </table>

  <div class="section-title">Confirmatory Diagnostic Workflow</div>
  <ul style="font-size: 12px; margin: 0 0 16px 20px;">
    ${(targetReport.diagnosticWorkflow || []).map((step) => `<li>${step}</li>`).join('')}
  </ul>

  <div class="footer">
    <div>MicrobeClassify AI Diagnostic Engine &bull; Bergey's Manual & ICTV Aligned</div>
    <div>Educational use only. Not a medical diagnosis.</div>
  </div>
</body>
</html>`;
  };

  // Download printable HTML report via Blob link
  const handleDownloadHtmlReport = () => {
    if (!report) return;
    try {
      const htmlContent = generateReportHtml(report);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.scientificName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Diagnostic_Report.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setSaveToast({
        message: isAr ? 'تم تنزيل تقرير التشخيص بنجاح!' : 'Report downloaded successfully!',
        type: 'success',
      });
    } catch (e) {
      console.error('Failed to download report', e);
      setSaveToast({
        message: isAr ? 'فشل تنزيل التقرير.' : 'Failed to download report file.',
        type: 'warning',
      });
    }
  };

  // Open report in new tab as fallback
  const handleOpenInNewTab = () => {
    if (!report) return;
    try {
      const htmlContent = generateReportHtml(report);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.warn('Could not open new tab, triggering download instead', e);
      handleDownloadHtmlReport();
    }
  };

  // Export PDF or Download handler
  const handleExportPdf = () => {
    // Attempt window.print(), but provide instant file download fallback because sandboxed iframes block window.print()
    handleDownloadHtmlReport();
  };

  // Microscope button handler with fuzzy matching
  const handleOpenMicroscopeForReport = () => {
    if (!report) return;
    const searchTarget = report.scientificName.trim().toLowerCase();
    const genusTarget = (report.genus || report.scientificName.split(' ')[0] || '').trim().toLowerCase();
    const commonTarget = report.commonName.trim().toLowerCase();

    // Fuzzy matching against encyclopedia
    const matched = MICROORGANISMS.find((m) => {
      const mSci = m.scientificName.toLowerCase();
      const mCommon = m.commonName.toLowerCase();
      const mGenus = (m.taxonomy.genus || m.scientificName.split(' ')[0] || '').toLowerCase();

      return (
        mSci === searchTarget ||
        mSci.includes(searchTarget) ||
        searchTarget.includes(mSci) ||
        (genusTarget && mGenus === genusTarget) ||
        (genusTarget && mSci.startsWith(genusTarget)) ||
        mCommon.includes(commonTarget) ||
        commonTarget.includes(mCommon)
      );
    });

    if (matched && onSelectKnownMicrobeName) {
      setMicroscopeNotFoundMsg(null);
      onSelectKnownMicrobeName(matched.scientificName);
    } else {
      setMicroscopeNotFoundMsg(
        isAr
          ? `هذا الكائن (${report.scientificName}) غير موجود في مكتبة المجهر بعد.`
          : 'This organism is not in the microscope library yet.'
      );
    }
  };

  const loadSampleSlide = (type: 'staph' | 'ecoli' | 'tb' | 'spores', title: string, note: string) => {
    const url = generateSampleSlideUrl(type);
    setSelectedImage(url);
    setImageNotes(note);
    setError(null);
  };

  const handleClassifyText = async (textToUse?: string) => {
    const text = textToUse || promptText;
    if (!text.trim()) {
      setError(
        isAr
          ? 'يرجى إدخال ملاحظات المختبر أو اختيار حالة سريرية جاهزة.'
          : 'Please enter lab findings or select a clinical vignette.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setTechnicalDetail(null);
    setReport(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('/api/gemini/classify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: text,
          specimenDetails: specimenOrigin,
        }),
      });

      clearTimeout(timeoutId);
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (json.statusCode || json.statusText) {
          setTechnicalDetail(`Status: ${json.statusCode || response.status} ${json.statusText || response.statusText || 'ERROR'}`);
        } else {
          setTechnicalDetail(`Status: ${response.status} ${response.statusText || 'ERROR'}`);
        }
        throw new Error(json.error || 'Failed to classify microorganism');
      }

      setReport(json.data);
    } catch (err: any) {
      console.error(err);
      let message = err?.message;
      if (err?.name === 'AbortError' || err?.message?.includes('Failed to fetch') || err instanceof TypeError) {
        message = isAr
          ? 'تعذر الوصول إلى خادم الذكاء الاصطناعي أو انتهت مهلة الاتصال. يرجى إعادة المحاولة.'
          : 'The diagnostic service took too long or the connection was interrupted. Please check your network and retry.';
        setTechnicalDetail('Network: Connection refused or timeout (Fetch failed)');
      }
      setError(message || 'Error communicating with classification model.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(isAr ? 'الملف المحدد ليس صورة صالحة.' : 'Selected file is not a valid image format.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError(
        isAr
          ? 'حجم الصورة يتجاوز 8 ميجابايت. يرجى اختيار صورة أصغر.'
          : 'Image exceeds 8 MB limit. Please select a smaller photo.'
      );
      return;
    }

    setError(null);
    try {
      const compressedDataUrl = await compressAndResizeImage(file);
      setSelectedImage(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error', err);
      setError(isAr ? 'فشل معالجة الصورة.' : 'Failed to process image file.');
    }
  };

  const handleClassifyImage = async () => {
    if (!selectedImage) {
      setError(isAr ? 'يرجى تحميل أو تحديد صورة شريحة مجهرية أولاً.' : 'Please select or upload a microscopic smear image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTechnicalDetail(null);
    setReport(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('/api/gemini/classify-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: 'image/jpeg',
          clinicalNotes: imageNotes,
        }),
      });

      clearTimeout(timeoutId);
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (json.statusCode || json.statusText) {
          setTechnicalDetail(`Status: ${json.statusCode || response.status} ${json.statusText || response.statusText || 'ERROR'}`);
        } else {
          setTechnicalDetail(`Status: ${response.status} ${response.statusText || 'ERROR'}`);
        }
        throw new Error(json.error || 'Failed to analyze microscopic image');
      }

      setReport(json.data);
    } catch (err: any) {
      console.error(err);
      let message = err?.message;
      if (err?.name === 'AbortError' || err?.message?.includes('Failed to fetch') || err instanceof TypeError) {
        message = isAr
          ? 'تعذر إرسال الصورة أو انتهت مهلة المعالجة. يرجى المحاولة بصورة أصغر أو اختيار عينة جاهزة.'
          : 'The image upload timed out or could not reach the server. Please retry with a smaller image or test one of the pre-loaded slide samples below.';
        setTechnicalDetail('Network: Connection refused or timeout (Fetch failed)');
      }
      setError(message || 'Error analyzing microscopic image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Priority 1 Item 1: Prominent Visible Disclaimer on AI Diagnostic Page */}
      <div className="bg-amber-500/10 border-2 border-amber-400/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              {isAr ? 'إخلاء مسؤولية أمان طبي' : 'Mandatory Scientific Notice'}
            </div>
            <div className="text-xs font-semibold text-amber-900">
              {isAr
                ? 'Educational use only. Not a medical diagnosis. (للاستخدام التعليمي فقط. ليس تشخيصاً طبياً)'
                : 'Educational use only. Not a medical diagnosis.'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedModal(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="View saved reports list"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-700" />
            {isAr ? `التقارير المحفوظة (${savedReports.length})` : `Saved Reports (${savedReports.length})`}
          </button>
        </div>
      </div>

      {/* Main Mode Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Gemini 3.8 Flash Diagnostic Intelligence
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAr ? 'نموذج التشخيص وتصنيف الميكروبات بالذكاء الاصطناعي' : 'AI Microorganism Diagnostic & Classification Model'}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {isAr
                ? 'تحليل الملاحظات السريرية، تفاعلات صبغة غرام، والفحوصات البيوكيميائية لتحديد وتصنيف الكائن الدقيق.'
                : 'Classifies microorganisms from laboratory observations, staining reactions, or slide images.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 self-start sm:self-center">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {isAr ? 'ملاحظات المختبر والسيناريوهات' : 'Lab Findings & Notes'}
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'image'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              {isAr ? 'صورة شريحة مجهرية' : 'Slide Image Classifier'}
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: Textual Lab Notes & Clinical Scenarios */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Input Form */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'مصدر العينة السريرية:' : 'Clinical Specimen Origin:'}
              </label>
              <input
                type="text"
                value={specimenOrigin}
                onChange={(e) => setSpecimenOrigin(e.target.value)}
                placeholder="e.g. Sputum, Blood culture, Peritoneal fluid, Stool, Wound"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAr ? 'الملاحظات الميكروبيولوجية ونتائج الفحوصات:' : 'Microbiological Observations & Diagnostic Test Notes:'}
              </label>
              <textarea
                rows={5}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter Gram stain reaction, morphology (shape, arrangement), colony appearance, oxygen requirements, catalase/oxidase, motility, or patient clinical history..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Grounded in Bergey's Manual of Systematic Bacteriology & ICTV Taxonomy.
              </span>
              <button
                onClick={() => handleClassifyText()}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white shadow-xs transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {isAr ? 'جاري التشخيص والتصنيف...' : 'Classifying Microorganism...'}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> {isAr ? 'تصنيف وتوليد التقرير' : 'Classify & Generate Profile'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Vignette Presets */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> {isAr ? 'حالات سريرية نموذجية معدة مسبقاً:' : 'Pre-loaded Diagnostic Vignettes:'}
            </h3>
            <div className="space-y-2">
              {SAMPLE_VIGNETTES.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptText(v.text);
                    handleClassifyText(v.text);
                  }}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    {v.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {v.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode B: Microscopic Image Classifier */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          {/* Quick Sample Microscopic Slides Gallery */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              {isAr ? 'عينات شرائح مجهرية جاهزة للاختبار الفوري:' : 'Instant Test Smear Presets (Click to load slide):'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() =>
                  loadSampleSlide(
                    'staph',
                    'Staphylococcus aureus',
                    '1000x oil immersion Gram stain: Gram-positive cocci in irregular grape-like clusters'
                  )
                }
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">S. aureus (MRSA)</div>
                <div className="text-[11px] text-purple-700 font-semibold">Gram+ cocci clusters</div>
              </button>
              <button
                onClick={() =>
                  loadSampleSlide(
                    'ecoli',
                    'Escherichia coli',
                    '1000x oil immersion Gram stain: Gram-negative pink rods, single and in pairs'
                  )
                }
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">Escherichia coli</div>
                <div className="text-[11px] text-rose-700 font-semibold">Gram- pink bacilli</div>
              </button>
              <button
                onClick={() =>
                  loadSampleSlide(
                    'tb',
                    'Mycobacterium tuberculosis',
                    'Ziehl-Neelsen acid-fast stain: Bright red fuchsia beaded bacilli on blue background'
                  )
                }
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">M. tuberculosis</div>
                <div className="text-[11px] text-red-700 font-semibold">Acid-Fast red rods</div>
              </button>
              <button
                onClick={() =>
                  loadSampleSlide(
                    'spores',
                    'Bacillus anthracis',
                    'Schaeffer-Fulton stain: Gram-positive bacilli with green oval endospores'
                  )
                }
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">Bacillus cereus / anthracis</div>
                <div className="text-[11px] text-emerald-700 font-semibold">Endospore former</div>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  {isAr ? 'صورة الشريحة المجهرية المعروضة:' : 'Active Microscopic Smear Slide:'}
                </label>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-blue-400 transition-colors bg-slate-50 min-h-[220px] flex items-center justify-center">
                  {selectedImage ? (
                    <div className="space-y-3 w-full">
                      <img
                        src={selectedImage}
                        alt="Microscopic smear preview"
                        className="max-h-56 mx-auto rounded-lg shadow-sm border border-slate-200 object-cover"
                      />
                      <div className="flex justify-center gap-3 text-xs">
                        <label className="cursor-pointer font-semibold text-blue-600 hover:underline">
                          {isAr ? 'تغيير الصورة' : 'Upload Another Photo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <span>•</span>
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="font-semibold text-slate-500 hover:text-rose-600"
                        >
                          {isAr ? 'إزالة' : 'Clear'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="text-xs font-semibold text-slate-700">
                        {isAr ? 'اسحب صورة المسحة المجهرية هنا أو انقر للاختيار' : 'Drop microscope slide photo here or click to browse'}
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Supports Gram stain, Acid-Fast, Giemsa blood smears, and TEM micrographs (JPEG, PNG).
                      </p>
                      <label className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs">
                        {isAr ? 'اختيار صورة' : 'Choose Local File'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Microscopic details note */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'ملاحظات التكبير والصبغة المجهرية:' : 'Microscope Objective / Staining Notes:'}
                  </label>
                  <input
                    type="text"
                    value={imageNotes}
                    onChange={(e) => setImageNotes(e.target.value)}
                    placeholder="e.g. 1000x oil immersion, Gram stain of blood culture"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  <div className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Multimodal Optical Evaluation:
                  </div>
                  Gemini 3.8 Flash assesses cell curvature, Gram stain color absorption (crystal violet vs safranin), clustering patterns, flagellar arrangements, and background debris to deduce the microbial species.
                </div>

                <button
                  onClick={handleClassifyImage}
                  disabled={isLoading || !selectedImage}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 text-white shadow-xs transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> {isAr ? 'جاري فحص المسحة المجهرية...' : 'Analyzing Microscopic Morphology...'}
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> {isAr ? 'تحليل الصورة وتصنيف الميكروب' : 'Analyze Slide & Classify Microbe'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="font-bold">{isAr ? 'خطأ في معالجة الطلب' : 'Classification Error'}</div>
            <div>{error}</div>
            {technicalDetail && (
              <div className="text-[11px] font-mono text-red-600/90 bg-red-100/60 rounded px-2 py-0.5 inline-block border border-red-200/60">
                {technicalDetail}
              </div>
            )}
          </div>
          <button
            onClick={() => (activeTab === 'image' ? handleClassifyImage() : handleClassifyText())}
            className="text-xs px-2.5 py-1 bg-white border border-red-300 rounded font-bold hover:bg-red-100 text-red-700 flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> {isAr ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* Priority 1 Item 1: Structured Diagnostic Report Output WITH EMBEDDED DISCLAIMER */}
      {report && (
        <div
          id="diagnostic-report-container"
          className="bg-white border-2 border-emerald-500/20 rounded-xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0"
        >
          {/* Priority 1 Item 1: REQUIRED DISCLAIMER IN EVERY GENERATED REPORT */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 text-xs text-amber-900 font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Educational use only. Not a medical diagnosis.</span>
            </span>
            <span className="text-[11px] text-amber-800 font-medium hidden sm:inline">
              Bergey's Manual & ICTV Aligned
            </span>
          </div>

          {/* Action Toolbar: Print / Save */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 print:hidden">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Classification Identified
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {report.confidenceScore}% Confidence
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={saveReportToStorage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                title="Save report to browser memory and local storage"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                {isAr ? 'حفظ التقرير' : 'Save Report'}
              </button>

              <button
                onClick={handleDownloadHtmlReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                title="Download printable HTML report file (guaranteed in sandboxed iframes)"
              >
                <Download className="w-3.5 h-3.5" />
                {isAr ? 'تنزيل ملف التقرير' : 'Download Report'}
              </button>

              <button
                onClick={handleOpenInNewTab}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
                title="Open print-friendly view in new tab / Print PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                {isAr ? 'تصدير / طباعة PDF' : 'Print / Export PDF'}
              </button>

              <button
                onClick={handleOpenMicroscopeForReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
                title="View organism in optical microscope simulator"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isAr ? 'المجهر' : 'Microscope'}
              </button>
            </div>
          </div>

          {/* Toast Notification Banner for Save / Download Feedback */}
          {saveToast && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs animate-in fade-in duration-200 ${
                saveToast.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : saveToast.type === 'warning'
                  ? 'bg-amber-50 border border-amber-300 text-amber-900'
                  : 'bg-blue-50 border border-blue-300 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveToast.message}</span>
              </div>
              <button
                onClick={() => setSaveToast(null)}
                className="text-xs opacity-60 hover:opacity-100 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Microscope Library Match Notification */}
          {microscopeNotFoundMsg && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{microscopeNotFoundMsg}</span>
              </div>
              <button
                onClick={() => setMicroscopeNotFoundMsg(null)}
                className="text-xs opacity-60 hover:opacity-100 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Report Identity Banner */}
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Taxonomic Binomial Nomenclature:
            </div>
            <h3 className="text-2xl font-bold text-slate-900 italic mt-0.5">
              {report.scientificName}
            </h3>
            <div className="text-sm font-medium text-slate-600">
              Common Name: <strong>{report.commonName}</strong>
              {report.strainOrGroup ? ` (${report.strainOrGroup})` : ''}
            </div>
          </div>

          {/* Full Taxonomic Lineage Hierarchy */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Biological Taxonomic Classification Hierarchy:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Domain</div>
                <div className="font-semibold text-slate-900 truncate" title={report.domain}>
                  {report.domain}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Phylum</div>
                <div className="font-semibold text-slate-900 truncate" title={report.phylum}>
                  {report.phylum || 'N/A'}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Class</div>
                <div className="font-semibold text-slate-900 truncate" title={report.classTaxon}>
                  {report.classTaxon || 'N/A'}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Order</div>
                <div className="font-semibold text-slate-900 truncate" title={report.orderTaxon}>
                  {report.orderTaxon || 'N/A'}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Family</div>
                <div className="font-semibold text-slate-900 truncate" title={report.family}>
                  {report.family || 'N/A'}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Genus</div>
                <div className="font-semibold text-slate-900 truncate" title={report.genus}>
                  {report.genus || 'N/A'}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Species</div>
                <div className="font-semibold text-slate-900 truncate" title={report.species}>
                  {report.species || 'N/A'}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Group</div>
                <div className="font-semibold text-slate-900 truncate" title={report.microbeGroup}>
                  {report.microbeGroup}
                </div>
              </div>
            </div>
          </div>

          {/* Morphological and Physiological Markers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cellular Morphology */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                Cellular Morphology & Envelope:
              </div>
              <div>
                <span className="text-slate-500">Gram Status:</span>{' '}
                <strong className="text-slate-900">{report.morphology.gramStatus}</strong>
              </div>
              <div>
                <span className="text-slate-500">Shape & Arrangement:</span>{' '}
                <strong className="text-slate-900">
                  {report.morphology.shape} ({report.morphology.arrangement})
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Dimensions:</span>{' '}
                <span className="text-slate-800 font-mono">{report.morphology.dimensions}</span>
              </div>
              <div>
                <span className="text-slate-500">Motility:</span>{' '}
                <span className="text-slate-800">{report.morphology.motility}</span>
              </div>
              <div>
                <span className="text-slate-500">Envelope / Cell Wall:</span>{' '}
                <span className="text-slate-700">{report.morphology.cellWallStructure}</span>
              </div>
            </div>

            {/* Physiology & Metabolism */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                Physiology & Biochemical Markers:
              </div>
              <div>
                <span className="text-slate-500">Respiration:</span>{' '}
                <strong className="text-slate-900">{report.physiology.respiration}</strong>
              </div>
              <div>
                <span className="text-slate-500">Trophic Type:</span>{' '}
                <span className="text-slate-800">{report.physiology.trophicType}</span>
              </div>
              <div>
                <span className="text-slate-500">Catalase:</span>{' '}
                <strong className="text-slate-900">{report.physiology.catalase}</strong>
              </div>
              <div>
                <span className="text-slate-500">Oxidase:</span>{' '}
                <strong className="text-slate-900">{report.physiology.oxidase}</strong>
              </div>
              <div>
                <span className="text-slate-500">Optimal Growth:</span>{' '}
                <span className="text-slate-700">
                  {report.physiology.optimalTemp || '37°C'}, pH {report.physiology.optimalPh || '7.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Significance & Virulence */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Clinical / Ecological Significance
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {report.clinicalOrEcologicalSignificance.biosafetyLevel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Clinical Role:</span>{' '}
                <span className="text-slate-800">
                  {report.clinicalOrEcologicalSignificance.clinicalRole}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Associated Pathologies:</span>{' '}
                <span className="text-slate-800">
                  {report.clinicalOrEcologicalSignificance.associatedDiseases.join(', ')}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Virulence Factors:</span>
                <div className="text-slate-600 mt-0.5">
                  {report.clinicalOrEcologicalSignificance.virulenceFactors.join(', ')}
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Therapeutic Targets & Control:</span>
                <div className="text-slate-600 mt-0.5">
                  {report.clinicalOrEcologicalSignificance.treatmentOrControl.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Differential Diagnosis Table */}
          {report.differentialDiagnosis && report.differentialDiagnosis.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Differential Diagnosis (Ruling Out Close Relatives):
              </h4>
              <div className="space-y-2">
                {report.differentialDiagnosis.map((diff, didx) => (
                  <div
                    key={didx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                      {didx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 italic">{diff.organismName}: </span>
                      <span className="text-slate-600">{diff.distinguishingFeatures}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Workflow & Recommended Lab Assays */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Confirmatory Diagnostic Workflow & Lab Assays:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {report.diagnosticWorkflow.map((step, sidx) => (
                <div key={sidx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-blue-600 mr-1.5">Step {sidx + 1}:</span>
                  <span className="text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Rationale */}
          <div className="text-xs text-slate-600 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <div className="font-semibold text-blue-950 mb-1">Taxonomic Rationale:</div>
            {report.classificationRationale}
          </div>

          {/* Report Footer Disclaimer */}
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>MicrobeClassify AI Diagnostic Report • Bergey's Manual & ICTV Aligned</span>
            <span className="font-semibold text-amber-700">Educational use only. Not a medical diagnosis.</span>
          </div>
        </div>
      )}

      {/* Saved Reports Drawer / Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {isAr ? 'تقارير الحالات المحفوظة' : 'Saved Diagnostic Reports'}
                </h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold px-2 py-1"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {savedReports.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {isAr ? 'لا توجد تقارير محفوظة.' : 'No saved diagnostic reports found.'}
                </div>
              ) : (
                savedReports.map((saved) => (
                  <div
                    key={saved.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 italic text-sm">
                        {saved.report.scientificName}
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" /> {saved.timestamp}
                        <span>•</span>
                        <span>{saved.specimenOrigin}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReport(saved.report);
                          setShowSavedModal(false);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                      >
                        {isAr ? 'عرض' : 'Load'}
                      </button>
                      <button
                        onClick={() => deleteSavedReport(saved.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Delete saved report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
