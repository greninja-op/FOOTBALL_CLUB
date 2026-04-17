import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─── Tier assignment ────────────────────────────────────── */
const getTier = (rating) => {
  if (rating >= 9) return { label: 'GOLD', class: 'card-tier-gold', bg: 'linear-gradient(145deg, #1a1200, #2a1f00)', border: '#D4AF37' };
  if (rating >= 7.5) return { label: 'SILVER', class: 'card-tier-silver', bg: 'linear-gradient(145deg, #111214, #1a1e22)', border: '#A8A9AD' };
  if (rating >= 6) return { label: 'RARE', class: 'card-tier-purple', bg: 'linear-gradient(145deg, #120820, #1c0d2e)', border: '#9333EA' };
  return { label: 'STD', class: 'card-tier-standard', bg: 'linear-gradient(145deg, #0a0a14, #111122)', border: '#64748b' };
};

/* ─── Animated number (count up) ────────────────────────── */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const target = Number(value || 0);
    const frames = 30;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setDisplay(Math.round((target * frame) / frames));
      if (frame >= frames) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [value]);

  return <span>{display}</span>;
};

/* ─── Form indicator dot ─────────────────────────────────── */
const FormDot = ({ rating }) => {
  const color = rating >= 7.5 ? '#22c55e' : rating >= 5.5 ? '#eab308' : '#ef4444';
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  );
};

/* ─── Particle burst (fires on mount if in view) ─────────── */
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const ParticleBurst = ({ active }) => {
  if (!active) return null;
  return (
    <>
      {PARTICLE_ANGLES.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * 32;
        const ty = Math.sin(rad) * 32;
        return (
          <span
            key={angle}
            className="card-particle"
            style={{
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              top: '50%',
              left: '50%',
              marginTop: -3,
              marginLeft: -3,
              background: angle % 90 === 0 ? 'var(--color-primary)' : '#D4AF37',
            }}
          />
        );
      })}
    </>
  );
};

/* ─── FcPlayerCard ───────────────────────────────────────── */
const FcPlayerCard = ({ player, href }) => {
  const [flipped, setFlipped] = useState(false);
  const [burst, setBurst] = useState(false);
  const ref = useRef(null);
  const burstedRef = useRef(false);

  const rating = Number(player.stats?.rating || 0);
  const tier = getTier(rating);

  /* Particle burst on first scroll-into-view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !burstedRef.current) {
          burstedRef.current = true;
          setBurst(true);
          setTimeout(() => setBurst(false), 900);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const CardWrapper = href ? Link : 'div';
  const wrapperProps = href ? { to: href } : {};

  return (
    <div
      ref={ref}
      className={`player-fc-card ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped((prev) => !prev)}
      title="Click to flip"
      style={{ flexShrink: 0 }}
    >
      <div className="player-fc-card-inner">
        {/* ── FRONT ── */}
        <div
          className="player-fc-card-front"
          style={{
            background: tier.bg,
            border: `1px solid ${tier.border}30`,
            boxShadow: `0 0 20px ${tier.border}20, inset 0 1px 0 ${tier.border}30`,
          }}
        >
          {/* Tier corner fold */}
          <div className={tier.class} style={{ '--tier-color': tier.border }}>
            <div className="card-tier-fold" style={{ '--tier-color': tier.border }} />
          </div>

          {/* Foil lines */}
          <div className="foil-lines" />

          {/* Light streak */}
          <div className="card-streak" />

          {/* Particle burst */}
          <ParticleBurst active={burst} />

          {/* Top section: rating + position */}
          <div style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 38,
                  lineHeight: 1,
                  color: tier.border,
                  textShadow: `0 0 20px ${tier.border}80`,
                }}
              >
                {Math.round(rating * 10)}
              </div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {player.preferredPosition || player.position || 'MF'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <FormDot rating={rating} />
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                #{player.jerseyNumber || '–'}
              </div>
            </div>
          </div>

          {/* Player image placeholder / initials */}
          <div
            style={{
              margin: '8px auto',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${tier.border}25, rgba(0,0,0,0.4))`,
              border: `2px solid ${tier.border}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {player.photo ? (
              <img
                src={`${API_URL}${player.photo}`}
                alt={player.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: tier.border, letterSpacing: 2 }}>
                {player.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>

          {/* Name */}
          <div
            style={{
              textAlign: 'center',
              padding: '0 8px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 16,
              letterSpacing: 2,
              lineHeight: 1.2,
              color: 'white',
              textShadow: `0 1px 8px ${tier.border}40`,
            }}
          >
            {player.fullName}
          </div>

          {/* Divider */}
          <div style={{ margin: '8px 12px', height: 1, background: `linear-gradient(90deg, transparent, ${tier.border}60, transparent)` }} />

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 8px 14px' }}>
            {[
              { label: 'GOL', value: player.stats?.goals || 0 },
              { label: 'ASS', value: player.stats?.assists || 0 },
              { label: 'APP', value: player.stats?.appearances || 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: 'white', lineHeight: 1 }}>
                  <AnimatedNumber value={value} />
                </div>
                <div style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tier badge */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 7,
            letterSpacing: 3,
            fontFamily: "'Bebas Neue', sans-serif",
            color: `${tier.border}80`,
          }}>
            {tier.label}
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="player-fc-card-back"
          style={{
            background: tier.bg,
            border: `1px solid ${tier.border}30`,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 3, color: tier.border, marginBottom: 4 }}>
            PLAYER CARD
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, lineHeight: 1 }}>{player.fullName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{player.preferredPosition || player.position}</div>

          <div style={{ height: 1, background: `${tier.border}30`, margin: '4px 0' }} />

          {/* Detailed stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'Goals', value: player.stats?.goals || 0 },
              { label: 'Assists', value: player.stats?.assists || 0 },
              { label: 'Appearances', value: player.stats?.appearances || 0 },
              { label: 'Rating', value: `${rating.toFixed(1)}/10` },
              { label: 'Yellow Cards', value: player.stats?.yellowCards || 0 },
              { label: 'Red Cards', value: player.stats?.redCards || 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '6px 8px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: 'white', marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Fitness status */}
          <div style={{
            padding: '6px 10px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.55)',
          }}>
            Status: <span style={{ color: player.fitnessStatus === 'Fit' ? '#22c55e' : '#eab308' }}>{player.fitnessStatus || 'Ready'}</span>
          </div>

          {/* View profile link */}
          {href && (
            <CardWrapper
              {...wrapperProps}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '8px',
                borderRadius: 8,
                border: `1px solid ${tier.border}50`,
                background: `${tier.border}15`,
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 11,
                letterSpacing: 2,
                color: tier.border,
                textDecoration: 'none',
                marginTop: 4,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${tier.border}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${tier.border}15`; }}
            >
              VIEW PROFILE →
            </CardWrapper>
          )}
        </div>
      </div>
    </div>
  );
};

export default FcPlayerCard;
