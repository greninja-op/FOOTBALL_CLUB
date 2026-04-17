import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FcPlayerCard from '../components/FcPlayerCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ──────────────────────────────────────────────────────────
   Canvas particle system
────────────────────────────────────────────────────────── */
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
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,175,55,${p.alpha})`
          : `rgba(255,255,255,${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
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

/* ──────────────────────────────────────────────────────────
   Pitch ghost SVG watermark
────────────────────────────────────────────────────────── */
const PitchGhost = () => (
  <svg
    viewBox="0 0 680 1050"
    className="pitch-ghost"
    fill="none"
    stroke="white"
    strokeWidth="3"
    aria-hidden
  >
    {/* Outer boundary */}
    <rect x="20" y="20" width="640" height="1010" />
    {/* Halfway line */}
    <line x1="20" y1="525" x2="660" y2="525" />
    {/* Center circle */}
    <circle cx="340" cy="525" r="91" />
    <circle cx="340" cy="525" r="3" />
    {/* Penalty box top */}
    <rect x="130" y="20" width="420" height="150" />
    {/* Goal box top */}
    <rect x="218" y="20" width="244" height="50" />
    {/* Penalty box bottom */}
    <rect x="130" y="880" width="420" height="150" />
    {/* Goal box bottom */}
    <rect x="218" y="980" width="244" height="50" />
    {/* Penalty spots */}
    <circle cx="340" cy="157" r="4" fill="white" />
    <circle cx="340" cy="893" r="4" fill="white" />
    {/* Corner arcs */}
    <path d="M20,20 Q40,20 40,40" />
    <path d="M660,20 Q640,20 640,40" />
    <path d="M20,1030 Q40,1030 40,1010" />
    <path d="M660,1030 Q640,1030 640,1010" />
  </svg>
);

/* ──────────────────────────────────────────────────────────
   Floating wireframe football
────────────────────────────────────────────────────────── */
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
    {/* Pentagon/hexagon football wireframe */}
    <circle cx="32" cy="32" r="28" />
    <polygon points="32,10 50,22 44,42 20,42 14,22" />
    <line x1="32" y1="10" x2="32" y2="4" />
    <line x1="50" y1="22" x2="56" y2="18" />
    <line x1="44" y1="42" x2="50" y2="46" />
    <line x1="20" y1="42" x2="14" y2="46" />
    <line x1="14" y1="22" x2="8" y2="18" />
  </svg>
);

/* ──────────────────────────────────────────────────────────
   Animated stat number (count-up on scroll)
────────────────────────────────────────────────────────── */
const CountStat = ({ value, label, arc }) => {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const numericTarget = Number(String(value).replace(/[^0-9.]/g, '')) || 0;
          const frames = 60;
          let frame = 0;
          const timer = setInterval(() => {
            frame++;
            setDisplay(Math.round((numericTarget * frame) / frames));
            if (frame >= frames) clearInterval(timer);
          }, 25);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, started]);

  const arcPercent = arc ?? 0.75;
  const circumference = 2 * Math.PI * 25;
  const offset = circumference * (1 - arcPercent);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="80" height="80" viewBox="0 0 60 60" className="-rotate-90">
          <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={started ? offset : circumference}
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)' }}
          />
        </svg>
      </div>
      <div className="countup-number text-white">{display}</div>
      <div className="text-[9px] uppercase tracking-[3px] text-white/45">{label}</div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Fixture countdown
────────────────────────────────────────────────────────── */
const Countdown = ({ date }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(date) - Date.now();
      if (diff <= 0) { setText('NOW'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setText(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [date]);

  return <span className="fixture-countdown text-sm">{text}</span>;
};

/* ──────────────────────────────────────────────────────────
   Section wrapper with IntersectionObserver
────────────────────────────────────────────────────────── */
const FadeSection = ({ children, className = '', id }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} className={`section-hidden ${className}`}>
      {children}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Main HomePage
────────────────────────────────────────────────────────── */
const HomePage = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activePosition, setActivePosition] = useState('All');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/home`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load homepage');
        setHomeData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04040c]">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '3px solid rgba(200,16,46,0.3)',
              borderTop: '3px solid var(--color-primary)',
              animation: 'logoBreath 1s ease-in-out infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            LOADING CLUB
          </p>
        </div>
      </div>
    );
  }

  if (error || !homeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04040c] text-red-300">
        {error || 'Homepage unavailable'}
      </div>
    );
  }

  const { club, heroStats, topPlayers, recentResults, upcomingFixtures, trophies } = homeData;

  const positions = ['All', ...new Set((topPlayers || []).map((p) => p.preferredPosition || p.position).filter(Boolean))];
  const filteredPlayers = activePosition === 'All'
    ? topPlayers
    : topPlayers.filter((p) => (p.preferredPosition || p.position) === activePosition);

  const resultColor = (result) => {
    if (!result) return 'rgba(255,255,255,0.2)';
    const r = String(result).toUpperCase();
    if (r === 'W') return '#22c55e';
    if (r === 'L') return '#ef4444';
    return '#eab308';
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 3 }}>
      {/* ── Background Systems (z=0) ── */}
      <ParticleCanvas />
      <PitchGhost />
      <FloatingBall style={{ size: 120, left: '5%', delay: '0s' }} duration={22} />
      <FloatingBall style={{ size: 80, left: '75%', delay: '-8s' }} duration={30} />
      <FloatingBall style={{ size: 160, left: '45%', delay: '-14s' }} duration={38} />
      <FloatingBall style={{ size: 60, left: '88%', delay: '-20s' }} duration={18} />

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'background 0.4s ease, border-color 0.4s ease',
          borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
          background: scrolled ? 'rgba(4,4,12,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo + Club Name */}
          <div className="flex items-center gap-3">
            {club.logoUrl ? (
              <img
                src={`${API_URL}${club.logoUrl}`}
                alt={club.name}
                className="crest-glow h-10 w-10 rounded-full object-contain"
                style={{ border: '1px solid rgba(200,16,46,0.3)' }}
              />
            ) : (
              <div
                className="crest-glow flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(200,16,46,0.15)',
                  border: '1px solid rgba(200,16,46,0.3)',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 16,
                  letterSpacing: 2,
                }}
              >
                FC
              </div>
            )}
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                letterSpacing: 4,
              }}
            >
              {club.name}
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden gap-10 md:flex">
            {['About', 'Squad', 'Results', 'Trophies'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="nav-link text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            to="/login"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 13,
              letterSpacing: 3,
              background: 'var(--color-primary)',
              borderRadius: 2,
              padding: '8px 20px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,16,46,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Enter Portal
          </Link>
        </div>
      </header>

      {/* ─── HERO SECTION ───────────────────────────────────── */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 3,
          padding: '0 24px',
        }}
      >
        {/* Crest */}
        <div className="hero-crest">
          {club.logoUrl ? (
            <div
              className="crest-glow"
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(200,16,46,0.08)',
                border: '1px solid rgba(200,16,46,0.3)',
                margin: '0 auto',
              }}
            >
              <img src={`${API_URL}${club.logoUrl}`} alt={club.name} style={{ width: 80, height: 80, objectFit: 'contain' }} />
            </div>
          ) : (
            <div
              className="crest-glow"
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: 'rgba(200,16,46,0.1)',
                border: '2px solid rgba(200,16,46,0.4)',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 36,
                letterSpacing: 4,
              }}
            >
              FC
            </div>
          )}
        </div>

        {/* Season badge */}
        <div className="hero-badge mt-6">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 100,
              fontSize: 9,
              letterSpacing: 4,
              fontFamily: "'Bebas Neue', sans-serif",
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
            {club.currentSeason || '2025/26'} SEASON IN PROGRESS
          </span>
        </div>

        {/* Club name */}
        <div className="hero-name mt-6">
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(60px, 13vw, 140px)',
              lineHeight: 0.9,
              textShadow: '0 0 60px rgba(200,16,46,0.3)',
              margin: 0,
            }}
          >
            {club.name}
          </h1>
          {club.headline && (
            <p
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(18px, 4vw, 42px)',
                letterSpacing: 14,
                color: 'var(--color-primary)',
                marginTop: 4,
              }}
            >
              {club.headline}
            </p>
          )}
        </div>

        {/* Motto */}
        {club.motto && (
          <p className="hero-motto" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 14, fontWeight: 300 }}>
            {club.motto}
          </p>
        )}

        {/* CTAs */}
        <div className="hero-ctas mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 13,
              letterSpacing: 3,
              background: 'var(--color-primary)',
              borderRadius: 2,
              padding: '12px 32px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(200,16,46,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            Enter Portal
          </Link>
          <a
            href="#results"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 13,
              letterSpacing: 3,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              padding: '12px 32px',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = ''; }}
          >
            View Season
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll" style={{ position: 'absolute', bottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, letterSpacing: 4, fontFamily: "'Bebas Neue', sans-serif", color: 'rgba(255,255,255,0.3)' }}>SCROLL</span>
          <div className="scroll-indicator-line" style={{ width: 1, background: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
        </div>
      </section>

      {/* ─── STATS BAR ──────────────────────────────────────── */}
      <FadeSection>
        <div
          style={{
            background: 'rgba(200,16,46,0.07)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(200,16,46,0.2)',
            borderBottom: '1px solid rgba(200,16,46,0.2)',
            padding: '36px 0',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-8 px-6">
            {Object.entries(heroStats || {}).map(([key, value], i, arr) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <CountStat value={value} label={formatKey(key)} arc={0.6} />
                {i < arr.length - 1 && (
                  <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ─── ABOUT SECTION ──────────────────────────────────── */}
      <FadeSection id="about">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8" style={{ position: 'relative', zIndex: 3 }}>
          {/* Left: crest in hexagon */}
          <div className="glass rounded-[40px] p-10 flex flex-col items-center justify-center gap-6">
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              {/* Rotating hexagon border */}
              <svg
                viewBox="0 0 200 200"
                className="hex-rotate"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <polygon
                  points="100,10 180,55 180,145 100,190 20,145 20,55"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  strokeDasharray="8 4"
                />
              </svg>
              {/* Glow behind */}
              <div style={{
                position: 'absolute',
                inset: 30,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,16,46,0.3), transparent)',
                filter: 'blur(20px)',
              }} />
              {/* Crest */}
              {club.logoUrl ? (
                <img
                  src={`${API_URL}${club.logoUrl}`}
                  alt={club.name}
                  style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
                />
              ) : (
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: "'Bebas Neue'", fontSize: 64, letterSpacing: 4 }}>FC</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {[
                { label: 'Founded', value: club.founded },
                { label: 'Ground', value: club.ground },
                { label: 'League', value: club.league },
              ].filter((item) => item.value).map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: '3px solid var(--color-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 300, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>{item.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: text */}
          <div className="glass rounded-[40px] p-10 flex flex-col justify-center">
            <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 32, height: 1, background: 'var(--color-primary)' }} />
              The Club
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(36px, 5vw, 64px)',
                lineHeight: 0.95,
                marginTop: 16,
              }}
            >
              MORE THAN A<br />
              <span style={{ color: 'var(--color-primary)' }}>FOOTBALL CLUB</span>
            </h2>
            <p style={{ marginTop: 24, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, fontWeight: 300, fontSize: 15 }}>
              {club.description || 'This club platform blends internal operations with a public identity layer. Supporters can explore players, fixtures, results and match stories while staff run training, health, contracts and squad decisions from the secured portal.'}
            </p>

            {/* W/D/L badges */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Wins', color: '#22c55e', key: 'wins' },
                { label: 'Draws', color: '#eab308', key: 'draws' },
                { label: 'Losses', color: '#ef4444', key: 'losses' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '16px 12px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    textAlign: 'center',
                    borderTop: `2px solid ${item.color}`,
                  }}
                >
                  <div style={{ color: item.color, fontFamily: "'Bebas Neue'", fontSize: 36 }}>
                    {heroStats?.[item.key] ?? '-'}
                  </div>
                  <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ─── SQUAD SECTION ──────────────────────────────────── */}
      <FadeSection id="squad">
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 3 }}>
          {/* Diagonal bg stripe */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 24px)',
            pointerEvents: 'none',
            borderRadius: 40,
          }} />

          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
                Spotlight
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, marginTop: 8 }}>
                TOP PLAYERS
              </h2>
            </div>

            {/* Position filter pills */}
            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setActivePosition(pos)}
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 11,
                    letterSpacing: 2,
                    padding: '6px 16px',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: activePosition === pos ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
                    boxShadow: activePosition === pos ? '0 0 20px rgba(200,16,46,0.4)' : 'none',
                    color: 'white',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Cards — horizontal scroll */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              overflowX: 'auto',
              paddingBottom: 16,
              scrollbarWidth: 'none',
            }}
          >
            {(filteredPlayers || []).map((player) => (
              <FcPlayerCard key={player._id} player={player} href={`/players/${player._id}`} />
            ))}
          </div>

          <div className="mt-10">
            <Link
              to="/squad"
              style={{
                display: 'inline-flex',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 12,
                letterSpacing: 3,
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '10px 28px',
                borderRadius: 2,
                transition: 'background 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.transform = ''; }}
            >
              View Full Squad →
            </Link>
          </div>
        </section>
      </FadeSection>

      {/* ─── RESULTS & FIXTURES ─────────────────────────────── */}
      <FadeSection id="results">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8" style={{ position: 'relative', zIndex: 3 }}>
          {/* Results */}
          <div className="glass rounded-[40px] p-8">
            <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
              Recent Matches
            </p>

            {/* Form bar */}
            <div className="mt-6 flex gap-2">
              {(recentResults || []).slice(0, 5).map((match, i) => {
                const r = match.result || (match.scoreline?.club > match.scoreline?.opponent ? 'W' : match.scoreline?.club < match.scoreline?.opponent ? 'L' : 'D');
                return (
                  <div
                    key={i}
                    className="form-circle"
                    title={`vs ${match.opponent}`}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: `2px solid ${resultColor(r)}`,
                      background: `${resultColor(r)}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 13,
                      color: resultColor(r),
                      cursor: 'default',
                    }}
                  >
                    {r || '?'}
                  </div>
                );
              })}
            </div>

            {/* Result rows */}
            <div className="mt-6 space-y-3">
              {(recentResults || []).map((match, i) => (
                <Link
                  key={match.id}
                  to={`/match/${match.id}`}
                  className="result-row block"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    borderLeft: `3px solid ${resultColor(match.result)}`,
                    transition: 'background 0.2s, border-color 0.2s',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>vs {match.opponent}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                      {new Date(match.date).toLocaleDateString()} · {match.location}
                    </div>
                    {match.summary && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.6 }}>
                        {match.summary.slice(0, 80)}{match.summary.length > 80 ? '…' : ''}
                      </p>
                    )}
                  </div>
                  {match.scoreline && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, lineHeight: 1 }}>
                        <span style={{ color: 'white' }}>{match.scoreline.club}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 4px' }}>-</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{match.scoreline.opponent}</span>
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Fixtures */}
          <div className="glass rounded-[40px] p-8">
            <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
              Upcoming Fixtures
            </p>
            <div className="mt-6 space-y-4">
              {(upcomingFixtures || []).map((fixture) => (
                <div
                  key={fixture.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: fixture.location === 'Home' ? 'rgba(200,16,46,0.04)' : 'rgba(255,255,255,0.02)',
                    borderLeft: fixture.location === 'Home' ? '3px solid rgba(200,16,46,0.4)' : '3px solid rgba(255,255,255,0.1)',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = fixture.location === 'Home' ? 'rgba(200,16,46,0.04)' : 'rgba(255,255,255,0.02)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>vs {fixture.opponent}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                        {new Date(fixture.date).toLocaleString()} · {fixture.location}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <Countdown date={fixture.date} />
                      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>to kickoff</div>
                    </div>
                  </div>
                </div>
              ))}
              {(!upcomingFixtures || !upcomingFixtures.length) && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  No upcoming fixtures scheduled
                </div>
              )}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ─── TROPHY CABINET ─────────────────────────────────── */}
      <FadeSection id="trophies">
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 3 }}>
          
          <div className="mb-10 flex items-center justify-between">
            <div>
              <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
                Honours
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, marginTop: 8 }}>
                TROPHY CABINET
              </h2>
            </div>
            <a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}>
              View All
            </a>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 32,
              padding: '40px 0',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory',
              alignItems: 'center',
            }}
          >
            {(trophies && trophies.length > 0 ? trophies : [
              {
                competitionName: 'PREMIER LEAGUE CHAMPIONS',
                seasonIdentifier: 'SEASON 2025/26',
                year: '2026',
                manager: 'J. Guardiola',
                captain: 'Kevin De Bruyne',
                finalResult: '3-1 vs Man City',
                playersInvolved: [
                  { name: 'Haaland' }, { name: 'Foden' }, { name: 'Bernardo' }, { name: 'Janam' }, { name: 'Doku' }
                ],
                reportUrl: '#'
              }
            ]).map((trophy, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  width: '340px',
                  scrollSnapAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(30,10,15,1) 0%, rgba(10,10,15,1) 100%)',
                  borderRadius: '24px',
                  boxShadow: '0 0 40px rgba(200,16,46,0.35)', // intense red glowing shadow
                  border: '1px solid rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Gold/Red fog behind trophy inside card */}
                <div style={{
                  position: 'absolute',
                  top: '15%',
                  left: '50%',
                  width: '80%',
                  height: '40%',
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(200,16,46,0.3), transparent 70%)',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ padding: '24px 20px 16px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                  <h3 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    lineHeight: '1.2',
                    margin: 0
                  }}>
                    {trophy.competitionName || trophy.title || 'CHAMPIONSHIP'}
                  </h3>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    color: 'var(--color-primary)',
                    marginTop: '6px',
                    letterSpacing: '2px',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {trophy.seasonIdentifier || `SEASON ${trophy.year}`}
                  </p>
                </div>

                {/* Hero Image */}
                <div style={{ 
                  flex: '1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '10px 0',
                  position: 'relative',
                  zIndex: 2,
                  minHeight: '220px'
                }}>
                  {trophy.trophyAsset ? (
                    <img 
                      src={`${API_URL}${trophy.trophyAsset}`} 
                      alt="Trophy" 
                      style={{ height: '180px', objectFit: 'contain', filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.8))' }} 
                    />
                  ) : (
                     <div style={{ fontSize: '140px', lineHeight: 1, filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.8))' }}>🏆</div>
                  )}
                </div>

                {/* Metadata Grid */}
                <div style={{ padding: '0 20px', position: 'relative', zIndex: 2 }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    {/* Cell 1: Year */}
                    <div style={{ background: 'rgba(20,20,26,0.9)', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>📅</span>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Year</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginTop: 2 }}>{trophy.year}</div>
                      </div>
                    </div>
                    {/* Cell 2: Manager */}
                    <div style={{ background: 'rgba(20,20,26,0.9)', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>👤</span>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Manager</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginTop: 2 }}>{trophy.manager || 'N/A'}</div>
                      </div>
                    </div>
                    {/* Cell 3: Captain */}
                    <div style={{ background: 'rgba(20,20,26,0.9)', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>⭐</span>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Captain</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginTop: 2 }}>{trophy.captain || 'N/A'}</div>
                      </div>
                    </div>
                    {/* Cell 4: Final */}
                    <div style={{ background: 'rgba(20,20,26,0.9)', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>🏁</span>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Final</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginTop: 2 }}>{trophy.finalResult || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player Roster */}
                <div style={{ padding: '20px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>PLAYERS INVOLVED</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>〉</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                    {(trophy.playersInvolved || []).map((player, idx) => (
                      <div key={idx} style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '50%', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginBottom: '6px'
                        }}>
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>⚽</span>
                          )}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '50px' }}>
                          {player.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div style={{ padding: '0 20px 20px', position: 'relative', zIndex: 2 }}>
                  <a href={trophy.reportUrl || '#'} style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 0',
                    textAlign: 'center',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                  >
                    VIEW SEASON REPORT
                  </a>
                </div>

              </div>
            ))}
          </div>

        </section>
      </FadeSection>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 3 }}>
        {/* Neon divider */}
        <div className="neon-divider" />

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 4 }}>{club.name}</div>
            <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontWeight: 300 }}>
              Built for matchday identity, squad continuity, and modern club operations.
            </p>
            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {['📘', '📸', '🐦'].map((icon, i) => (
                <button
                  key={i}
                  className="social-icon"
                  style={{
                    width: 40,
                    height: 40,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,16,46,0.2)'; e.currentTarget.style.borderColor = 'rgba(200,16,46,0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Contact</div>
            <div className="mt-4 space-y-2">
              {club.contactEmail && (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{club.contactEmail}</p>
              )}
              {club.socialHandle && (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{club.socialHandle}</p>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Navigate</div>
            <div className="mt-4 flex flex-col gap-2">
              {['#squad', '#results', '#trophies', '#about'].map((href) => (
                <a
                  key={href}
                  href={href}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                </a>
              ))}
              <Link
                to="/login"
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                Portal Login
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>
          © {new Date().getFullYear()} {club.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

function formatKey(key) {
  return key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
}

export default HomePage;
