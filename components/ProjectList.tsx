
import React from 'react';
import { Plus, Copy, Search, Filter, MoreHorizontal, ExternalLink, Clock, FileText, ChevronRight } from 'lucide-react';
import { Questionnaire, QuestionnaireStatus } from '../types';

interface ProjectListProps {
  questionnaires: Questionnaire[];
  onOpen: (q: Questionnaire) => void;
}

const statusConfig: Record<QuestionnaireStatus, { color: string, label: string }> = {
  [QuestionnaireStatus.DRAFT]: { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Draft' },
  [QuestionnaireStatus.REVIEW]: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'In Review' },
  [QuestionnaireStatus.APPROVED]: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved' },
  [QuestionnaireStatus.LOCKED]: { color: 'bg-slate-200 text-slate-800 border-slate-300', label: 'Published' },
};

export const ProjectList: React.FC<ProjectListProps> = ({ questionnaires, onOpen }) => {
  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto bg-slate-50/30">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Portal</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Manage enterprise-grade research assets and fieldwork questionnaires.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Copy className="w-4 h-4" />
            Clone Existing
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 tracking-wide uppercase">
            <Plus className="w-4 h-4" />
            Create New Survey
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find a project by name or ID..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all placeholder:text-slate-400"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {questionnaires.length} Records Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Survey Metadata</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Questionnaire</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {questionnaires.map((q) => {
                const status = statusConfig[q.status];
                return (
                  <tr 
                    key={q.id} 
                    className="hover:bg-slate-50/50 cursor-pointer transition-all group"
                    onClick={() => onOpen(q)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{q.projectName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">ID: PRJ-{q.id}0023</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{q.name}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{q.version}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{q.lastUpdated}</span>
                        </div>
                        <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 transition-all opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
          <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View Archived Projects</button>
        </div>
      </div>
    </div>
  );
};
