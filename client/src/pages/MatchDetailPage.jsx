import { useEffect, useRef, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ──────────────────────────────────────────────────────────
   Animated SVG Performance Graph
────────────────────────────────────────────────────────── */
const PerformanceGraph = ({ graph, goals, yellowCards: yellows, redCards: reds }) => {
  const pathRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const wrapperRef = useRef(null);

  // Build SVG path from data points
  const { path, totalLength } = useMemo(() => {
    if (!graph?.length) return { path: '', totalLength: 1000 };

    const pts = graph.map((p) => ({
      x: (p.minute / 90) * 560 + 20,
      y: 170 - (p.value / 100) * 140,
    }));

    // Smooth Bezier curve
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }
    return { path: d, totalLength: 1000 };
  }, [graph]);

  const areaFill = useMemo(() => {
    if (!graph?.length) return '';
    const pts = graph.map((p) => ({
      x: (p.minute / 90) * 560 + 20,
      y: 170 - (p.value / 100) * 140,
    }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }
    const last = pts[pts.length - 1];
    const first = pts[0];
    d += ` L ${last.x} 170 L ${first.x} 170 Z`;
    return d;
  }, [graph]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <svg viewBox="0 0 600 180" style={{ width: '100%', height: 200 }}>
        <defs>
          <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="graphStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[25, 75, 125].map((y) => (
          <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {/* Minute markers */}
        {[15, 30, 45, 60, 75, 90].map((min) => {
          const x = (min / 90) * 560 + 20;
          return (
            <g key={min}>
              <line x1={x} y1="10" x2={x} y2="170" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={x} y="178" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif">{min}'</text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaFill && (
          <path d={areaFill} fill="url(#graphFill)" />
        )}

        {/* Main line */}
        {path && (
          <path
            ref={pathRef}
            d={path}
            fill="none"
            stroke="url(#graphStroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#glow)"
            style={{
              strokeDasharray: totalLength,
              strokeDashoffset: animated ? 0 : totalLength,
              transition: animated ? 'stroke-dashoffset 2s cubic-bezier(0.22,1,0.36,1)' : 'none',
            }}
          />
        )}

        {/* Goal event markers */}
        {(goals || []).map((goal) => {
          const x = (goal.minute / 90) * 560 + 20;
          return (
            <g key={`goal-${goal.minute}-${goal.scorer}`}>
              <line x1={x} y1="10" x2={x} y2="170" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
              <text x={x} y="18" fill="#D4AF37" fontSize="10" textAnchor="middle">⚽</text>
            </g>
          );
        })}

        {/* Yellow card markers */}
        {(yellows || []).map((card, i) => {
          const x = (card.minute / 90) * 560 + 20;
          return (
            <g key={`y-${i}`}>
              <line x1={x} y1="10" x2={x} y2="170" stroke="#eab308" strokeWidth="1" opacity="0.5" />
              <rect x={x - 5} y="6" width="10" height="14" fill="#eab308" rx="2" opacity="0.9" />
            </g>
          );
        })}

        {/* Red card markers */}
        {(reds || []).map((card, i) => {
          const x = (card.minute / 90) * 560 + 20;
          return (
            <g key={`r-${i}`}>
              <line x1={x} y1="10" x2={x} y2="170" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
              <rect x={x - 5} y="6" width="10" height="14" fill="#ef4444" rx="2" opacity="0.9" />
            </g>
          );
        })}

        {/* Hover data points */}
        {(graph || []).map((p, i) => {
          const cx = (p.minute / 90) * 560 + 20;
          const cy = 170 - (p.value / 100) * 140;
          return (
            <circle key={i} cx={cx} cy={cy} r="3" fill="var(--color-primary)" opacity={animated ? 1 : 0} style={{ transition: `opacity 0.3s ease ${0.5 + i * 0.05}s` }}>
              <title>{p.minute}' — Performance: {p.value}%</title>
            </circle>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-4" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12 }}>⚽</span> Goal
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 14, background: '#eab308', borderRadius: 2, display: 'block' }} /> Yellow Card
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 14, background: '#ef4444', borderRadius: 2, display: 'block' }} /> Red Card
        </span>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   2D Pitch Formation Display  
────────────────────────────────────────────────────────── */
const PitchFormation = ({ lineup, formation }) => {
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  // Parse formation string to get player positions on pitch
  const slots = useMemo(() => {
    if (!lineup?.length) return [];

    // Simple formation layout based on shape string
    const shape = formation || '4-3-3';
    const lines = String(shape).split('-').map(Number);

    const positions = [];
    // GK
    positions.push({ player: lineup[0], x: 50, y: 88, label: 'GK' });

    let playerIndex = 1;
    const xStart = 10;
    const xEnd = 90;
    const yPositions = [];

    // Distribute y positions for each line
    const totalLines = lines.length;
    for (let li = 0; li < totalLines; li++) {
      yPositions.push(70 - (li * (50 / totalLines)));
    }

    lines.forEach((count, lineIndex) => {
      const y = yPositions[lineIndex];
      const step = (xEnd - xStart) / (count + 1);
      for (let j = 0; j < count; j++) {
        if (playerIndex < lineup.length) {
          positions.push({
            player: lineup[playerIndex],
            x: xStart + step * (j + 1),
            y,
            label: lineup[playerIndex]?.preferredPosition || lineup[playerIndex]?.position || `#${playerIndex}`,
          });
          playerIndex++;
        }
      }
    });

    return positions;
  }, [lineup, formation]);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0b5d37 0%, #0b7142 50%, #0b5d37 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '145%',
      }}
    >
      {/* Pitch markings */}
      <svg
        viewBox="0 0 100 145"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.4"
      >
        {/* Boundary */}
        <rect x="5" y="3" width="90" height="139" />
        {/* Halfway line */}
        <line x1="5" y1="72.5" x2="95" y2="72.5" />
        {/* Center circle */}
        <circle cx="50" cy="72.5" r="9" />
        <circle cx="50" cy="72.5" r="0.8" fill="rgba(255,255,255,0.18)" />
        {/* Top penalty area */}
        <rect x="22" y="3" width="56" height="18" />
        <rect x="33" y="3" width="34" height="7" />
        {/* Bottom penalty area */}
        <rect x="22" y="124" width="56" height="18" />
        <rect x="33" y="136" width="34" height="7" />
        {/* Top goal */}
        <rect x="40" y="0" width="20" height="3" />
        {/* Bottom goal */}
        <rect x="40" y="142" width="20" height="3" />
        {/* Corner arcs */}
        <path d="M5,3 Q8,3 8,6" />
        <path d="M95,3 Q92,3 92,6" />
        <path d="M5,142 Q8,142 8,139" />
        <path d="M95,142 Q92,142 92,139" />
      </svg>

      {/* Player tokens */}
      {slots.map((slot, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${slot.x}%`,
            top: `${slot.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHoveredPlayer(i)}
          onMouseLeave={() => setHoveredPlayer(null)}
        >
          {/* Photo circle */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(4,4,12,0.85)',
            border: '2px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s, border-color 0.2s',
            ...(hoveredPlayer === i ? { transform: 'scale(1.15)', borderColor: 'var(--color-primary)' } : {}),
          }}>
            {slot.player?.photo ? (
              <img src={`http://localhost:5000${slot.player.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", color: 'white', letterSpacing: 1 }}>
                {slot.player?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || slot.label}
              </span>
            )}
          </div>

          {/* Jersey number */}
          <div style={{ fontSize: 8, fontFamily: "'Bebas Neue',sans-serif", color: 'white', marginTop: 2, letterSpacing: 1, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {slot.player?.jerseyNumber || slot.label}
          </div>

          {/* Hover tooltip */}
          {hoveredPlayer === i && (
            <div style={{
              position: 'absolute',
              bottom: '110%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(4,4,12,0.95)',
              border: '1px solid rgba(200,16,46,0.4)',
              borderRadius: 10,
              padding: '8px 12px',
              whiteSpace: 'nowrap',
              zIndex: 10,
              fontSize: 11,
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 1 }}>{slot.player?.fullName || 'Player'}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{slot.player?.preferredPosition || slot.label}</div>
              {slot.player?.stats?.rating && (
                <div style={{ color: 'var(--color-primary)', marginTop: 2 }}>Rating: {Number(slot.player.stats.rating).toFixed(1)}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Main MatchDetailPage
────────────────────────────────────────────────────────── */
const MatchDetailPage = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/matches/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load match');
        setMatch(data.match);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04040c]">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(200,16,46,0.3)', borderTop: '3px solid var(--color-primary)', animation: 'logoBreath 1s ease-in-out infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 4, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>LOADING MATCH</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04040c]">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: 'var(--color-primary)' }}>MATCH ERROR</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{error || 'Match unavailable'}</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', background: 'var(--color-primary)', borderRadius: 2, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, fontSize: 12 }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const homeScore = match.scoreline?.club ?? '-';
  const awayScore = match.scoreline?.opponent ?? '-';
  const won = homeScore > awayScore;
  const drew = homeScore === awayScore;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', color: 'white', position: 'relative', zIndex: 3 }}>
      {/* ── HERO SCORELINE ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        {/* Color bleed from both club sides */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(200,16,46,0.18) 0%, transparent 40%, transparent 60%, rgba(59,130,246,0.12) 100%)',
        }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(200,16,46,0.2), transparent 60%)' }} />

        <div className="mx-auto max-w-4xl">
          <Link to="/" style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
            ← Back to Home
          </Link>

          <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', marginTop: 20 }}>{match.matchType}</p>

          {/* Scoreline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(64px, 14vw, 120px)', lineHeight: 1, color: 'white' }}>{homeScore}</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px, 6vw, 60px)', color: 'rgba(255,255,255,0.25)' }}>—</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(64px, 14vw, 120px)', lineHeight: 1, color: won ? 'rgba(255,255,255,0.5)' : drew ? 'rgba(255,255,255,0.7)' : 'white' }}>{awayScore}</span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(24px, 5vw, 48px)', letterSpacing: 4, marginTop: 8 }}>
            VS {match.opponent}
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8, fontSize: 14 }}>
            {new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {match.location}
          </p>

          {match.tacticalShape && (
            <div style={{ display: 'inline-flex', marginTop: 12, padding: '4px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.5)' }}>
              Formation: {match.tacticalShape}
            </div>
          )}

          {match.summary && (
            <p style={{ maxWidth: 640, margin: '20px auto 0', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: 15, fontWeight: 300 }}>
              {match.summary}
            </p>
          )}
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">

          {/* ── Left column ── */}
          <div className="space-y-8">

            {/* Performance Graph */}
            <div className="glass rounded-[32px] p-8">
              <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
                Performance Graph
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, marginTop: 8 }}>90 MINUTE STORY</h2>

              <div className="mt-6 rounded-[20px] p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {match.graph?.length ? (
                  <PerformanceGraph
                    graph={match.graph}
                    goals={match.goals}
                    yellowCards={match.yellowCards}
                    redCards={match.redCards}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    No performance data available
                  </div>
                )}
              </div>
            </div>

            {/* Goals */}
            {match.goals?.length > 0 && (
              <div className="glass rounded-[32px] p-8">
                <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 32, height: 1, background: 'var(--color-gold)', display: 'block' }} />
                  Goals
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {match.goals.map((goal) => (
                    <div
                      key={`${goal.minute}-${goal.scorer}`}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 16,
                        border: '1px solid rgba(212,175,55,0.2)',
                        background: 'rgba(212,175,55,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'var(--color-gold)', lineHeight: 1 }}>{goal.minute}'</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>⚽ {goal.scorer}</div>
                        {goal.assist && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Assist: {goal.assist}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match Story / Phases */}
            {match.phases?.length > 0 && (
              <div className="glass rounded-[32px] p-8">
                <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
                  Match Story
                </p>
                <div className="mt-6 space-y-4">
                  {match.phases.map((phase, i) => (
                    <div
                      key={`${phase.title}-${i}`}
                      style={{
                        padding: '20px 24px',
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                        borderLeft: '3px solid var(--color-primary)',
                      }}
                    >
                      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--color-primary)', fontFamily: "'Bebas Neue',sans-serif" }}>{phase.title}</div>
                      <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>{phase.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lineup History */}
            {match.lineupHistory?.length > 0 && (
              <div className="glass rounded-[32px] p-8">
                <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.2)', display: 'block' }} />
                  Lineup History
                </p>
                <div className="mt-6 space-y-3">
                  {match.lineupHistory.map((entry) => (
                    <div key={`${entry.version}-${entry.savedAt}`} style={{
                      padding: '14px 18px',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, color: 'var(--color-primary)', fontSize: 13 }}>
                          Version {entry.version} {entry.formation ? `· ${entry.formation}` : ''}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{entry.size} players</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{new Date(entry.savedAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: Pitch Formation ── */}
          <div className="space-y-6">
            <div className="glass rounded-[32px] p-6">
              <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
                Lineup
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, marginTop: 8 }}>{match.tacticalShape || 'Formation'}</h2>

              <div className="mt-4">
                {match.displayLineup?.length ? (
                  <PitchFormation
                    lineup={match.displayLineup.map((e) => e.player)}
                    formation={match.tacticalShape}
                  />
                ) : match.lineup?.length ? (
                  <PitchFormation
                    lineup={match.lineup}
                    formation={match.tacticalShape}
                  />
                ) : (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    No lineup data available
                  </div>
                )}
              </div>
            </div>

            {/* Bench */}
            {match.lineup?.length > 11 && (
              <div className="glass rounded-[32px] p-6">
                <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Bench</p>
                <div className="mt-4 space-y-2">
                  {match.lineup.slice(11).map((player) => (
                    <div
                      key={player._id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", flexShrink: 0 }}>
                        {player.jerseyNumber || player.fullName?.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{player.fullName}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{player.preferredPosition || player.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match Stats Summary */}
            {match.stats && (
              <div className="glass rounded-[32px] p-6">
                <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Match Stats</p>
                <div className="mt-4 space-y-3">
                  {Object.entries(match.stats).map(([key, val]) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                        <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>{val}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: 'var(--color-primary)', width: `${Math.min(100, Number(val) * 5)}%`, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;
