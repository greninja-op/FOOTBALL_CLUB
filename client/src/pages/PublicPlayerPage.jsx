import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PlayerSpotlightCard from '../components/PlayerSpotlightCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PublicPlayerPage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/players/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load player');
        }

        setPlayer(data.player);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading player...</div>;
  }

  if (error || !player) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-300">{error || 'Player unavailable'}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/squad" className="text-sm uppercase tracking-[0.25em] text-white/50 hover:text-white">Back to Squad</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <PlayerSpotlightCard player={player} />

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-red-300">Player Profile</p>
            <h1 className="mt-4 text-4xl font-black uppercase">{player.fullName}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/10 px-3 py-1">{player.preferredPosition || player.position}</span>
              {player.secondaryPositions?.map((entry) => (
                <span key={entry} className="rounded-full border border-white/10 px-3 py-1">{entry}</span>
              ))}
              <span className="rounded-full border border-white/10 px-3 py-1">{player.fitnessStatus}</span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <StatBlock label="Goals" value={player.stats?.goals || 0} />
              <StatBlock label="Assists" value={player.stats?.assists || 0} />
              <StatBlock label="Appearances" value={player.stats?.appearances || 0} />
              <StatBlock label="Rating" value={`${Number(player.stats?.rating || 0).toFixed(1)}/10`} />
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold uppercase">Recent Matches</h2>
              <div className="mt-4 space-y-3">
                {player.recentFixtures.length ? player.recentFixtures.map((fixture) => (
                  <Link
                    key={fixture.id}
                    to={`/match/${fixture.id}`}
                    className="block rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition hover:border-red-400/40"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">vs {fixture.opponent}</div>
                        <div className="mt-1 text-sm text-white/55">
                          {new Date(fixture.date).toLocaleDateString()} - {fixture.location}
                        </div>
                      </div>
                      <div className="text-right text-xs uppercase tracking-[0.22em] text-white/45">
                        {fixture.formation || 'Matchday'}
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                    No recent match history yet.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold uppercase">Recent Coaching Notes</h2>
              <div className="mt-4 space-y-3">
                {player.performanceNotes.length ? player.performanceNotes.map((entry, index) => (
                  <div key={`${entry.createdAt}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-red-300">
                      {entry.role || 'staff'} - {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/70">{entry.note}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                    No public player notes available yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatBlock = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
    <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">{label}</div>
    <div className="mt-2 text-3xl font-black">{value}</div>
  </div>
);

export default PublicPlayerPage;
