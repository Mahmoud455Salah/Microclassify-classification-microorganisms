import React, { useState } from 'react';
import { Microorganism } from '../types/microbe';
import { Language } from '../data/i18n';
import { exportMicrobePdf } from '../utils/exportMicrobePdf';
import {
  X,
  Eye,
  ShieldAlert,
  Dna,
  Bug,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Activity,
  Layers,
  FileDown,
  Check,
} from 'lucide-react';

interface MicrobeDetailModalProps {
  microbe: Microorganism | null;
  onClose: () => void;
  onViewMicroscope: (microbe: Microorganism) => void;
  onOpenAiChat?: (microbe: Microorganism) => void;
  language?: Language;
}

export const MicrobeDetailModal: React.FC<MicrobeDetailModalProps> = ({
  microbe,
  onClose,
  onViewMicroscope,
  onOpenAiChat,
  language = 'en',
}) => {
  const isAr = language === 'ar';
  const [qaQuestion, setQaQuestion] = useState<string>('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  if (!microbe) return null;

  const handleExportPdf = async () => {
    if (!microbe || isExportingPdf) return;
    setIsExportingPdf(true);
    setPdfSuccess(false);
    try {
      await exportMicrobePdf(microbe, language);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleAskQuestion = async (customPrompt?: string) => {
    const q = customPrompt || qaQuestion;
    if (!q.trim()) return;

    setIsAsking(true);
    setQaAnswer(null);

    try {
      const response = await fetch('/api/gemini/ask-microbe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          contextOrganism: `${microbe.scientificName} (${microbe.commonName}) - ${microbe.microbeGroup}`,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const techDetail = data.statusCode || data.statusText ? `\n[${data.statusCode || response.status} ${data.statusText || response.statusText || 'ERROR'}]` : `\n[${response.status} ${response.statusText || 'ERROR'}]`;
        if (data.errorType === 'MISSING_API_KEY') {
          throw new Error(`API key is not loaded on the server. Please check environment configuration.${techDetail}`);
        } else if (data.errorType === 'MODEL_UNAVAILABLE') {
          throw new Error(`The AI model is currently experiencing high demand. Please try again.${techDetail}`);
        } else if (data.errorType === 'QUOTA_EXCEEDED') {
          throw new Error(`Rate limit or quota reached. Please wait a moment before trying again.${techDetail}`);
        }
        throw new Error(`${data.error || 'Failed to query microbiology assistant.'}${techDetail}`);
      }

      setQaAnswer(data.answer);
    } catch (err: any) {
      console.error(err);
      let msg = err?.message || 'Unable to retrieve answer.';
      if (err?.name === 'TypeError' && err?.message?.includes('fetch')) {
        msg = 'Network connection to the AI service was interrupted. Please check your network and retry.\n[Network: Connection refused or timeout]';
      }
      setQaAnswer(`⚠️ ${msg}`);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Safety Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-300/40 px-5 py-2 text-xs text-amber-900 font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            Educational use only. Not a medical diagnosis.
          </span>
          <span className="text-[11px] text-amber-800 font-medium hidden sm:inline">
            Bergey's Manual & CDC/WHO Aligned
          </span>
        </div>

        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {microbe.microbeGroup}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                {microbe.cellularType}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                <ShieldAlert className="w-3 h-3 text-amber-700" />
                {microbe.pathology.biosafetyLevel}
              </span>
              {microbe.reviewed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Data
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  Unverified
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 italic">
              {microbe.scientificName}
            </h2>
            <div className="text-sm text-slate-600 font-medium">
              Common name: <strong>{microbe.commonName}</strong>
              {microbe.taxonomy.strainOrGroup ? ` • ${microbe.taxonomy.strainOrGroup}` : ''}
              {microbe.reviewedBy && (
                <span className="text-xs text-slate-500 ml-2">
                  (Reviewed by: {microbe.reviewedBy}, {microbe.reviewDate})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer ${
                pdfSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
              title={isAr ? 'تصدير تقرير PDF علمي شامل' : 'Export Full PDF Report'}
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : pdfSuccess ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <FileDown className="w-4 h-4 text-emerald-700" />
              )}
              <span>
                {isExportingPdf
                  ? (isAr ? 'جاري إنشاء PDF...' : 'Generating PDF...')
                  : pdfSuccess
                  ? (isAr ? 'تم تصدير PDF!' : 'PDF Downloaded!')
                  : (isAr ? 'تصدير تقرير PDF' : 'Export PDF Report')}
              </span>
            </button>
            <button
              onClick={() => {
                if (onOpenAiChat) {
                  onOpenAiChat(microbe);
                } else {
                  document.getElementById('modal-ai-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
              title={isAr ? 'اسأل الذكاء الاصطناعي عن هذه العينة' : 'Ask AI about this organism'}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAr ? 'اسأل الذكاء الاصطناعي عن هذه العينة' : 'Ask AI about this organism'}</span>
            </button>
            <button
              onClick={() => {
                onViewMicroscope(microbe);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-600" /> Optical Microscope
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prominent Top Banner: Ask AI About This Organism */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50 border-b border-blue-200/80 px-5 py-2.5 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{isAr ? 'استشارة الذكاء الاصطناعي المتخصص' : 'AI Organism Consultation'}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {isAr
                  ? `استفسر عن آليات المقاومة، مسارات الاستقلاب، أو الفحوصات لـ ${microbe.scientificName}`
                  : `Query cell wall structure, resistance mechanisms, or differential diagnosis for ${microbe.scientificName}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onOpenAiChat) {
                onOpenAiChat(microbe);
              } else {
                document.getElementById('modal-ai-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isAr ? 'اسأل الذكاء الاصطناعي عن هذه العينة' : 'Ask AI about this organism'} &rarr;</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Quick PDF Dossier Export Banner */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 border border-emerald-200/90 rounded-xl p-3.5 flex items-center justify-between gap-3 flex-wrap shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{isAr ? 'تصدير التقرير التشخيصي الكامل (PDF)' : 'Full Scientific Specimen Dossier (PDF)'}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {isAr ? 'التصنيف + الصور + البيانات' : 'Data • Images • Taxonomy'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isAr
                    ? `تصدير تقرير رسمي يتضمن المخطط التصنيفي الثماني، المحاكاة المجهرية بدقة عالية، الفحوصات الكيميائية الحيوية، وحساسية المضادات الحيوية.`
                    : `Generate a complete PDF report with 8-tier taxonomic lineage, high-res ocular micrograph, biochemical profile, and AST data.`}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                pdfSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : pdfSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isExportingPdf
                  ? (isAr ? 'جاري التصدير...' : 'Exporting...')
                  : pdfSuccess
                  ? (isAr ? 'تم حفظ التقرير!' : 'Report Saved!')
                  : (isAr ? 'تصدير تقرير PDF' : 'Export PDF Report')}
              </span>
            </button>
          </div>

          {/* Complete 8-Tier Taxonomic Hierarchy Lineage */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Formal Taxonomic Hierarchy Lineage
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-center">
              {[
                { rank: 'Domain', val: microbe.taxonomy.domain },
                { rank: 'Kingdom', val: microbe.taxonomy.kingdom },
                { rank: 'Phylum', val: microbe.taxonomy.phylum },
                { rank: 'Class', val: microbe.taxonomy.classTaxon },
                { rank: 'Order', val: microbe.taxonomy.orderTaxon },
                { rank: 'Family', val: microbe.taxonomy.family },
                { rank: 'Genus', val: microbe.taxonomy.genus, italic: true },
                { rank: 'Species', val: microbe.taxonomy.species, italic: true },
              ].map((t, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{t.rank}</div>
                  <div className={`font-semibold text-slate-900 truncate mt-0.5 ${t.italic ? 'italic' : ''}`} title={t.val}>
                    {t.val || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Morphology & Cell Wall Biochemistry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-purple-600" /> Morphological & Structural Architecture
              </h4>
              <div className="space-y-2 text-slate-700">
                <div>
                  <span className="text-slate-500">Shape & Arrangement:</span>{' '}
                  <strong>{microbe.morphology.shape}</strong> ({microbe.morphology.arrangement})
                </div>
                <div>
                  <span className="text-slate-500">Gram Stain Reaction:</span>{' '}
                  <span className="font-bold text-purple-700">{microbe.morphology.gramStatus}</span>
                </div>
                <div>
                  <span className="text-slate-500">Size / Dimensions:</span>{' '}
                  <span className="font-mono font-medium">{microbe.morphology.dimensions}</span>
                </div>
                <div>
                  <span className="text-slate-500">Motility:</span> {microbe.morphology.motility}
                </div>
                <div>
                  <span className="text-slate-500">Spore Formation:</span> {microbe.morphology.sporeFormation}
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-semibold">Cell Envelope Chemistry:</span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                    {microbe.morphology.cellWallStructure}
                  </p>
                </div>
              </div>
            </div>

            {/* Physiology and Metabolic Profile */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Physiological & Metabolic Markers
              </h4>
              <div className="space-y-2 text-slate-700">
                <div>
                  <span className="text-slate-500">Oxygen Requirement:</span>{' '}
                  <strong>{microbe.physiology.oxygenRequirement}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Nutritional Trophic Mode:</span>{' '}
                  {microbe.physiology.trophicType}
                </div>
                <div>
                  <span className="text-slate-500">Catalase:</span>{' '}
                  <span className="font-bold">{microbe.physiology.catalase}</span> •{' '}
                  <span className="text-slate-500">Oxidase:</span>{' '}
                  <span className="font-bold">{microbe.physiology.oxidase}</span>
                </div>
                <div>
                  <span className="text-slate-500">Growth Optimum:</span>{' '}
                  {microbe.physiology.optimalTemp} • pH {microbe.physiology.optimalPh}
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-1 font-semibold">Diagnostic Biochemical Milestones:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {microbe.physiology.uniqueMetabolicFeatures.map((feat, fidx) => (
                      <li key={fidx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Significance, Virulence & Antimicrobial Targets */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Clinical Pathology, Virulence & Antimicrobials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Pathological Syndromes:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                  {microbe.pathology.diseases.map((d, didx) => (
                    <li key={didx}>{d}</li>
                  ))}
                </ul>

                <span className="font-semibold text-slate-700 block mt-3 mb-1">Virulence Factors:</span>
                <p className="text-slate-600 leading-relaxed">
                  {microbe.pathology.virulenceFactors.join('; ')}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Therapeutic Targets / Susceptibilities:</span>
                <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-amber-200">
                  {microbe.pathology.treatmentTargets.join(', ')}
                </p>

                {microbe.pathology.antibioticSensitivity && (
                  <p className="text-amber-800 text-[11px] mt-2 italic">
                    Resistance note: {microbe.pathology.antibioticSensitivity.join(' ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Criteria & Culture Media */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Definitive Diagnostic Criteria & Culture Media
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {microbe.diagnosticCriteria.map((crit, cidx) => (
                <div key={cidx} className="bg-white p-2 rounded border border-slate-200 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    ✓
                  </span>
                  <span className="text-slate-700">{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Biochemical Profile Panel */}
          {microbe.physiology.biochemicals && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" /> Standard Biochemical Profile (IMViC, Urease & TSI)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Indole</div>
                  <div className="font-bold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.indole}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Methyl Red</div>
                  <div className="font-bold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.methylRed}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Voges-Proskauer</div>
                  <div className="font-bold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.vogesProskauer}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Citrate</div>
                  <div className="font-bold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.citrate}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Urease</div>
                  <div className="font-bold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.urease}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">TSI Slant</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.tsiSlant}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">TSI Butt</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.tsiButt}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">H2S Production</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.tsiH2S}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Gas Production</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.tsiGas}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">SIM Motility</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{microbe.physiology.biochemicals.motilitySim}</div>
                </div>
              </div>
            </div>
          )}

          {/* Kirby-Bauer Antibiotic Susceptibility Table */}
          {microbe.pathology.susceptibilityProfile && microbe.pathology.susceptibilityProfile.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" /> CLSI Kirby-Bauer Antibiotic Susceptibility Profile
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="p-2 font-bold">Antimicrobial Agent</th>
                      <th className="p-2 font-bold">Disk Content</th>
                      <th className="p-2 font-bold">Inhibition Zone (mm)</th>
                      <th className="p-2 font-bold">Interpretation</th>
                      <th className="p-2 font-bold">Mechanism of Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {microbe.pathology.susceptibilityProfile.map((s, sidx) => (
                      <tr key={sidx} className="hover:bg-slate-50/50">
                        <td className="p-2 font-bold text-slate-900">{s.antibiotic}</td>
                        <td className="p-2 font-mono text-slate-600">{s.diskContent}</td>
                        <td className="p-2 font-mono font-bold text-slate-900">{s.zoneDiameterMm} mm</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              s.interpretation === 'Sensitive'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.interpretation === 'Resistant'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {s.interpretation}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600">{s.mechanism || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sources and Literature Citations */}
          {microbe.sources && microbe.sources.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Scientific References & Citations:
              </h4>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                {microbe.sources.map((src, idx) => (
                  <li key={idx}>{src}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ecology and Biotechnology Utility */}
          <div className="text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Ecological Role & Industrial Application:
            </span>
            <p className="leading-relaxed">{microbe.ecologicalOrIndustrialRole}</p>
          </div>

          {/* Ask Gemini Microbiology Assistant on this Specimen */}
          <div id="modal-ai-section" className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Ask AI About {microbe.scientificName}
            </div>
            <p className="text-slate-600 mb-3">
              Ask deep questions about this organism's molecular genetics, cell wall biosynthesis, antibiotic mechanisms, or clinical diagnosis.
            </p>

            {/* Quick Question Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                onClick={() =>
                  handleAskQuestion(`How do antibiotics target the cell wall of ${microbe.scientificName}?`)
                }
                className="text-[11px] px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded border border-blue-200"
              >
                Antibiotic targets?
              </button>
              <button
                onClick={() =>
                  handleAskQuestion(`What are the key virulence mechanisms of ${microbe.scientificName}?`)
                }
                className="text-[11px] px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded border border-blue-200"
              >
                Virulence factors?
              </button>
              <button
                onClick={() =>
                  handleAskQuestion(`How do I distinguish ${microbe.scientificName} from other related species in the lab?`)
                }
                className="text-[11px] px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded border border-blue-200"
              >
                Differential laboratory diagnosis?
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder={`Ask any scientific question about ${microbe.scientificName}...`}
                className="flex-1 text-xs bg-white border border-blue-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={isAsking}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Ask AI
              </button>
            </div>

            {qaAnswer && (
              <div className="mt-3 p-3.5 bg-white rounded-lg border border-blue-200 text-slate-800 text-xs leading-relaxed whitespace-pre-line shadow-xs">
                {qaAnswer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
