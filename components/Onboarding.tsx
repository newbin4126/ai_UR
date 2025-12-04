import React from 'react';

interface OnboardingProps {
  onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-fade-in-up">
        <div className="bg-blue-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to UR</h2>
          <p className="text-blue-100">Medical Data Analysis made simple.</p>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-slate-900">Upload Data</h4>
                <p className="text-sm text-slate-500">Drag and drop your CSV file containing medical records.</p>
              </div>
            </div>
             <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-slate-900">Select Variables</h4>
                <p className="text-sm text-slate-500">Choose what to predict (e.g., Diagnosis) and which factors affect it.</p>
              </div>
            </div>
             <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-slate-900">Get Insights</h4>
                <p className="text-sm text-slate-500">View automated graphs, statistics, and AI-powered explanations.</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-8 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};