import { useState } from 'react';
import Navbar from '../components/Navbar';
import UserManagement from '../components/UserManagement';
import ClubSettings from '../components/ClubSettings';
import SystemLogs from '../components/SystemLogs';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [accessDenied, setAccessDenied] = useState(false);

  const tabs = [
    { id: 'users', label: 'User Management', component: UserManagement },
    { id: 'settings', label: 'Club Settings', component: ClubSettings },
    { id: 'logs', label: 'System Logs', component: SystemLogs }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {accessDenied ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">
              You do not have permission to access this resource.
            </p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div>
                {ActiveComponent && <ActiveComponent />}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
