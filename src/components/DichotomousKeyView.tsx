import React, { useState } from 'react';
import { DICHOTOMOUS_TREE } from '../data/dichotomousTree';
import { MICROORGANISMS } from '../data/microorganisms';
import { Microorganism } from '../types/microbe';
import { GitBranch, RotateCcw, ArrowRight, CheckCircle2, Info, ChevronRight, Sparkles } from 'lucide-react';

interface DichotomousKeyViewProps {
  onSelectMicrobe: (microbe: Microorganism) => void;
}

interface StepHistory {
  nodeId: string;
  selectedOptionIndex: number;
}

export const DichotomousKeyView: React.FC<DichotomousKeyViewProps> = ({ onSelectMicrobe }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root-cellularity');
  const [history, setHistory] = useState<StepHistory[]>([]);

  const currentNode = DICHOTOMOUS_TREE[currentNodeId];

  const handleChooseOption = (optionIndex: number) => {
    const option = currentNode.options[optionIndex];
    setHistory((prev) => [...prev, { nodeId: currentNodeId, selectedOptionIndex: optionIndex }]);

    if (option.nextNodeId && DICHOTOMOUS_TREE[option.nextNodeId]) {
      setCurrentNodeId(option.nextNodeId);
    }
  };

  const handleGoBackToStep = (index: number) => {
    const targetHistory = history.slice(0, index);
    const targetNodeId = index === 0 ? 'root-cellularity' : history[index].nodeId;
    setHistory(targetHistory);
    setCurrentNodeId(targetNodeId);
  };

  const handleReset = () => {
    setHistory([]);
    setCurrentNodeId('root-cellularity');
  };

  // Find candidate microorganisms matching current node's options or selected history
  const getCandidateMicrobes = (ids: string[]): Microorganism[] => {
    return ids
      .map((id) => MICROORGANISMS.find((m) => m.id === id))
      .filter((m): m is Microorganism => m !== undefined);
  };

  // Check if current options are terminal leaves
  const isTerminalOption = (optionIndex: number) => {
    return !currentNode.options[optionIndex].nextNodeId;
  };

  return (
    <div className="space-y-6">
      {/* Header and explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
              <GitBranch className="w-3.5 h-3.5" /> Interactive Dichotomous Key
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Taxonomic Decision Tree for Microorganism Identification
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Follow standard diagnostic branch points based on cellularity, cell wall staining, morphology, oxygen tolerance, and biochemical assays.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Tree
          </button>
        </div>

        {/* Breadcrumb path history */}
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Decision Path:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGoBackToStep(0)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                1. Start (Cellularity)
              </button>
              {history.map((step, idx) => {
                const node = DICHOTOMOUS_TREE[step.nodeId];
                const opt = node.options[step.selectedOptionIndex];
                return (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <button
                      onClick={() => handleGoBackToStep(idx + 1)}
                      className="text-xs px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors max-w-xs truncate"
                      title={opt.text}
                    >
                      {idx + 2}. {opt.text.split('(')[0].trim()}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Current Active Decision Node */}
      {currentNode && (
        <div className="bg-white border-2 border-blue-500/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              Diagnostic Step: {currentNode.category}
            </span>
            <span className="text-xs text-slate-400">Step ID: {currentNode.id}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900">{currentNode.question}</h3>

          <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>{currentNode.educationalContext}</span>
          </div>

          {/* Branch Choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {currentNode.options.map((option, idx) => {
              const isTerminal = isTerminalOption(idx);
              const candidates = getCandidateMicrobes(option.candidateMicrobeIds);

              return (
                <div
                  key={idx}
                  className="group relative bg-white hover:bg-blue-50/40 border-2 border-slate-200 hover:border-blue-400 rounded-xl p-5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-bold flex items-center justify-center transition-colors">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {option.candidateMicrobeIds.length} candidate{option.candidateMicrobeIds.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-900 leading-snug">
                      {option.text}
                    </h4>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{option.explanation}</p>
                  </div>

                  {/* Candidate chips preview */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Matching Taxa:
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {candidates.map((c) => (
                        <span
                          key={c.id}
                          className="text-xs italic px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {c.scientificName}
                        </span>
                      ))}
                    </div>

                    {isTerminal && candidates.length === 1 ? (
                      <button
                        onClick={() => onSelectMicrobe(candidates[0])}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Classify as {candidates[0].commonName}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleChooseOption(idx)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                      >
                        Choose Branch {String.fromCharCode(65 + idx)}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick reference guide of classification principles */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
        <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Dichotomous Classification Logic:
        </div>
        A dichotomous key presents two mutually exclusive choices at each step, systematically eliminating non-matching taxa based on morphological, biochemical, and physiological attributes until a single unequivocal genus or species remains.
      </div>
    </div>
  );
};
