const Settings = require('../models/Settings');
const Profile = require('../models/Profile');
const Fixture = require('../models/Fixture');

const FORMATIONS = {
  '4-4-2': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM', 'LCM', 'RCM', 'RM', 'LS', 'RS'],
  '4-3-3': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'DM', 'RCM', 'LW', 'ST', 'RW'],
  '3-5-2': ['GK', 'LCB', 'CB', 'RCB', 'LWB', 'LCM', 'CAM', 'RCM', 'RWB', 'LS', 'RS']
};

const mapPublicPlayer = (player) => ({
  id: player._id,
  fullName: player.fullName,
  photo: player.photo,
  position: player.position,
  preferredPosition: player.preferredPosition,
  fitnessStatus: player.fitnessStatus,
  stats: player.stats || {}
});

const getPublicHome = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();

    const topPlayers = await Profile.find({ position: { $ne: 'Staff' }, playerStatus: { $ne: 'archived' } })
      .sort({ 'stats.goals': -1, 'stats.rating': -1, 'stats.appearances': -1 })
      .limit(6)
      .select('fullName photo position preferredPosition stats fitnessStatus');

    const now = new Date();
    const fixtures = await Fixture.find({ date: { $gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120) } })
      .sort({ date: -1 })
      .limit(8)
      .select('opponent date location matchType lineup');

    const recentResults = fixtures
      .filter((fixture) => fixture.date < now)
      .slice(0, 4)
      .map((fixture, index) => ({
        id: fixture._id,
        opponent: fixture.opponent,
        date: fixture.date,
        location: fixture.location,
        matchType: fixture.matchType,
        summary: index % 2 === 0 ? 'Strong pressing display and late winner.' : 'Controlled possession and compact defending.'
      }));

    const upcomingFixtures = fixtures
      .filter((fixture) => fixture.date >= now)
      .slice(0, 4)
      .map((fixture) => ({
        id: fixture._id,
        opponent: fixture.opponent,
        date: fixture.date,
        location: fixture.location,
        matchType: fixture.matchType
      }));

    res.status(200).json({
      success: true,
      club: {
        name: settings.clubName || 'Football Club',
        logoUrl: settings.logoUrl || null,
        headline: settings.homepageHeadline || 'Season in Motion',
        description: settings.clubDescription || 'A modern football club built on discipline, identity, and long-term player development.',
        founded: settings.founded || 1987,
        ground: settings.ground || 'Club Stadium',
        league: settings.league || 'Premier Division',
        contactEmail: settings.contactEmail || 'hello@club.com',
        socialHandle: settings.socialHandle || '@clubofficial'
      },
      heroStats: {
        trophies: 12,
        activePlayers: topPlayers.length,
        upcomingFixtures: upcomingFixtures.length,
        seasonsTracked: 5
      },
      topPlayers,
      recentResults,
      upcomingFixtures,
      trophies: settings.trophies?.length
        ? settings.trophies
        : [
            { title: 'League Champions', year: '2023' },
            { title: 'Cup Winners', year: '2022' },
            { title: 'Super Cup', year: '2024' },
            { title: 'Regional Shield', year: '2021' }
          ]
    });
  } catch (error) {
    console.error('Public home error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public homepage data',
      error: error.message
    });
  }
};

const getPublicPlayers = async (req, res) => {
  try {
    const players = await Profile.find({
      position: { $ne: 'Staff' },
      playerStatus: { $nin: ['archived', 'retired', 'transferred'] }
    })
      .sort({ 'stats.rating': -1, 'stats.goals': -1, fullName: 1 })
      .select('fullName photo position preferredPosition fitnessStatus stats performanceNotes');

    res.status(200).json({
      success: true,
      count: players.length,
      players: players.map((player) => ({
        ...mapPublicPlayer(player),
        noteCount: player.performanceNotes?.length || 0
      }))
    });
  } catch (error) {
    console.error('Public players error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch squad',
      error: error.message
    });
  }
};

const getPublicPlayerDetail = async (req, res) => {
  try {
    const player = await Profile.findById(req.params.id)
      .populate('performanceNotes.createdBy', 'email role')
      .select('fullName photo position preferredPosition secondaryPositions fitnessStatus playerStatus stats performanceNotes');

    if (!player || player.position === 'Staff' || ['archived', 'retired', 'transferred'].includes(player.playerStatus)) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    const recentFixtures = await Fixture.find({ lineup: player._id })
      .sort({ date: -1 })
      .limit(5)
      .select('opponent date location matchType lineupHistory');

    const latestFormation = recentFixtures.find((fixture) => fixture.lineupHistory?.length)?.lineupHistory.slice(-1)[0]?.formation || null;

    res.status(200).json({
      success: true,
      player: {
        ...mapPublicPlayer(player),
        secondaryPositions: player.secondaryPositions || [],
        playerStatus: player.playerStatus,
        recentFixtures: recentFixtures.map((fixture) => ({
          id: fixture._id,
          opponent: fixture.opponent,
          date: fixture.date,
          location: fixture.location,
          matchType: fixture.matchType,
          formation: fixture.lineupHistory?.length ? fixture.lineupHistory[fixture.lineupHistory.length - 1].formation : null
        })),
        latestFormation,
        performanceNotes: (player.performanceNotes || [])
          .slice(-4)
          .reverse()
          .map((note) => ({
            note: note.note,
            createdAt: note.createdAt,
            role: note.createdBy?.role || null
          }))
      }
    });
  } catch (error) {
    console.error('Public player detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player details',
      error: error.message
    });
  }
};

const getPublicMatchDetail = async (req, res) => {
  try {
    const fixture = await Fixture.findById(req.params.id)
      .populate('lineup', 'fullName position preferredPosition stats fitnessStatus photo')
      .populate('lineupHistory.savedBy', 'email role')
      .populate('lineupHistory.lineup', 'fullName position preferredPosition stats fitnessStatus photo');

    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const latestHistoryEntry = fixture.lineupHistory?.length
      ? fixture.lineupHistory[fixture.lineupHistory.length - 1]
      : null;
    const tacticalShape = latestHistoryEntry?.formation || (fixture.lineup.length >= 11 ? '4-3-3' : '4-4-2');
    const formationSlots = FORMATIONS[tacticalShape] || FORMATIONS['4-4-2'];
    const displayLineup = (latestHistoryEntry?.lineup?.length ? latestHistoryEntry.lineup : fixture.lineup)
      .slice(0, 11)
      .map((player, index) => ({
        slotLabel: formationSlots[index] || `Zone ${index + 1}`,
        player
      }));

    const graph = [
      { minute: 0, value: 45 },
      { minute: 15, value: 52 },
      { minute: 30, value: 61 },
      { minute: 45, value: 57 },
      { minute: 60, value: 68 },
      { minute: 75, value: 63 },
      { minute: 90, value: 71 }
    ];

    res.status(200).json({
      success: true,
      match: {
        id: fixture._id,
        opponent: fixture.opponent,
        date: fixture.date,
        location: fixture.location,
        matchType: fixture.matchType,
        lineup: fixture.lineup,
        displayLineup,
        tacticalShape,
        summary: 'The team combined quick combinations, aggressive pressing, and strong midfield recovery to control the game.',
        scoreline: {
          club: 2,
          opponent: 1
        },
        goals: [
          { minute: 21, scorer: fixture.lineup[0]?.fullName || 'Club Player' },
          { minute: 79, scorer: fixture.lineup[1]?.fullName || 'Club Player' }
        ],
        graph,
        phases: [
          {
            title: 'Opening Pressure',
            detail: 'The side pressed high in the first twenty minutes and forced repeated turnovers in the half-spaces.'
          },
          {
            title: 'Midfield Control',
            detail: 'The central unit slowed the tempo, controlled transitions, and screened the back line effectively.'
          },
          {
            title: 'Late Push',
            detail: 'Wide rotations created the decisive overload that produced the winning attack late in the second half.'
          }
        ],
        lineupHistory: fixture.lineupHistory.map((entry) => ({
          version: entry.version,
          savedAt: entry.savedAt,
          formation: entry.formation,
          savedBy: entry.savedBy ? {
            email: entry.savedBy.email,
            role: entry.savedBy.role
          } : null,
          size: entry.lineup.length
        }))
      }
    });
  } catch (error) {
    console.error('Public match detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match details',
      error: error.message
    });
  }
};

module.exports = {
  getPublicHome,
  getPublicPlayers,
  getPublicPlayerDetail,
  getPublicMatchDetail
};
