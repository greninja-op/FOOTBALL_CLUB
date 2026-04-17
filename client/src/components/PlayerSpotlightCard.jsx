import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    let frame = 0;
    const frames = 24;
    const interval = setInterval(() => {
      frame += 1;
      const nextValue = Math.round((target * frame) / frames);
      setDisplayValue(nextValue);
      if (frame >= frames) {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [value]);

  return <span>{displayValue}</span>;
};

const PlayerSpotlightCard = ({ player, href }) => {
  const CardTag = href ? Link : 'article';
  const cardProps = href ? { to: href } : {};

  return (
    <CardTag
      {...cardProps}
      className="group relative block overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.4)] transition hover:-translate-y-1 hover:border-red-400/40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_48%)] opacity-90" />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Squad Spotlight</p>
          <h3 className="mt-3 text-2xl font-black uppercase tracking-wide">{player.fullName}</h3>
          <p className="mt-1 text-sm text-white/65">{player.preferredPosition || player.position}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/60">
          {player.fitnessStatus || 'Ready'}
        </div>
      </div>

      <div className="relative mt-8 grid grid-cols-3 gap-3">
        <StatChip label="Goals" value={player.stats?.goals || 0} />
        <StatChip label="Assists" value={player.stats?.assists || 0} />
        <StatChip label="Apps" value={player.stats?.appearances || 0} />
      </div>

      <div className="relative mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-sm text-white/60">Rating</span>
        <span className="text-2xl font-black text-red-300">
          <AnimatedNumber value={Math.round((player.stats?.rating || 0) * 10)} />
          <span className="text-base text-white/45">/100</span>
        </span>
      </div>
    </CardTag>
  );
};

const StatChip = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center">
    <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">{label}</div>
    <div className="mt-2 text-2xl font-black text-white">
      <AnimatedNumber value={value} />
    </div>
  </div>
);

export default PlayerSpotlightCard;
