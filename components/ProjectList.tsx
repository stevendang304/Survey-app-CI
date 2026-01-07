
import React, { useState } from 'react';
import { Plus, Copy, Search, Filter, MoreHorizontal, ExternalLink, Clock, FileText, ChevronRight, X, Calendar, Users, Briefcase, Info, Key as KeyIcon } from 'lucide-react';
import { Questionnaire, QuestionnaireStatus } from '../types';

interface ProjectListProps {
  questionnaires: Questionnaire[];
  onOpen: (q: Questionnaire) => void;
  onCreate: (data: Partial<Questionnaire>) => void;
}

const statusConfig: Record<QuestionnaireStatus, { color: string, label: string }> = {
  [QuestionnaireStatus.DRAFT]: { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Draft' },
  [QuestionnaireStatus.REVIEW]: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'In Review' },
  [QuestionnaireStatus.APPROVED]: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved' },
  [QuestionnaireStatus.LOCKED]: { color: 'bg-slate-200 text-slate-800 border-slate-300', label: 'Published' },
};

const PROJECT_TYPES = [
  'Brand Tracker',
  'Usage & Attitude (U&A)',
  'Concept Test',
  'Price Test',
  'Customer Satisfaction (CSAT)',
  'Employee Engagement',
  'Ad-hoc Qualitative',
  'Product Innovation'
];

export const ProjectList: React.FC<ProjectListProps> = ({ questionnaires, onOpen, onCreate }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Questionnaire>>({
    clientKey: '',
    projectName: '',
    name: '',
    description: '',
    projectType: PROJECT_TYPES[0],
    targetSampleSize: 1000,
    implementationStart: '',
    implementationEnd: '',
    fieldworkStart: '',
    fieldworkEnd: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setIsCreateModalOpen(false);
    // Reset form
    setFormData({
      clientKey: '',
      projectName: '',
      name: '',
      description: '',
      projectType: PROJECT_TYPES[0],
      targetSampleSize: 1000,
      implementationStart: '',
      implementationEnd: '',
      fieldworkStart: '',
      fieldworkEnd: '',
    });
  };

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto bg-slate-50/30">
      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-[22px] flex items-center justify-center shadow-xl">
                  <Plus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">New Research Project</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Declare core metadata and timelines before building</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
              {/* Section 1: Identity */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> 01. Project Identity
                </h4>
                
                {/* NEW KEY FIELD AS PER SCREENSHOT */}
                <div className="space-y-2 max-w-sm">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Key</label>
                  <input 
                    type="text" 
                    placeholder="CLIENT_KEY..."
                    value={formData.clientKey}
                    onChange={e => setFormData({ ...formData, clientKey: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Parent Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Global Brand Health 2024"
                      value={formData.projectName}
                      onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Survey Identifier</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Q4 Regional Tracker"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Study Methodology</label>
                    <select 
                      value={formData.projectType}
                      onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white transition-all outline-none appearance-none"
                    >
                      {PROJECT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Sample (N)</label>
                    <div className="relative">
                      <Users className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={formData.targetSampleSize}
                        onChange={e => setFormData({ ...formData, targetSampleSize: parseInt(e.target.value) })}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scope & Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide a brief overview of the project objectives..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Timelines */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Calendar className="w-4 h-4" /> 02. Timeline & Fieldwork
                </h4>
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Implementation</p>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Start Date</span>
                        <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">End Date</span>
                        <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fieldwork Phase</p>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Launch</span>
                        <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Close</span>
                        <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-6">
              <button 
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-8 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSubmit}
                className="px-10 py-4 bg-blue-600 text-white rounded-[22px] font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Initialize & Build Survey
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 tracking-wide uppercase"
          >
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">N</th>
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: PRJ-{q.id.padStart(4, '0')}</span>
                          {q.clientKey && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">KEY: {q.clientKey}</span>
                            </>
                          )}
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{q.projectType}</span>
                        </div>
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
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{q.targetSampleSize.toLocaleString()}</span>
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
