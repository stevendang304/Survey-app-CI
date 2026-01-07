
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { Builder } from './components/Builder/Builder';
import { Versioning } from './components/Versioning';
import { DPTool } from './components/DPTool';
import { Questionnaire, QuestionnaireStatus, QuestionType } from './types';

export enum View {
  PROJECT_LIST = 'projects',
  BUILDER = 'survey',
  WORKFLOWS = 'workflows',
  DISTRIBUTIONS = 'distributions',
  DATA_ANALYSIS = 'data',
  RESULTS = 'results',
  REPORTS = 'reports',
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.PROJECT_LIST);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([
    {
      id: '1',
      clientKey: 'GBH-2024-INTL',
      projectName: 'Global Brand Health 2024',
      name: 'Q3 Brand Tracker',
      projectType: 'Brand Tracker',
      targetSampleSize: 2500,
      implementationStart: '2024-01-01',
      implementationEnd: '2024-12-31',
      fieldworkStart: '2024-07-01',
      fieldworkEnd: '2024-07-21',
      version: 'v2.4',
      status: QuestionnaireStatus.DRAFT,
      lastUpdated: '2 hours ago',
      questions: [
        {
          id: 'Q1',
          type: QuestionType.SINGLE,
          text: 'How often do you purchase energy drinks?',
          required: true,
          randomized: false,
          logic: [],
          options: ['Daily', 'Weekly', 'Monthly', 'Never']
        },
        {
          id: 'Q2',
          type: QuestionType.MULTIPLE,
          text: 'Which of the following brands have you seen advertised recently?',
          required: true,
          randomized: true,
          logic: [],
          options: ['Red Bull', 'Monster', 'Rockstar', 'Celsius', 'Prime']
        }
      ],
      blocks: [
        { id: 'B1', name: 'Usage & Awareness', questionIds: ['Q1', 'Q2'], isExpanded: true }
      ]
    },
    {
      id: '2',
      clientKey: 'PACK-TEST-X',
      projectName: 'Product Innovation X',
      name: 'Packaging Concept Test',
      projectType: 'Concept Test',
      targetSampleSize: 800,
      implementationStart: '2024-05-15',
      implementationEnd: '2024-06-30',
      fieldworkStart: '2024-06-01',
      fieldworkEnd: '2024-06-15',
      version: 'v1.0',
      status: QuestionnaireStatus.APPROVED,
      lastUpdated: '1 day ago',
      questions: [],
      blocks: []
    }
  ]);

  const handleOpenBuilder = (q: Questionnaire) => {
    setSelectedQuestionnaire(q);
    setCurrentView(View.BUILDER);
  };

  const handleCreateNew = (data: Partial<Questionnaire>) => {
    const newSurvey: Questionnaire = {
      id: (questionnaires.length + 1).toString(),
      clientKey: data.clientKey || 'NO_KEY',
      projectName: data.projectName || 'New Project',
      name: data.name || 'Untitled Survey',
      description: data.description,
      projectType: data.projectType || 'Ad-hoc',
      targetSampleSize: data.targetSampleSize || 500,
      implementationStart: data.implementationStart || '',
      implementationEnd: data.implementationEnd || '',
      fieldworkStart: data.fieldworkStart || '',
      fieldworkEnd: data.fieldworkEnd || '',
      version: 'v1.0',
      status: QuestionnaireStatus.DRAFT,
      lastUpdated: 'Just now',
      questions: [],
      blocks: [],
    };
    setQuestionnaires([...questionnaires, newSurvey]);
    handleOpenBuilder(newSurvey);
  };

  const renderView = () => {
    switch (currentView) {
      case View.PROJECT_LIST:
        return <ProjectList questionnaires={questionnaires} onOpen={handleOpenBuilder} onCreate={handleCreateNew} />;
      case View.BUILDER:
        return selectedQuestionnaire ? (
          <Builder questionnaire={selectedQuestionnaire} />
        ) : (
          <div className="p-12 text-center text-slate-400 font-medium">No questionnaire selected</div>
        );
      case View.WORKFLOWS:
        return <Versioning questionnaire={selectedQuestionnaire} />;
      case View.DATA_ANALYSIS:
        return <DPTool />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
            <div className="w-20 h-20 bg-white shadow-sm border border-slate-200 rounded-3xl flex items-center justify-center mb-6">
              <span className="text-slate-300 text-3xl font-black">...</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Feature Under Development</h3>
            <p className="text-slate-500 max-w-sm mt-2 text-sm">The {currentView} module is currently scheduled for the next deployment phase.</p>
            <button 
              onClick={() => setCurrentView(View.BUILDER)}
              className="mt-8 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
            >
              Back to Builder
            </button>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView}
      isProjectSelected={!!selectedQuestionnaire}
      selectedProjectName={selectedQuestionnaire?.name}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
