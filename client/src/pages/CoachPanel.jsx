import { useEffect, useRef, useState } from 'react';
import TacticalBoard from '../components/TacticalBoard';
import TrainingSchedule from '../components/TrainingSchedule';
import SquadHealth from '../components/SquadHealth';
import DisciplinaryPanel from '../components/DisciplinaryPanel';
import LeaveApproval from '../components/LeaveApproval';
import PerformanceTracking from '../components/PerformanceTracking';
import PanelShell from '../components/PanelShell';

const NAV_HEIGHT = 88;
const SECTION_OFFSET = 150;

const CoachPanel = () => {
  const [activeSection, setActiveSection] = useState('tactical');

  const tacticalRef = useRef(null);
  const trainingRef = useRef(null);
  const healthRef = useRef(null);
  const disciplineRef = useRef(null);
  const leaveRef = useRef(null);
  const performanceRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'tactical', ref: tacticalRef },
        { id: 'training', ref: trainingRef },
        { id: 'health', ref: healthRef },
        { id: 'discipline', ref: disciplineRef },
        { id: 'leave', ref: leaveRef },
        { id: 'performance', ref: performanceRef },
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
      tactical: tacticalRef,
      training: trainingRef,
      health: healthRef,
      discipline: disciplineRef,
      leave: leaveRef,
      performance: performanceRef,
    };

    const element = refs[sectionId]?.current;
    if (!element) return;

    window.scrollTo({
      top: element.offsetTop - NAV_HEIGHT,
      behavior: 'smooth',
    });
  };

  const menuItems = [
    { id: 'tactical', label: 'TACTICAL BOARD' },
    { id: 'training', label: 'TRAINING' },
    { id: 'health', label: 'SQUAD HEALTH' },
    { id: 'discipline', label: 'DISCIPLINE' },
    { id: 'leave', label: 'LEAVE APPROVAL' },
    { id: 'performance', label: 'PERFORMANCE' },
  ];

  return (
    <PanelShell menuItems={menuItems} activeSection={activeSection} onMenuClick={scrollToSection}>
      <main className="panel-shell-main">
        <section ref={tacticalRef} id="tactical" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Matchday Control</span>
            <h1 className="panel-section-title">Tactical Board</h1>
            <p className="panel-section-copy">Build lineups, revise positions, and manage bench decisions from a full-width tactical workspace.</p>
          </div>
          <div className="panel-card"><TacticalBoard /></div>
        </section>

        <section ref={trainingRef} id="training" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Planning</span>
            <h2 className="panel-section-title">Training</h2>
            <p className="panel-section-copy">Schedule sessions and track attendance without leaving the same coaching page.</p>
          </div>
          <div className="panel-card"><TrainingSchedule /></div>
        </section>

        <section ref={healthRef} id="health" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Availability</span>
            <h2 className="panel-section-title">Squad Health</h2>
            <p className="panel-section-copy">See only player health data and availability instead of non-playing staff records.</p>
          </div>
          <div className="panel-card"><SquadHealth /></div>
        </section>

        <section ref={disciplineRef} id="discipline" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Standards</span>
            <h2 className="panel-section-title">Discipline</h2>
            <p className="panel-section-copy">Review fines and disciplinary actions in the same visual language as the rest of the panel.</p>
          </div>
          <div className="panel-card"><DisciplinaryPanel /></div>
        </section>

        <section ref={leaveRef} id="leave" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Requests</span>
            <h2 className="panel-section-title">Leave Approval</h2>
            <p className="panel-section-copy">Approve or deny player requests with cleaner spacing and calmer feedback.</p>
          </div>
          <div className="panel-card"><LeaveApproval /></div>
        </section>

        <section ref={performanceRef} id="performance" className="panel-section">
          <div className="panel-section-heading">
            <span className="panel-section-kicker">Review</span>
            <h2 className="panel-section-title">Performance</h2>
            <p className="panel-section-copy">Update stats and notes from the same scrolling coaching workspace.</p>
          </div>
          <div className="panel-card"><PerformanceTracking /></div>
        </section>
      </main>
    </PanelShell>
  );
};

export default CoachPanel;
