
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Hash, 
  Percent, 
  ListOrdered, 
  Grid3X3,
  Trash2,
  Copy,
  Variable,
  Eye,
  ChevronRight,
  Plus,
  Scissors,
  Undo2,
  Redo2,
  AlignLeft,
  Star,
  SlidersHorizontal,
  MousePointer2,
  MoreVertical,
  Activity,
  Play,
  Shuffle,
  FastForward,
  Lock,
  Workflow,
  ArrowRightLeft,
  Ban,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  FileSearch,
  Zap,
  CheckCircle2,
  FolderPlus,
  Pencil,
  Settings2,
  Type as TypeIcon,
  X,
  Bold,
  Italic,
  Underline,
  List,
  Code2,
  Link as LinkIcon,
  Search,
  ChevronLeft,
  Settings,
  Database,
  ShieldAlert,
  ArrowRightLeft as ReorderIcon,
  ScissorsLineDashed,
  Palette,
  Type,
  Maximize,
  Map,
  Target,
  Layers,
  Columns2,
  Info,
  StickyNote,
  User,
  Calendar,
  FileText as FileIcon,
  GripVertical,
  PlusCircle
} from 'lucide-react';
import { Questionnaire, Question, QuestionType, QuestionBlock } from '../../types';
import { LogicBuilder } from './LogicBuilder';
import { SurveyPreview } from './SurveyPreview';

interface BuilderProps {
  questionnaire: Questionnaire;
}

const questionLibrary = [
  { group: 'Categorical', items: [
    { type: QuestionType.SINGLE, icon: MousePointer2, description: 'One choice (Radio)' },
    { type: QuestionType.MULTIPLE, icon: CheckSquare, description: 'Multiple choices (Checkbox)' },
    { type: QuestionType.DRILL_DOWN, icon: Layers, description: 'Hierarchical cascading selection' },
  ]},
  { group: 'Attitudinal', items: [
    { type: QuestionType.GRID, icon: Grid3X3, description: 'Matrix table evaluating statements' },
    { type: QuestionType.SIDE_BY_SIDE, icon: Columns2, description: 'Compare items on multiple scales' },
    { type: QuestionType.SLIDER, icon: SlidersHorizontal, description: 'Numerical drag scale' },
    { type: QuestionType.NPS, icon: Star, description: 'Net Promoter Score (0-10)' },
    { type: QuestionType.GRAPHIC_SLIDER, icon: Activity, description: 'Visual/Icon-based scale' },
  ]},
  { group: 'Trade-off & Open', items: [
    { type: QuestionType.RANKING, icon: ListOrdered, description: 'Order items by preference' },
    { type: QuestionType.CONSTANT_SUM, icon: Percent, description: 'Allocate fixed sum (e.g., 100)' },
    { type: QuestionType.OPEN_ENDED, icon: AlignLeft, description: 'Free text entry' },
    { type: QuestionType.NUMERIC, icon: Hash, description: 'Quantity or number input' },
  ]},
  { group: 'Visual & Spec', items: [
    { type: QuestionType.HOT_SPOT, icon: Target, description: 'Click regions on an image' },
    { type: QuestionType.HEAT_MAP, icon: Map, description: 'Visual click intensity mapping' },
  ]}
];

const getLogicSummary = (q: Question) => {
  const hasDisplay = q.displayLogic && q.displayLogic.conditions.length > 0;
  const hasSkip = q.skipLogic && q.skipLogic.length > 0;
  const hasCarry = !!q.carryForward;
  const hasRandom = q.randomizationConfig?.shuffleOptions;

  if (!hasDisplay && !hasSkip && !hasCarry && !hasRandom) return null;

  return (
    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-4 animate-in fade-in duration-300">
      {hasDisplay && (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
          <Eye className="w-3.5 h-3.5" /> Visibility Logic
        </div>
      )}
      {hasSkip && (
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
          <FastForward className="w-3.5 h-3.5" /> Skip Routing
        </div>
      )}
      {hasCarry && (
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
          <ArrowRightLeft className="w-3.5 h-3.5" /> Carry Forward
        </div>
      )}
      {hasRandom && (
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
          <Shuffle className="w-3.5 h-3.5" /> Randomized
        </div>
      )}
    </div>
  );
};

export const Builder: React.FC<BuilderProps> = ({ questionnaire: initialQ }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQ.questions || []);
  const [blocks, setBlocks] = useState<QuestionBlock[]>(initialQ.blocks || []);
  const [selectedId, setSelectedId] = useState<string | null>(initialQ.questions?.[0]?.id || null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'validation' | 'logic'>('content');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sidebarActive, setSidebarActive] = useState<'library' | 'structure'>('library');
  
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // States for Modals
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<'options' | 'rows' | 'secondary'>('options');
  const [bulkText, setBulkText] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [pipedMenuState, setPipedMenuState] = useState<{
    isOpen: boolean;
    step: 'source' | 'type';
    selectedSourceId: string | null;
    searchQuery: string;
  }>({ isOpen: false, step: 'source', selectedSourceId: null, searchQuery: '' });

  const [typePickerBlockId, setTypePickerBlockId] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  useEffect(() => {
    if (blocks.length === 0) {
      const defaultBlock: QuestionBlock = {
        id: 'B1',
        name: 'Introduction Block',
        questionIds: questions.map(q => q.id),
        isExpanded: true
      };
      setBlocks([defaultBlock]);
    }
  }, []);

  const selectedQuestion = questions.find(q => q.id === selectedId);

  const handleSelectQuestion = (id: string) => {
    setSelectedId(id);
    setSelectedBlockId(null);
  };

  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id);
    setSelectedId(null);
  };

  const updateQuestion = (updated: Partial<Question>, qId?: string) => {
    const idToUpdate = qId || selectedId;
    if (!idToUpdate) return;
    setQuestions(questions.map(q => q.id === idToUpdate ? { ...q, ...updated } : q));
  };

  const handleBulkUpdate = () => {
    const newItems = bulkText.split('\n').map(t => t.trim()).filter(t => t !== '');
    if (bulkMode === 'options') {
      const newRecodes = newItems.map((_, i) => String(i + 1));
      updateQuestion({ options: newItems, optionRecodes: newRecodes });
    } else if (bulkMode === 'rows') {
      updateQuestion({ gridRows: newItems });
    } else {
      updateQuestion({ secondaryOptions: newItems });
    }
    setIsBulkEditOpen(false);
  };

  const addQuestion = (type: QuestionType, targetBlockId?: string, atIndex?: number) => {
    const isPageBreak = type === QuestionType.PAGE_BREAK;
    const isGrid = type === QuestionType.GRID || type === QuestionType.SIDE_BY_SIDE;
    const isSum = type === QuestionType.CONSTANT_SUM;
    const isDrill = type === QuestionType.DRILL_DOWN;

    const newId = isPageBreak 
      ? `PB_${Math.random().toString(36).substr(2, 4).toUpperCase()}` 
      : `Q${questions.filter(q => q.type !== QuestionType.PAGE_BREAK).length + 1}`;
    
    const newQuestion: Question = {
      id: newId,
      type,
      text: isPageBreak ? '--- New Page ---' : 'Edit this question text...',
      required: !isPageBreak,
      randomized: false,
      logic: [],
      displayLogic: { match: 'ALL', conditions: [], inPage: false },
      options: (type === QuestionType.SINGLE || type === QuestionType.MULTIPLE || type === QuestionType.RANKING || isGrid || isSum || isDrill) ? ['Option A', 'Option B', 'Option C'] : undefined,
      gridRows: isGrid ? ['Statement 1', 'Statement 2'] : undefined,
      secondaryOptions: type === QuestionType.SIDE_BY_SIDE ? ['Scale 1', 'Scale 2'] : undefined,
      validation: isSum ? { sumTo: 100 } : undefined,
    };

    let blockId = targetBlockId;
    let newBlocks = [...blocks];

    if (newBlocks.length === 0) {
      const newBlock = { id: 'B1', name: 'Default Block', questionIds: [newId], isExpanded: true };
      newBlocks = [newBlock];
    } else {
      if (!blockId) blockId = newBlocks[newBlocks.length - 1].id;
      newBlocks = newBlocks.map(b => {
        if (b.id === blockId) {
          const newQIds = [...b.questionIds];
          if (atIndex !== undefined && atIndex !== null) {
            newQIds.splice(atIndex, 0, newId);
          } else {
            newQIds.push(newId);
          }
          return { ...b, questionIds: newQIds };
        }
        return b;
      });
    }

    setQuestions([...questions, newQuestion]);
    setBlocks(newBlocks);
    handleSelectQuestion(newId);
    setTypePickerBlockId(null); 
    setInsertIndex(null);
  };

  const addBlock = () => {
    const newBlockId = `B${Date.now().toString().slice(-4)}`;
    const newBlock: QuestionBlock = {
      id: newBlockId,
      name: `New Section ${blocks.length + 1}`,
      questionIds: [],
      isExpanded: true
    };
    setBlocks([...blocks, newBlock]);
    handleSelectBlock(newBlockId);
  };

  const renameBlock = (blockId: string, newName: string) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, name: newName } : b));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    setBlocks(blocks.map(b => ({ ...b, questionIds: b.questionIds.filter(qid => qid !== id) })));
    if (selectedId === id) setSelectedId(null);
  };

  const moveQuestionInMap = (blockId: string, questionId: string, direction: 'up' | 'down') => {
    setBlocks(blocks.map(block => {
      if (block.id !== blockId) return block;
      
      const newQuestionIds = [...block.questionIds];
      const index = newQuestionIds.indexOf(questionId);
      if (index === -1) return block;
      
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newQuestionIds.length) return block;
      
      // Swap elements
      [newQuestionIds[index], newQuestionIds[targetIndex]] = [newQuestionIds[targetIndex], newQuestionIds[index]];
      
      return { ...block, questionIds: newQuestionIds };
    }));
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (visualEditorRef.current) {
      updateQuestion({ text: visualEditorRef.current.innerHTML });
    }
  };

  const insertPipedToken = (token: string) => {
    const formattedToken = `{{${token}}}`;
    if (editorMode === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('insertHTML', false, formattedToken);
      updateQuestion({ text: visualEditorRef.current.innerHTML });
    } else {
      updateQuestion({ text: (selectedQuestion?.text || '') + formattedToken });
    }
    setPipedMenuState({ isOpen: false, step: 'source', selectedSourceId: null, searchQuery: '' });
  };

  const renderVisualText = (text: string) => {
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const content = part.replace(/[{}]/g, '');
        const [id, type] = content.split(':');
        return (
          <span key={i} className="bg-slate-900 text-white px-2 py-0.5 rounded-md border border-slate-700 text-[10px] font-black inline-flex items-center gap-1 mx-0.5 shadow-sm select-none">
            <Variable className="w-2.5 h-2.5 text-blue-400" />
            {id} <span className="opacity-40 font-medium">/</span> <span className="text-blue-200">{type || 'VALUE'}</span>
          </span>
        );
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  const renderInsertPoint = (blockId: string, index: number) => {
    return (
      <div className="relative h-4 group/insert flex items-center justify-center -my-2 z-10">
        <div className="absolute inset-0 cursor-pointer" />
        <div className="w-full h-px bg-transparent group-hover/insert:bg-blue-200 transition-colors" />
        <div className="absolute flex items-center gap-2 opacity-0 group-hover/insert:opacity-100 transition-all scale-90 group-hover/insert:scale-100">
          <button 
            onClick={() => { setTypePickerBlockId(blockId); setInsertIndex(index); }}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-full text-[9px] font-black text-blue-600 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all uppercase tracking-widest"
          >
            <Plus className="w-3 h-3" /> Question
          </button>
          <button 
            onClick={() => addQuestion(QuestionType.PAGE_BREAK, blockId, index)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-500 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            <ScissorsLineDashed className="w-3 h-3" /> Page Break
          </button>
        </div>
      </div>
    );
  };

  const availablePipeSources = questions.filter(q => q.id !== selectedId && q.type !== QuestionType.PAGE_BREAK);
  const filteredSources = availablePipeSources.filter(s => 
    s.id.toLowerCase().includes(pipedMenuState.searchQuery.toLowerCase()) || 
    s.text.toLowerCase().includes(pipedMenuState.searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
      {/* Piped Text Selector Modal */}
      {pipedMenuState.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Variable className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Piped Data Source</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Select dynamic data to insert into wording</p>
                </div>
              </div>
              <button onClick={() => setPipedMenuState({ ...pipedMenuState, isOpen: false })} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {pipedMenuState.step === 'source' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-8 pt-8 pb-4">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search source questions or variables..." 
                        value={pipedMenuState.searchQuery}
                        onChange={(e) => setPipedMenuState({ ...pipedMenuState, searchQuery: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-bold focus:border-blue-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-4 custom-scrollbar">
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Project Variables</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => insertPipedToken('SYSTEM:USER_NAME')} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">Respondent Name</span>
                          </button>
                          <button onClick={() => insertPipedToken('SYSTEM:DATE')} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">Current Date</span>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-2 pt-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Survey Questions</h4>
                       <div className="space-y-2">
                          {filteredSources.map(s => (
                            <button 
                              key={s.id} 
                              onClick={() => setPipedMenuState({ ...pipedMenuState, step: 'type', selectedSourceId: s.id })}
                              className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                              <div className="flex items-center gap-4">
                                <span className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">{s.id}</span>
                                <span className="text-xs font-bold text-slate-700 truncate max-w-xs">{s.text.replace(/<[^>]*>?/gm, '')}</span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-all" />
                            </button>
                          ))}
                          {filteredSources.length === 0 && (
                            <div className="py-12 text-center text-slate-400">
                               <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                               <p className="text-sm font-bold uppercase tracking-widest">No Sources Found</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-8 space-y-6">
                  <button onClick={() => setPipedMenuState({ ...pipedMenuState, step: 'source' })} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mb-4">
                    <ChevronLeft className="w-4 h-4" /> Back to Sources
                  </button>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Data Point for {pipedMenuState.selectedSourceId}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => insertPipedToken(`${pipedMenuState.selectedSourceId}:SELECTED`)} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Selected Choice(s)</p>
                        <p className="text-[10px] text-slate-400 font-bold">The text of the option the user picked</p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    </button>
                    <button onClick={() => insertPipedToken(`${pipedMenuState.selectedSourceId}:UNSELECTED`)} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Unselected Choices</p>
                        <p className="text-[10px] text-slate-400 font-bold">The choices the user did NOT select</p>
                      </div>
                      <X className="w-6 h-6 text-slate-300" />
                    </button>
                    <button onClick={() => insertPipedToken(`${pipedMenuState.selectedSourceId}:TEXT`)} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Question Wording</p>
                        <p className="text-[10px] text-slate-400 font-bold">The actual text of the source question</p>
                      </div>
                      <TypeIcon className="w-6 h-6 text-slate-300" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Type Picker Overlay */}
      {typePickerBlockId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Plus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Question Library</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase">Select a structural element to add to block</p>
                </div>
              </div>
              <button onClick={() => { setTypePickerBlockId(null); setInsertIndex(null); }} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 overflow-y-auto grid grid-cols-2 gap-10 custom-scrollbar">
              {questionLibrary.map((group) => (
                <div key={group.group} className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">{group.group}</h4>
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <button key={item.type} onClick={() => addQuestion(item.type, typePickerBlockId, insertIndex!)} className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-slate-50 hover:border-blue-600 hover:bg-blue-50/30 transition-all group text-left">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                           <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight mb-1">{item.type}</p>
                          <p className="text-[10px] font-bold text-slate-400 leading-tight">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Bulk Edit {bulkMode}</h3>
               <button onClick={() => setIsBulkEditOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed tracking-wide">Enter one item per line. Existing data will be overwritten for this property.</p>
              <textarea 
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full h-80 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-sm outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                placeholder="Item 1&#10;Item 2&#10;Item 3..."
              />
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setIsBulkEditOpen(false)} className="px-8 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
              <button onClick={handleBulkUpdate} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/20">Sync Items</button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="h-14 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button className="p-2 rounded-lg text-slate-400 hover:bg-white hover:shadow-sm transition-all"><Undo2 className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg text-slate-400 hover:bg-white hover:shadow-sm transition-all"><Redo2 className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 px-6 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-all uppercase tracking-widest">
            <Play className="w-4 h-4 fill-slate-700" /> Test Drive
          </button>
          <button className="flex items-center gap-2 px-8 py-2 text-[11px] font-black bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase tracking-widest">
            Lock & Deploy
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="m-4 bg-slate-100/80 p-1 rounded-[22px] flex items-center border border-slate-200 shadow-sm">
            <button 
              onClick={() => setSidebarActive('library')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] rounded-[18px] transition-all duration-300 ${
                sidebarActive === 'library' 
                ? 'bg-white text-blue-600 shadow-[0_8px_20px_rgba(0,0,0,0.06)]' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> LIBRARY
            </button>
            <button 
              onClick={() => setSidebarActive('structure')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] rounded-[18px] transition-all duration-300 ${
                sidebarActive === 'structure' 
                ? 'bg-white text-blue-600 shadow-[0_8px_20px_rgba(0,0,0,0.06)]' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileIcon className="w-4 h-4" /> MAP
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {sidebarActive === 'library' ? (
              <div className="space-y-1">
                {questionLibrary.flatMap(g => g.items).map((item) => (
                  <button key={item.type} onClick={() => addQuestion(item.type)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all text-left group border border-transparent hover:border-blue-100">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{item.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold leading-tight">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {blocks.map(block => (
                  <div key={block.id} className="space-y-3">
                    <div 
                      onClick={() => handleSelectBlock(block.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] cursor-pointer transition-all border ${
                        selectedBlockId === block.id 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FolderPlus className={`w-4 h-4 shrink-0 ${selectedBlockId === block.id ? 'text-blue-400' : 'text-slate-300'}`} />
                        <span className="truncate">{block.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1 ml-4 border-l-2 border-slate-100/50 pl-3">
                      {block.questionIds.map((id, index) => {
                        const q = questions.find(q => q.id === id);
                        if (!q) return null;
                        const isSelected = selectedId === id;
                        const isPageBreak = q.type === QuestionType.PAGE_BREAK;
                        
                        return (
                          <div 
                            key={id} 
                            className={`group relative flex items-center justify-between pl-3 pr-2 py-2 rounded-xl transition-all ${
                              isSelected ? 'bg-blue-50/50 ring-1 ring-blue-100' : 'hover:bg-slate-50'
                            }`}
                          >
                            <button 
                              onClick={() => handleSelectQuestion(id)} 
                              className={`flex-1 text-left text-xs font-bold truncate transition-all flex items-center gap-2 ${
                                isSelected ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-900'
                              }`}
                            >
                              {isPageBreak ? (
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-300 flex items-center gap-2">
                                  <ScissorsLineDashed className="w-3 h-3" /> Page Break
                                </span>
                              ) : (
                                <>
                                  <span className="font-black shrink-0">{id}:</span> 
                                  <span className="truncate">{q.text.replace(/<[^>]*>?/gm, '') || 'New Item'}</span>
                                </>
                              )}
                            </button>

                            {!isPageBreak && (
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                <button 
                                  disabled={index === 0}
                                  onClick={(e) => { e.stopPropagation(); moveQuestionInMap(block.id, id, 'up'); }}
                                  className={`p-1 rounded-md transition-colors ${index === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 hover:bg-white shadow-sm hover:shadow-md'}`}
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  disabled={index === block.questionIds.length - 1}
                                  onClick={(e) => { e.stopPropagation(); moveQuestionInMap(block.id, id, 'down'); }}
                                  className={`p-1 rounded-md transition-colors ${index === block.questionIds.length - 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 hover:bg-white shadow-sm hover:shadow-md'}`}
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 overflow-y-auto p-16 custom-scrollbar scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-4 pb-60">
            {blocks.map(block => {
              const isBlockSelected = selectedBlockId === block.id;
              return (
                <section key={block.id} className={`space-y-2 relative p-12 -m-12 rounded-[60px] transition-all duration-700 ${isBlockSelected ? 'bg-blue-50/50 shadow-inner ring-1 ring-blue-100' : ''}`}>
                  <div className="flex items-center justify-between border-b-2 pb-8 mb-12 border-slate-200">
                    <div className="flex items-center gap-6 group/blockheader">
                      <div className="w-14 h-14 rounded-[24px] flex items-center justify-center text-white text-[16px] font-black bg-slate-900 shadow-2xl">BK</div>
                      <div className="relative flex items-center">
                        <input 
                          type="text" 
                          value={block.name} 
                          onChange={(e) => renameBlock(block.id, e.target.value)}
                          className="bg-transparent text-2xl font-black uppercase tracking-widest outline-none text-slate-800 pr-12 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-4 py-2 transition-all"
                          placeholder="Block Name..."
                        />
                        <Pencil className="w-5 h-5 text-slate-300 absolute right-4 pointer-events-none opacity-40 group-hover/blockheader:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    {renderInsertPoint(block.id, 0)}

                    {block.questionIds.map((id, index) => {
                      const q = questions.find(it => it.id === id);
                      if (!q) return null;
                      
                      const isPageBreak = q.type === QuestionType.PAGE_BREAK;
                      const isSelected = selectedId === q.id;

                      return (
                        <React.Fragment key={q.id}>
                          {isPageBreak ? (
                            <div className="relative py-10 group/pb">
                              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 border-t border-dashed border-slate-400" />
                              <div className="relative flex justify-center items-center gap-6">
                                <div className="bg-white px-8 py-3 rounded-[20px] border-2 border-slate-200 flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm group-hover/pb:border-blue-400 group-hover/pb:text-blue-600 transition-all">
                                  <ScissorsLineDashed className="w-4 h-4" />
                                  Next Logical Page
                                </div>
                                <button onClick={() => deleteQuestion(q.id)} className="w-10 h-10 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover/pb:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-xl"><Trash2 className="w-5 h-5" /></button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleSelectQuestion(q.id)} 
                              className={`group relative bg-white border-2 rounded-[40px] p-12 transition-all cursor-pointer mb-2 ${
                                isSelected ? 'border-blue-600 shadow-[0_30px_80px_rgba(37,99,235,0.12)] scale-[1.01] z-10' : 'border-white hover:border-slate-200 shadow-lg'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-5">
                                  <span className={`text-[11px] font-black px-4 py-2 rounded-xl text-white ${isSelected ? 'bg-blue-600 shadow-xl shadow-blue-600/40' : 'bg-slate-900'}`}>{q.id}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{q.type}</span>
                                    {q.required && <span className="text-red-500 font-black text-2xl" title="Mandatory">*</span>}
                                  </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }} className="p-3 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 rounded-[15px] transition-all"><Trash2 className="w-5 h-5" /></button>
                              </div>
                              
                              <div 
                                contentEditable={isSelected}
                                suppressContentEditableWarning
                                onBlur={(e) => updateQuestion({ text: e.currentTarget.innerHTML }, q.id)}
                                className={`text-slate-900 text-2xl font-black leading-tight mb-6 prose prose-slate max-w-none outline-none focus:ring-4 focus:ring-blue-500/5 rounded-xl px-2 py-1 transition-all ${isSelected ? 'hover:bg-slate-50 border border-transparent focus:border-blue-200' : ''}`}
                              >
                                {renderVisualText(q.text)}
                              </div>
                              
                              {q.interviewerNote && (
                                <div className="mb-8 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                                  <span className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"><Info className="w-full h-full" /></span>
                                  <p className="text-xs font-medium text-blue-800 italic">{q.interviewerNote}</p>
                                </div>
                              )}

                              <div className="space-y-4">
                                {(q.type === QuestionType.SINGLE || q.type === QuestionType.MULTIPLE || q.type === QuestionType.RANKING) && (
                                  <div className="grid gap-3">
                                    {q.options?.map((opt, i) => (
                                      <div key={i} className="flex items-center gap-5 p-4 bg-slate-50 border border-slate-100 rounded-[20px] text-[13px] text-slate-600 font-black transition-all">
                                        <div className={`w-5 h-5 border-2 border-slate-200 bg-white ${q.type === QuestionType.SINGLE ? 'rounded-full' : 'rounded-md'}`} />
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {getLogicSummary(q)}
                            </div>
                          )}
                          {renderInsertPoint(block.id, index + 1)}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            <div className="flex justify-center pt-20 border-t border-slate-200">
               <button onClick={addBlock} className="flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[28px] font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                 <FolderPlus className="w-6 h-6" /> Create Logical Block
               </button>
            </div>
          </div>
        </main>

        {/* Right Panel - Properties */}
        <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-[-10px_0_50px_rgba(0,0,0,0.04)]">
          {selectedQuestion ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[20px] flex items-center justify-center font-black shadow-[0_20px_40px_rgba(37,99,235,0.3)] text-2xl">
                  {selectedQuestion.id}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest mb-1">Configuration</h3>
                  <div className="relative group">
                    <select 
                      value={selectedQuestion.type}
                      onChange={(e) => updateQuestion({ type: e.target.value as QuestionType })}
                      className="w-full text-[12px] font-black text-blue-600 uppercase tracking-widest bg-transparent border-none p-0 outline-none cursor-pointer hover:underline appearance-none truncate"
                    >
                      {Object.values(QuestionType).filter(t => t !== QuestionType.PAGE_BREAK).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-slate-100 p-2 bg-slate-100 m-8 rounded-[24px] shrink-0">
                {(['content', 'validation', 'logic'] as const).map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`flex-1 py-3 text-[12px] font-black uppercase tracking-widest transition-all rounded-[18px] ${activeTab === tab ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-0">
                {activeTab === 'content' && (
                  <div className="space-y-12 animate-in fade-in duration-300 pb-20">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                         <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Question Text</label>
                         <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                           <button onClick={() => setEditorMode('visual')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg ${editorMode === 'visual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Visual</button>
                           <button onClick={() => setEditorMode('html')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg ${editorMode === 'html' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>HTML</button>
                         </div>
                      </div>

                      <div className="bg-slate-50 border-2 border-slate-100 rounded-t-[32px] p-4 flex flex-wrap items-center gap-3 border-b-0 relative shadow-inner">
                        <button onClick={() => execCmd('bold')} className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 active:scale-90" title="Bold"><Bold className="w-5 h-5" /></button>
                        <button onClick={() => execCmd('italic')} className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 active:scale-90" title="Italic"><Italic className="w-5 h-5" /></button>
                        <button onClick={() => execCmd('underline')} className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 active:scale-90" title="Underline"><Underline className="w-5 h-5" /></button>
                        <div className="w-px h-6 bg-slate-200 mx-2" />
                        <button 
                          onClick={() => setPipedMenuState({ ...pipedMenuState, isOpen: true })}
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-blue-200 active:scale-90 flex items-center gap-2" 
                          title="Insert Piped Data"
                        >
                          <Variable className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-tight">Piped Data</span>
                        </button>
                      </div>

                      {editorMode === 'visual' ? (
                        <div 
                          ref={visualEditorRef}
                          contentEditable
                          dangerouslySetInnerHTML={{ __html: selectedQuestion.text }}
                          onInput={(e) => updateQuestion({ text: e.currentTarget.innerHTML })}
                          className="w-full p-10 bg-white border-2 border-slate-100 rounded-b-[32px] text-xl font-black outline-none focus:border-blue-600 transition-all min-h-[150px] shadow-sm prose prose-slate max-w-none prose-p:my-0"
                        />
                      ) : (
                        <textarea 
                          value={selectedQuestion.text} 
                          onChange={(e) => updateQuestion({ text: e.target.value })} 
                          className="w-full p-8 bg-slate-900 border-2 border-slate-100 rounded-b-[32px] text-emerald-400 font-mono text-sm outline-none focus:border-blue-600 transition-all min-h-[150px] shadow-inner"
                        />
                      )}
                    </div>

                    {/* EDITABLE OPTIONS SECTION */}
                    {(selectedQuestion.options) && (
                      <div className="space-y-6 pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Answer Options</label>
                          <button 
                            onClick={() => { setBulkText(selectedQuestion.options?.join('\n') || ''); setBulkMode('options'); setIsBulkEditOpen(true); }}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                          >
                            Bulk Edit
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {selectedQuestion.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-3 group/opt animate-in fade-in duration-200">
                              <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                              <div className="flex-1 relative">
                                <input 
                                  type="text" 
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...(selectedQuestion.options || [])];
                                    newOpts[i] = e.target.value;
                                    updateQuestion({ options: newOpts });
                                  }}
                                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  const newOpts = selectedQuestion.options?.filter((_, idx) => idx !== i);
                                  updateQuestion({ options: newOpts });
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/opt:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newOpts = [...(selectedQuestion.options || []), `Option ${(selectedQuestion.options?.length || 0) + 1}`];
                              updateQuestion({ options: newOpts });
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                          >
                            <PlusCircle className="w-4 h-4" /> Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-5 pt-8 border-t border-slate-100">
                       <div className="flex items-center justify-between">
                          <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <StickyNote className="w-4 h-4 text-blue-500" />
                            Interviewer Note
                          </label>
                       </div>
                       <textarea
                         value={selectedQuestion.interviewerNote || ''}
                         onChange={(e) => updateQuestion({ interviewerNote: e.target.value })}
                         className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner min-h-[120px] placeholder:text-slate-300"
                         placeholder="Add specific instructions..."
                       />
                    </div>
                  </div>
                )}
                {activeTab === 'validation' && (
                  <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] space-y-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[15px] font-black text-slate-800 uppercase tracking-tight">Force Response</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Respondent must answer</p>
                        </div>
                        <input type="checkbox" checked={selectedQuestion.required} onChange={(e) => updateQuestion({ required: e.target.checked })} className="w-7 h-7 rounded-xl border-slate-300 text-blue-600 focus:ring-blue-600 transition-all" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'logic' && (
                  <LogicBuilder question={selectedQuestion} allQuestions={questions} onUpdate={updateQuestion} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-32 h-32 bg-slate-50 border-2 border-slate-100 rounded-[50px] flex items-center justify-center mb-12 shadow-inner"><Zap className="w-16 h-16 text-slate-200" /></div>
              <p className="text-[15px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">Select an element<br/>to begin mapping</p>
            </div>
          )}
        </aside>
      </div>
      {isPreviewOpen && <SurveyPreview questions={questions} onClose={() => setIsPreviewOpen(false)} />}
    </div>
  );
};
