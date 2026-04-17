import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FcPlayerCard from '../components/FcPlayerCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PublicSquadPage = () => {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/players`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load squad');
        setPlayers(data.players || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    if (filter === 'ALL') return players;
    return players.filter((p) => (p.preferredPosition || p.position) === filter);
  }, [filter, players]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-deep)', color: 'white', position: 'relative', zIndex: 3 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid rgba(200,16,46,0.3)', borderTop: '3px solid var(--color-primary)', animation: 'logoBreath 1s ease-in-out infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 4, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>LOADING SQUAD</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-deep)', color: '#fca5a5', position: 'relative', zIndex: 3 }}>
        {error}
      </div>
    );
  }

  const filters = ['ALL', 'GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'CAM', 'AM', 'LW', 'RW', 'ST'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', color: 'white', padding: '40px 0', position: 'relative', zIndex: 3 }}>
      {/* Glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(200,16,46,0.1), transparent 60%)', zIndex: 0 }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 3 }}>
        <Link
          to="/"
          style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <div style={{ marginTop: 32, padding: '40px 40px', borderRadius: 40, background: 'radial-gradient(circle at top, rgba(200,16,46,0.18), transparent 50%)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 32, height: 1, background: 'var(--color-primary)', display: 'block' }} />
            Full Squad
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 1, marginTop: 12 }}>
            PLAYER DIRECTORY
          </h1>
          <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.55)', maxWidth: 540, lineHeight: 1.8, fontWeight: 300 }}>
            Browse the current squad, filter by position, and click the cards to flip them for full stats.
          </p>
        </div>

        {/* Position filter pills */}
        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {filters.map((entry) => (
            <button
              key={entry}
              onClick={() => setFilter(entry)}
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 11,
                letterSpacing: 2,
                padding: '6px 18px',
                borderRadius: 100,
                border: '1px solid rgba(255,255,255,0.12)',
                background: filter === entry ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
                boxShadow: filter === entry ? '0 0 20px rgba(200,16,46,0.4)' : 'none',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {entry}
            </button>
          ))}
        </div>

        {/* Player count */}
        <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>
          {filteredPlayers.length} PLAYER{filteredPlayers.length !== 1 ? 'S' : ''}
        </p>

        {/* Cards grid */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'flex-start',
          }}
        >
          {filteredPlayers.map((player) => (
            <FcPlayerCard
              key={player.id || player._id}
              player={player}
              href={`/players/${player.id || player._id}`}
            />
          ))}
          {filteredPlayers.length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', width: '100%', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              No players found for this position
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSquadPage;
