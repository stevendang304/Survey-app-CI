
import React, { useState } from 'react';
import { Upload, FileText, Settings, Play, Download, Terminal, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const DPTool: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

  const jobs = [
    { id: 'JOB-001', project: 'Brand Health Q3', status: 'completed', date: 'Oct 24, 09:00', type: 'Weights & SPSS' },
    { id: 'JOB-002', project: 'NPD Concept A', status: 'failed', date: 'Oct 23, 14:20', type: 'Data Cleaning' },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">DP Automation Pipeline</h1>
        <p className="text-slate-500 mt-1 text-sm">Transform raw survey data into clean deliverables based on questionnaire metadata.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Wizard Steps */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100">
              {[
                { n: 1, label: 'Upload Raw', icon: Upload },
                { n: 2, label: 'Mapping Rules', icon: Settings },
                { n: 3, label: 'Process Data', icon: Play },
                { n: 4, label: 'Export Output', icon: Download },
              ].map((step) => (
                <button
                  key={step.n}
                  onClick={() => setActiveStep(step.n)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-r border-slate-100 last:border-r-0 ${
                    activeStep === step.n ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  {step.label}
                </button>
              ))}
            </div>

            <div className="p-12 min-h-[400px] flex flex-col items-center justify-center">
              {activeStep === 1 && (
                <div className="max-w-md w-full text-center">
                  <div className="w-20 h-20 bg-blue-50 border-2 border-dashed border-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Raw Survey Data</h3>
                  <p className="text-sm text-slate-500 mb-8">Supported formats: .csv, .xlsx, .dat. Maximum file size 500MB.</p>
                  <label className="inline-block px-8 py-3 bg-slate-900 text-white rounded-lg font-bold text-sm cursor-pointer hover:bg-slate-800 shadow-lg shadow-slate-900/10">
                    Select Data Files
                    <input type="file" className="hidden" />
                  </label>
                  <p className="mt-6 text-xs text-slate-400">Total records currently in pipeline: 0</p>
                </div>
              )}

              {activeStep === 3 && (
                <div className="w-full space-y-8">
                  <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm text-emerald-400 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                      <Terminal className="w-4 h-4" />
                      <span className="text-slate-400">Pipeline Execution Log</span>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-slate-500">[09:00:01]</span> INITIALIZING RUNTIME...</p>
                      <p><span className="text-slate-500">[09:00:02]</span> PARSING METADATA FROM QUESTIONNAIRE V2.4</p>
                      <p><span className="text-slate-500">[09:00:04]</span> MAPPING 54 VARIABLES TO CI_STANDARD_v4.2</p>
                      <p className="text-amber-400"><span className="text-slate-500">[09:00:05]</span> WARNING: Q11 RESPONSE RANGE EXCEEDED BY 2% OF SAMPLE</p>
                      <p><span className="text-slate-500">[09:00:08]</span> GENERATING WEIGHTING VECTORS...</p>
                      {jobStatus === 'running' && <p className="animate-pulse">_ EXECUTION IN PROGRESS...</p>}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setJobStatus('running')}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Run Pipeline
                    </button>
                  </div>
                </div>
              )}

              {activeStep !== 1 && activeStep !== 3 && (
                <div className="text-center text-slate-400">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">Feature coming soon in Phase 2</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Recent Jobs</h3>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400">{job.id}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${
                      job.status === 'completed' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {job.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-1">{job.project}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{job.type}</span>
                    <span className="text-[10px] text-slate-400">{job.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Pro Tip</h3>
              <p className="text-sm leading-relaxed mb-4">You can download the standard mapping file directly from the questionnaire version history screen to bypass manual config.</p>
              <button className="text-xs font-bold text-white underline hover:text-blue-200">GET MAPPING FILE</button>
            </div>
            <FileText className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};
