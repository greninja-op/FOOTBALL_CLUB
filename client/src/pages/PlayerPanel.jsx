import { useEffect, useRef, useState } from 'react';
import PlayerDashboard from '../components/PlayerDashboard';
import PlayerCalendar from '../components/PlayerCalendar';
import LeaveRequestForm from '../components/LeaveRequestForm';
import PanelShell from '../components/PanelShell';

const NAV_HEIGHT = 88;
const SECTION_OFFSET = 150;

const PlayerPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const dashboardRef = useRef(null);
  const calendarRef = useRef(null);
  const leaveRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'dashboard', ref: dashboardRef },
        { id: 'calendar', ref: calendarRef },
        { id: 'leave', ref: leaveRef },
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
      dashboard: dashboardRef,
      calendar: calendarRef,
      leave: leaveRef,
    };

    const element = refs[sectionId]?.current;
    if (!element) return;

    window.scrollTo({
      top: element.offsetTop - NAV_HEIGHT,
      behavior: 'smooth',
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'calendar', label: 'CALENDAR' },
    { id: 'leave', label: 'LEAVE REQUESTS' },
  ];

  return (
    <PanelShell menuItems={menuItems} activeSection={activeSection} onMenuClick={scrollToSection}>
      <main className="panel-shell-main">
        <section ref={dashboardRef} id="dashboard" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Player Hub</span>
            <h1 className="panel-section-title">Dashboard</h1>
            <p className="panel-section-copy">Keep personal stats and updates in the same visual language as the rest of the club app.</p>
          </div>
          <div className="panel-card"><PlayerDashboard /></div>
        </section>

        <section ref={calendarRef} id="calendar" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Schedule</span>
            <h2 className="panel-section-title">Calendar</h2>
            <p className="panel-section-copy">Review fixtures, sessions, and excused dates without switching tabs inside a cramped card.</p>
          </div>
          <div className="panel-card"><PlayerCalendar /></div>
        </section>

        <section ref={leaveRef} id="leave" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Requests</span>
            <h2 className="panel-section-title">Leave Requests</h2>
            <p className="panel-section-copy">Submit and track leave requests with the same card system and slide-down form behavior as admin tools.</p>
          </div>
          <div className="panel-card"><LeaveRequestForm /></div>
        </section>
      </main>
    </PanelShell>
  );
};

export default PlayerPanel;
