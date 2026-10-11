import React, { useState } from 'react';
import { MICROORGANISMS } from './data/microorganisms';
import { Microorganism } from './types/microbe';
import { MicroscopeViewer } from './components/MicroscopeViewer';
import { DichotomousKeyView } from './components/DichotomousKeyView';
import { PhenotypicClassifier } from './components/PhenotypicClassifier';
import { AiDiagnosticModel } from './components/AiDiagnosticModel';
import { VirtualStainLab } from './components/VirtualStainLab';
import { AntibioticSusceptibility } from './components/AntibioticSusceptibility';
import { QuizMode } from './components/QuizMode';
import { MlClassifierDashboard } from './components/MlClassifierDashboard';
import { MicrobeComparator } from './components/MicrobeComparator';
import { MicrobeEncyclopedia } from './components/MicrobeEncyclopedia';
import { MicrobeDetailModal } from './components/MicrobeDetailModal';
import { AskAiFloatingChat } from './components/AskAiFloatingChat';
import { Language, TRANSLATIONS } from './data/i18n';
import {
  Eye,
  GitBranch,
  SlidersHorizontal,
  Sparkles,
  FlaskConical,
  Columns3,
  BookOpen,
  Microscope,
  ShieldAlert,
  BrainCircuit,
  GraduationCap,
  Disc3,
  Languages,
  Menu,
  X,
} from 'lucide-react';

type NavigationTab =
  | 'microscope'
  | 'ai-classifier'
  | 'phenotypic'
  | 'kirby-bauer'
  | 'virtual-lab'
  | 'quiz'
  | 'ml-pipeline'
  | 'dichotomous'
  | 'comparator'
  | 'encyclopedia';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<NavigationTab>('microscope');
  const [selectedMicrobe, setSelectedMicrobe] = useState<Microorganism>(MICROORGANISMS[0]); // E. coli
  const [modalMicrobe, setModalMicrobe] = useState<Microorganism | null>(null);
  const [comparatorInitialId, setComparatorInitialId] = useState<string>('escherichia-coli');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [chatContextMicrobe, setChatContextMicrobe] = useState<Microorganism | null>(null);

  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // Open Ask AI Chat directly with an optional context organism
  const handleOpenAiChat = (microbe?: Microorganism) => {
    if (microbe) {
      setChatContextMicrobe(microbe);
    }
    setIsAiChatOpen(true);
  };

  // Quick switch and view in microscope
  const handleViewInMicroscope = (microbe: Microorganism) => {
    setSelectedMicrobe(microbe);
    setActiveTab('microscope');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open modal detail dossier
  const handleOpenDetailModal = (microbe: Microorganism) => {
    setModalMicrobe(microbe);
  };

  // Compare microbe
  const handleCompareMicrobe = (microbe: Microorganism) => {
    setComparatorInitialId(microbe.id);
    setActiveTab('comparator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find microbe by scientific name or fuzzy match (genus or species)
  const handleSelectMicrobeByName = (name: string) => {
    if (!name) return;
    const target = name.trim().toLowerCase();
    const parts = target.split(/\s+/).filter(Boolean);
    const genus = parts[0] || '';

    const found = MICROORGANISMS.find((m) => {
      const mSci = m.scientificName.toLowerCase();
      const mCommon = m.commonName.toLowerCase();
      const mGenus = (m.taxonomy.genus || m.scientificName.split(' ')[0] || '').toLowerCase();

      return (
        mSci === target ||
        mSci.includes(target) ||
        target.includes(mSci) ||
        mCommon.includes(target) ||
        target.includes(mCommon) ||
        (genus.length >= 3 && (mGenus === genus || mSci.startsWith(genus))) ||
        parts.some((p) => p.length >= 4 && (mSci.includes(p) || mCommon.includes(p)))
      );
    });

    if (found) {
      handleViewInMicroscope(found);
    }
  };

  const navItems = [
    { id: 'microscope', label: t.navMicroscope, icon: Eye },
    { id: 'ai-classifier', label: t.navAiClassifier, icon: Sparkles, badge: 'Gemini' },
    { id: 'phenotypic', label: t.navPhenotypic, icon: SlidersHorizontal },
    { id: 'kirby-bauer', label: t.navKirbyBauer, icon: Disc3, badge: 'AST' },
    { id: 'virtual-lab', label: t.navVirtualLab, icon: FlaskConical },
    { id: 'quiz', label: t.navQuiz, icon: GraduationCap },
    { id: 'ml-pipeline', label: t.navMlClassifier, icon: BrainCircuit, badge: 'ML' },
    { id: 'dichotomous', label: t.navDichotomous, icon: GitBranch },
    { id: 'comparator', label: t.compare, icon: Columns3 },
    { id: 'encyclopedia', label: t.navEncyclopedia, icon: BookOpen },
  ];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-100/80 text-slate-900 font-sans antialiased flex flex-col"
    >
      {/* Priority 1 Item 1: Top Mandatory Educational Disclaimer Banner */}
      <div className="bg-amber-500/15 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{t.disclaimerBanner}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-amber-800 font-medium">
            <span>Bergey's Manual of Systematic Bacteriology</span>
            <span>•</span>
            <span>ICTV & CLSI Breakpoints</span>
          </div>
        </div>
      </div>

      {/* Top Scientific Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                  {t.appName}
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 hidden sm:inline">
                    Taxonomy & Diagnostic Model
                  </span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Language Switcher and Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
              >
                <Languages className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'English' : 'العربية (AR)'}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Quick Specimen Chips Bar */}
          <div className="py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] shrink-0">
              {t.quickSpecimens}
            </span>
            {[
              { id: 'escherichia-coli', label: 'E. coli' },
              { id: 'staphylococcus-aureus', label: 'S. aureus (MRSA)' },
              { id: 'mycobacterium-tuberculosis', label: 'M. tuberculosis' },
              { id: 'klebsiella-pneumoniae', label: 'K. pneumoniae (ESBL)' },
              { id: 'salmonella-typhi', label: 'S. typhi (H2S+)' },
              { id: 'pseudomonas-aeruginosa', label: 'P. aeruginosa' },
              { id: 'bacillus-anthracis', label: 'B. anthracis' },
              { id: 'candida-auris', label: 'C. auris' },
              { id: 'sars-cov-2', label: 'SARS-CoV-2' },
              { id: 'giardia-lamblia', label: 'Giardia' },
            ].map((item) => {
              const microbe = MICROORGANISMS.find((m) => m.id === item.id);
              if (!microbe) return null;
              const isSelected = selectedMicrobe.id === item.id && activeTab === 'microscope';

              return (
                <button
                  key={item.id}
                  onClick={() => handleViewInMicroscope(microbe)}
                  className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex space-x-1 overflow-x-auto py-1 border-t border-slate-100 no-scrollbar">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as NavigationTab)}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-3 space-y-1 shadow-lg animate-in slide-in-from-top duration-150">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as NavigationTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Tab 1: Virtual Optical Microscope Simulator */}
        {activeTab === 'microscope' && (
          <div className="space-y-6">
            <MicroscopeViewer microbe={selectedMicrobe} />

            {/* Specimen Quick Selector Cards */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {isAr ? 'تحديد شريحة العينة المعروضة:' : 'Select Specimen Slide for Microscope Field:'}
                </h3>
                <button
                  onClick={() => handleOpenDetailModal(selectedMicrobe)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {isAr ? 'عرض الملف العلمي الكامل' : 'View Full Scientific Dossier'} &rarr;
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {MICROORGANISMS.slice(0, 18).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMicrobe(m)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedMicrobe.id === m.id
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{m.microbeGroup}</div>
                    <div className="text-xs font-bold text-slate-900 italic truncate" title={m.scientificName}>
                      {m.scientificName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{m.morphology.shape}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Diagnostic Model (Gemini 3.8 Flash) */}
        {activeTab === 'ai-classifier' && (
          <AiDiagnosticModel
            onSelectKnownMicrobeName={handleSelectMicrobeByName}
            language={language}
          />
        )}

        {/* Tab 3: Multi-Parametric Phenotypic Classifier */}
        {activeTab === 'phenotypic' && (
          <PhenotypicClassifier
            onSelectMicrobe={handleOpenDetailModal}
            onViewMicroscope={handleViewInMicroscope}
            onConsultAiWithTraits={(_traits) => setActiveTab('ai-classifier')}
            language={language}
          />
        )}

        {/* Tab 4: Kirby-Bauer Antibiotic Susceptibility Testing */}
        {activeTab === 'kirby-bauer' && <AntibioticSusceptibility />}

        {/* Tab 5: Virtual Gram Stain Lab & Biochemical Tests (IMViC, Urease, TSI, SIM) */}
        {activeTab === 'virtual-lab' && <VirtualStainLab />}

        {/* Tab 6: Interactive Microbiology Quiz */}
        {activeTab === 'quiz' && <QuizMode language={language} />}

        {/* Tab 7: Machine Learning Decision Tree & Random Forest Pipeline */}
        {activeTab === 'ml-pipeline' && (
          <MlClassifierDashboard
            onSelectMicrobe={handleOpenDetailModal}
            onViewMicroscope={handleViewInMicroscope}
          />
        )}

        {/* Tab 8: Interactive Dichotomous Key */}
        {activeTab === 'dichotomous' && (
          <DichotomousKeyView onSelectMicrobe={handleOpenDetailModal} />
        )}

        {/* Tab 9: Side-by-Side Comparator */}
        {activeTab === 'comparator' && (
          <MicrobeComparator
            initialMicrobeId={comparatorInitialId}
            onViewMicroscope={handleViewInMicroscope}
          />
        )}

        {/* Tab 10: Complete Encyclopedia Repository */}
        {activeTab === 'encyclopedia' && (
          <MicrobeEncyclopedia
            onSelectMicrobe={handleOpenDetailModal}
            onViewMicroscope={handleViewInMicroscope}
            onCompareMicrobe={handleCompareMicrobe}
            language={language}
          />
        )}
      </main>

      {/* Modal Microbe Detail Dossier */}
      <MicrobeDetailModal
        microbe={modalMicrobe}
        onClose={() => setModalMicrobe(null)}
        onViewMicroscope={handleViewInMicroscope}
        onOpenAiChat={handleOpenAiChat}
        language={language}
      />

      {/* Floating "Ask AI" Button & Interactive Panel (Visible on Every Page of the App) */}
      <AskAiFloatingChat
        isOpen={isAiChatOpen}
        onOpen={() => setIsAiChatOpen(true)}
        onClose={() => setIsAiChatOpen(false)}
        contextMicrobe={chatContextMicrobe}
        onContextMicrobeChange={setChatContextMicrobe}
        microorganisms={MICROORGANISMS}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MicrobeClassify</span>
            <span>•</span>
            <span>{t.appSubtitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Bergey's Manual Standards</span>
            <span>•</span>
            <span>ICTV Viral Taxonomy</span>
            <span>•</span>
            <span>CLSI M100 AST Breakpoints</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
