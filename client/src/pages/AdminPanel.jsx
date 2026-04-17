import { useEffect, useRef, useState } from 'react';
import UserManagement from '../components/UserManagement';
import ClubSettings from '../components/ClubSettings';
import SystemLogs from '../components/SystemLogs';
import PlayerArchiveManager from '../components/PlayerArchiveManager';
import PanelShell from '../components/PanelShell';

const SECTION_OFFSET = 150;
const NAV_HEIGHT = 88;

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('users');

  const usersRef = useRef(null);
  const archiveRef = useRef(null);
  const settingsRef = useRef(null);
  const logsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'users', ref: usersRef },
        { id: 'archive', ref: archiveRef },
        { id: 'settings', ref: settingsRef },
        { id: 'logs', ref: logsRef },
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
      users: usersRef,
      archive: archiveRef,
      settings: settingsRef,
      logs: logsRef,
    };

    const element = refs[sectionId]?.current;
    if (!element) return;

    window.scrollTo({
      top: element.offsetTop - NAV_HEIGHT,
      behavior: 'smooth',
    });
  };

  const menuItems = [
    { id: 'users', label: 'USER MANAGEMENT' },
    { id: 'archive', label: 'PLAYER ARCHIVE' },
    { id: 'settings', label: 'CLUB SETTINGS' },
    { id: 'logs', label: 'SYSTEM LOGS' },
  ];

  return (
    <PanelShell
      menuItems={menuItems}
      activeSection={activeSection}
      onMenuClick={scrollToSection}
    >
      <main className="panel-shell-main">
        <section ref={usersRef} id="users" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Administration</span>
            <h1 className="panel-section-title">User Management</h1>
            <p className="panel-section-copy">Create, edit, and control system access without cramped overlays or clipped forms.</p>
          </div>
          <div className="panel-card">
            <UserManagement />
          </div>
        </section>

        <section ref={archiveRef} id="archive" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Player Lifecycle</span>
            <h2 className="panel-section-title">Player Archive</h2>
            <p className="panel-section-copy">Archive and reinstate records from a dedicated floating workspace.</p>
          </div>
          <div className="panel-card">
            <PlayerArchiveManager />
          </div>
        </section>

        <section ref={settingsRef} id="settings" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Club Identity</span>
            <h2 className="panel-section-title">Club Settings</h2>
            <p className="panel-section-copy">Keep homepage content, visual identity, and club details aligned in one place.</p>
          </div>
          <div className="panel-card">
            <ClubSettings />
          </div>
        </section>

        <section ref={logsRef} id="logs" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Security</span>
            <h2 className="panel-section-title">System Logs</h2>
            <p className="panel-section-copy">Review live presence, login history, and the audit trail without leaving the admin shell.</p>
          </div>
          <div className="panel-card">
            <SystemLogs />
          </div>
        </section>
      </main>
    </PanelShell>
  );
};

export default AdminPanel;
