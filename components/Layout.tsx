import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              U
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-800">UR</span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">문서</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">지원</span>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <a 
            href="https://youtube.com/shorts/qPaP36Gf--c?si=7ZrMnD_0rUHh5yv2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-red-600 transition-colors transform hover:scale-110 duration-200"
            aria-label="YouTube 영상 보기"
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C3.537 15.255 3.532 12 3.532 12s.004-3.255.42-4.814a2.507 2.507 0 0 1 1.768-1.767C7.299 5.005 13.554 5.005 13.554 5.005s6.255 0 7.814.413H19.812zM9.544 15.568V8.432L15.818 12l-6.274 3.568z" clipRule="evenodd" />
            </svg>
          </a>
          <p className="text-sm">&copy; {new Date().getFullYear()} UR Analytics. team DBDB. AI - final assignment</p>
        </div>
      </footer>
    </div>
  );
};