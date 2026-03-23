import React from 'react';
import { useAppStore } from './store/useAppStore';
import { useURLSync } from './hooks/useURLSync';
import { useCollaboration } from './hooks/useCollaboration';
import { FilterBar } from './components/filters/FilterBar';
import { CollaborationBar } from './components/collaboration/CollaborationBar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { ListView } from './components/list/ListView';
import { TimelineView } from './components/timeline/TimelineView';
import { ViewMode } from './types';

const VIEW_TABS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'kanban', label: 'Board', icon: '⊞' },
  { id: 'list', label: 'List', icon: '≡' },
  { id: 'timeline', label: 'Timeline', icon: '⊟' },
];

const App: React.FC = () => {
  const { view, setView } = useAppStore();
  useURLSync();
  useCollaboration();

  return (
    <div className="min-h-screen bg-surface-0 text-white flex flex-col" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/8 bg-surface-0/80 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <span className="font-semibold text-white/90 text-sm tracking-tight">Velozity</span>
            <span className="text-white/20 text-sm">/</span>
            <span className="text-white/50 text-sm">Project Tracker</span>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 bg-surface-2 rounded-xl p-1 border border-white/8">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === tab.id
                  ? 'bg-surface-4 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span className="text-sm leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Collaboration */}
        <CollaborationBar />
      </header>

      {/* Filter bar */}
      <div className="px-6 py-2.5 border-b border-white/6 bg-surface-0/50 flex-shrink-0">
        <FilterBar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        {view === 'kanban' && (
          <div className="h-full" style={{ minHeight: 'calc(100vh - 160px)' }}>
            <KanbanBoard />
          </div>
        )}
        {view === 'list' && (
          <div style={{ height: 'calc(100vh - 160px)' }}>
            <ListView />
          </div>
        )}
        {view === 'timeline' && (
          <div style={{ height: 'calc(100vh - 160px)' }}>
            <TimelineView />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
