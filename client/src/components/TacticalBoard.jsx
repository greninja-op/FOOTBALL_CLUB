import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../contexts/AuthContext';
import FloatingNotice from './FloatingNotice';
import UiButton from './ui/UiButton';
import UiSelect from './ui/UiSelect';

const FORMATIONS = {
  '4-4-2': [
    { id: 'gk', label: 'GK', accepts: ['GK'], row: 5, col: 3 },
    { id: 'lb', label: 'LB', accepts: ['LB', 'LWB', 'CB'], row: 4, col: 0 },
    { id: 'lcb', label: 'LCB', accepts: ['CB', 'LB', 'RB'], row: 4, col: 2 },
    { id: 'rcb', label: 'RCB', accepts: ['CB', 'LB', 'RB'], row: 4, col: 4 },
    { id: 'rb', label: 'RB', accepts: ['RB', 'RWB', 'CB'], row: 4, col: 6 },
    { id: 'lm', label: 'LM', accepts: ['LM', 'LW', 'CM'], row: 3, col: 0 },
    { id: 'lcm', label: 'LCM', accepts: ['CM', 'DM', 'AM'], row: 3, col: 2 },
    { id: 'rcm', label: 'RCM', accepts: ['CM', 'DM', 'AM'], row: 3, col: 4 },
    { id: 'rm', label: 'RM', accepts: ['RM', 'RW', 'CM'], row: 3, col: 6 },
    { id: 'ls', label: 'LS', accepts: ['ST', 'CF', 'SS'], row: 1, col: 2 },
    { id: 'rs', label: 'RS', accepts: ['ST', 'CF', 'SS'], row: 1, col: 4 }
  ],
  '4-3-3': [
    { id: 'gk', label: 'GK', accepts: ['GK'], row: 5, col: 3 },
    { id: 'lb', label: 'LB', accepts: ['LB', 'LWB', 'CB'], row: 4, col: 0 },
    { id: 'lcb', label: 'LCB', accepts: ['CB', 'LB', 'RB'], row: 4, col: 2 },
    { id: 'rcb', label: 'RCB', accepts: ['CB', 'LB', 'RB'], row: 4, col: 4 },
    { id: 'rb', label: 'RB', accepts: ['RB', 'RWB', 'CB'], row: 4, col: 6 },
    { id: 'lcm', label: 'LCM', accepts: ['CM', 'DM', 'AM'], row: 3, col: 1 },
    { id: 'dm', label: 'DM', accepts: ['DM', 'CM', 'CB'], row: 3, col: 3 },
    { id: 'rcm', label: 'RCM', accepts: ['CM', 'DM', 'AM'], row: 3, col: 5 },
    { id: 'lw', label: 'LW', accepts: ['LW', 'LM', 'RW'], row: 1, col: 0 },
    { id: 'st', label: 'ST', accepts: ['ST', 'CF', 'SS'], row: 1, col: 3 },
    { id: 'rw', label: 'RW', accepts: ['RW', 'RM', 'LW'], row: 1, col: 6 }
  ],
  '3-5-2': [
    { id: 'gk', label: 'GK', accepts: ['GK'], row: 5, col: 3 },
    { id: 'lcb', label: 'LCB', accepts: ['CB', 'LB'], row: 4, col: 1 },
    { id: 'cb', label: 'CB', accepts: ['CB', 'DM'], row: 4, col: 3 },
    { id: 'rcb', label: 'RCB', accepts: ['CB', 'RB'], row: 4, col: 5 },
    { id: 'lwb', label: 'LWB', accepts: ['LWB', 'LB', 'LM'], row: 3, col: 0 },
    { id: 'lcm', label: 'LCM', accepts: ['CM', 'DM', 'AM'], row: 3, col: 2 },
    { id: 'cam', label: 'CAM', accepts: ['CAM', 'AM', 'CM'], row: 2, col: 3 },
    { id: 'rcm', label: 'RCM', accepts: ['CM', 'DM', 'AM'], row: 3, col: 4 },
    { id: 'rwb', label: 'RWB', accepts: ['RWB', 'RB', 'RM'], row: 3, col: 6 },
    { id: 'ls', label: 'LS', accepts: ['ST', 'CF', 'SS'], row: 1, col: 2 },
    { id: 'rs', label: 'RS', accepts: ['ST', 'CF', 'SS'], row: 1, col: 4 }
  ]
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TacticalBoard = () => {
  const { token } = useAuth();
  const rosterPrintRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [unavailablePlayers, setUnavailablePlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState('');
  const [formation, setFormation] = useState('4-3-3');
  const [bench, setBench] = useState([]);
  const [lineupMap, setLineupMap] = useState({});
  const [dragPayload, setDragPayload] = useState(null);
  const [fixtureHistory, setFixtureHistory] = useState([]);
  const [overrideDrafts, setOverrideDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clubName = import.meta.env.VITE_CLUB_NAME || 'Football Club';

  const slots = useMemo(() => FORMATIONS[formation], [formation]);

  useEffect(() => {
    fetchPlayers();
    fetchFixtures();
  }, [token]);

  useEffect(() => {
    setLineupMap({});
    setBench([]);
  }, [formation]);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/player-domain/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPlayers(data.available || []);
        setUnavailablePlayers(data.unavailable || []);
      }
      setLoading(false);
    } catch (fetchError) {
      setError('Failed to load players');
      setLoading(false);
    }
  };

  const updateOverrideDraft = (playerId, value) => {
    setOverrideDrafts((current) => ({
      ...current,
      [playerId]: value
    }));
  };

  const submitAvailabilityOverride = async (playerId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/player-domain/availability/${playerId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          reason: overrideDrafts[playerId] || ''
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update availability');
      }

      setSuccess('Availability updated');
      fetchPlayers();
      setTimeout(() => setSuccess(''), 2500);
    } catch (overrideError) {
      setError(overrideError.message || 'Failed to update availability');
    }
  };

  const fetchFixtures = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fixtures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const upcomingFixtures = data.fixtures.filter((fixture) =>
          new Date(fixture.date) > new Date() && (!fixture.lineup || fixture.lineup.length === 0)
        );
        setFixtures(upcomingFixtures);
      }
    } catch (fetchError) {
      setError('Failed to load fixtures');
    }
  };

  const fetchFixtureHistory = async (fixtureId) => {
    if (!fixtureId) {
      setFixtureHistory([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/fixtures/${fixtureId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFixtureHistory(data.fixture.lineupHistory || []);
      }
    } catch (fetchError) {
      setError('Failed to load fixture history');
    }
  };

  const allSelectedIds = useMemo(() => {
    const assigned = Object.values(lineupMap)
      .filter(Boolean)
      .map((player) => player.id || player._id);

    return new Set([...assigned, ...bench.map((player) => player.id || player._id)]);
  }, [lineupMap, bench]);

  const availableBenchPool = players.filter((player) => !allSelectedIds.has(player.id || player._id));

  const officialStarters = useMemo(() => (
    slots
      .map((slot) => ({
        slotLabel: slot.label,
        player: lineupMap[slot.id]
      }))
      .filter((entry) => Boolean(entry.player))
  ), [slots, lineupMap]);

  const officialBench = useMemo(() => bench.slice(0, 7), [bench]);

  const selectedFixtureDetails = useMemo(() => (
    fixtures.find((fixture) => String(fixture.id || fixture._id) === String(selectedFixture)) || null
  ), [fixtures, selectedFixture]);

  const handlePrintOfficialRoster = useReactToPrint({
    content: () => rosterPrintRef.current,
    documentTitle: `official_roster_${new Date().toISOString().slice(0, 10)}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 14mm;
      }

      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #000000;
      }
    `
  });

  useEffect(() => {
    fetchFixtureHistory(selectedFixture);
  }, [selectedFixture, token]);

  const handleDragStart = (payload) => {
    setDragPayload(payload);
  };

  const assignPlayerToSlot = (slotId, player) => {
    setLineupMap((current) => {
      const next = { ...current };
      const existingSlotId = Object.entries(next).find(([, currentPlayer]) => {
        if (!currentPlayer) return false;
        return (currentPlayer.id || currentPlayer._id) === (player.id || player._id);
      })?.[0];

      if (existingSlotId) {
        delete next[existingSlotId];
      }

      next[slotId] = player;
      return next;
    });
  };

  const swapSlots = (sourceSlotId, targetSlotId) => {
    setLineupMap((current) => {
      const next = { ...current };
      const sourcePlayer = next[sourceSlotId] || null;
      const targetPlayer = next[targetSlotId] || null;
      next[targetSlotId] = sourcePlayer;
      next[sourceSlotId] = targetPlayer;
      return next;
    });
  };

  const dropOnSlot = (slot) => {
    if (!dragPayload) return;

    if (dragPayload.type === 'slot') {
      swapSlots(dragPayload.slotId, slot.id);
      setDragPayload(null);
      return;
    }

    const player = dragPayload.player;
    const playerId = player.id || player._id;
    const slotOccupant = lineupMap[slot.id];

    setBench((currentBench) => {
      const filteredBench = currentBench.filter((entry) => (entry.id || entry._id) !== playerId);
      if (slotOccupant && (dragPayload.type === 'bench' || dragPayload.type === 'pool')) {
        if (filteredBench.some((entry) => (entry.id || entry._id) === (slotOccupant.id || slotOccupant._id))) {
          return filteredBench;
        }
        return [...filteredBench, slotOccupant];
      }
      return filteredBench;
    });

    assignPlayerToSlot(slot.id, player);
    setDragPayload(null);
    setError('');
  };

  const dropOnBench = () => {
    if (!dragPayload) return;

    if (dragPayload.type === 'slot') {
      const slotPlayer = lineupMap[dragPayload.slotId];
      if (!slotPlayer) return;

      setLineupMap((current) => ({
        ...current,
        [dragPayload.slotId]: null
      }));

      setBench((currentBench) => {
        if (currentBench.some((entry) => (entry.id || entry._id) === (slotPlayer.id || slotPlayer._id))) {
          return currentBench;
        }
        return [...currentBench, slotPlayer].slice(0, 7);
      });
    } else if (dragPayload.type === 'pool') {
      const player = dragPayload.player;
      setBench((currentBench) => {
        if (currentBench.length >= 7) {
          setError('Bench already has 7 players');
          return currentBench;
        }
        if (currentBench.some((entry) => (entry.id || entry._id) === (player.id || player._id))) {
          return currentBench;
        }
        return [...currentBench, player];
      });
    }

    setDragPayload(null);
  };

  const dropBackToPool = () => {
    if (!dragPayload) return;

    if (dragPayload.type === 'slot') {
      setLineupMap((current) => ({
        ...current,
        [dragPayload.slotId]: null
      }));
    }

    if (dragPayload.type === 'bench') {
      setBench((current) => current.filter((player) => (player.id || player._id) !== (dragPayload.player.id || dragPayload.player._id)));
    }

    setDragPayload(null);
  };

  const autoFillLineup = () => {
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreA = (a.stats?.goals || 0) + (a.stats?.assists || 0) + (a.stats?.rating || 0);
      const scoreB = (b.stats?.goals || 0) + (b.stats?.assists || 0) + (b.stats?.rating || 0);
      return scoreB - scoreA;
    });

    const nextMap = {};
    const usedIds = new Set();

    slots.forEach((slot) => {
      const match = sortedPlayers.find((player) => {
        const playerId = player.id || player._id;
        if (usedIds.has(playerId)) return false;
        const tags = getPlayerPositionTags(player);
        return tags.some((tag) => slot.accepts.includes(tag));
      }) || sortedPlayers.find((player) => !usedIds.has(player.id || player._id));

      if (match) {
        nextMap[slot.id] = match;
        usedIds.add(match.id || match._id);
      }
    });

    const nextBench = sortedPlayers.filter((player) => !usedIds.has(player.id || player._id)).slice(0, 7);
    setLineupMap(nextMap);
    setBench(nextBench);
    setError('');
  };

  const loadHistoryVersion = (historyEntry) => {
    const historyFormation = historyEntry.formation;
    if (historyFormation && FORMATIONS[historyFormation]) {
      setFormation(historyFormation);

      setTimeout(() => {
        hydrateLineupFromHistory(historyEntry, historyFormation);
      }, 0);
      return;
    }

    hydrateLineupFromHistory(historyEntry, formation);
  };

  const hydrateLineupFromHistory = (historyEntry, activeFormation) => {
    const activeSlots = FORMATIONS[activeFormation];
    const nextMap = {};
    const historyPlayers = historyEntry.lineup || [];

    activeSlots.forEach((slot, index) => {
      if (historyPlayers[index]) {
        nextMap[slot.id] = historyPlayers[index];
      }
    });

    setLineupMap(nextMap);
    setBench(historyPlayers.slice(activeSlots.length, activeSlots.length + 7));
    setSuccess(`Loaded lineup version ${historyEntry.version}`);
    setTimeout(() => setSuccess(''), 2500);
  };

  const removeFromSlot = (slotId) => {
    const player = lineupMap[slotId];
    if (!player) return;

    setLineupMap((current) => ({
      ...current,
      [slotId]: null
    }));

    setBench((currentBench) => {
      if (currentBench.length >= 7) return currentBench;
      return [...currentBench, player];
    });
  };

  const removeFromBench = (playerId) => {
    setBench((current) => current.filter((player) => (player.id || player._id) !== playerId));
  };

  const saveLineup = async () => {
    if (!selectedFixture) {
      setError('Please select a fixture');
      return;
    }

    const starters = slots.map((slot) => lineupMap[slot.id]).filter(Boolean);
    const finalLineup = [...starters, ...bench];

    if (starters.length < 11) {
      setError('Please fill all 11 starter slots before saving');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/fixtures/${selectedFixture}/lineup`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lineup: finalLineup.map((player) => player.id || player._id),
          formation
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Lineup saved successfully');
        setLineupMap({});
        setBench([]);
        setSelectedFixture('');
        fetchFixtures();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save lineup');
      }
    } catch (saveError) {
      setError('Failed to save lineup');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">Loading tactical board...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <FloatingNotice message={error || success} type={error ? 'error' : 'success'} />

      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Tactical Board</h2>
          <p className="mt-1 text-xs text-gray-400">
            Build a slot-based lineup, swap players between positions, and keep the bench organized.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <UiButton
            onClick={handlePrintOfficialRoster}
            variant="success"
            className="px-4"
          >
            Print Official Roster
          </UiButton>
          <UiButton
            onClick={() => window.print()}
            variant="secondary"
            className="px-4"
          >
            Print Pitch
          </UiButton>
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Select Fixture</label>
          <UiSelect
            value={selectedFixture}
            onChange={(event) => setSelectedFixture(event.target.value)}
          >
            <option value="">-- Select a fixture --</option>
            {fixtures.map((fixture) => (
              <option key={fixture.id} value={fixture.id}>
                {new Date(fixture.date).toLocaleDateString()} - vs {fixture.opponent} ({fixture.location})
              </option>
            ))}
          </UiSelect>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Formation</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(FORMATIONS).map((shape) => (
              <UiButton
                key={shape}
                onClick={() => setFormation(shape)}
                variant={formation === shape ? 'primary' : 'secondary'}
                size="sm"
              >
                {shape}
              </UiButton>
            ))}
            <UiButton
              onClick={autoFillLineup}
              variant="success"
              size="sm"
            >
              Auto Fill
            </UiButton>
          </div>
        </div>
      </div>

      {selectedFixture && (
        <div className="mb-4 rounded-lg bg-gray-800/40 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Saved Lineup Versions</h3>
            <span className="text-sm text-gray-400">{fixtureHistory.length} versions</span>
          </div>
          {fixtureHistory.length === 0 ? (
            <div className="text-sm text-gray-500">No saved lineup history for this fixture yet.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {fixtureHistory
                .slice()
                .sort((a, b) => b.version - a.version)
                .map((entry) => (
                  <button
                    key={`${entry.version}-${entry.savedAt}`}
                    onClick={() => loadHistoryVersion(entry)}
                    className="rounded-lg bg-gray-700/20 border border-white/10 p-3 text-left transition hover:border-red-500/30 hover:bg-gray-700/40"
                  >
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                      Version {entry.version}
                    </div>
                    <div className="mt-2 text-sm text-gray-300">
                      {entry.formation || 'No formation'} - {entry.lineup.length} players
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {new Date(entry.savedAt).toLocaleString()}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr_0.9fr]">
        <aside>
          <h3 className="mb-3 text-lg font-semibold text-white">Available Players</h3>
          <div className="rounded-lg bg-gray-800/40 backdrop-blur-sm border border-white/10 p-4">
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={dropBackToPool}
              className="grid max-h-[31rem] min-h-[24rem] grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-white/15 p-2 pr-1 no-scrollbar sm:grid-cols-2"
            >
              {availableBenchPool.map((player) => (
                <PlayerToken
                  key={player.id || player._id}
                  player={player}
                  onDragStart={() => handleDragStart({ type: 'pool', player })}
                />
              ))}
              {dragPayload && dragPayload.type !== 'pool' && (
                <p className="mt-3 text-center text-xs uppercase tracking-[0.25em] text-gray-500">
                  Drop here to remove from lineup
                </p>
              )}
            </div>
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-white">Bench ({bench.length}/7)</h3>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropOnBench}
            className="min-h-44 rounded-lg border border-green-500/30 bg-green-900/20 p-4"
          >
            {bench.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500">Drag players here for the bench</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {bench.map((player) => (
                  <div key={player.id || player._id} className="rounded-xl border border-white/10 bg-gray-800/35 p-2">
                    <PlayerToken
                      player={player}
                      compact
                      onDragStart={() => handleDragStart({ type: 'bench', player })}
                    />
                    <UiButton
                      onClick={() => removeFromBench(player.id || player._id)}
                      variant="danger"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      Remove
                    </UiButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section>
          <h3 className="mb-3 text-lg font-semibold text-white">Pitch Layout</h3>
          <div className="rounded-[28px] border border-emerald-700/40 bg-[linear-gradient(180deg,#0b5d37_0%,#0b7142_100%)] p-4 shadow-inner">
            <div className="grid grid-cols-7 gap-3 rounded-[24px] border border-white/20 p-4">
              {Array.from({ length: 42 }).map((_, index) => {
                const row = Math.floor(index / 7);
                const col = index % 7;
                const slot = slots.find((entry) => entry.row === row && entry.col === col);

                if (!slot) {
                  return <div key={`cell-${index}`} className="h-20 rounded-2xl border border-transparent" />;
                }

                const assignedPlayer = lineupMap[slot.id];
                const mismatch = assignedPlayer && !playerFitsSlot(assignedPlayer, slot);

                return (
                  <div
                    key={slot.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropOnSlot(slot)}
                    className={`relative flex h-20 flex-col items-center justify-center rounded-2xl border p-2 text-center ${
                      mismatch
                        ? 'border-amber-300 bg-amber-50/90'
                        : 'border-white/30 bg-white/10'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">{slot.label}</div>
                    {assignedPlayer ? (
                      <>
                        <div
                          draggable
                          onDragStart={() => handleDragStart({ type: 'slot', slotId: slot.id })}
                          className="mt-1 cursor-move rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white"
                        >
                          {assignedPlayer.fullName}
                        </div>
                        {mismatch && (
                          <div className="mt-1 text-[10px] font-semibold uppercase text-amber-900">
                            Out of Position
                          </div>
                        )}
                        <button
                          onClick={() => removeFromSlot(slot.id)}
                          className="absolute right-1 top-1 text-[10px] font-bold text-white/80"
                        >
                          X
                        </button>
                      </>
                    ) : (
                      <div className="mt-1 text-[11px] text-white/60">Drop player</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <UiButton
            onClick={saveLineup}
            disabled={!selectedFixture}
            variant="primary"
            className="mt-4 w-full"
          >
            Save Lineup
          </UiButton>
        </section>

        <aside>
          <h3 className="mb-3 text-lg font-semibold text-white">Unavailable Players</h3>
          <div className="min-h-96 rounded-lg bg-gray-800/40 backdrop-blur-sm border border-white/10 p-4">
            {unavailablePlayers.length === 0 ? (
              <div className="mt-20 text-center text-sm text-gray-500">All players available</div>
            ) : (
              unavailablePlayers.map((player) => (
                <div key={player.id} className="mb-3 rounded-lg bg-gray-700/20 border border-white/10 p-3">
                  <div className="font-medium text-white">{player.fullName}</div>
                  <div className="text-sm text-gray-400">{player.preferredPosition || player.position}</div>
                  <div className="mt-2 inline-flex rounded-full bg-red-900/40 border border-red-500/30 px-2 py-1 text-xs font-semibold text-red-200">
                    {player.reason?.label}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{player.reason?.detail}</div>
                  <input
                    value={overrideDrafts[player.id] || ''}
                    onChange={(event) => updateOverrideDraft(player.id, event.target.value)}
                    className="mt-3 w-full rounded bg-gray-800/40 border border-white/20 text-white px-2 py-1 text-xs placeholder-gray-500"
                    placeholder="Manual note for override"
                  />
                  <div className="mt-2 flex gap-2">
                    <UiButton
                      onClick={() => submitAvailabilityOverride(player.id, 'available')}
                      variant="success"
                      size="sm"
                    >
                      Force Available
                    </UiButton>
                    <UiButton
                      onClick={() => submitAvailabilityOverride(player.id, 'auto')}
                      variant="secondary"
                      size="sm"
                    >
                      Back to Auto
                    </UiButton>
                  </div>
                </div>
              ))
            )}
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-white">Manual Availability Controls</h3>
          <div className="rounded-lg bg-gray-800/40 backdrop-blur-sm border border-white/10 p-4">
            <div className="grid max-h-[31rem] grid-cols-1 gap-3 overflow-y-auto pr-1 no-scrollbar sm:grid-cols-2">
              {players.slice(0, 6).map((player) => (
                <div key={`manual-${player.id}`} className="rounded-lg bg-gray-700/20 border border-white/10 p-3">
                  <div className="font-medium text-white">{player.fullName}</div>
                  <div className="text-sm text-gray-400">{player.preferredPosition || player.position}</div>
                  <input
                    value={overrideDrafts[player.id] || ''}
                    onChange={(event) => updateOverrideDraft(player.id, event.target.value)}
                    className="mt-2 w-full rounded bg-gray-800/40 border border-white/20 text-white px-2 py-1 text-xs placeholder-gray-500"
                    placeholder="Manual note"
                  />
                  <div className="mt-2 flex gap-2">
                    <UiButton
                      onClick={() => submitAvailabilityOverride(player.id, 'unavailable')}
                      variant="danger"
                      size="sm"
                    >
                      Mark Unavailable
                    </UiButton>
                    <UiButton
                      onClick={() => submitAvailabilityOverride(player.id, 'auto')}
                      variant="secondary"
                      size="sm"
                    >
                      Auto
                    </UiButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div style={{ position: 'absolute', left: '-99999px', top: 0 }} aria-hidden="true">
        <div
          ref={rosterPrintRef}
          style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            padding: '20px'
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {clubName}
          </h1>
          <h2 style={{ marginTop: '8px', fontSize: '18px', fontWeight: 700 }}>
            Official Matchday Roster
          </h2>
          <p style={{ marginTop: '4px', fontSize: '12px' }}>
            Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ marginTop: '2px', fontSize: '12px' }}>
            Fixture: {selectedFixtureDetails ? `vs ${selectedFixtureDetails.opponent}` : 'Not selected'}
          </p>
          <p style={{ marginTop: '2px', fontSize: '12px' }}>Formation: {formation}</p>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', textTransform: 'uppercase' }}>Starting XI</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={printTableHeaderStyle}>#</th>
                  <th style={printTableHeaderStyle}>Position</th>
                  <th style={printTableHeaderStyle}>Player</th>
                </tr>
              </thead>
              <tbody>
                {officialStarters.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={printEmptyCellStyle}>No starters selected</td>
                  </tr>
                ) : (
                  officialStarters.map((entry, index) => (
                    <tr key={`starter-${entry.slotLabel}-${entry.player?.id || entry.player?._id || index}`}>
                      <td style={printTableCellStyle}>{index + 1}</td>
                      <td style={printTableCellStyle}>{entry.slotLabel}</td>
                      <td style={printTableCellStyle}>{entry.player?.fullName || 'Unknown'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', textTransform: 'uppercase' }}>Bench</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={printTableHeaderStyle}>#</th>
                  <th style={printTableHeaderStyle}>Player</th>
                  <th style={printTableHeaderStyle}>Position</th>
                </tr>
              </thead>
              <tbody>
                {officialBench.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={printEmptyCellStyle}>No bench players selected</td>
                  </tr>
                ) : (
                  officialBench.map((player, index) => (
                    <tr key={`bench-${player?.id || player?._id || index}`}>
                      <td style={printTableCellStyle}>{index + 1}</td>
                      <td style={printTableCellStyle}>{player?.fullName || 'Unknown'}</td>
                      <td style={printTableCellStyle}>{player?.preferredPosition || player?.position || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const printTableHeaderStyle = {
  textAlign: 'left',
  borderBottom: '1px solid #000000',
  padding: '8px 4px',
  fontSize: '12px'
};

const printTableCellStyle = {
  borderBottom: '1px solid #d1d5db',
  padding: '8px 4px',
  fontSize: '12px'
};

const printEmptyCellStyle = {
  borderBottom: '1px solid #d1d5db',
  padding: '12px 4px',
  fontSize: '12px',
  color: '#4b5563'
};

const PlayerToken = ({ player, onDragStart, compact = false }) => (
  <div
    draggable
    onDragStart={onDragStart}
    className={`cursor-move rounded-lg bg-gray-700/40 border border-white/10 shadow transition hover:shadow-md hover:bg-gray-700/60 ${compact ? 'flex-1 p-2' : 'mb-2 p-3'}`}
  >
    <div className="font-medium text-white">{player.fullName}</div>
    <div className="text-sm text-gray-400">{player.preferredPosition || player.position || 'Position not set'}</div>
    <div className="mt-1 inline-flex rounded-full bg-gray-800/60 border border-white/20 px-2 py-1 text-[11px] font-semibold text-gray-300">
      Rating {Number(player.stats?.rating || 0).toFixed(1)}
    </div>
  </div>
);

function playerFitsSlot(player, slot) {
  const tags = getPlayerPositionTags(player);
  return tags.some((tag) => slot.accepts.includes(tag));
}

function getPlayerPositionTags(player) {
  const broadPositionMap = {
    Goalkeeper: ['GK'],
    Defender: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
    Midfielder: ['DM', 'CM', 'AM', 'CAM', 'LM', 'RM'],
    Forward: ['LW', 'RW', 'CF', 'ST', 'SS'],
    Staff: ['STAFF']
  };

  return [
    player.preferredPosition,
    ...(player.secondaryPositions || []),
    ...(broadPositionMap[player.position] || [player.position])
  ].filter(Boolean);
}

export default TacticalBoard;
