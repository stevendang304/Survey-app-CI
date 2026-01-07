
import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ArrowRight,
  ArrowRightLeft,
  Ban,
  Info,
  Lock,
  Workflow,
  EyeOff
} from 'lucide-react';
import { Question, QuestionType, LogicCondition, DisplayLogic, CarryForwardMode, BlockMode } from '../../types';

interface SurveyPreviewProps {
  questions: Question[];
  onClose: () => void;
}

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ questions, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);

  // --- Advanced Piped Text Resolution Engine ---
  const resolvePipedText = (text: string, currentResponses: Record<string, any>) => {
    // structured token: {{QID:TYPE}}
    return text.replace(/\{\{([^{}:]+):?([^{}]*)\}\}/g, (match, id, type) => {
      const sourceQId = id.trim();
      const pipingType = type.trim() || 'SELECTED';

      // Handle System / Variable Piping
      if (sourceQId === 'SYSTEM') {
        if (pipingType === 'USER_NAME') return '<span class="text-blue-600 font-black">Jane Respondent</span>';
        if (pipingType === 'DATE') return new Date().toLocaleDateString();
        return `<span class="text-slate-400">[System:${pipingType}]</span>`;
      }

      const sourceQ = questions.find(q => q.id === sourceQId);
      if (!sourceQ) return `<span class="text-red-500 font-bold">[Invalid Source: ${sourceQId}]</span>`;

      // Option 1: Question Text
      if (pipingType === 'TEXT') {
        return sourceQ.text.replace(/<[^>]*>?/gm, ''); // Strip HTML
      }

      // Option 2: Responses (Selected/Unselected)
      const response = currentResponses[sourceQId];
      
      if (response === undefined || response === null || response === '' || (Array.isArray(response) && response.length === 0)) {
        return `<span class="bg-amber-50 text-amber-600 px-2 py-0.5 border border-amber-200 rounded text-[10px] font-black uppercase tracking-tighter">(${sourceQId} unanswered)</span>`;
      }

      if (pipingType === 'SELECTED') {
        if (Array.isArray(response)) return response.join(', ');
        return String(response);
      }

      if (pipingType === 'UNSELECTED') {
        if (!sourceQ.options) return '';
        const selected = Array.isArray(response) ? response : [String(response)];
        const unselected = sourceQ.options.filter(opt => !selected.includes(opt));
        return unselected.join(', ');
      }

      return String(response);
    });
  };

  // Evaluate logic for a single condition
  const isConditionMet = (cond: LogicCondition, currentResponses: Record<string, any>) => {
    const val = currentResponses[cond.sourceQuestionId];
    if (val === undefined || val === null) return cond.operator === 'is_not_answered';

    switch (cond.operator) {
      case 'is_selected':
      case 'equals': 
        if (Array.isArray(val)) return val.includes(cond.value);
        return String(val) === cond.value;
      case 'is_not_selected':
      case 'not_equals':
        if (Array.isArray(val)) return !val.includes(cond.value);
        return String(val) !== cond.value;
      case 'contains_any':
        if (!Array.isArray(val)) return String(val).includes(cond.value);
        return val.some(v => cond.value.includes(v));
      case 'contains_all':
        if (!Array.isArray(val)) return false;
        const requiredValues = cond.value.split(',').map(v => v.trim());
        return requiredValues.every(rv => val.includes(rv));
      case 'greater_than': return Number(val) > Number(cond.value);
      case 'less_than': return Number(val) < Number(cond.value);
      case 'between': 
        const num = Number(val);
        return num >= Number(cond.value) && num <= Number(cond.secondValue || Infinity);
      case 'is_answered': return val !== '' && val !== null && (Array.isArray(val) ? val.length > 0 : true);
      case 'is_not_answered': return val === '' || val === null || (Array.isArray(val) && val.length === 0);
      default: return true;
    }
  };

  const evaluateDisplayLogic = (logic: DisplayLogic | undefined, currentResponses: Record<string, any>) => {
    if (!logic || !logic.conditions || logic.conditions.length === 0) return true;
    
    if (logic.match === 'ALL') {
      return logic.conditions.every(cond => isConditionMet(cond, currentResponses));
    } else {
      return logic.conditions.some(cond => isConditionMet(cond, currentResponses));
    }
  };

  const visibleQuestions = useMemo(() => {
    return questions.filter(q => {
      if (q.type === QuestionType.PAGE_BREAK) return true;
      const logic = q.displayLogic;
      if (!logic || logic.conditions.length === 0) return true;
      return evaluateDisplayLogic(logic, responses);
    });
  }, [questions, responses]);

  const pages = useMemo(() => {
    const grouped: Question[][] = [[]];
    let currentIdx = 0;
    
    questions.forEach(q => {
      if (q.type === QuestionType.PAGE_BREAK) {
        if (grouped[currentIdx].length > 0) {
          grouped.push([]);
          currentIdx++;
        }
      } else {
        const isVisible = visibleQuestions.some(vq => vq.id === q.id);
        if (isVisible) {
          grouped[currentIdx].push(q);
        }
      }
    });
    
    return grouped.filter(p => p.length > 0);
  }, [visibleQuestions, questions]);

  const progress = Math.round(((currentPage + 1) / Math.max(1, pages.length)) * 100);

  const handleNext = () => {
    const currentQuestions = pages[currentPage] || [];
    let skipTarget: string | null = null;

    for (const q of currentQuestions) {
      if (q.skipLogic && q.skipLogic.length > 0) {
        for (const rule of q.skipLogic) {
          const ruleMet = rule.conditions.every(c => isConditionMet(c, responses));
          if (ruleMet) {
            skipTarget = rule.targetQuestionId;
            break; 
          }
        }
      }
      if (skipTarget) break;
    }

    if (skipTarget === 'TERMINATE') {
      setIsFinished(true);
      return;
    }

    if (skipTarget) {
      const targetPageIndex = pages.findIndex(p => p.some(q => q.id === skipTarget));
      if (targetPageIndex !== -1) {
        setCurrentPage(targetPageIndex);
        window.scrollTo(0, 0);
        return;
      }
    }

    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    } else {
      setIsFinished(true);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const updateResponse = (id: string, value: any) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleMultipleChoiceSelection = (q: Question, opt: string) => {
    const current = responses[q.id] || [];
    const isSelected = current.includes(opt);
    let nextValue: string[] = [];

    if (isSelected) {
      nextValue = current.filter((v: string) => v !== opt);
    } else {
      const blockRule = q.blockOptions?.find(b => b.sourceChoice === opt);
      
      if (blockRule?.mode === BlockMode.MUTUALLY_EXCLUSIVE) {
        nextValue = [opt];
      } else {
        nextValue = current.filter((v: string) => {
          const rule = q.blockOptions?.find(b => b.sourceChoice === v);
          return rule?.mode !== BlockMode.MUTUALLY_EXCLUSIVE;
        });
        nextValue.push(opt);

        if (blockRule?.mode === BlockMode.BLOCK_LIST) {
          nextValue = nextValue.filter(v => !blockRule.targets.includes(v));
        }
      }
    }
    updateResponse(q.id, nextValue);
  };

  const isChoiceBlocked = (q: Question, opt: string) => {
    const current = responses[q.id] || [];
    if (!Array.isArray(current) || current.length === 0) return false;

    const isOptMutuallyExclusive = q.blockOptions?.some(b => b.sourceChoice === opt && b.mode === BlockMode.MUTUALLY_EXCLUSIVE);
    if (isOptMutuallyExclusive && current.length > 0 && !current.includes(opt)) return true;

    return current.some(selectedOpt => {
      const rule = q.blockOptions?.find(b => b.sourceChoice === selectedOpt);
      if (!rule) return false;
      
      if (rule.mode === BlockMode.MUTUALLY_EXCLUSIVE) return true;
      if (rule.mode === BlockMode.BLOCK_LIST) return rule.targets.includes(opt);
      
      return false;
    });
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Thank You!</h2>
          <p className="text-slate-500 text-lg">Your responses have been recorded.</p>
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Close Preview</button>
        </div>
      </div>
    );
  }

  const currentQuestions = pages[currentPage] || [];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded">PREVIEW MODE</div>
          <h3 className="text-sm font-bold text-slate-700">Respondent View: <span className="text-slate-400 font-normal">Page {currentPage + 1} of {pages.length}</span></h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
      </header>

      <div className="h-1 w-full bg-slate-200">
        <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto pt-12 pb-32 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          {currentQuestions.map((q) => {
            let baseOptions = [...(q.options || [])];
            let carriedOptions: string[] = [];

            if (q.carryForward && q.carryForward.sourceQuestionId) {
              const sourceQ = questions.find(it => it.id === q.carryForward!.sourceQuestionId);
              const sourceResp = responses[q.carryForward.sourceQuestionId];

              if (sourceQ && sourceQ.options) {
                switch (q.carryForward.mode) {
                  case CarryForwardMode.SELECTED:
                    carriedOptions = sourceQ.options.filter(opt => {
                      if (Array.isArray(sourceResp)) return sourceResp.includes(opt);
                      return sourceResp === opt;
                    });
                    break;
                  case CarryForwardMode.UNSELECTED:
                    carriedOptions = sourceQ.options.filter(opt => {
                      if (Array.isArray(sourceResp)) return !sourceResp.includes(opt);
                      return sourceResp !== opt && sourceResp !== undefined;
                    });
                    break;
                  case CarryForwardMode.ALL:
                  case CarryForwardMode.DISPLAYED:
                    carriedOptions = sourceQ.options;
                    break;
                }
              }
            }

            const allPossibleOptions = [...baseOptions, ...carriedOptions];
            const displayOptions = allPossibleOptions.filter(opt => {
              const logic = q.optionDisplayLogic?.[opt];
              if (!logic || logic.conditions.length === 0) return true;
              return evaluateDisplayLogic(logic, responses);
            });

            return (
              <div key={q.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 
                      className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight"
                      dangerouslySetInnerHTML={{ __html: resolvePipedText(q.text, responses) + (q.required ? ' <span class="text-red-500">*</span>' : '') }}
                    />
                    {q.interviewerNote && (
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-blue-800 leading-relaxed italic">
                          {q.interviewerNote}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Specialized Grid Rendering */}
                    {q.type === QuestionType.GRID && (
                       <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="p-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Statements</th>
                              {q.options?.map((opt, i) => (
                                <th key={i} className="p-5 text-center text-[11px] font-black text-slate-600 uppercase tracking-widest border-r border-slate-100 last:border-r-0">{opt}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {q.gridRows?.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-5 text-sm font-black text-slate-700 border-r border-slate-100">{row}</td>
                                {q.options?.map((_, colIndex) => (
                                  <td key={colIndex} className="p-5 text-center border-r border-slate-100 last:border-r-0">
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 mx-auto bg-white cursor-pointer hover:border-blue-500 transition-colors" />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(q.type === QuestionType.SINGLE || q.type === QuestionType.MULTIPLE) && (
                      <div className="grid grid-cols-1 gap-4">
                        {displayOptions.map((opt, i) => {
                          const isSelected = q.type === QuestionType.SINGLE 
                            ? responses[q.id] === opt 
                            : (responses[q.id] || []).includes(opt);
                          
                          const isCarried = carriedOptions.includes(opt);
                          const isBlocked = q.type === QuestionType.MULTIPLE && isChoiceBlocked(q, opt);
                          const isMutuallyExclusive = q.blockOptions?.some(b => b.sourceChoice === opt && b.mode === BlockMode.MUTUALLY_EXCLUSIVE);

                          return (
                            <button
                              key={i}
                              disabled={isBlocked}
                              onClick={() => {
                                if (q.type === QuestionType.SINGLE) {
                                  updateResponse(q.id, opt);
                                } else {
                                  handleMultipleChoiceSelection(q, opt);
                                }
                              }}
                              className={`text-left rounded-2xl border-2 transition-all p-5 flex gap-4 items-center group relative ${
                                isBlocked ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed grayscale' :
                                isSelected ? 'border-blue-600 bg-blue-50 shadow-md ring-4 ring-blue-600/5' : 'border-white bg-white hover:border-slate-200 shadow-sm'
                              }`}
                            >
                              <div className="flex-1 flex items-center gap-4">
                                <div className={`w-6 h-6 border-2 shrink-0 flex items-center justify-center transition-colors ${
                                  isBlocked ? 'border-slate-300' :
                                  isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'
                                } ${q.type === QuestionType.SINGLE ? 'rounded-full' : 'rounded-md'}`}>
                                  {isSelected && (<div className="w-2 h-2 bg-white rounded-full" />)}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className={`text-lg font-medium truncate ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{opt}</span>
                                  
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {isCarried && (
                                      <span className="text-[9px] text-indigo-500 font-bold flex items-center gap-1 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                                        <ArrowRightLeft className="w-2.5 h-2.5" /> Referenced
                                      </span>
                                    )}
                                    {isMutuallyExclusive && !isBlocked && (
                                      <span className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-widest bg-red-50 px-1.5 py-0.5 rounded">
                                        <Ban className="w-2.5 h-2.5" /> Mutually Exclusive
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="h-24 bg-white border-t border-slate-200 px-8 flex items-center shrink-0">
        <div className="max-w-2xl mx-auto w-full flex justify-between">
          <button disabled={currentPage === 0} onClick={handleBack} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'}`}><ChevronLeft className="w-5 h-5" /> Back</button>
          <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
            {currentPage === pages.length - 1 ? 'Finish Survey' : 'Next'}
            <ChevronRight className="w-6 h-6 ml-2" />
          </button>
        </div>
      </footer>
    </div>
  );
};
