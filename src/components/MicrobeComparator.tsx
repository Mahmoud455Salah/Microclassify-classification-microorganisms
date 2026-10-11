import React, { useState } from 'react';
import { MICROORGANISMS } from '../data/microorganisms';
import { Microorganism } from '../types/microbe';
import { Columns3, X, Plus, ShieldAlert, Check, Minus } from 'lucide-react';

interface MicrobeComparatorProps {
  initialMicrobeId?: string;
  onViewMicroscope: (microbe: Microorganism) => void;
}

export const MicrobeComparator: React.FC<MicrobeComparatorProps> = ({
  initialMicrobeId,
  onViewMicroscope,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialMicrobeId) {
      const secondId = initialMicrobeId === 'escherichia-coli' ? 'staphylococcus-aureus' : 'escherichia-coli';
      return [initialMicrobeId, secondId];
    }
    return ['escherichia-coli', 'staphylococcus-aureus', 'sars-cov-2'];
  });

  const selectedMicrobes = selectedIds
    .map((id) => MICROORGANISMS.find((m) => m.id === id))
    .filter((m): m is Microorganism => m !== undefined);

  const handleAddMicrobe = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveMicrobe = (id: string) => {
    if (selectedIds.length > 1) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const unselectedMicrobes = MICROORGANISMS.filter((m) => !selectedIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Header & Organism Selector Chips */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
              <Columns3 className="w-3.5 h-3.5" /> Comparative Matrix
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Side-by-Side Microorganism Comparator
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Compare cellular morphology, cell wall biochemistry, genome architecture, and antimicrobial targets across up to 3 taxa simultaneously.
            </p>
          </div>

          {/* Add Organism Dropdown */}
          {selectedIds.length < 3 && (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddMicrobe(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Microorganism to Compare...
                </option>
                {unselectedMicrobes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.commonName} ({m.scientificName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Microorganism Tags */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
          {selectedMicrobes.map((m) => (
            <div
              key={m.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900"
            >
              <span className="italic">{m.scientificName}</span>
              {selectedIds.length > 1 && (
                <button
                  onClick={() => handleRemoveMicrobe(m.id)}
                  className="text-blue-500 hover:text-red-600 transition-colors"
                  title="Remove from comparison"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <th className="p-4 w-44 font-bold uppercase tracking-wider text-[11px]">
                  Diagnostic Attribute
                </th>
                {selectedMicrobes.map((m) => (
                  <th key={m.id} className="p-4 font-bold border-l border-slate-200 min-w-64">
                    <div className="flex items-center justify-between">
                      <span className="text-sm italic font-bold text-slate-900">
                        {m.scientificName}
                      </span>
                      <button
                        onClick={() => onViewMicroscope(m)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Lens
                      </button>
                    </div>
                    <div className="text-xs font-normal text-slate-500 mt-0.5">
                      {m.commonName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Group & Cellular Type */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Domain & Group
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 font-semibold text-slate-900">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 mr-2">
                      {m.microbeGroup}
                    </span>
                    {m.cellularType}
                  </td>
                ))}
              </tr>

              {/* Taxonomy Lineage */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Taxonomic Phylum & Family
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-700">
                    <div>Phylum: <strong>{m.taxonomy.phylum}</strong></div>
                    <div>Family: <strong>{m.taxonomy.family}</strong></div>
                  </td>
                ))}
              </tr>

              {/* Gram Stain Reaction */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Gram Staining Reaction
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                        m.morphology.gramStatus === 'Gram-Positive'
                          ? 'bg-purple-100 text-purple-800'
                          : m.morphology.gramStatus === 'Gram-Negative'
                          ? 'bg-rose-100 text-rose-800'
                          : m.morphology.gramStatus === 'Acid-Fast'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.morphology.gramStatus}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Shape and Dimensions */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Shape & Dimensions
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-800">
                    <div className="font-semibold">{m.morphology.shape}</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                      Size: {m.morphology.dimensions} ({m.morphology.arrangement})
                    </div>
                  </td>
                ))}
              </tr>

              {/* Cell Wall Chemistry */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Cell Envelope Architecture
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-700 leading-relaxed">
                    {m.morphology.cellWallStructure}
                  </td>
                ))}
              </tr>

              {/* Motility & Spores */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Motility & Spores
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-700">
                    <div>Motility: <strong>{m.morphology.motility}</strong></div>
                    <div>Spores: <strong>{m.morphology.sporeFormation}</strong></div>
                  </td>
                ))}
              </tr>

              {/* Oxygen Tolerance & Catalase */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Respiration & Enzymes
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-700">
                    <div>Oxygen: <strong>{m.physiology.oxygenRequirement}</strong></div>
                    <div>
                      Catalase: <strong>{m.physiology.catalase}</strong> • Oxidase:{' '}
                      <strong>{m.physiology.oxidase}</strong>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Biosafety Level & Role */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Biosafety Containment
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        m.pathology.biosafetyLevel === 'BSL-3' || m.pathology.biosafetyLevel === 'BSL-4'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {m.pathology.biosafetyLevel} ({m.pathology.clinicalRole})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Associated Pathologies */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Key Diseases / Impact
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-700">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {m.pathology.diseases.slice(0, 3).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Antimicrobial Targets */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Therapeutic Targets
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-700">
                    {m.pathology.treatmentTargets.join(', ')}
                  </td>
                ))}
              </tr>

              {/* Ecological or Industrial Role */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                  Ecology & Biotechnology
                </td>
                {selectedMicrobes.map((m) => (
                  <td key={m.id} className="p-3.5 border-l border-slate-200 text-slate-700 leading-relaxed">
                    {m.ecologicalOrIndustrialRole}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
