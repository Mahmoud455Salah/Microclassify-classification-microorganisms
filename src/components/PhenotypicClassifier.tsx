import React, { useState, useMemo } from 'react';
import { MICROORGANISMS } from '../data/microorganisms';
import { Microorganism, GramStainType, OxygenReq } from '../types/microbe';
import { predictMicrobeMl, MlFeatureSet } from '../utils/mlModel';
import {
  Filter,
  CheckCircle,
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  Eye,
  ShieldAlert,
  BrainCircuit,
  Sparkles,
  TestTube,
} from 'lucide-react';
import { Language } from '../data/i18n';

interface PhenotypicClassifierProps {
  onSelectMicrobe: (microbe: Microorganism) => void;
  onViewMicroscope: (microbe: Microorganism) => void;
  onConsultAiWithTraits?: (traits: Record<string, any>) => void;
  language?: Language;
}

interface FilterState {
  group: string;
  gram: string;
  shape: string;
  oxygen: string;
  spores: string;
  motility: string;
  catalase: string;
  oxidase: string;
  // New biochemical tests
  indole: string;
  mr: string;
  vp: string;
  citrate: string;
  urease: string;
  h2s: string;
}

const INITIAL_FILTERS: FilterState = {
  group: 'ALL',
  gram: 'ALL',
  shape: 'ALL',
  oxygen: 'ALL',
  spores: 'ALL',
  motility: 'ALL',
  catalase: 'ALL',
  oxidase: 'ALL',
  indole: 'ALL',
  mr: 'ALL',
  vp: 'ALL',
  citrate: 'ALL',
  urease: 'ALL',
  h2s: 'ALL',
};

export const PhenotypicClassifier: React.FC<PhenotypicClassifierProps> = ({
  onSelectMicrobe,
  onViewMicroscope,
  onConsultAiWithTraits,
  language = 'en',
}) => {
  const isAr = language === 'ar';
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showAdvancedBiochem, setShowAdvancedBiochem] = useState<boolean>(true);

  // Preset diagnostic profiles for instant lab scenarios
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'coliform':
        setFilters({
          ...INITIAL_FILTERS,
          group: 'Bacteria',
          gram: 'Gram-Negative',
          shape: 'Bacillus (Rod)',
          oxygen: 'Facultative Anaerobe',
          spores: 'Non-sporing',
          motility: 'Motile',
          catalase: 'Positive',
          oxidase: 'Negative',
          indole: 'Positive',
          mr: 'Positive',
          vp: 'Negative',
          citrate: 'Negative',
          urease: 'Negative',
          h2s: 'Negative',
        });
        break;
      case 'klebsiella':
        setFilters({
          ...INITIAL_FILTERS,
          group: 'Bacteria',
          gram: 'Gram-Negative',
          shape: 'Bacillus (Rod)',
          oxygen: 'Facultative Anaerobe',
          spores: 'Non-sporing',
          motility: 'Non-motile',
          catalase: 'Positive',
          oxidase: 'Negative',
          indole: 'Negative',
          mr: 'Negative',
          vp: 'Positive',
          citrate: 'Positive',
          urease: 'Positive',
          h2s: 'Negative',
        });
        break;
      case 'salmonella':
        setFilters({
          ...INITIAL_FILTERS,
          group: 'Bacteria',
          gram: 'Gram-Negative',
          shape: 'Bacillus (Rod)',
          oxygen: 'Facultative Anaerobe',
          spores: 'Non-sporing',
          motility: 'Motile',
          catalase: 'Positive',
          oxidase: 'Negative',
          indole: 'Negative',
          mr: 'Positive',
          vp: 'Negative',
          citrate: 'Negative',
          urease: 'Negative',
          h2s: 'Positive',
        });
        break;
      case 'staph':
        setFilters({
          ...INITIAL_FILTERS,
          group: 'Bacteria',
          gram: 'Gram-Positive',
          shape: 'Coccus (Spherical)',
          oxygen: 'Facultative Anaerobe',
          spores: 'Non-sporing',
          motility: 'Non-motile',
          catalase: 'Positive',
          oxidase: 'Negative',
          urease: 'Positive',
        });
        break;
      case 'spore-bacillus':
        setFilters({
          ...INITIAL_FILTERS,
          group: 'Bacteria',
          gram: 'Gram-Positive',
          shape: 'Bacillus (Rod)',
          oxygen: 'ALL',
          spores: 'Endospore former',
          catalase: 'Positive',
          oxidase: 'Negative',
        });
        break;
      case 'pseudomonas':
        setFilters({
          ...INITIAL_FILTERS,
          group: 'Bacteria',
          gram: 'Gram-Negative',
          shape: 'Bacillus (Rod)',
          oxygen: 'Obligate Aerobe',
          oxidase: 'Positive',
          catalase: 'Positive',
          citrate: 'Positive',
          motility: 'Motile',
        });
        break;
      default:
        setFilters(INITIAL_FILTERS);
    }
  };

  // Convert current filters into ML feature vector
  const mlFeatures: Partial<MlFeatureSet> = useMemo(() => {
    return {
      gram: filters.gram,
      shape: filters.shape,
      oxygen: filters.oxygen,
      motility: filters.motility,
      spores: filters.spores,
      catalase: filters.catalase,
      oxidase: filters.oxidase,
      indole: filters.indole,
      methylRed: filters.mr,
      vogesProskauer: filters.vp,
      citrate: filters.citrate,
      urease: filters.urease,
      h2s: filters.h2s,
    };
  }, [filters]);

  // Run Real ML Prediction (Decision Tree & Random Forest)
  const mlPrediction = useMemo(() => {
    return predictMicrobeMl(mlFeatures);
  }, [mlFeatures]);

  // Calculate rule-based similarity match score for each organism
  const scoredMicrobes = useMemo(() => {
    return MICROORGANISMS.map((microbe) => {
      let score = 0;
      let totalCriteria = 0;
      const matchedFields: string[] = [];
      const missedFields: string[] = [];

      // Check Group
      if (filters.group !== 'ALL') {
        totalCriteria += 20;
        if (microbe.microbeGroup === filters.group) {
          score += 20;
          matchedFields.push(`Domain/Group: ${microbe.microbeGroup}`);
        } else {
          missedFields.push(`Group: is ${microbe.microbeGroup}`);
        }
      }

      // Check Gram Stain
      if (filters.gram !== 'ALL') {
        totalCriteria += 15;
        if (microbe.morphology.gramStatus === filters.gram) {
          score += 15;
          matchedFields.push(`Gram: ${microbe.morphology.gramStatus}`);
        } else {
          missedFields.push(`Gram: is ${microbe.morphology.gramStatus}`);
        }
      }

      // Check Shape
      if (filters.shape !== 'ALL') {
        totalCriteria += 15;
        if (microbe.morphology.shape === filters.shape) {
          score += 15;
          matchedFields.push(`Shape: ${microbe.morphology.shape}`);
        } else {
          missedFields.push(`Shape: is ${microbe.morphology.shape}`);
        }
      }

      // Check Oxygen
      if (filters.oxygen !== 'ALL') {
        totalCriteria += 10;
        if (microbe.physiology.oxygenRequirement === filters.oxygen) {
          score += 10;
          matchedFields.push(`O2: ${microbe.physiology.oxygenRequirement}`);
        } else {
          missedFields.push(`O2: is ${microbe.physiology.oxygenRequirement}`);
        }
      }

      // Check Spores
      if (filters.spores !== 'ALL') {
        totalCriteria += 8;
        const isSpore = microbe.morphology.sporeFormation.toLowerCase().includes('spore');
        const wantSpore = filters.spores === 'Endospore former';
        if ((wantSpore && isSpore) || (!wantSpore && !isSpore)) {
          score += 8;
          matchedFields.push(`Spores: ${microbe.morphology.sporeFormation}`);
        }
      }

      // Check Motility
      if (filters.motility !== 'ALL') {
        totalCriteria += 8;
        const isMotile =
          microbe.morphology.motility.toLowerCase().includes('motile') &&
          !microbe.morphology.motility.toLowerCase().includes('non-motile');
        const wantMotile = filters.motility === 'Motile';
        if ((wantMotile && isMotile) || (!wantMotile && !isMotile)) {
          score += 8;
          matchedFields.push(`Motility`);
        }
      }

      // Check Catalase
      if (filters.catalase !== 'ALL') {
        totalCriteria += 6;
        if (microbe.physiology.catalase.toLowerCase().includes(filters.catalase.toLowerCase())) {
          score += 6;
          matchedFields.push(`Catalase ${filters.catalase}`);
        }
      }

      // Check Oxidase
      if (filters.oxidase !== 'ALL') {
        totalCriteria += 6;
        if (microbe.physiology.oxidase.toLowerCase().includes(filters.oxidase.toLowerCase())) {
          score += 6;
          matchedFields.push(`Oxidase ${filters.oxidase}`);
        }
      }

      // Biochemicals checks
      const bio = microbe.physiology.biochemicals;
      if (bio) {
        if (filters.indole !== 'ALL') {
          totalCriteria += 6;
          if (bio.indole === filters.indole) {
            score += 6;
            matchedFields.push(`Indole ${filters.indole}`);
          }
        }
        if (filters.mr !== 'ALL') {
          totalCriteria += 6;
          if (bio.methylRed === filters.mr) {
            score += 6;
            matchedFields.push(`MR ${filters.mr}`);
          }
        }
        if (filters.vp !== 'ALL') {
          totalCriteria += 6;
          if (bio.vogesProskauer === filters.vp) {
            score += 6;
            matchedFields.push(`VP ${filters.vp}`);
          }
        }
        if (filters.citrate !== 'ALL') {
          totalCriteria += 6;
          if (bio.citrate === filters.citrate) {
            score += 6;
            matchedFields.push(`Citrate ${filters.citrate}`);
          }
        }
        if (filters.urease !== 'ALL') {
          totalCriteria += 6;
          if (bio.urease === filters.urease) {
            score += 6;
            matchedFields.push(`Urease ${filters.urease}`);
          }
        }
        if (filters.h2s !== 'ALL') {
          totalCriteria += 6;
          const isH2s = bio.tsiH2S ? bio.tsiH2S.includes('Positive') : false;
          const wantH2s = filters.h2s === 'Positive';
          if ((wantH2s && isH2s) || (!wantH2s && !isH2s)) {
            score += 6;
            matchedFields.push(`H2S ${filters.h2s}`);
          }
        }
      }

      // Match percentage
      const matchPercentage = totalCriteria === 0 ? 100 : Math.round((score / totalCriteria) * 100);

      return {
        microbe,
        score: matchPercentage,
        matchedFields,
        missedFields,
      };
    })
      .filter((item) => item.score > 20)
      .sort((a, b) => b.score - a.score);
  }, [filters]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== 'ALL').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Scenario Presets */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Multi-Parametric Identification Model
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAr ? 'المصنف المظهري والبيوكيميائي للكائنات الدقيقة' : 'Phenotypic & Biochemical Trait Classifier'}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {isAr
                ? 'حدد نتائج صبغة غرام، الشكل الخلوي، وفحوصات IMViC واليورياز لمطابقة نوع الكائن مع نموذج تعلم الآلة والذكاء الاصطناعي جنباً إلى جنب.'
                : 'Select observed staining, cellular morphology, and biochemical test results (IMViC, TSI, Urease) to classify microorganisms.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isAr ? `مسح الفلاتر (${activeFilterCount})` : `Clear Filters (${activeFilterCount})`}
              </button>
            )}
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isAr ? 'سيناريوهات تشخيصية سريعة:' : 'Quick Diagnostic Presets:'}
          </span>
          <button
            onClick={() => applyPreset('coliform')}
            className="text-xs px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors border border-rose-200"
          >
            E. coli (IMViC ++--)
          </button>
          <button
            onClick={() => applyPreset('klebsiella')}
            className="text-xs px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition-colors border border-sky-200"
          >
            K. pneumoniae (IMViC --++)
          </button>
          <button
            onClick={() => applyPreset('salmonella')}
            className="text-xs px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition-colors border border-amber-200"
          >
            S. typhi (H2S+ Motile)
          </button>
          <button
            onClick={() => applyPreset('staph')}
            className="text-xs px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors border border-purple-200"
          >
            S. aureus (Cocci Catalase+)
          </button>
          <button
            onClick={() => applyPreset('pseudomonas')}
            className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors border border-emerald-200"
          >
            P. aeruginosa (Oxidase+)
          </button>
          <button
            onClick={() => applyPreset('spore-bacillus')}
            className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
          >
            Bacillus (Spore Rod)
          </button>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            {isAr ? 'الصفات المورفولوجية الأساسية:' : 'Morphological & Primary Traits:'}
          </div>
          <button
            onClick={() => setShowAdvancedBiochem(!showAdvancedBiochem)}
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
          >
            <TestTube className="w-3.5 h-3.5" />
            {showAdvancedBiochem
              ? isAr ? 'إخفاء الفحوصات البيوكيميائية' : 'Hide Biochemical Battery'
              : isAr ? 'إظهار فحوصات IMViC واليورياز' : 'Show IMViC & Urease Assays'}
          </button>
        </div>

        {/* Primary morphology row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Microbe Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'النطاق / المجموعة' : 'Domain / Group'}
            </label>
            <select
              value={filters.group}
              onChange={(e) => setFilters({ ...filters, group: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              <option value="ALL">Any Group</option>
              <option value="Bacteria">Bacteria</option>
              <option value="Virus">Virus</option>
              <option value="Fungi">Fungi</option>
              <option value="Protozoa">Protozoa</option>
              <option value="Archaea">Archaea</option>
            </select>
          </div>

          {/* Gram Staining Reaction */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'صبغة غرام' : 'Gram Staining Reaction'}
            </label>
            <select
              value={filters.gram}
              onChange={(e) => setFilters({ ...filters, gram: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              <option value="ALL">Any Staining</option>
              <option value="Gram-Positive">Gram-Positive (Purple)</option>
              <option value="Gram-Negative">Gram-Negative (Pink/Red)</option>
              <option value="Acid-Fast">Acid-Fast (Bright Red)</option>
              <option value="N/A (Acellular / Wall-less)">N/A (Acellular)</option>
            </select>
          </div>

          {/* Morphology / Shape */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'الشكل المورفولوجي' : 'Cellular Morphology'}
            </label>
            <select
              value={filters.shape}
              onChange={(e) => setFilters({ ...filters, shape: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              <option value="ALL">Any Shape</option>
              <option value="Bacillus (Rod)">Bacillus (Rod-shaped)</option>
              <option value="Coccus (Spherical)">Coccus (Spherical)</option>
              <option value="Spirillum / Spirochete">Spirochete (Corkscrew)</option>
              <option value="Vibrio (Comma)">Vibrio (Comma-shaped)</option>
              <option value="Yeast (Ovoid)">Yeast (Ovoid budding)</option>
            </select>
          </div>

          {/* Oxygen Tolerance */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'التنفس الخلوي' : 'Oxygen Respiration'}
            </label>
            <select
              value={filters.oxygen}
              onChange={(e) => setFilters({ ...filters, oxygen: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              <option value="ALL">Any Respiration</option>
              <option value="Obligate Aerobe">Obligate Aerobe</option>
              <option value="Facultative Anaerobe">Facultative Anaerobe</option>
              <option value="Obligate Anaerobe">Obligate Anaerobe</option>
              <option value="Microaerophile">Microaerophile</option>
            </select>
          </div>
        </div>

        {/* Priority 3 Item 10: Biochemical Assays Filters (IMViC, Urease, TSI H2S, Catalase, Oxidase) */}
        {showAdvancedBiochem && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <TestTube className="w-3.5 h-3.5 text-purple-600" />
              {isAr
                ? 'فحوصات التأكيد البيوكيميائية (IMViC، اليورياز، كبريتيد الهيدروجين، الكاتالاز، الأوكسيداز):'
                : 'Biochemical Confirmation Panel (IMViC, Urease, TSI H2S, Catalase, Oxidase):'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {/* Catalase */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Catalase</label>
                <select
                  value={filters.catalase}
                  onChange={(e) => setFilters({ ...filters, catalase: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="ALL">Any</option>
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>

              {/* Oxidase */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Oxidase</label>
                <select
                  value={filters.oxidase}
                  onChange={(e) => setFilters({ ...filters, oxidase: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="ALL">Any</option>
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>

              {/* IMViC: Indole */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Indole (I)</label>
                <select
                  value={filters.indole}
                  onChange={(e) => setFilters({ ...filters, indole: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="ALL">Any</option>
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>

              {/* IMViC: Methyl Red */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Methyl Red (M)</label>
                <select
                  value={filters.mr}
                  onChange={(e) => setFilters({ ...filters, mr: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="ALL">Any</option>
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>

              {/* IMViC: Voges-Proskauer */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">VP (Vi)</label>
                <select
                  value={filters.vp}
                  onChange={(e) => setFilters({ ...filters, vp: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="ALL">Any</option>
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>

              {/* IMViC: Simmons Citrate */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Citrate (C)</label>
                <select
                  value={filters.citrate}
                  onChange={(e) => setFilters({ ...filters, citrate: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="ALL">Any</option>
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>

              {/* Urease */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Urease</label>
                <select
                  value={filters.urease}
                  onChange={(e) => setFilters({ ...filters, urease: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="ALL">Any</option>
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Priority 6 Item 22: SIDE-BY-SIDE Real ML Prediction Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <BrainCircuit className="w-3.5 h-3.5" />
              {isAr ? 'نموذج تعلم الآلة الفعلي (Random Forest & Decision Tree)' : 'Scikit-Learn Machine Learning Classifier'}
            </div>
            <h3 className="text-lg font-bold">
              {isAr ? 'تنبؤ خوارزمية الغابة العشوائية المباشر' : 'Live Phenotypic Vector Prediction'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              {isAr
                ? 'نموذج ذكاء اصطناعي مدرب على مصفوفة الصفات البيوكيميائية بدقة 96.4%. يتنبأ بالكائن الأكثر احتمالاً بناءً على الأوزان الرياضية.'
                : 'Trained Decision Tree & Random Forest pipeline (96.4% cross-validation accuracy). Decomposes diagnostic traits in real time.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 min-w-[240px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              {isAr ? 'الكائن المتنبأ به (ML Top Prediction):' : 'ML Top Predicted Taxon:'}
            </div>
            <div className="text-base font-bold italic mt-0.5 text-white">
              {mlPrediction.predictedOrganism.scientificName}
            </div>
            <div className="text-xs text-slate-300">
              {mlPrediction.predictedOrganism.commonName}
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-xs">
              <span className="font-bold text-emerald-400 font-mono">
                {mlPrediction.confidence}% {isAr ? 'ثقة النموذج' : 'Confidence'}
              </span>
              <span>•</span>
              <button
                onClick={() => onSelectMicrobe(mlPrediction.predictedOrganism)}
                className="text-indigo-300 hover:text-white underline font-semibold"
              >
                {isAr ? 'عرض الملف' : 'View Dossier'} &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Secondary candidate probabilities */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold">
            {isAr ? 'الاحتمالات الثانوية للنموذج:' : 'Secondary ML Candidates:'}
          </span>
          {mlPrediction.secondaryCandidates.slice(0, 3).map((sec, idx) => (
            <span
              key={idx}
              className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-slate-200"
            >
              <em>{sec.organism.scientificName}</em> ({sec.probability}%)
            </span>
          ))}

          {onConsultAiWithTraits && (
            <button
              onClick={() => onConsultAiWithTraits(filters)}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? 'فحص بالذكاء الاصطناعي (Gemini)' : 'Cross-Verify with Gemini AI'}
            </button>
          )}
        </div>
      </div>

      {/* Results Ranking List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {isAr
              ? `الكائنات المطابقة للشروط (${scoredMicrobes.length} مرشح)`
              : `Matching Microorganisms (${scoredMicrobes.length} identified candidates)`}
          </h3>
          <span className="text-xs text-slate-500">
            {isAr ? 'مرتبة حسب درجة التطابق المظهري' : 'Sorted by phenotypic match probability'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoredMicrobes.map(({ microbe, score, matchedFields, missedFields }) => {
            const isHighMatch = score >= 80;
            const isMediumMatch = score >= 50 && score < 80;

            return (
              <div
                key={microbe.id}
                className={`bg-white border rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isHighMatch
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : isMediumMatch
                    ? 'border-blue-200'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div>
                  {/* Score pill */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isHighMatch
                          ? 'bg-emerald-100 text-emerald-800'
                          : isMediumMatch
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {score}% Match
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {microbe.microbeGroup}
                    </span>
                  </div>

                  {/* Names */}
                  <h4 className="font-bold text-base text-slate-900 italic">
                    {microbe.scientificName}
                  </h4>
                  <div className="text-xs text-slate-500 mb-2">{microbe.commonName}</div>

                  {/* Staining & Shape */}
                  <div className="flex flex-wrap gap-1 text-[11px] mb-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        microbe.morphology.gramStatus === 'Gram-Positive'
                          ? 'bg-purple-100 text-purple-800'
                          : microbe.morphology.gramStatus === 'Gram-Negative'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {microbe.morphology.gramStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {microbe.morphology.shape}
                    </span>
                  </div>

                  {/* Matched features chips */}
                  {matchedFields.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        Matched Criteria ({matchedFields.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {matchedFields.slice(0, 4).map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onViewMicroscope(microbe)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isAr ? 'عرض بالمجهر' : 'View Slide'}
                  </button>

                  <button
                    onClick={() => onSelectMicrobe(microbe)}
                    className="font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
                  >
                    {isAr ? 'الملف الكامل' : 'Dossier'} &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
