import React, { useState, useEffect } from 'react';
import { DataRow, DatasetMeta, PredictionResult } from '../types';
import { createHistogramData } from '../services/dataService';
import { generateExplanation } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis
} from 'recharts';

interface DashboardProps {
  data: DataRow[];
  meta: DatasetMeta;
  target: string;
  features: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data, meta, target, features }) => {
  const [activeFeature, setActiveFeature] = useState<string>(features[0]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const targetStats = meta.stats[target];
  const featureStats = meta.stats[activeFeature];

  // Fetch explanation when active feature changes
  useEffect(() => {
    let isMounted = true;
    const fetchExplanation = async () => {
      if (!showExplanation) return;
      
      setLoadingExplanation(true);
      const statsContext = `Target is ${target} (${targetStats.type}), Feature is ${activeFeature} (${featureStats.type}). Mean of feature: ${featureStats.mean?.toFixed(2) || 'N/A'}.`;
      
      const text = await generateExplanation(target, activeFeature, statsContext);
      if (isMounted) {
        setExplanation(text);
        setLoadingExplanation(false);
      }
    };
    fetchExplanation();
    return () => { isMounted = false; };
  }, [activeFeature, target, showExplanation, targetStats, featureStats]); // Correct dependency array

  // Prepare chart data
  const histogramData = createHistogramData(data, activeFeature);
  
  // Prepare Relationship Data
  // If target is categorical and feature is numeric -> Box plot approximation (scatter with category on X)
  // If both numeric -> Scatter plot
  const relationshipData = data.map((row, i) => ({
    x: targetStats.type === 'categorical' ? row[target] : row[activeFeature],
    y: targetStats.type === 'categorical' ? row[activeFeature] : row[target],
    z: 1, // Size
  })).slice(0, 300); // Limit points for performance

  // Mock Prediction Model
  const prediction: PredictionResult = {
    accuracy: 0.94,
    auc: 0.98,
    modelName: 'Random Forest Classifier (Simulated)'
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Bar: Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-500">Analyzing Relationship:</label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold text-sm">{target}</span>
            <span className="text-slate-400">vs</span>
            <select 
              value={activeFeature}
              onChange={(e) => setActiveFeature(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {features.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-sm text-slate-500">Enable AI Assistant</span>
           <button 
             onClick={() => setShowExplanation(!showExplanation)}
             className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${showExplanation ? 'bg-blue-600' : 'bg-slate-300'}`}
           >
             <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${showExplanation ? 'translate-x-6' : 'translate-x-0'}`} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Stats & Prediction */}
        <div className="space-y-8">
            {/* Prediction Card */}
            <div className="bg-slate-850 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">Model Performance</h3>
                <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-bold">{(prediction.accuracy * 100).toFixed(1)}%</span>
                    <span className="text-sm text-blue-400 mb-1">Accuracy</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${prediction.accuracy * 100}%` }}></div>
                </div>
                <div className="mt-4 flex justify-between text-xs text-slate-400">
                    <span>AUC: {prediction.auc}</span>
                    <span>{prediction.modelName}</span>
                </div>
            </div>

            {/* Feature Stats */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                 <h3 className="font-semibold text-slate-900 mb-4 flex justify-between">
                    <span>Data Quality: {activeFeature}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">{featureStats.type}</span>
                 </h3>
                 <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Missing Values</span>
                        <span className={`font-medium ${featureStats.missingCount > 0 ? 'text-red-500' : 'text-slate-700'}`}>
                            {featureStats.missingCount} ({((featureStats.missingCount / meta.rowCount) * 100).toFixed(1)}%)
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Unique Values</span>
                        <span className="font-medium text-slate-700">{featureStats.uniqueCount}</span>
                    </div>
                    {featureStats.mean && (
                         <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">Mean</span>
                            <span className="font-medium text-slate-700">{featureStats.mean.toFixed(4)}</span>
                        </div>
                    )}
                 </div>
            </div>

             {/* AI Explanation */}
            {showExplanation && (
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 relative">
                     <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="font-bold text-blue-900">Expert Insight</h3>
                     </div>
                     <div className="text-sm text-blue-800 leading-relaxed">
                        {loadingExplanation ? (
                             <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-2 bg-blue-200 rounded"></div>
                                    <div className="h-2 bg-blue-200 rounded w-5/6"></div>
                                    <div className="h-2 bg-blue-200 rounded w-4/6"></div>
                                </div>
                             </div>
                        ) : (
                            explanation
                        )}
                     </div>
                     <div className="mt-3 text-xs text-blue-400 text-right">Powered by Gemini</div>
                </div>
            )}
        </div>

        {/* Right Col: Visualizations */}
        <div className="lg:col-span-2 space-y-8">
            {/* Distribution Plot */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-6">Distribution of {activeFeature}</h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="bin" tick={{fontSize: 12, fill: '#64748b'}} />
                            <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                                itemStyle={{color: '#fff'}}
                                cursor={{fill: '#f1f5f9'}}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">Shows how frequently different values of {activeFeature} occur in the dataset.</p>
            </div>

            {/* Relationship Plot */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-6">{target} vs {activeFeature}</h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                type={targetStats.type === 'categorical' ? 'category' : 'number'} 
                                dataKey="x" 
                                name={targetStats.type === 'categorical' ? target : activeFeature} 
                                tick={{fontSize: 12, fill: '#64748b'}} 
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name={targetStats.type === 'categorical' ? activeFeature : target}
                                tick={{fontSize: 12, fill: '#64748b'}} 
                            />
                            <ZAxis type="number" range={[50, 50]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                                contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b'}}
                            />
                            <Scatter name="Values" data={relationshipData} fill="#2563eb" fillOpacity={0.6} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">
                    {targetStats.type === 'categorical' 
                        ? `Visualizing the spread of ${activeFeature} across different ${target} categories.`
                        : `Correlation plot between ${target} and ${activeFeature}.`}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
