import { useEffect, useRef } from 'react';
import Navbar from './Navbar';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.5 + 0.05,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      gold: Math.random() < 0.12,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.gold
          ? `rgba(212,175,55,${particle.alpha})`
          : `rgba(255,255,255,${particle.alpha})`;
        ctx.fill();

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

const PitchGhost = () => (
  <svg
    viewBox="0 0 680 1050"
    className="pitch-ghost"
    fill="none"
    stroke="white"
    strokeWidth="3"
    aria-hidden
  >
    <rect x="20" y="20" width="640" height="1010" />
    <line x1="20" y1="525" x2="660" y2="525" />
    <circle cx="340" cy="525" r="91" />
    <circle cx="340" cy="525" r="3" />
    <rect x="130" y="20" width="420" height="150" />
    <rect x="218" y="20" width="244" height="50" />
    <rect x="130" y="880" width="420" height="150" />
    <rect x="218" y="980" width="244" height="50" />
    <circle cx="340" cy="157" r="4" fill="white" />
    <circle cx="340" cy="893" r="4" fill="white" />
    <path d="M20,20 Q40,20 40,40" />
    <path d="M660,20 Q640,20 640,40" />
    <path d="M20,1030 Q40,1030 40,1010" />
    <path d="M660,1030 Q640,1030 640,1010" />
  </svg>
);

const FloatingBall = ({ style, duration }) => (
  <svg
    viewBox="0 0 64 64"
    style={{
      width: style?.size || 80,
      height: style?.size || 80,
      position: 'fixed',
      opacity: 0.06,
      pointerEvents: 'none',
      zIndex: 0,
      animation: `floatUp ${duration}s linear infinite`,
      animationDelay: style?.delay || '0s',
      left: style?.left || '10%',
    }}
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    aria-hidden
  >
    <circle cx="32" cy="32" r="28" />
    <polygon points="32,10 50,22 44,42 20,42 14,22" />
    <line x1="32" y1="10" x2="32" y2="4" />
    <line x1="50" y1="22" x2="56" y2="18" />
    <line x1="44" y1="42" x2="50" y2="46" />
    <line x1="20" y1="42" x2="14" y2="46" />
    <line x1="14" y1="22" x2="8" y2="18" />
  </svg>
);

const PanelShell = ({ menuItems, activeSection, onMenuClick, children }) => (
  <div className="min-h-screen panel-shell" style={{ position: 'relative', zIndex: 3 }}>
    <ParticleCanvas />
    <PitchGhost />
    <FloatingBall style={{ size: 120, left: '5%', delay: '0s' }} duration={22} />
    <FloatingBall style={{ size: 80, left: '75%', delay: '-8s' }} duration={30} />
    <FloatingBall style={{ size: 160, left: '45%', delay: '-14s' }} duration={38} />
    <FloatingBall style={{ size: 60, left: '88%', delay: '-20s' }} duration={18} />

    <Navbar
      menuItems={menuItems}
      activeSection={activeSection}
      onMenuClick={onMenuClick}
    />

    {children}
  </div>
);

export default PanelShell;
