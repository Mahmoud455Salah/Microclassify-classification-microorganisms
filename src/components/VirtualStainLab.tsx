import React, { useState } from 'react';
import { FlaskConical, Beaker, RotateCcw, ArrowRight, Sparkles, TestTube, CheckCircle2 } from 'lucide-react';

type GramStep = 0 | 1 | 2 | 3 | 4;

type BioTestId =
  | 'catalase'
  | 'oxidase'
  | 'coagulase'
  | 'macconkey'
  | 'hemolysis'
  | 'imvic_indole'
  | 'imvic_mr'
  | 'imvic_vp'
  | 'imvic_citrate'
  | 'urease'
  | 'tsi'
  | 'sim_motility';

export const VirtualStainLab: React.FC = () => {
  const [gramStep, setGramStep] = useState<GramStep>(0);
  const [activeBioTest, setActiveBioTest] = useState<BioTestId>('catalase');
  const [testOrganism, setTestOrganism] = useState<string>('pos');

  const gramStepsInfo = [
    {
      title: 'Heat-Fixed Bacterial Smear (Unstained)',
      reagent: 'Heat fixation over Bunsen flame',
      actionName: 'Apply Crystal Violet (Primary Stain)',
      posColor: '#94a3b8',
      negColor: '#94a3b8',
      explanation:
        'Bacterial cells are fixed onto the glass slide. Both Gram-positive and Gram-negative organisms are transparent and colorless prior to dye application.',
    },
    {
      title: 'Step 1: Crystal Violet (Primary Dye)',
      reagent: 'Crystal Violet (triphenylmethane basic dye)',
      actionName: 'Add Gram Iodine (Mordant)',
      posColor: '#7c3aed',
      negColor: '#7c3aed',
      explanation:
        'Crystal violet dissociates into CV+ cations that penetrate both Gram+ and Gram- cell walls and membranes, staining all bacteria intense purple-violet.',
    },
    {
      title: 'Step 2: Gram Iodine (Mordant)',
      reagent: "Lugol's Iodine (I2 + KI)",
      actionName: 'Apply Alcohol Decolorizer (Crucial Step)',
      posColor: '#5b21b6',
      negColor: '#5b21b6',
      explanation:
        'Iodine acts as a chemical mordant. I- binds with CV+ inside the cytoplasm and peptidoglycan to form large, insoluble Crystal Violet-Iodine (CV-I) complexes.',
    },
    {
      title: 'Step 3: 95% Ethyl Alcohol / Acetone (Decolorization)',
      reagent: 'Ethanol / Acetone Decolorizer (10-15 seconds)',
      actionName: 'Apply Safranin (Counterstain)',
      posColor: '#5b21b6',
      negColor: '#f1f5f9',
      explanation:
        'The differential step! Alcohol dehydrates the thick peptidoglycan in Gram+ cells, shrinking pores and trapping CV-I (remains purple). In Gram- cells, alcohol dissolves the outer lipid membrane, leaving pores in thin peptidoglycan where CV-I washes completely out, rendering Gram- cells colorless!',
    },
    {
      title: 'Step 4: Safranin (Counterstain)',
      reagent: 'Safranin O (Basic dye)',
      actionName: 'Complete (Restart Staining Protocol)',
      posColor: '#6d28d9',
      negColor: '#f43f5e',
      explanation:
        'Safranin penetrates all cells. The transparent Gram- cells readily absorb safranin and appear red or pink. The Gram+ cells, already saturated with intense dark purple CV-I, retain their violet coloration.',
    },
  ];

  const currentStep = gramStepsInfo[gramStep];

  const handleNextGramStep = () => {
    if (gramStep === 4) {
      setGramStep(0);
    } else {
      setGramStep((prev) => (prev + 1) as GramStep);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-1">
          <FlaskConical className="w-3.5 h-3.5" /> Virtual Staining & Diagnostic Simulator
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Gram Staining Protocol & Biochemical Assay Bench
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Step through the chemical mechanisms of differential bacterial staining and perform standard clinical biochemical tests (IMViC, Urease, TSI, SIM, Catalase, Oxidase).
        </p>
      </div>

      {/* Part 1: Interactive Gram Stain Protocol */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Differential Staining Procedure
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Gram Differential Staining Mechanism
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
              Step {gramStep} of 4
            </span>
            <button
              onClick={() => setGramStep(0)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-5 gap-2 my-5">
          {gramStepsInfo.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setGramStep(idx as GramStep)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                gramStep === idx
                  ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                  : gramStep > idx
                  ? 'border-slate-300 bg-slate-50 text-slate-600'
                  : 'border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">
                {idx === 0 ? 'Smear' : `Step ${idx}`}
              </div>
              <div className="text-xs font-bold text-slate-800 truncate">
                {idx === 0 ? 'Fixation' : idx === 1 ? 'Crystal Violet' : idx === 2 ? 'Iodine' : idx === 3 ? 'Decolorizer' : 'Safranin'}
              </div>
            </button>
          ))}
        </div>

        {/* Slide view */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center">
          <div className="relative h-64 bg-slate-900 rounded-2xl p-4 shadow-xl border-4 border-slate-700 flex flex-col justify-between overflow-hidden">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>MICROSCOPE SLIDE #084-DIFF</span>
              <span className="text-purple-400">1000x Oil Immersion</span>
            </div>

            <div className="grid grid-cols-2 h-full items-center relative">
              {/* Gram+ */}
              <div className="flex flex-col items-center justify-center p-2 text-center border-r border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Gram-Positive (S. aureus)
                </div>
                <div className="w-24 h-24 relative flex items-center justify-center">
                  {[
                    { x: -12, y: -12, r: 8 },
                    { x: 4, y: -16, r: 8 },
                    { x: -18, y: 4, r: 8 },
                    { x: 0, y: 0, r: 8 },
                    { x: 16, y: -2, r: 8 },
                    { x: -6, y: 16, r: 8 },
                    { x: 12, y: 14, r: 8 },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full transition-colors duration-500 shadow-sm"
                      style={{
                        width: c.r * 2,
                        height: c.r * 2,
                        transform: `translate(${c.x}px, ${c.y}px)`,
                        backgroundColor: currentStep.posColor,
                        border: gramStep === 3 ? '1px solid #ffffff' : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold mt-1" style={{ color: currentStep.posColor }}>
                  {gramStep === 0
                    ? 'Colorless'
                    : gramStep < 4
                    ? 'Crystal Violet Retained'
                    : 'Purple / Violet (Gram+)'}
                </div>
              </div>

              {/* Gram- */}
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Gram-Negative (E. coli)
                </div>
                <div className="w-24 h-24 relative flex items-center justify-center">
                  {[
                    { x: -10, y: -14, rot: 15 },
                    { x: 10, y: 2, rot: -25 },
                    { x: -8, y: 18, rot: 35 },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full transition-colors duration-500 shadow-sm"
                      style={{
                        width: 26,
                        height: 10,
                        transform: `translate(${r.x}px, ${r.y}px) rotate(${r.rot}deg)`,
                        backgroundColor: currentStep.negColor,
                        border: currentStep.negColor === '#f1f5f9' ? '1px dashed #64748b' : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold mt-1" style={{ color: currentStep.negColor === '#f1f5f9' ? '#94a3b8' : currentStep.negColor }}>
                  {gramStep === 0
                    ? 'Colorless'
                    : gramStep === 3
                    ? 'Decolorized (Colorless)'
                    : gramStep === 4
                    ? 'Pink / Red (Gram-)'
                    : 'Stained Purple'}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-500 font-mono">
              Reagent Applied: {currentStep.reagent}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
                Chemical Mechanism at This Stage:
              </span>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {currentStep.title}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentStep.explanation}
              </p>
            </div>

            <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100 text-xs text-purple-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong>Why the difference?</strong> Thick peptidoglycan (up to 40 layers in Gram+) traps CV-I complexes, whereas thin peptidoglycan with an outer lipid membrane (Gram-) is stripped by alcohol, allowing counterstain uptake.
              </span>
            </div>

            <button
              onClick={handleNextGramStep}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
            >
              {currentStep.actionName} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Part 2: Comprehensive Biochemical Assays Bench */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          Phenotypic Identification Bench
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Virtual Biochemical Testing Simulator (IMViC, Urease, TSI & Enzymatic)
        </h3>

        {/* Primary Test Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'catalase', label: 'Catalase (H2O2)' },
            { id: 'oxidase', label: 'Oxidase (Cytochrome c)' },
            { id: 'coagulase', label: 'Coagulase (Plasma)' },
            { id: 'macconkey', label: 'MacConkey (Lactose)' },
            { id: 'hemolysis', label: 'Blood Agar (Hemolysis)' },
            { id: 'imvic_indole', label: 'IMViC: Indole' },
            { id: 'imvic_mr', label: 'IMViC: Methyl Red' },
            { id: 'imvic_vp', label: 'IMViC: Voges-Proskauer' },
            { id: 'imvic_citrate', label: 'IMViC: Simmons Citrate' },
            { id: 'urease', label: 'Urease (Christensen)' },
            { id: 'tsi', label: 'TSI Agar (Triple Sugar Iron)' },
            { id: 'sim_motility', label: 'SIM Medium (Sulfide/Motility)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveBioTest(t.id as BioTestId);
                setTestOrganism('pos');
              }}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                activeBioTest === t.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dynamic Simulator Bench */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Reaction Tube / Plate Graphic Display */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-white p-6 rounded-xl border border-slate-200 min-h-68 shadow-xs">
            {/* Catalase */}
            {activeBioTest === 'catalase' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">3% Hydrogen Peroxide Catalase Slide</div>
                <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center relative overflow-hidden">
                  {testOrganism === 'pos' ? (
                    <div>
                      <span className="text-3xl font-bold animate-bounce block">🫧</span>
                      <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                        Vigorous O2 Bubbles
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs font-medium">No bubbling (inert)</div>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Reaction: 2 H2O2 &rarr; 2 H2O + O2 &uarr;
                </div>
              </div>
            )}

            {/* Oxidase */}
            {activeBioTest === 'oxidase' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">TMPD Oxidase Test Paper Strip</div>
                <div
                  className="w-20 h-28 mx-auto rounded-lg shadow-sm border flex items-center justify-center transition-colors duration-500"
                  style={{
                    backgroundColor: testOrganism === 'pos' ? '#3b0764' : '#f8fafc',
                    borderColor: testOrganism === 'pos' ? '#581c87' : '#cbd5e1',
                  }}
                >
                  <span
                    className={`text-xs font-bold ${testOrganism === 'pos' ? 'text-white' : 'text-slate-400'}`}
                  >
                    {testOrganism === 'pos' ? 'Deep Purple' : 'Colorless'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos' ? 'Positive: Indophenol Blue (< 10s)' : 'Negative: Colorless'}
                </div>
              </div>
            )}

            {/* Coagulase */}
            {activeBioTest === 'coagulase' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">Rabbit Plasma Tube Test</div>
                <div className="w-16 h-32 mx-auto rounded-b-2xl border-2 border-slate-300 bg-slate-100 relative overflow-hidden flex items-end">
                  <div
                    className="w-full transition-all duration-500 rounded-b-xl flex items-center justify-center text-[10px] font-bold"
                    style={{
                      height: '60%',
                      backgroundColor: testOrganism === 'pos' ? '#fde047' : '#fef08a',
                      color: '#854d0e',
                    }}
                  >
                    {testOrganism === 'pos' ? 'Solid Clot' : 'Liquid'}
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos' ? 'Positive: Firm Fibrin Clot' : 'Negative: Fluid Suspension'}
                </div>
              </div>
            )}

            {/* IMViC Indole */}
            {activeBioTest === 'imvic_indole' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">Tryptone Broth with Kovacs Reagent</div>
                <div className="w-16 h-32 mx-auto rounded-b-2xl border-2 border-slate-300 bg-amber-50 relative overflow-hidden flex flex-col justify-between p-1">
                  {/* Top reagent ring */}
                  <div
                    className="w-full h-4 rounded-md transition-colors duration-500 flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ backgroundColor: testOrganism === 'pos' ? '#e11d48' : '#f59e0b' }}
                  >
                    {testOrganism === 'pos' ? 'Cherry Red' : 'Yellow'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Broth</div>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos'
                    ? 'Positive: Rosindole Dye Ring (Indole +)'
                    : 'Negative: Yellowish Ring (Indole -)'}
                </div>
              </div>
            )}

            {/* IMViC Methyl Red */}
            {activeBioTest === 'imvic_mr' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">MR-VP Broth with Methyl Red Indicator</div>
                <div
                  className="w-16 h-32 mx-auto rounded-b-2xl border-2 border-slate-300 transition-colors duration-500 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: testOrganism === 'pos' ? '#dc2626' : '#fde047',
                    color: testOrganism === 'pos' ? '#ffffff' : '#854d0e',
                  }}
                >
                  {testOrganism === 'pos' ? 'Red (pH < 4.4)' : 'Yellow (pH > 6.2)'}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos'
                    ? 'Positive: Mixed Acid Fermentation'
                    : 'Negative: Butanediol pathway / Neutral'}
                </div>
              </div>
            )}

            {/* IMViC Voges-Proskauer */}
            {activeBioTest === 'imvic_vp' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">VP Test (Barritt A & B: Alpha-naphthol + KOH)</div>
                <div className="w-16 h-32 mx-auto rounded-b-2xl border-2 border-slate-300 bg-amber-50 relative overflow-hidden flex flex-col justify-between p-1">
                  <div
                    className="w-full h-5 rounded-md transition-colors duration-500 flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: testOrganism === 'pos' ? '#e11d48' : '#fef08a' }}
                  >
                    {testOrganism === 'pos' ? 'Pink-Red' : 'Copper'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Broth</div>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos'
                    ? 'Positive: Acetoin (Diacetyl) Present'
                    : 'Negative: No Acetoin'}
                </div>
              </div>
            )}

            {/* IMViC Citrate */}
            {activeBioTest === 'imvic_citrate' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">Simmons Citrate Agar Slant</div>
                <div
                  className="w-14 h-32 mx-auto rounded-b-xl border-2 border-slate-300 transition-colors duration-500 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: testOrganism === 'pos' ? '#1d4ed8' : '#15803d',
                    color: '#ffffff',
                  }}
                >
                  {testOrganism === 'pos' ? 'Prussian Blue' : 'Forest Green'}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos'
                    ? 'Positive: Citrate Utilized (Alkaline pH > 7.6)'
                    : 'Negative: No Growth (Neutral pH 6.9)'}
                </div>
              </div>
            )}

            {/* Urease */}
            {activeBioTest === 'urease' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">Christensen Urea Agar Slant</div>
                <div
                  className="w-14 h-32 mx-auto rounded-b-xl border-2 border-slate-300 transition-colors duration-500 flex items-center justify-center text-[10px] font-bold text-center px-1"
                  style={{
                    backgroundColor: testOrganism === 'pos' ? '#f43f5e' : '#fef08a',
                    color: testOrganism === 'pos' ? '#ffffff' : '#854d0e',
                  }}
                >
                  {testOrganism === 'pos' ? 'Vibrant Magenta' : 'Peach / Yellow'}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos'
                    ? 'Positive: Urea Hydrolyzed to Ammonia (Alkaline)'
                    : 'Negative: No Urease'}
                </div>
              </div>
            )}

            {/* TSI Agar */}
            {activeBioTest === 'tsi' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">Triple Sugar Iron (TSI) Slant</div>
                <div className="w-16 h-34 mx-auto rounded-b-xl border-2 border-slate-300 relative overflow-hidden flex flex-col">
                  {/* Slant */}
                  <div
                    className="w-full h-1/2 flex items-center justify-center text-[9px] font-bold text-white transition-colors"
                    style={{
                      backgroundColor:
                        testOrganism === 'ecoli' || testOrganism === 'pos' ? '#eab308' : '#dc2626',
                    }}
                  >
                    Slant: {testOrganism === 'ecoli' || testOrganism === 'pos' ? 'Acid (A)' : 'Alk (K)'}
                  </div>
                  {/* Butt */}
                  <div
                    className="w-full h-1/2 flex items-center justify-center text-[9px] font-bold transition-colors"
                    style={{
                      backgroundColor: testOrganism === 'salmonella' ? '#000000' : '#eab308',
                      color: testOrganism === 'salmonella' ? '#ffffff' : '#713f12',
                    }}
                  >
                    {testOrganism === 'salmonella' ? 'Black (H2S+)' : 'Acid (A)'}
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'ecoli'
                    ? 'A/A Gas+ H2S- (Glucose + Lactose/Sucrose fermenter)'
                    : testOrganism === 'salmonella'
                    ? 'K/A H2S+ Gas- (Glucose only, H2S black)'
                    : 'K/A H2S- Gas- (Non-lactose, non-H2S)'}
                </div>
              </div>
            )}

            {/* SIM Motility */}
            {activeBioTest === 'sim_motility' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">SIM Semi-Solid Motility Medium</div>
                <div className="w-14 h-32 mx-auto rounded-b-xl border-2 border-slate-300 bg-amber-50 relative flex items-center justify-center">
                  {testOrganism === 'pos' ? (
                    <div className="w-full h-full bg-slate-300/60 rounded-b-xl flex items-center justify-center text-[9px] font-bold text-slate-700">
                      Diffuse Haziness (Motile)
                    </div>
                  ) : (
                    <div className="w-1 h-24 bg-red-800 rounded-full flex items-center justify-center">
                      <span className="text-[8px] bg-white px-1 text-red-900 font-bold whitespace-nowrap -rotate-90">
                        Sharp Line
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {testOrganism === 'pos'
                    ? 'Motile: Bacterial migration away from stab line'
                    : 'Non-motile: Growth strictly confined to stab line'}
                </div>
              </div>
            )}

            {/* MacConkey */}
            {activeBioTest === 'macconkey' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">MacConkey Agar Plate</div>
                <div
                  className="w-28 h-28 mx-auto rounded-full border-4 shadow-sm flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: testOrganism === 'pos' ? '#f43f5e' : '#fef3c7',
                    borderColor: testOrganism === 'pos' ? '#be123c' : '#d97706',
                  }}
                >
                  <span
                    className={`text-xs font-bold px-2 text-center ${
                      testOrganism === 'pos' ? 'text-white' : 'text-amber-900'
                    }`}
                  >
                    {testOrganism === 'pos' ? 'Pink (Lactose+)' : 'Colorless (Lactose-)'}
                  </span>
                </div>
              </div>
            )}

            {/* Hemolysis */}
            {activeBioTest === 'hemolysis' && (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-slate-500">5% Sheep Blood Agar Plate</div>
                <div className="w-28 h-28 mx-auto rounded-full border-4 border-red-900 bg-red-700 flex items-center justify-center relative shadow-sm">
                  {testOrganism === 'pos' && (
                    <div className="w-16 h-16 rounded-full bg-amber-100/90 border border-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-900">
                      Beta (Clear Zone)
                    </div>
                  )}
                  {testOrganism === 'alpha' && (
                    <div className="w-16 h-16 rounded-full bg-emerald-800/80 border border-emerald-600 flex items-center justify-center text-[10px] font-bold text-emerald-200">
                      Alpha (Greening)
                    </div>
                  )}
                  {testOrganism === 'neg' && (
                    <div className="text-[10px] font-bold text-red-200">Gamma (No Lysis)</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls & Scientific Protocol Information */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                Select Test Strain / Clinical Isolate:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeBioTest === 'catalase' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Staphylococcus aureus (Catalase +)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Streptococcus pneumoniae (Catalase -)
                    </button>
                  </>
                )}

                {activeBioTest === 'imvic_indole' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Escherichia coli (Indole POSITIVE)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Klebsiella pneumoniae (Indole NEGATIVE)
                    </button>
                  </>
                )}

                {activeBioTest === 'imvic_citrate' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Klebsiella pneumoniae (Citrate POSITIVE, Blue)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Escherichia coli (Citrate NEGATIVE, Green)
                    </button>
                  </>
                )}

                {activeBioTest === 'urease' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Proteus mirabilis / H. pylori (Rapid Urease +)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Escherichia coli (Urease -)
                    </button>
                  </>
                )}

                {activeBioTest === 'tsi' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('ecoli')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'ecoli' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      E. coli (A/A, Gas+, H2S-)
                    </button>
                    <button
                      onClick={() => setTestOrganism('salmonella')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'salmonella' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Salmonella Typhi (K/A, H2S Black)
                    </button>
                    <button
                      onClick={() => setTestOrganism('shigella')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'shigella' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Shigella dysenteriae (K/A, H2S-)
                    </button>
                  </>
                )}

                {activeBioTest === 'sim_motility' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Proteus mirabilis (Motile, Diffuse)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Klebsiella / Shigella (Non-motile, Stab Line)
                    </button>
                  </>
                )}

                {activeBioTest === 'oxidase' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Pseudomonas aeruginosa (Oxidase +)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Escherichia coli (Oxidase -)
                    </button>
                  </>
                )}

                {activeBioTest === 'macconkey' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Escherichia coli (Lactose+, Pink)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Pseudomonas / Salmonella (Lactose-, Pale)
                    </button>
                  </>
                )}

                {activeBioTest === 'hemolysis' && (
                  <>
                    <button
                      onClick={() => setTestOrganism('pos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      S. pyogenes / S. aureus (Beta)
                    </button>
                    <button
                      onClick={() => setTestOrganism('alpha')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'alpha' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      S. pneumoniae (Alpha)
                    </button>
                    <button
                      onClick={() => setTestOrganism('neg')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        testOrganism === 'neg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Enterococcus faecalis (Gamma)
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <TestTube className="w-4 h-4 text-blue-600" /> Biochemical Test Principle:
              </div>
              {activeBioTest === 'imvic_indole' && (
                <p>
                  Tests for tryptophanase, which hydrolyzes tryptophan into indole, pyruvic acid, and ammonia. Addition of Kovacs reagent (p-dimethylaminobenzaldehyde) yields a cherry-red rosindole ring. Classic key for <em>E. coli</em> (+).
                </p>
              )}
              {activeBioTest === 'imvic_mr' && (
                <p>
                  Detects mixed acid fermentation of glucose producing stable organic acids (pH &lt; 4.4). Methyl red stays red below pH 4.4 (MR+) or turns yellow above pH 6.2 (MR-).
                </p>
              )}
              {activeBioTest === 'imvic_vp' && (
                <p>
                  Detects acetoin (acetylmethylcarbinol), an intermediate in the 2,3-butanediol fermentation pathway. Oxidation in the presence of alpha-naphthol and KOH produces a pink-red diacetyl complex.
                </p>
              )}
              {activeBioTest === 'imvic_citrate' && (
                <p>
                  Determines whether an organism can use sodium citrate as its sole carbon source and ammonium phosphate as its sole nitrogen source. Metabolism releases alkaline sodium carbonate, shifting bromothymol blue from green to royal blue.
                </p>
              )}
              {activeBioTest === 'urease' && (
                <p>
                  Urease splits urea into ammonia and CO2. Ammonia raises the pH, causing phenol red to shift from pale yellow to intense magenta pink. Diagnostic for <em>Proteus mirabilis</em>, <em>H. pylori</em>, and <em>Cryptococcus neoformans</em>.
                </p>
              )}
              {activeBioTest === 'tsi' && (
                <p>
                  Contains 0.1% glucose, 1% lactose, 1% sucrose, ferrous sulfate, and phenol red. Differentiates Enterobacterales based on glucose fermentation alone (K/A, red slant/yellow butt), lactose/sucrose fermentation (A/A, yellow/yellow), H2S production (black), and gas formation.
                </p>
              )}
              {activeBioTest === 'sim_motility' && (
                <p>
                  Semi-solid agar (0.4% agar) allows motile organisms with flagella to swim outward from the stab line producing diffuse turbidity, whereas non-motile organisms grow strictly along the inoculating stab wire.
                </p>
              )}
              {activeBioTest === 'catalase' && (
                <p>
                  Catalase breaks down toxic hydrogen peroxide (2 H₂O₂ → 2 H₂O + O₂↑). Differentiates Staphylococci (+) from Streptococci (-).
                </p>
              )}
              {activeBioTest === 'oxidase' && (
                <p>
                  Tests for cytochrome c oxidase. Distinguishes Enterobacteriaceae (-) from Pseudomonadaceae (+) and Neisseriaceae (+).
                </p>
              )}
              {activeBioTest === 'coagulase' && (
                <p>
                  Converts fibrinogen to fibrin clot. Distinguishes virulent <em>Staphylococcus aureus</em> (+) from coagulase-negative staphylococci (CoNS).
                </p>
              )}
              {activeBioTest === 'macconkey' && (
                <p>
                  Bile salts and crystal violet inhibit Gram+ bacteria. Neutral red turns pink when lactose is fermented into lactic acid.
                </p>
              )}
              {activeBioTest === 'hemolysis' && (
                <p>
                  Complete beta-hemolysis leaves a clear zone around colonies. Alpha produces partial biliverdin greening. Gamma shows no change.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
