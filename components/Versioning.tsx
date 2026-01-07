
import React from 'react';
import { CheckCircle2, Clock, User, ArrowLeftRight, RotateCcw, MessageSquare, Send } from 'lucide-react';
import { Questionnaire, QuestionnaireStatus, VersionEntry } from '../types';

interface VersioningProps {
  questionnaire: Questionnaire | null;
}

export const Versioning: React.FC<VersioningProps> = ({ questionnaire }) => {
  if (!questionnaire) return <div className="p-12 text-slate-500 text-center">Select a questionnaire to view history</div>;

  const mockVersions: VersionEntry[] = [
    { id: '1', version: 'v2.4', author: 'Jane Smith', timestamp: 'Oct 24, 2:30 PM', status: QuestionnaireStatus.DRAFT, comment: 'Updated logic for Q12 filter' },
    { id: '2', version: 'v2.3', author: 'John Doe', timestamp: 'Oct 23, 11:15 AM', status: QuestionnaireStatus.REVIEW, comment: 'Sent for PM approval' },
    { id: '3', version: 'v2.2', author: 'Jane Smith', timestamp: 'Oct 22, 9:00 AM', status: QuestionnaireStatus.DRAFT, comment: 'Bulk upload of numeric questions' },
    { id: '4', version: 'v2.1', author: 'System', timestamp: 'Oct 20, 5:45 PM', status: QuestionnaireStatus.APPROVED, comment: 'Baseline approved for fieldwork' },
  ];

  const approvalSteps = [
    { role: 'Researcher', name: 'Jane Smith', date: 'Oct 23', status: 'completed' },
    { role: 'QC Analyst', name: 'Mark Wu', date: 'Oct 23', status: 'completed' },
    { role: 'Project Manager', name: 'Sarah Connor', date: 'Oct 24', status: 'pending' },
    { role: 'Client Admin', name: 'External', date: '-', status: 'locked' },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Governance & History</h1>
          <p className="text-slate-500 mt-1 text-sm">Review changes, roll back versions, and track approvals for {questionnaire.name}.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50">
            <ArrowLeftRight className="w-4 h-4" />
            Compare Versions
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm">
            <Send className="w-4 h-4" />
            Request Approval
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Version Timeline</h3>
              <span className="text-xs text-slate-400 font-medium">LATEST FIRST</span>
            </div>
            <div className="divide-y divide-slate-100">
              {mockVersions.map((v) => (
                <div key={v.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">{v.version}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                          {v.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{v.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <User className="w-3 h-3" />
                      <span>{v.author}</span>
                    </div>
                    <p className="text-sm text-slate-600 italic bg-slate-50/50 p-3 rounded border border-slate-100">
                      "{v.comment}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:text-blue-600 hover:border-blue-200 shadow-sm" title="Rollback to this">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:text-slate-900 shadow-sm" title="View snapshot">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Approval Workflow</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
              {approvalSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-6">
                  <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 ${
                    step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    step.status === 'pending' ? 'bg-amber-100 border-amber-300 text-amber-600' :
                    'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{step.role}</p>
                    <p className="text-sm font-semibold text-slate-800">{step.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Internal Discussion</h3>
            <div className="space-y-4 mb-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">JD</div>
                <div className="flex-1 bg-slate-50 p-3 rounded-lg text-xs">
                  <p className="font-bold mb-1">John Doe <span className="text-[10px] font-normal text-slate-400 ml-2">10:45 AM</span></p>
                  <p className="text-slate-600">Sarah, did you check the randomization rules for the brand grid? I think we might need to anchor the 'Other' option.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <textarea 
                placeholder="Add a comment..." 
                className="w-full p-3 pr-10 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none min-h-[80px]"
              />
              <button className="absolute bottom-3 right-3 text-blue-600 hover:text-blue-700">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
