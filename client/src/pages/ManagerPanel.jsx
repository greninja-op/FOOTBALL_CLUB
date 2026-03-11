import { useState } from 'react'
import Navbar from '../components/Navbar'
import FixtureCalendar from '../components/FixtureCalendar'
import ContractManagement from '../components/ContractManagement'
import DocumentVault from '../components/DocumentVault'
import InventoryManagement from '../components/InventoryManagement'
import FinanceDashboard from '../components/FinanceDashboard'

const ManagerPanel = () => {
  const [activeTab, setActiveTab] = useState('fixtures')

  const tabs = [
    { id: 'fixtures', label: 'Fixtures', component: FixtureCalendar },
    { id: 'contracts', label: 'Contracts', component: ContractManagement },
    { id: 'documents', label: 'Documents', component: DocumentVault },
    { id: 'inventory', label: 'Inventory', component: InventoryManagement },
    { id: 'finance', label: 'Finance', component: FinanceDashboard }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manager Panel</h1>
          <p className="text-gray-600 mt-2">
            Manage fixtures, contracts, documents, inventory, and finances.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
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
      </main>
    </div>
  )
}

export default ManagerPanel
