
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Eye, FastForward, Shuffle, Anchor, AlertTriangle, Check, MinusCircle, PlusCircle, ArrowRightLeft, Info, Target, Ban, ListFilter, HelpCircle, EyeOff } from 'lucide-react';
import { Question, LogicCondition, SkipRule, LogicOperator, DisplayLogic, QuestionType, CarryForwardMode, CarryForwardConfig, RandomizationConfig, BlockOption, BlockMode } from '../../types';

interface LogicBuilderProps {
  question: Question;
  allQuestions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
}

export const LogicBuilder: React.FC<LogicBuilderProps> = ({ question, allQuestions, onUpdate }) => {
  const [logicTab, setLogicTab] = useState<'visibility' | 'choice_visibility' | 'skip' | 'random' | 'flow' | 'blocks'>('visibility');
  const [selectedOptionForLogic, setSelectedOptionForLogic] = useState<string>('');

  // Initial option for Choice Logic
  useEffect(() => {
    if (question.options && question.options.length > 0 && !selectedOptionForLogic) {
      setSelectedOptionForLogic(question.options[0]);
    }
  }, [question.id]);
  
  const [localDisplayLogic, setLocalDisplayLogic] = useState<DisplayLogic>(
    question.displayLogic || { match: 'ALL', conditions: [], inPage: false }
  );

  useEffect(() => {
    setLocalDisplayLogic(question.displayLogic || { match: 'ALL', conditions: [], inPage: false });
  }, [question.id]);

  const saveDisplayLogic = () => onUpdate({ displayLogic: localDisplayLogic });

  const getDefaultOperatorForType = (type?: QuestionType): LogicOperator => {
    if (!type) return 'is_selected';
    if (type === QuestionType.NUMERIC || type === QuestionType.PERCENTAGE) return 'equals';
    return 'is_selected';
  };

  const getOperatorsForQuestion = (qId: string): { label: string, value: LogicOperator }[] => {
    const src = allQuestions.find(q => q.id === qId);
    if (!src) return [];

    const type = src.type;
    if (type === QuestionType.SINGLE) {
      return [
        { label: 'Is Selected', value: 'is_selected' },
        { label: 'Is Not Selected', value: 'is_not_selected' },
        { label: 'Is Answered', value: 'is_answered' },
        { label: 'Is Not Answered', value: 'is_not_answered' },
      ];
    }
    if (type === QuestionType.MULTIPLE) {
      return [
        { label: 'Is Selected', value: 'is_selected' },
        { label: 'Is Not Selected', value: 'is_not_selected' },
        { label: 'Contains Any Of', value: 'contains_any' },
        { label: 'Contains All Of', value: 'contains_all' },
        { label: 'Is Answered', value: 'is_answered' },
        { label: 'Is Not Answered', value: 'is_not_answered' },
      ];
    }
    if (type === QuestionType.NUMERIC || type === QuestionType.PERCENTAGE || type === QuestionType.SLIDER) {
      return [
        { label: 'Is Equal To', value: 'equals' },
        { label: 'Is Not Equal To', value: 'not_equals' },
        { label: 'Is Greater Than', value: 'greater_than' },
        { label: 'Is Less Than', value: 'less_than' },
        { label: 'Is Between', value: 'between' },
        { label: 'Is Answered', value: 'is_answered' },
        { label: 'Is Not Answered', value: 'is_not_answered' },
      ];
    }
    return [
      { label: 'Is Equal To', value: 'equals' },
      { label: 'Is Answered', value: 'is_answered' },
      { label: 'Is Not Answered', value: 'is_not_answered' },
    ];
  };

  // Visibility Condition Helper
  const createCondition = (): LogicCondition => {
    const defaultSource = allQuestions.find(q => q.id !== question.id && q.type !== QuestionType.PAGE_BREAK);
    return {
      id: Math.random().toString(36).substr(2, 9),
      sourceType: 'question',
      sourceQuestionId: defaultSource?.id || '',
      operator: getDefaultOperatorForType(defaultSource?.type),
      value: ''
    };
  };

  // --- Option Specific Visibility Logic ---
  const optionLogic = question.optionDisplayLogic?.[selectedOptionForLogic] || { match: 'ALL', conditions: [], inPage: false };

  const updateOptionLogic = (updates: Partial<DisplayLogic>) => {
    const newOptionLogic = { ...optionLogic, ...updates };
    onUpdate({
      optionDisplayLogic: {
        ...(question.optionDisplayLogic || {}),
        [selectedOptionForLogic]: newOptionLogic
      }
    });
  };

  const addOptionCondition = () => {
    updateOptionLogic({ conditions: [...optionLogic.conditions, createCondition()] });
  };

  const removeOptionCondition = (id: string) => {
    updateOptionLogic({ conditions: optionLogic.conditions.filter(c => c.id !== id) });
  };

  const updateOptionCondition = (id: string, updates: Partial<LogicCondition>) => {
    updateOptionLogic({
      conditions: optionLogic.conditions.map(c => {
        if (c.id === id) {
          const merged = { ...c, ...updates };
          if (updates.sourceQuestionId) {
            const newSource = allQuestions.find(q => q.id === updates.sourceQuestionId);
            merged.operator = getDefaultOperatorForType(newSource?.type);
            merged.value = '';
          }
          return merged;
        }
        return c;
      })
    });
  };

  // General helpers
  const updateCarryForward = (updates: Partial<CarryForwardConfig>) => {
    onUpdate({
      carryForward: {
        sourceQuestionId: '',
        mode: CarryForwardMode.SELECTED,
        ...(question.carryForward || {}),
        ...updates
      }
    });
  };

  const removeCarryForward = () => onUpdate({ carryForward: undefined });

  const addSkipRule = () => {
    const newRule: SkipRule = {
      id: Math.random().toString(36).substr(2, 9),
      targetQuestionId: '',
      conditions: [{
        id: Math.random().toString(36).substr(2, 9),
        sourceType: 'question',
        sourceQuestionId: question.id,
        operator: 'is_selected',
        value: question.options?.[0] || ''
      }]
    };
    onUpdate({ skipLogic: [...(question.skipLogic || []), newRule] });
  };

  const updateSkipRule = (ruleId: string, updates: Partial<SkipRule>) => {
    onUpdate({
      skipLogic: (question.skipLogic || []).map(r => r.id === ruleId ? { ...r, ...updates } : r)
    });
  };

  const updateSkipCondition = (ruleId: string, conditionId: string, updates: Partial<LogicCondition>) => {
    onUpdate({
      skipLogic: (question.skipLogic || []).map(r => {
        if (r.id === ruleId) {
          return {
            ...r,
            conditions: r.conditions.map(c => c.id === conditionId ? { ...c, ...updates } : c)
          };
        }
        return r;
      })
    });
  };

  const updateRandomization = (key: keyof RandomizationConfig, value: any) => {
    onUpdate({
      randomizationConfig: {
        shuffleOptions: false,
        anchorLastN: 0,
        anchorFirstN: 0,
        ...(question.randomizationConfig || {}),
        [key]: value
      }
    });
  };

  const addBlockOption = () => {
    const newBlock: BlockOption = {
      id: Math.random().toString(36).substr(2, 9),
      sourceChoice: question.options?.[0] || '',
      mode: BlockMode.MUTUALLY_EXCLUSIVE,
      targets: []
    };
    onUpdate({ blockOptions: [...(question.blockOptions || []), newBlock] });
  };

  const updateBlockOption = (blockId: string, updates: Partial<BlockOption>) => {
    onUpdate({
      blockOptions: (question.blockOptions || []).map(b => b.id === blockId ? { ...b, ...updates } : b)
    });
  };

  const removeBlockOption = (blockId: string) => {
    onUpdate({
      blockOptions: (question.blockOptions || []).filter(b => b.id !== blockId)
    });
  };

  const toggleBlockTarget = (blockId: string, targetChoice: string) => {
    const block = question.blockOptions?.find(b => b.id === blockId);
    if (!block) return;
    const newTargets = block.targets.includes(targetChoice)
      ? block.targets.filter(t => t !== targetChoice)
      : [...block.targets, targetChoice];
    updateBlockOption(blockId, { targets: newTargets });
  };

  const qIndex = allQuestions.findIndex(q => q.id === question.id);
  const previousQuestions = allQuestions.slice(0, qIndex);
  const futureQuestions = allQuestions.slice(qIndex + 1).filter(q => q.type !== QuestionType.PAGE_BREAK);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap">
        {[
          { id: 'visibility', icon: Eye, label: 'Show' },
          { id: 'choice_visibility', icon: EyeOff, label: 'Choice' },
          { id: 'skip', icon: FastForward, label: 'Skip' },
          { id: 'blocks', icon: Ban, label: 'Blocks' },
          { id: 'random', icon: Shuffle, label: 'Order' },
          { id: 'flow', icon: ArrowRightLeft, label: 'Flow' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setLogicTab(tab.id as any)}
            className={`flex-1 min-w-[50px] flex items-center justify-center gap-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${
              logicTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {logicTab === 'visibility' && (
          <div className="flex flex-col h-full space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <Eye className="w-3 h-3" /> Visibility Logic
              </p>
              <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                "Display this question only if the following condition(s) are met."
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Matching</p>
                   <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer group">
                      <input 
                        type="radio" 
                        name="matchType" 
                        checked={localDisplayLogic.match === 'ALL'} 
                        onChange={() => setLocalDisplayLogic(p => ({ ...p, match: 'ALL' }))} 
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" 
                      />
                      <span className="text-xs font-semibold text-slate-700">All of the following conditions (AND)</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer group">
                      <input 
                        type="radio" 
                        name="matchType" 
                        checked={localDisplayLogic.match === 'ANY'} 
                        onChange={() => setLocalDisplayLogic(p => ({ ...p, match: 'ANY' }))} 
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" 
                      />
                      <span className="text-xs font-semibold text-slate-700">Any of the following conditions (OR)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  {localDisplayLogic.conditions.map((cond, index) => {
                    const sourceQ = allQuestions.find(q => q.id === cond.sourceQuestionId);
                    const operators = getOperatorsForQuestion(cond.sourceQuestionId);
                    const needsValue = !['is_answered', 'is_not_answered'].includes(cond.operator);

                    return (
                      <div key={cond.id} className="relative p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rule {index + 1}</span>
                          <button onClick={() => setLocalDisplayLogic(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== cond.id) }))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-500 uppercase">Question</label>
                          <select 
                            value={cond.sourceQuestionId} 
                            onChange={(e) => {
                              setLocalDisplayLogic(prev => ({ 
                                ...prev, 
                                conditions: prev.conditions.map(c => {
                                  if (c.id === cond.id) {
                                    const newSource = allQuestions.find(q => q.id === e.target.value);
                                    return { ...c, sourceQuestionId: e.target.value, operator: getDefaultOperatorForType(newSource?.type), value: '' };
                                  }
                                  return c;
                                })
                              }));
                            }} 
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            {allQuestions.filter(q => q.id !== question.id && q.type !== QuestionType.PAGE_BREAK).map(q => (
                              <option key={q.id} value={q.id}>{q.id}: {q.text.substring(0, 30)}...</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-500 uppercase">Operator</label>
                          <select 
                            value={cond.operator} 
                            onChange={(e) => {
                              setLocalDisplayLogic(prev => ({ 
                                ...prev, 
                                conditions: prev.conditions.map(c => c.id === cond.id ? { ...c, operator: e.target.value as LogicOperator } : c)
                              }));
                            }} 
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[11px] outline-none"
                          >
                            {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                          </select>
                        </div>

                        {needsValue && (
                          <div className="space-y-1 pt-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Value</label>
                            {sourceQ?.options ? (
                              <select 
                                value={cond.value} 
                                onChange={(e) => {
                                  setLocalDisplayLogic(prev => ({ 
                                    ...prev, 
                                    conditions: prev.conditions.map(c => c.id === cond.id ? { ...c, value: e.target.value } : c)
                                  }));
                                }} 
                                className="w-full px-2 py-1.5 bg-slate-900 text-white rounded text-[11px] font-bold outline-none"
                              >
                                <option value="">-- Choose Choice --</option>
                                {sourceQ.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <div className="space-y-2">
                                <input 
                                  type={sourceQ?.type === QuestionType.NUMERIC || sourceQ?.type === QuestionType.PERCENTAGE ? 'number' : 'text'}
                                  value={cond.value} 
                                  onChange={(e) => {
                                    setLocalDisplayLogic(prev => ({ 
                                      ...prev, 
                                      conditions: prev.conditions.map(c => c.id === cond.id ? { ...c, value: e.target.value } : c)
                                    }));
                                  }} 
                                  placeholder="Enter value..."
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold outline-none"
                                />
                                {cond.operator === 'between' && (
                                  <input 
                                    type="number"
                                    value={cond.secondValue || ''} 
                                    onChange={(e) => {
                                      setLocalDisplayLogic(prev => ({ 
                                        ...prev, 
                                        conditions: prev.conditions.map(c => c.id === cond.id ? { ...c, secondValue: e.target.value } : c)
                                      }));
                                    }} 
                                    placeholder="And..."
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold outline-none"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setLocalDisplayLogic(prev => ({ ...prev, conditions: [...prev.conditions, createCondition()] }))} 
                  className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-widest"
                >
                  <PlusCircle className="w-4 h-4" /> Add Logic Condition
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={localDisplayLogic.inPage} 
                        onChange={(e) => setLocalDisplayLogic(p => ({ ...p, inPage: e.target.checked }))} 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">In-Page Execution</span>
                    </label>
                    <span title="Question appears dynamically on the same page as soon as conditions are met.">
                      <HelpCircle className="w-3 h-3 text-slate-300" />
                    </span>
                  </div>
                  <button 
                    onClick={saveDisplayLogic} 
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition-all"
                  >
                    Apply Logic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {logicTab === 'choice_visibility' && (
          <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <EyeOff className="w-3 h-3" /> Choice Visibility Logic
              </p>
              <p className="text-[10px] text-indigo-600 leading-relaxed font-medium">
                "Show specific answer choices only if certain conditions are met."
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Option to Configure</label>
              <select 
                value={selectedOptionForLogic}
                onChange={(e) => setSelectedOptionForLogic(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none shadow-sm focus:border-indigo-500 transition-all"
              >
                {question.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>

            {selectedOptionForLogic && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-indigo-500 underline-offset-4">Rule for: {selectedOptionForLogic}</p>
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
                      <input 
                        type="radio" 
                        name="optionMatchType" 
                        checked={optionLogic.match === 'ALL'} 
                        onChange={() => updateOptionLogic({ match: 'ALL' })} 
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" 
                      />
                      <span className="text-[11px] font-semibold text-slate-700">All conditions (AND)</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
                      <input 
                        type="radio" 
                        name="optionMatchType" 
                        checked={optionLogic.match === 'ANY'} 
                        onChange={() => updateOptionLogic({ match: 'ANY' })} 
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" 
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Any conditions (OR)</span>
                    </label>
                  </div>

                  <div className="space-y-3 pt-2">
                    {optionLogic.conditions.map((cond, index) => {
                      const sourceQ = allQuestions.find(q => q.id === cond.sourceQuestionId);
                      const operators = getOperatorsForQuestion(cond.sourceQuestionId);
                      const needsValue = !['is_answered', 'is_not_answered'].includes(cond.operator);

                      return (
                        <div key={cond.id} className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Cond {index + 1}</span>
                            <button onClick={() => removeOptionCondition(cond.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          
                          <select 
                            value={cond.sourceQuestionId} 
                            onChange={(e) => updateOptionCondition(cond.id, { sourceQuestionId: e.target.value })} 
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-semibold outline-none"
                          >
                            {allQuestions.filter(q => q.id !== question.id && q.type !== QuestionType.PAGE_BREAK).map(q => (
                              <option key={q.id} value={q.id}>{q.id}: {q.text.substring(0, 20)}...</option>
                            ))}
                          </select>

                          <select 
                            value={cond.operator} 
                            onChange={(e) => updateOptionCondition(cond.id, { operator: e.target.value as LogicOperator })} 
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[11px] outline-none"
                          >
                            {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                          </select>

                          {needsValue && (
                            sourceQ?.options ? (
                              <select 
                                value={cond.value} 
                                onChange={(e) => updateOptionCondition(cond.id, { value: e.target.value })} 
                                className="w-full px-2 py-1.5 bg-indigo-900 text-white rounded text-[11px] font-bold outline-none"
                              >
                                <option value="">-- Choice --</option>
                                {sourceQ.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input 
                                type="text"
                                value={cond.value} 
                                onChange={(e) => updateOptionCondition(cond.id, { value: e.target.value })} 
                                placeholder="Enter value..."
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold outline-none"
                              />
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={addOptionCondition} 
                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Choice Condition
                  </button>
              </div>
            )}
          </div>
        )}

        {logicTab === 'blocks' && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Ban className="w-3 h-3" /> Selection Block Options</p>
              <p className="text-[10px] text-red-600 leading-relaxed">Ensure logically consistent data by blocking specific choice combinations at runtime.</p>
            </div>

            <div className="space-y-3">
              {(question.blockOptions || []).map((block, idx) => (
                <div key={block.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 group">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <ListFilter className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Rule {idx + 1}</span>
                    </div>
                    <button onClick={() => removeBlockOption(block.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2">1. Source Option Selection</label>
                      <select 
                        value={block.sourceChoice}
                        onChange={(e) => updateBlockOption(block.id, { sourceChoice: e.target.value })}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold outline-none"
                      >
                        {question.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">2. Enforcement Behavior</label>
                      <select 
                        value={block.mode}
                        onChange={(e) => updateBlockOption(block.id, { mode: e.target.value as BlockMode })}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded text-[11px] outline-none"
                      >
                        <option value={BlockMode.MUTUALLY_EXCLUSIVE}>Mutually Exclusive (Standard 'None of above')</option>
                        <option value={BlockMode.BLOCK_LIST}>Block Specific Targets</option>
                      </select>
                    </div>

                    {block.mode === BlockMode.BLOCK_LIST && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-50">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">3. Targeted Block List</label>
                        <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-100 rounded custom-scrollbar">
                          {question.options?.filter(opt => opt !== block.sourceChoice).map((opt, i) => (
                            <label key={i} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition-colors group/item">
                              <input 
                                type="checkbox" 
                                checked={block.targets.includes(opt)} 
                                onChange={() => toggleBlockTarget(block.id, opt)}
                                className="w-3 h-3 text-red-600 rounded ring-offset-2 focus:ring-2 focus:ring-red-500"
                              />
                              <span className="text-[10px] text-slate-600 truncate group-hover/item:text-slate-900">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={addBlockOption}
              disabled={question.type !== QuestionType.MULTIPLE || !question.options || question.options.length === 0}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Add Block Strategy</span>
            </button>
          </div>
        )}

        {logicTab === 'skip' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><FastForward className="w-3 h-3" /> Skip Logic</p>
              <p className="text-[10px] text-amber-600 leading-relaxed">Route respondents forward based on their selection.</p>
            </div>

            <div className="space-y-3">
              {(question.skipLogic || []).map((rule, idx) => (
                <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skip Rule {idx + 1}</span>
                    <button onClick={() => onUpdate({ skipLogic: question.skipLogic?.filter(r => r.id !== rule.id) })} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">If Respondent selects:</label>
                      <select 
                        value={rule.conditions[0].value}
                        onChange={(e) => updateSkipCondition(rule.id, rule.conditions[0].id, { value: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] outline-none"
                      >
                        {question.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Skip to:</label>
                      <select 
                        value={rule.targetQuestionId}
                        onChange={(e) => updateSkipRule(rule.id, { targetQuestionId: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-900 text-white rounded text-[11px] font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Choose Destination --</option>
                        <option value="TERMINATE" className="text-red-400">TERMINATE INTERVIEW</option>
                        {futureQuestions.map(q => (
                          <option key={q.id} value={q.id}>{q.id}: {q.text.substring(0, 30)}...</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={addSkipRule}
              disabled={!question.options || question.options.length === 0}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Add Skip Statement</span>
            </button>
          </div>
        )}

        {logicTab === 'random' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl group transition-all">
                <div className="flex items-center gap-3"><Shuffle className="w-4 h-4 text-slate-400" /><div><p className="text-xs font-bold text-slate-700">Shuffle Options</p></div></div>
                <input type="checkbox" checked={question.randomizationConfig?.shuffleOptions || false} onChange={(e) => updateRandomization('shuffleOptions', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-emerald-600" />
             </div>
             {question.randomizationConfig?.shuffleOptions && (
               <div className="space-y-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl animate-in slide-in-from-top-2">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Anchor Top N</label>
                    <input type="number" value={question.randomizationConfig?.anchorFirstN || 0} onChange={(e) => updateRandomization('anchorFirstN', parseInt(e.target.value))} className="w-12 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-center font-bold" />
                 </div>
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Anchor Bottom N</label>
                    <input type="number" value={question.randomizationConfig?.anchorLastN || 0} onChange={(e) => updateRandomization('anchorLastN', parseInt(e.target.value))} className="w-12 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-center font-bold" />
                 </div>
               </div>
             )}
          </div>
        )}

        {logicTab === 'flow' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><ArrowRightLeft className="w-3 h-3" /> Carry Forward Choices</p>
              <p className="text-[10px] text-blue-600 leading-relaxed">Pull options from a previous question.</p>
            </div>

            {question.carryForward ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 relative group">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={removeCarryForward} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">1. Source Question</label>
                    <select value={question.carryForward.sourceQuestionId} onChange={(e) => updateCarryForward({ sourceQuestionId: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none">
                      <option value="">-- Choose Previous --</option>
                      {previousQuestions.filter(q => q.options && q.options.length > 0).map(q => <option key={q.id} value={q.id}>{q.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">2. Mode</label>
                    <select value={question.carryForward.mode} onChange={(e) => updateCarryForward({ mode: e.target.value as CarryForwardMode })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold outline-none">
                      {Object.values(CarryForwardMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => updateCarryForward({})} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all group">
                <ArrowRightLeft className="w-6 h-6 text-slate-300 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Enable Carry Forward</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
