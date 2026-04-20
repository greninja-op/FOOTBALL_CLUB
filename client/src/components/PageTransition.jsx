import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const prevPath = useRef(null);
  const timersRef = useRef([]);
  const [phase, setPhase] = useState('idle');
  const [logoUrl, setLogoUrl] = useState(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const pendingChildren = useRef(children);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isFirstMount = useRef(true);

  useEffect(() => {
    fetch(`${API_URL}/api/public/home`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.club?.logoUrl) {
          setLogoUrl(`${API_URL}${data.club.logoUrl}`);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setPhase('login-open');
      const timer = setTimeout(() => setPhase('idle'), 1200);
      timersRef.current.push(timer);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  useLayoutEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = location.pathname;
      return;
    }

    if (prevPath.current === location.pathname) {
      return;
    }

    prevPath.current = location.pathname;
    pendingChildren.current = children;
    setPhase('closing');

    const closeTimer = setTimeout(() => {
      setDisplayChildren(pendingChildren.current);
      setPhase('holding');
    }, 500);

    const openTimer = setTimeout(() => {
      setPhase('opening');
    }, 900);

    const idleTimer = setTimeout(() => {
      setPhase('idle');
    }, 1400);

    timersRef.current.push(closeTimer, openTimer, idleTimer);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      clearTimeout(idleTimer);
    };
    // Intentionally only depend on pathname — depending on `children` here would
    // incorrectly re-trigger the walls animation whenever a child state update
    // (e.g., pagination within System Logs or User Management) creates a new
    // children reference, producing the "home page briefly flashes" bug.
  }, [location.pathname]);

  useEffect(() => {
    if (phase === 'idle') {
      setDisplayChildren(children);
    } else {
      pendingChildren.current = children;
    }
  }, [children, phase]);

  const wallClass = (() => {
    if (phase === 'login-open') return 'walls-login-open';
    if (phase === 'closing' || phase === 'holding') return 'walls-closing';
    if (phase === 'opening') return 'walls-opening';
    return '';
  })();

  const contentIsHidden = phase === 'closing' || phase === 'holding';

  const LogoHalfLeft = () =>
    logoUrl ? (
      <img
        src={logoUrl}
        alt="Club crest"
        className={`logo-half ${phase === 'holding' ? 'logo-pulse' : ''}`}
        style={{
          width: 100,
          height: 100,
          objectFit: 'contain',
          position: 'absolute',
          right: 0,
          clipPath: isMobile ? 'inset(0 0 50% 0)' : 'inset(0 50% 0 0)',
        }}
      />
    ) : (
      <div
        style={{
          position: 'absolute',
          right: 0,
          width: 50,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: 2,
        }}
      >
        FC
      </div>
    );

  const LogoHalfRight = () =>
    logoUrl ? (
      <img
        src={logoUrl}
        alt="Club crest"
        className={phase === 'holding' ? 'logo-pulse' : ''}
        style={{
          width: 100,
          height: 100,
          objectFit: 'contain',
          position: 'absolute',
          left: 0,
          clipPath: isMobile ? 'inset(50% 0 0 0)' : 'inset(0 0 0 50%)',
        }}
      />
    ) : null;

  if (isMobile) {
    return (
      <div className="bg-cinematic scanlines vignette" style={{ minHeight: '100vh' }}>
        <div className={wallClass}>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'var(--color-bg-deep)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              transform: phase === 'idle' ? 'translateY(-100%)' : 'translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
              pointerEvents: 'none',
            }}
          >
            <LogoHalfLeft />
          </div>
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'var(--color-bg-deep)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              transform: phase === 'idle' ? 'translateY(100%)' : 'translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
              pointerEvents: 'none',
            }}
          >
            <LogoHalfRight />
          </div>
        </div>

        <div
          style={{
            opacity: contentIsHidden ? 0 : 1,
            transition: 'opacity 0.15s ease-out',
            pointerEvents: contentIsHidden ? 'none' : 'auto',
          }}
        >
          {displayChildren}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cinematic scanlines vignette" style={{ minHeight: '100vh' }}>
      <div className="fog-layer-1" aria-hidden />
      <div className="fog-layer-2" aria-hidden />

      <div className={wallClass} aria-hidden>
        <div className="wall-left">
          <div className="wall-texture" />
          <LogoHalfLeft />
        </div>

        <div className="wall-right">
          <div className="wall-texture" />
          <LogoHalfRight />
        </div>
      </div>

      <div
        style={{
          opacity: contentIsHidden ? 0 : 1,
          transition: 'opacity 0.15s ease-out',
          pointerEvents: contentIsHidden ? 'none' : 'auto',
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
};

export default PageTransition;
