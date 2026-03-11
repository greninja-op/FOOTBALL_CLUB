import { useState } from 'react';
import Navbar from '../components/Navbar';
import TacticalBoard from '../components/TacticalBoard';
import TrainingSchedule from '../components/TrainingSchedule';
import SquadHealth from '../components/SquadHealth';
import DisciplinaryPanel from '../components/DisciplinaryPanel';
import LeaveApproval from '../components/LeaveApproval';
import PerformanceTracking from '../components/PerformanceTracking';

const CoachPanel = () => {
  const [activeTab, setActiveTab] = useState('tactical');

  const tabs = [
    { id: 'tactical', label: 'Tactical Board', component: TacticalBoard },
    { id: 'training', label: 'Training', component: TrainingSchedule },
    { id: 'health', label: 'Squad Health', component: SquadHealth },
    { id: 'discipline', label: 'Discipline', component: DisciplinaryPanel },
    { id: 'leave', label: 'Leave Approval', component: LeaveApproval },
    { id: 'performance', label: 'Performance', component: PerformanceTracking }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Active Tab Content */}
          <div>
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachPanel;
