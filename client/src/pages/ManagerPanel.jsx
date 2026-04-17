import { useEffect, useRef, useState } from 'react';
import FixtureCalendar from '../components/FixtureCalendar';
import ContractManagement from '../components/ContractManagement';
import DocumentVault from '../components/DocumentVault';
import InventoryManagement from '../components/InventoryManagement';
import FinanceDashboard from '../components/FinanceDashboard';
import PanelShell from '../components/PanelShell';

const NAV_HEIGHT = 88;
const SECTION_OFFSET = 150;

const ManagerPanel = () => {
  const [activeSection, setActiveSection] = useState('fixtures');

  const fixturesRef = useRef(null);
  const contractsRef = useRef(null);
  const documentsRef = useRef(null);
  const inventoryRef = useRef(null);
  const financeRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'fixtures', ref: fixturesRef },
        { id: 'contracts', ref: contractsRef },
        { id: 'documents', ref: documentsRef },
        { id: 'inventory', ref: inventoryRef },
        { id: 'finance', ref: financeRef },
      ];

      const scrollPosition = window.scrollY + SECTION_OFFSET;

      for (const section of sections) {
        const element = section.ref.current;
        if (!element) continue;

        const { offsetTop, offsetHeight } = element;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const refs = {
      fixtures: fixturesRef,
      contracts: contractsRef,
      documents: documentsRef,
      inventory: inventoryRef,
      finance: financeRef,
    };

    const element = refs[sectionId]?.current;
    if (!element) return;

    window.scrollTo({
      top: element.offsetTop - NAV_HEIGHT,
      behavior: 'smooth',
    });
  };

  const menuItems = [
    { id: 'fixtures', label: 'FIXTURES' },
    { id: 'contracts', label: 'CONTRACTS' },
    { id: 'documents', label: 'DOCUMENTS' },
    { id: 'inventory', label: 'INVENTORY' },
    { id: 'finance', label: 'FINANCE' },
  ];

  return (
    <PanelShell menuItems={menuItems} activeSection={activeSection} onMenuClick={scrollToSection}>
      <main className="panel-shell-main">
        <section ref={fixturesRef} id="fixtures" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Scheduling</span>
            <h1 className="panel-section-title">Fixtures</h1>
            <p className="panel-section-copy">Create and manage fixtures in the same floating shell as the rest of the manager workflow.</p>
          </div>
          <div className="panel-card"><FixtureCalendar /></div>
        </section>

        <section ref={contractsRef} id="contracts" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Administration</span>
            <h2 className="panel-section-title">Contracts</h2>
            <p className="panel-section-copy">Track contract status with clearer separation and less visual clutter.</p>
          </div>
          <div className="panel-card"><ContractManagement /></div>
        </section>

        <section ref={documentsRef} id="documents" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Records</span>
            <h2 className="panel-section-title">Documents</h2>
            <p className="panel-section-copy">Manage player paperwork inside the shared design system instead of isolated card styles.</p>
          </div>
          <div className="panel-card"><DocumentVault /></div>
        </section>

        <section ref={inventoryRef} id="inventory" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Equipment</span>
            <h2 className="panel-section-title">Inventory</h2>
            <p className="panel-section-copy">Track and assign equipment with more breathing room and management-friendly form behavior.</p>
          </div>
          <div className="panel-card"><InventoryManagement /></div>
        </section>

        <section ref={financeRef} id="finance" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Reporting</span>
            <h2 className="panel-section-title">Finance</h2>
            <p className="panel-section-copy">See fine tracking and payment data in the same visual structure as the rest of the manager tools.</p>
          </div>
          <div className="panel-card"><FinanceDashboard /></div>
        </section>
      </main>
    </PanelShell>
  );
};

export default ManagerPanel;
