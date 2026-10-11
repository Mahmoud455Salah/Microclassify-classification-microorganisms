import React, { useState, useMemo } from 'react';
import { MICROORGANISMS } from '../data/microorganisms';
import { Microorganism, MicrobeGroup, GramStainType } from '../types/microbe';
import {
  Search,
  Eye,
  BookOpen,
  Filter,
  ShieldAlert,
  ArrowRight,
  Columns3,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Language } from '../data/i18n';

interface MicrobeEncyclopediaProps {
  onSelectMicrobe: (microbe: Microorganism) => void;
  onViewMicroscope: (microbe: Microorganism) => void;
  onCompareMicrobe: (microbe: Microorganism) => void;
  language?: Language;
}

export const MicrobeEncyclopedia: React.FC<MicrobeEncyclopediaProps> = ({
  onSelectMicrobe,
  onViewMicroscope,
  onCompareMicrobe,
  language = 'en',
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedGram, setSelectedGram] = useState<string>('ALL');
  const [selectedBsl, setSelectedBsl] = useState<string>('ALL');
  const [onlyReviewed, setOnlyReviewed] = useState<boolean>(false);

  // Filtered microorganisms
  const filteredMicrobes = useMemo(() => {
    return MICROORGANISMS.filter((m) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.scientificName.toLowerCase().includes(q) ||
        m.commonName.toLowerCase().includes(q) ||
        m.taxonomy.phylum.toLowerCase().includes(q) ||
        m.morphology.shape.toLowerCase().includes(q) ||
        m.pathology.diseases.some((d) => d.toLowerCase().includes(q)) ||
        m.pathology.virulenceFactors.some((v) => v.toLowerCase().includes(q));

      // Group
      const matchesGroup =
        selectedGroup === 'ALL' ||
        m.microbeGroup === selectedGroup ||
        (selectedGroup === 'Helminths' && (m.microbeGroup === 'Helminths' || m.microbeGroup === 'Helminth'));

      // Gram
      const matchesGram = selectedGram === 'ALL' || m.morphology.gramStatus === selectedGram;

      // BSL
      const matchesBsl = selectedBsl === 'ALL' || m.pathology.biosafetyLevel === selectedBsl;

      // Reviewed status
      const matchesReviewed = !onlyReviewed || m.reviewed === true;

      return matchesSearch && matchesGroup && matchesGram && matchesBsl && matchesReviewed;
    });
  }, [searchQuery, selectedGroup, selectedGram, selectedBsl, onlyReviewed]);

  // Group counters
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Bacteria: 0,
      Virus: 0,
      Fungi: 0,
      Protozoa: 0,
      Helminths: 0,
      Archaea: 0,
    };
    MICROORGANISMS.forEach((m) => {
      const grp = m.microbeGroup === 'Helminth' ? 'Helminths' : m.microbeGroup;
      if (counts[grp] !== undefined) {
        counts[grp]++;
      }
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner and Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
              <BookOpen className="w-3.5 h-3.5" /> Curated Taxa Repository
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAr ? 'موسوعة وقاعدة بيانات الكائنات الحية الدقيقة' : 'Microorganism Encyclopedia & Taxonomy Database'}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {isAr
                ? `استكشف ملفات شاملة وموثقة لـ ${MICROORGANISMS.length} كائناً دقيقاً عبر البكتيريا، الفيروسات، الفطريات، والأوليات.`
                : `Explore profiles for ${MICROORGANISMS.length} representative microorganisms across Bacteria, Viruses, Fungi, Protists, and Archaea.`}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث بالاسم العلمي، المرض، الشكل...' : 'Search by taxon, disease, shape...'}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedGroup('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              selectedGroup === 'ALL'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'جميع الكائنات' : 'All Taxa'} ({MICROORGANISMS.length})
          </button>
          {(['Bacteria', 'Virus', 'Fungi', 'Protozoa', 'Helminths', 'Archaea'] as (MicrobeGroup | 'Helminths')[]).map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                selectedGroup === grp
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grp} ({groupCounts[grp] || 0})
            </button>
          ))}
        </div>

        {/* Detailed Secondary Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">{isAr ? 'صبغة غرام:' : 'Gram Staining:'}</span>
            <select
              value={selectedGram}
              onChange={(e) => setSelectedGram(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium"
            >
              <option value="ALL">All Stains</option>
              <option value="Gram-Positive">Gram-Positive (Purple)</option>
              <option value="Gram-Negative">Gram-Negative (Pink)</option>
              <option value="Acid-Fast">Acid-Fast (Red)</option>
              <option value="N/A (Acellular / Wall-less)">N/A / Acellular</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">{isAr ? 'مستوى السلامة:' : 'Biosafety Level:'}</span>
            <select
              value={selectedBsl}
              onChange={(e) => setSelectedBsl(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium"
            >
              <option value="ALL">All BSL Levels</option>
              <option value="BSL-1">BSL-1 (Minimal risk)</option>
              <option value="BSL-2">BSL-2 (Moderate pathogen)</option>
              <option value="BSL-3">BSL-3 (Aerosol / Severe)</option>
              <option value="BSL-4">BSL-4 (Maximum containment)</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-slate-700 font-medium cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={onlyReviewed}
              onChange={(e) => setOnlyReviewed(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{isAr ? 'البيانات المراجعة والمحققة فقط' : 'Peer-Reviewed Only'}</span>
          </label>

          {(selectedGroup !== 'ALL' || selectedGram !== 'ALL' || selectedBsl !== 'ALL' || onlyReviewed || searchQuery) && (
            <button
              onClick={() => {
                setSelectedGroup('ALL');
                setSelectedGram('ALL');
                setSelectedBsl('ALL');
                setOnlyReviewed(false);
                setSearchQuery('');
              }}
              className="text-blue-600 hover:underline font-medium text-xs ml-auto"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Grid of Microorganism Cards */}
      {filteredMicrobes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-800">
            {isAr ? 'لا توجد كائنات تطابق الفلتر' : 'No microorganisms match the filter'}
          </h3>
          <p className="text-xs mt-1">
            {isAr ? 'حاول تعديل شروط البحث أو مسح الفلاتر.' : 'Try adjusting the search query or clearing filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMicrobes.map((microbe) => {
            const isHighSafety =
              microbe.pathology.biosafetyLevel === 'BSL-3' || microbe.pathology.biosafetyLevel === 'BSL-4';

            return (
              <div
                key={microbe.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {microbe.microbeGroup}
                      </span>
                      {microbe.reviewed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {isAr ? 'مراجَع' : 'Reviewed'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {isAr ? 'قيد المراجعة' : 'Unverified'}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isHighSafety ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      {microbe.pathology.biosafetyLevel}
                    </span>
                  </div>

                  {/* Scientific & Common Names */}
                  <h3 className="text-lg font-bold text-slate-900 italic group-hover:text-blue-700 transition-colors">
                    {microbe.scientificName}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium mb-3">
                    {microbe.commonName}
                  </div>

                  {/* Morphological pill row */}
                  <div className="flex flex-wrap gap-1 text-[11px] mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold ${
                        microbe.morphology.gramStatus === 'Gram-Positive'
                          ? 'bg-purple-100 text-purple-800'
                          : microbe.morphology.gramStatus === 'Gram-Negative'
                          ? 'bg-rose-100 text-rose-800'
                          : microbe.morphology.gramStatus === 'Acid-Fast'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {microbe.morphology.gramStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {microbe.morphology.shape}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {microbe.physiology.oxygenRequirement}
                    </span>
                  </div>

                  {/* Clinical diseases or role */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {microbe.pathology.clinicalRole === 'Primary Pathogen' ||
                    microbe.pathology.clinicalRole === 'Opportunistic Pathogen' ? (
                      <span>
                        <strong className="text-slate-800">Associated Conditions: </strong>
                        {microbe.pathology.diseases.slice(0, 3).join(', ')}
                      </span>
                    ) : (
                      <span>{microbe.ecologicalOrIndustrialRole}</span>
                    )}
                  </p>

                  {/* Sources tag */}
                  {microbe.sources && microbe.sources.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3" />
                      <span>
                        {microbe.sources.length} {isAr ? 'مراجع معتمدة' : 'Authoritative References'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewMicroscope(microbe)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700 font-medium"
                      title="View under optical microscope simulator"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isAr ? 'مجهر' : 'Microscope'}
                    </button>
                    <button
                      onClick={() => onCompareMicrobe(microbe)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700 font-medium"
                      title="Add to side-by-side comparison bench"
                    >
                      <Columns3 className="w-3.5 h-3.5" />
                      {isAr ? 'مقارنة' : 'Compare'}
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectMicrobe(microbe)}
                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:text-blue-800"
                  >
                    {isAr ? 'الملف الكامل' : 'Full Dossier'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
