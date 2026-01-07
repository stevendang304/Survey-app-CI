
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Workflow, 
  Send,
  Database, 
  BarChart3,
  FilePieChart,
  Settings, 
  ChevronRight,
  User,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { View } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  isProjectSelected?: boolean;
  selectedProjectName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, isProjectSelected, selectedProjectName }) => {
  // Only survey-specific lifecycle tabs remain in the header
  const lifecycleTabs = [
    { id: View.BUILDER, label: 'Survey', icon: FileText },
    { id: View.WORKFLOWS, label: 'Workflows', icon: Workflow },
    { id: View.DISTRIBUTIONS, label: 'Distributions', icon: Send },
  ];

  // Global level navigation items for the sidebar
  const globalNavItems = [
    { id: View.DATA_ANALYSIS, label: 'Data & Analysis', icon: Database },
    { id: View.RESULTS, label: 'Results', icon: BarChart3 },
    { id: View.REPORTS, label: 'Reports', icon: FilePieChart },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Sidebar - Persistent Global Level */}
      <aside className="w-16 bg-slate-900 flex flex-col items-center py-6 shrink-0 border-r border-slate-800">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs mb-8 shadow-lg shadow-blue-600/20">IA</div>
        
        <nav className="flex-1 flex flex-col gap-6">
          {/* Main Portal Entry */}
          <button 
            onClick={() => onNavigate(View.PROJECT_LIST)}
            className={`p-2 rounded-lg transition-all ${currentView === View.PROJECT_LIST ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            title="Project Portal"
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>

          <div className="w-8 h-px bg-slate-800 mx-auto my-2" />

          {/* Grouped Data & Results Cluster (Global Level) */}
          {globalNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`p-2 rounded-lg transition-all ${currentView === item.id ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-6 items-center">
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-all relative" title="Notifications">
            <Bell className="w-6 h-6" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-all" title="Settings">
            <Settings className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center overflow-hidden hover:border-slate-600 cursor-pointer transition-all shadow-sm">
            <User className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Contextual Top Header */}
        {isProjectSelected && [View.BUILDER, View.WORKFLOWS, View.DISTRIBUTIONS].includes(currentView) && (
          <header className="bg-white border-b border-slate-200 shrink-0">
            <div className="px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate(View.PROJECT_LIST)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </button>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <h2 className="text-sm font-bold text-slate-800">{selectedProjectName}</h2>
                <div className="ml-3 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase tracking-tight border border-slate-200">Draft v2.4</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cloud Saved</span>
                </div>
              </div>
            </div>
            
            {/* Lifecycle Tabs for specific survey tasks */}
            <nav className="px-6 flex gap-8">
              {lifecycleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`flex items-center gap-2 py-3 text-xs font-bold transition-all border-b-2 tracking-wide uppercase ${
                    currentView === tab.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${currentView === tab.id ? 'text-blue-600' : 'text-slate-300'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </header>
        )}

        {children}
      </div>
    </div>
  );
};
