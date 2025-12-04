import React, { useState } from 'react';
import { ColumnStats } from '../types';

interface VariableSelectorProps {
  columns: string[];
  stats: Record<string, ColumnStats>;
  onConfirm: (target: string, features: string[]) => void;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({ columns, stats, onConfirm }) => {
  const [target, setTarget] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const handleFeatureToggle = (col: string) => {
    if (col === target) return; // Can't select target as feature
    setSelectedFeatures(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleTargetChange = (col: string) => {
    setTarget(col);
    // Remove from features if it was selected
    setSelectedFeatures(prev => prev.filter(c => c !== col));
  };

  const isValid = target !== null && selectedFeatures.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Configure Analysis</h2>
        <p className="text-slate-500">Select the variable you want to predict (Target) and the factors impacting it (Features).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Target Column Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs">1</span>
              Select Target Variable
            </h3>
            <p className="text-xs text-blue-600 mt-1">The outcome you want to analyze (e.g., Diagnosis)</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {columns.map(col => (
              <label 
                key={`target-${col}`}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border ${target === col ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 border-transparent'}`}
              >
                <input 
                  type="radio" 
                  name="target" 
                  value={col} 
                  checked={target === col}
                  onChange={() => handleTargetChange(col)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium text-slate-700">{col}</div>
                  <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                    <span className="uppercase tracking-wider">{stats[col].type}</span>
                    <span>•</span>
                    <span>{stats[col].uniqueCount} unique</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Feature Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
           <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">2</span>
              Select Features
            </h3>
            <p className="text-xs text-slate-500 mt-1">Variables that might influence the target</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {columns.map(col => {
              const isTarget = col === target;
              return (
                <label 
                  key={`feature-${col}`}
                  className={`flex items-center p-3 rounded-lg transition-colors border ${selectedFeatures.includes(col) ? 'bg-slate-100 border-slate-400' : 'hover:bg-slate-50 border-transparent'} ${isTarget ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input 
                    type="checkbox" 
                    value={col} 
                    checked={selectedFeatures.includes(col)}
                    onChange={() => handleFeatureToggle(col)}
                    disabled={isTarget}
                    className="w-4 h-4 text-slate-600 rounded border-slate-300 focus:ring-slate-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-slate-700">{col} {isTarget && '(Target)'}</div>
                     <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                        <span className="uppercase tracking-wider">{stats[col].type}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end sticky bottom-4">
        <button
          disabled={!isValid}
          onClick={() => target && onConfirm(target, selectedFeatures)}
          className={`
            px-8 py-3 rounded-lg font-semibold shadow-lg transition-all transform
            ${isValid 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          Generate Analysis Dashboard
        </button>
      </div>
    </div>
  );
};
