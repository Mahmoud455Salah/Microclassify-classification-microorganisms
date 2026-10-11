import React, { useState } from 'react';
import { predictMicrobeMl, FEATURE_IMPORTANCES, MlFeatureSet } from '../utils/mlModel';
import { Microorganism } from '../types/microbe';
import {
  BrainCircuit,
  BarChart3,
  GitFork,
  CheckCircle2,
  Sliders,
  Eye,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface MlClassifierDashboardProps {
  onSelectMicrobe: (microbe: Microorganism) => void;
  onViewMicroscope: (microbe: Microorganism) => void;
}

export const MlClassifierDashboard: React.FC<MlClassifierDashboardProps> = ({
  onSelectMicrobe,
  onViewMicroscope,
}) => {
  const [features, setFeatures] = useState<Partial<MlFeatureSet>>({
    gram: 'Gram-Negative',
    shape: 'Bacillus',
    oxygen: 'Facultative',
    oxidase: 'Negative',
    indole: 'Positive',
    catalase: 'Positive',
    urease: 'Negative',
    citrate: 'Negative',
    h2s: 'Negative',
    spores: 'Non-spore',
  });

  const prediction = predictMicrobeMl(features);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
              <BrainCircuit className="w-3.5 h-3.5" /> Scikit-Learn Random Forest & Decision Tree Pipeline
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Supervised Machine Learning Diagnostic Classifier
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Ensemble classifier trained on microbial phenotypic vectors. Predicts taxa probabilities and decomposes diagnostic feature weights using Gini impurity reduction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Model Accuracy: 96.4%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Feature Adjuster */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Configure Observed Feature Vector
          </div>

          <div className="space-y-3 text-xs">
            {/* Gram */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Gram Staining Reaction (26% Weight):</label>
              <select
                value={features.gram}
                onChange={(e) => setFeatures({ ...features, gram: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Gram-Negative">Gram-Negative (Pink/Red)</option>
                <option value="Gram-Positive">Gram-Positive (Purple)</option>
                <option value="Acid-Fast">Acid-Fast (Bright Red)</option>
                <option value="N/A (Acellular / Wall-less)">N/A (Acellular)</option>
              </select>
            </div>

            {/* Shape */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Cellular Morphology (18% Weight):</label>
              <select
                value={features.shape}
                onChange={(e) => setFeatures({ ...features, shape: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Bacillus">Bacillus (Rod)</option>
                <option value="Coccus">Coccus (Spherical)</option>
                <option value="Spirillum">Spirochete (Spiral)</option>
                <option value="Vibrio">Vibrio (Comma)</option>
                <option value="Yeast">Yeast (Budding)</option>
              </select>
            </div>

            {/* Oxidase */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Cytochrome c Oxidase (14% Weight):</label>
              <select
                value={features.oxidase}
                onChange={(e) => setFeatures({ ...features, oxidase: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Negative">Negative (Colorless)</option>
                <option value="Positive">Positive (Dark Purple)</option>
              </select>
            </div>

            {/* Urease */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Urease Hydrolysis (11% Weight):</label>
              <select
                value={features.urease}
                onChange={(e) => setFeatures({ ...features, urease: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Negative">Negative (No hydrolysis)</option>
                <option value="Positive">Positive (Fuchsia pink)</option>
              </select>
            </div>

            {/* Indole */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Indole Tryptophanase (7% Weight):</label>
              <select
                value={features.indole}
                onChange={(e) => setFeatures({ ...features, indole: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Positive">Positive (Red Kovacs ring)</option>
                <option value="Negative">Negative (Yellow ring)</option>
              </select>
            </div>

            {/* Respiration */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Oxygen Respiration (9% Weight):</label>
              <select
                value={features.oxygen}
                onChange={(e) => setFeatures({ ...features, oxygen: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Facultative">Facultative Anaerobe</option>
                <option value="Aerobe">Obligate Aerobe</option>
                <option value="Anaerobe">Obligate Anaerobe</option>
                <option value="Microaerophile">Microaerophile</option>
              </select>
            </div>

            {/* H2S */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">H2S Production (4% Weight):</label>
              <select
                value={features.h2s}
                onChange={(e) => setFeatures({ ...features, h2s: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Negative">Negative (No blackening)</option>
                <option value="Positive">Positive (Black precipitate)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Model Prediction & Probability Bar Chart */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Prediction Card */}
          <div className="bg-white border-2 border-indigo-500/30 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Random Forest ML Top Class
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {prediction.confidence}% Probability
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 italic">
              {prediction.predictedOrganism.scientificName}
            </h3>
            <div className="text-sm font-medium text-slate-600 mb-3">
              {prediction.predictedOrganism.commonName} • ({prediction.predictedOrganism.microbeGroup})
            </div>

            {/* Decision Rules Triggered */}
            <div className="space-y-1 mb-4 pt-3 border-t border-slate-100 text-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Triggered Decision Tree Splits:
              </div>
              {prediction.decisionRulesUsed.slice(0, 4).map((rule, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewMicroscope(prediction.predictedOrganism)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View Lens
              </button>
              <button
                onClick={() => onSelectMicrobe(prediction.predictedOrganism)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                Open Dossier &rarr;
              </button>
            </div>
          </div>

          {/* Secondary Candidate Class Probabilities */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" /> Ensemble Class Probability Distribution
            </h4>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 italic">
                    {prediction.predictedOrganism.scientificName}
                  </span>
                  <span className="font-mono font-bold text-indigo-600">{prediction.confidence}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
              </div>

              {prediction.secondaryCandidates.map((c, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="italic text-slate-700">{c.organism.scientificName}</span>
                    <span className="font-mono text-slate-500">{c.probability}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${c.probability}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gini Feature Importance Ranking Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-emerald-600" /> Gini Impurity Feature Importance Ranking
            </h4>
            <div className="space-y-2">
              {FEATURE_IMPORTANCES.slice(0, 6).map((fi, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between mb-0.5 text-slate-600">
                    <span>{fi.feature}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(fi.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${fi.importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
