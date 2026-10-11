import React, { useState } from 'react';
import { MICROORGANISMS } from '../data/microorganisms';
import { Microorganism, AntibioticSusceptibilityRecord } from '../types/microbe';
import {
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Info,
  Beaker,
} from 'lucide-react';

export const AntibioticSusceptibility: React.FC = () => {
  // Filter organisms with susceptibility profile
  const testableOrganisms = MICROORGANISMS.filter(
    (m) => m.pathology.susceptibilityProfile && m.pathology.susceptibilityProfile.length > 0
  );

  const [selectedOrganismId, setSelectedOrganismId] = useState<string>(
    testableOrganisms[0]?.id || 'escherichia-coli'
  );
  const [selectedDiscIndex, setSelectedDiscIndex] = useState<number>(0);
  const [showRuler, setShowRuler] = useState<boolean>(true);

  const currentOrganism =
    MICROORGANISMS.find((m) => m.id === selectedOrganismId) || testableOrganisms[0];
  const discs = currentOrganism.pathology.susceptibilityProfile || [];
  const activeDisc = discs[selectedDiscIndex] || discs[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
          <Beaker className="w-3.5 h-3.5" /> CLSI Disk Diffusion Assay
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Kirby-Bauer Antibiotic Susceptibility Testing (AST)
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Standardized disk diffusion on Mueller-Hinton agar to evaluate zones of inhibition and assign clinical breakpoint interpretations (Sensitive, Intermediate, Resistant).
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Petri Dish Agar Plate Simulation */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mueller-Hinton Agar Plate (150 mm)
            </span>
            <button
              onClick={() => setShowRuler(!showRuler)}
              className={`text-xs px-2.5 py-1 rounded font-medium border transition-colors ${
                showRuler
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {showRuler ? 'Hide Caliper' : 'Show Caliper'}
            </button>
          </div>

          {/* Petri Dish SVG Rendering */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border-8 border-slate-300 bg-[#fef3c7] shadow-xl flex items-center justify-center overflow-hidden">
            {/* Bacterial Lawn Texture Layer */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(circle, rgba(254, 243, 199, 0.9) 0%, rgba(253, 230, 138, 0.95) 80%, rgba(245, 158, 11, 0.4) 100%)',
              }}
            />

            {/* Simulated Antibiotic Discs on the Plate */}
            <svg viewBox="-150 -150 300 300" className="w-full h-full relative z-10">
              {discs.map((disc, idx) => {
                const angle = (idx * 360) / Math.max(discs.length, 1);
                const rad = (angle * Math.PI) / 180;
                const distance = 80;
                const cx = Math.cos(rad) * distance;
                const cy = Math.sin(rad) * distance;
                const zoneRadius = disc.zoneDiameterMm * 2.2; // Scaled radius
                const isSelected = selectedDiscIndex === idx;

                return (
                  <g
                    key={idx}
                    onClick={() => setSelectedDiscIndex(idx)}
                    className="cursor-pointer group"
                  >
                    {/* Clear Zone of Inhibition (Uninoculated/Cleared Agar) */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={zoneRadius}
                      fill="#fef08a"
                      stroke={isSelected ? '#2563eb' : '#d97706'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={isSelected ? '4 2' : 'none'}
                      opacity={0.88}
                      className="transition-all"
                    />

                    {/* Caliper diameter line if selected */}
                    {showRuler && isSelected && (
                      <g stroke="#1d4ed8" strokeWidth="1.5">
                        <line x1={cx - zoneRadius} y1={cy} x2={cx + zoneRadius} y2={cy} />
                        <line x1={cx - zoneRadius} y1={cy - 4} x2={cx - zoneRadius} y2={cy + 4} />
                        <line x1={cx + zoneRadius} y1={cy - 4} x2={cx + zoneRadius} y2={cy + 4} />
                        <text
                          x={cx}
                          y={cy - 8}
                          textAnchor="middle"
                          fill="#1d4ed8"
                          fontSize="9"
                          fontWeight="bold"
                          className="font-mono select-none"
                        >
                          {disc.zoneDiameterMm} mm
                        </text>
                      </g>
                    )}

                    {/* Paper Filter Disc (White 6 mm disc) */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={14}
                      fill="#ffffff"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      className="shadow-sm"
                    />
                    {/* Antibiotic Abbreviation Code on Disc */}
                    <text
                      x={cx}
                      y={cy - 1}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="6.5"
                      fontWeight="bold"
                      className="font-mono select-none"
                    >
                      {disc.antibiotic.substring(0, 3).toUpperCase()}
                    </text>
                    <text
                      x={cx}
                      y={cy + 7}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="5"
                      className="font-mono select-none"
                    >
                      {disc.diskContent}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Petri dish reflection rim */}
            <div className="absolute inset-2 rounded-full border border-white/50 pointer-events-none" />
          </div>

          <div className="text-center text-xs text-slate-500 mt-3">
            Click on any antibiotic disc to inspect zone diameter calipers and clinical breakpoint criteria.
          </div>
        </div>

        {/* Right: Controls & Active Disc Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {/* Organism Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Microbial Inoculum for AST:
            </label>
            <select
              value={selectedOrganismId}
              onChange={(e) => {
                setSelectedOrganismId(e.target.value);
                setSelectedDiscIndex(0);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {testableOrganisms.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.scientificName} ({m.commonName})
                </option>
              ))}
            </select>
          </div>

          {/* Active Disc Detailed Measurement Card */}
          {activeDisc && (
            <div className="bg-white border-2 border-blue-500/30 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Active Disc Assay
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    activeDisc.interpretation === 'Sensitive'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeDisc.interpretation === 'Resistant'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeDisc.interpretation === 'Sensitive' && 'Sensitive (S)'}
                  {activeDisc.interpretation === 'Resistant' && 'Resistant (R)'}
                  {activeDisc.interpretation === 'Intermediate' && 'Intermediate (I)'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {activeDisc.antibiotic}{' '}
                <span className="text-xs text-slate-500 font-normal">({activeDisc.diskContent})</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Measured Inhibition Zone:</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {activeDisc.zoneDiameterMm} mm
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Biochemical Mechanism:</span>
                  <span className="font-semibold text-slate-800">{activeDisc.mechanism || 'Standard'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Table of all Tested Discs for current organism */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Antibiogram Table for <em>{currentOrganism.scientificName}</em>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600">
                    <th className="p-2.5 font-bold">Disc</th>
                    <th className="p-2.5 font-bold">Content</th>
                    <th className="p-2.5 font-bold">Zone</th>
                    <th className="p-2.5 font-bold">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discs.map((d, didx) => (
                    <tr
                      key={didx}
                      onClick={() => setSelectedDiscIndex(didx)}
                      className={`cursor-pointer transition-colors ${
                        selectedDiscIndex === didx ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2.5 font-bold text-slate-900">{d.antibiotic}</td>
                      <td className="p-2.5 font-mono text-slate-600">{d.diskContent}</td>
                      <td className="p-2.5 font-mono text-slate-900">{d.zoneDiameterMm} mm</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            d.interpretation === 'Sensitive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.interpretation === 'Resistant'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.interpretation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Panels: MIC, MRSA, VRE, ESBL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
              MIC
            </span>
            <h4 className="text-xs font-bold text-slate-900">Minimum Inhibitory Conc.</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The lowest concentration (µg/mL) of an antimicrobial agent that prevents visible bacterial growth in broth dilution. Zone diameters inversely correlate with MIC values according to CLSI regression formulas.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
              MRSA
            </span>
            <h4 className="text-xs font-bold text-slate-900">Methicillin Resistance</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mediated by the <em>mecA</em> gene on the SCCmec mobile genetic element, encoding <strong>PBP2a</strong>—a modified penicillin-binding protein with ultra-low binding affinity for nearly all beta-lactam antibiotics.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
              VRE
            </span>
            <h4 className="text-xs font-bold text-slate-900">Vancomycin Resistance</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enzymes encoded by the <em>vanA</em> or <em>vanB</em> operon synthesize modified peptidoglycan precursors ending in <strong>D-Ala-D-Lac</strong> instead of D-Ala-D-Ala, reducing vancomycin binding affinity by 1,000-fold.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
              ESBL
            </span>
            <h4 className="text-xs font-bold text-slate-900">Extended-Spectrum Beta-Lactamase</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Plasmid-borne enzymes (TEM, SHV, CTX-M) in <em>Enterobacteriaceae</em> that hydrolyze 3rd-generation cephalosporins (ceftriaxone, ceftazidime) and aztreonam, but are blocked by clavulanic acid and tazobactam.
          </p>
        </div>
      </div>
    </div>
  );
};
