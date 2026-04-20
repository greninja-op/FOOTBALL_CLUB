const Profile = require('../models/Profile');
const Player = require('../models/Player');
const ArchivedPlayer = require('../models/ArchivedPlayer');
const ClubMembership = require('../models/ClubMembership');
const SystemLog = require('../models/SystemLog');
const User = require('../models/User');
const Injury = require('../models/Injury');
const LeaveRequest = require('../models/LeaveRequest');
const {
  ensurePlayerFromLegacyProfile,
  summarizePlayerCareer,
  normalizePreferredPosition
} = require('../services/playerDomainService');

/**
 * Admin-facing player domain controller.
 * Introduced in Phase 1 to manage archive and reinstate workflows while the
 * rest of the app still relies on the legacy Profile model.
 */

const listArchivedPlayers = async (req, res) => {
  try {
    const archivedPlayers = await ArchivedPlayer.find()
      .populate('playerId', 'fullName photo status')
      .populate('archivedBy', 'email role')
      .sort({ archivedAt: -1 });

    const activeMemberships = await ClubMembership.find({
      playerId: { $in: archivedPlayers.map((entry) => entry.playerId?._id || entry.playerId).filter(Boolean) },
      isActive: true
    }).select('playerId');
    const activePlayerIds = new Set(activeMemberships.map((membership) => String(membership.playerId)));
    const inactiveArchiveEntries = archivedPlayers.filter((entry) => {
      const playerId = entry.playerId?._id || entry.playerId;
      return playerId && !activePlayerIds.has(String(playerId));
    });

    res.status(200).json({
      success: true,
      count: inactiveArchiveEntries.length,
      archivedPlayers: inactiveArchiveEntries.map((entry) => ({
        id: entry._id,
        playerId: entry.playerId?._id || null,
        fullName: entry.snapshot.fullName,
        status: entry.playerId?.status || 'archived',
        reason: entry.reason,
        archivedAt: entry.archivedAt,
        archivedBy: entry.archivedBy ? {
          id: entry.archivedBy._id,
          email: entry.archivedBy.email,
          role: entry.archivedBy.role
        } : null,
        summary: entry.careerSummaryAtClub,
        snapshot: entry.snapshot
      }))
    });
  } catch (error) {
    console.error('List archived players error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch archived players',
      error: error.message
    });
  }
};

const listPlayerDomainRecords = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate('userId', 'email role')
      .sort({ fullName: 1 });

    const legacyProfileIds = profiles.map((profile) => profile._id);
    const players = await Player.find({
      legacyProfileId: { $in: legacyProfileIds }
    });
    const memberships = await ClubMembership.find({
      legacyProfileId: { $in: legacyProfileIds }
    }).sort({ joinedAt: -1 });

    const playerByLegacyProfile = new Map(
      players.map((player) => [String(player.legacyProfileId), player])
    );

    const membershipsByLegacyProfile = memberships.reduce((acc, membership) => {
      const key = String(membership.legacyProfileId);
      if (!acc.has(key)) {
        acc.set(key, []);
      }
      acc.get(key).push(membership);
      return acc;
    }, new Map());

    const records = profiles
      .filter((profile) => profile.userId?.role === 'player' || profile.position !== 'Staff')
      .map((profile) => {
        const player = playerByLegacyProfile.get(String(profile._id)) || null;
        const profileMemberships = membershipsByLegacyProfile.get(String(profile._id)) || [];
        const activeMembership = profileMemberships.find((membership) => membership.isActive) || null;

        return {
          profileId: profile._id,
          fullName: profile.fullName,
          email: profile.userId?.email || null,
          role: profile.userId?.role || null,
          position: profile.position,
          preferredPosition: profile.preferredPosition,
          playerStatus: profile.playerStatus,
          legacyStats: profile.stats,
          migrated: Boolean(player),
          player: player ? {
            id: player._id,
            status: player.status,
            currentUserId: player.currentUserId
          } : null,
          activeMembership: activeMembership ? {
            id: activeMembership._id,
            primaryPosition: activeMembership.primaryPosition,
            jerseyNumber: activeMembership.jerseyNumber,
            contractType: activeMembership.contractType,
            joinedAt: activeMembership.joinedAt,
            availabilityStatus: activeMembership.availabilityStatus
          } : null,
          membershipCount: profileMemberships.length
        };
      });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    console.error('List player-domain records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player-domain records',
      error: error.message
    });
  }
};

const getAvailabilityBoard = async (req, res) => {
  try {
    const profiles = await Profile.find({ position: { $ne: 'Staff' } })
      .populate('userId', 'email role')
      .sort({ fullName: 1 });

    const profileIds = profiles.map((profile) => profile._id);
    const activeInjuries = await Injury.find({
      playerId: { $in: profileIds },
      resolved: false
    }).select('playerId injuryType expectedRecovery severity');

    const today = new Date();
    const approvedLeave = await LeaveRequest.find({
      playerId: { $in: profileIds },
      status: 'Approved',
      endDate: { $gte: today }
    }).select('playerId startDate endDate reason');

    const injuryByPlayer = new Map(activeInjuries.map((injury) => [String(injury.playerId), injury]));
    const leaveByPlayer = new Map(approvedLeave.map((leave) => [String(leave.playerId), leave]));

    const available = [];
    const unavailable = [];

    profiles.forEach((profile) => {
      const injury = injuryByPlayer.get(String(profile._id));
      const leave = leaveByPlayer.get(String(profile._id));

      let reason = null;

      if (profile.availabilityOverrideStatus === 'unavailable') {
        reason = {
          type: 'manual',
          label: 'Manual override',
          detail: profile.availabilityOverrideReason || profile.availabilityNotes || 'Marked unavailable by staff'
        };
      } else if (injury) {
        reason = {
          type: 'injury',
          label: injury.injuryType,
          detail: injury.expectedRecovery ? `Expected back ${new Date(injury.expectedRecovery).toLocaleDateString()}` : injury.severity
        };
      } else if (leave) {
        reason = {
          type: 'leave',
          label: 'Approved leave',
          detail: `${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}`
        };
      } else if (profile.fitnessStatus === 'Red') {
        reason = {
          type: 'fitness',
          label: 'Unavailable',
          detail: 'Marked red by fitness status'
        };
      }

      const record = {
        id: profile._id,
        userId: profile.userId?._id || profile.userId,
        fullName: profile.fullName,
        position: profile.position,
        preferredPosition: profile.preferredPosition,
        secondaryPositions: profile.secondaryPositions || [],
        fitnessStatus: profile.fitnessStatus,
        availabilityOverrideStatus: profile.availabilityOverrideStatus || 'auto',
        availabilityOverrideReason: profile.availabilityOverrideReason || null,
        availabilityNotes: profile.availabilityNotes || null,
        stats: profile.stats || {}
      };

      if (profile.availabilityOverrideStatus === 'available') {
        available.push(record);
      } else if (reason) {
        unavailable.push({
          ...record,
          reason
        });
      } else {
        available.push(record);
      }
    });

    res.status(200).json({
      success: true,
      available,
      unavailable
    });
  } catch (error) {
    console.error('Get availability board error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability board',
      error: error.message
    });
  }
};

const updateAvailabilityOverride = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { status, reason } = req.body;

    if (!['auto', 'available', 'unavailable'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability override status'
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.availabilityOverrideStatus = status;
    profile.availabilityOverrideReason = status === 'auto' ? null : (reason || null);

    if (status !== 'auto' && reason) {
      profile.availabilityNotes = reason;
    }

    await profile.save();

    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Profile',
      targetId: profile._id,
      changes: {
        availabilityOverrideStatus: profile.availabilityOverrideStatus,
        availabilityOverrideReason: profile.availabilityOverrideReason
      }
    });

    res.status(200).json({
      success: true,
      message: 'Availability override updated successfully',
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        availabilityOverrideStatus: profile.availabilityOverrideStatus,
        availabilityOverrideReason: profile.availabilityOverrideReason
      }
    });
  } catch (error) {
    console.error('Update availability override error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability override',
      error: error.message
    });
  }
};

const archiveLegacyProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Archive reason is required'
      });
    }

    const validReasons = ['transferred', 'released', 'retired', 'loan_ended', 'academy_exit', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid archive reason'
      });
    }

    const { profile, player, membership } = await ensurePlayerFromLegacyProfile(profileId);

    if (!membership.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Player membership is already archived'
      });
    }

    const existingArchive = await ArchivedPlayer.findOne({ membershipId: membership._id });
    if (existingArchive) {
      return res.status(400).json({
        success: false,
        message: 'This membership has already been archived'
      });
    }

    const summary = await summarizePlayerCareer(player._id, profile);
    const archivedAt = new Date();

    const archiveRecord = await ArchivedPlayer.create({
      playerId: player._id,
      membershipId: membership._id,
      archivedBy: req.user.id,
      archivedAt,
      reason,
      notes: notes || null,
      careerSummaryAtClub: summary,
      snapshot: {
        fullName: profile.fullName,
        photo: profile.photo,
        jerseyNumber: membership.jerseyNumber,
        primaryPosition: membership.primaryPosition,
        contractType: membership.contractType,
        joinedAt: membership.joinedAt,
        leftAt: archivedAt
      }
    });

    membership.isActive = false;
    membership.leftAt = archivedAt;
    membership.leftReason = reason === 'other' ? null : reason;
    membership.availabilityStatus = 'listed';
    membership.availabilityDetails = {
      reason: notes || reason,
      expectedReturnDate: null,
      source: 'manual'
    };
    await membership.save();

    player.status = reason === 'retired' ? 'retired' : (reason === 'transferred' ? 'transferred' : 'archived');
    player.currentUserId = null;
    await player.save();

    profile.playerStatus = player.status;
    profile.availabilityNotes = notes || `Archived: ${reason}`;
    await profile.save();

    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Player',
      targetId: player._id,
      changes: {
        archiveReason: reason,
        profileId: profile._id,
        membershipId: membership._id,
        archivedPlayerId: archiveRecord._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Player archived successfully',
      archivedPlayer: {
        id: archiveRecord._id,
        playerId: player._id,
        membershipId: membership._id,
        fullName: archiveRecord.snapshot.fullName,
        reason: archiveRecord.reason,
        archivedAt: archiveRecord.archivedAt,
        summary: archiveRecord.careerSummaryAtClub
      }
    });
  } catch (error) {
    console.error('Archive player error:', error);
    if (error.message === 'Legacy profile not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to archive player',
      error: error.message
    });
  }
};

const reinstateArchivedPlayer = async (req, res) => {
  try {
    const { archiveId } = req.params;
    const { userId, jerseyNumber, primaryPosition, secondaryPositions, contractType, contractStart, contractEnd } = req.body;

    const archiveRecord = await ArchivedPlayer.findById(archiveId)
      .populate('playerId');

    if (!archiveRecord) {
      return res.status(404).json({
        success: false,
        message: 'Archived player record not found'
      });
    }

    const player = await Player.findById(archiveRecord.playerId._id || archiveRecord.playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player record not found'
      });
    }

    const activeMembership = await ClubMembership.findOne({
      playerId: player._id,
      isActive: true
    });

    if (activeMembership) {
      return res.status(400).json({
        success: false,
        message: 'Player already has an active club membership'
      });
    }

    const linkedProfile = player.legacyProfileId ? await Profile.findById(player.legacyProfileId) : null;
    const positionValue = primaryPosition
      || archiveRecord.snapshot.primaryPosition
      || (linkedProfile ? normalizePreferredPosition(linkedProfile) : 'STAFF');

    let linkedUserId = null;
    if (userId) {
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Linked user not found'
        });
      }
      linkedUserId = existingUser._id;
    }

    const membership = await ClubMembership.create({
      playerId: player._id,
      userId: linkedUserId,
      legacyProfileId: linkedProfile ? linkedProfile._id : null,
      jerseyNumber: jerseyNumber || archiveRecord.snapshot.jerseyNumber || null,
      primaryPosition: positionValue,
      secondaryPositions: secondaryPositions || (linkedProfile?.secondaryPositions || []),
      contractType: contractType || archiveRecord.snapshot.contractType || 'Owned',
      squadRole: positionValue === 'STAFF' ? 'staff' : 'rotation',
      contractStart: contractStart || new Date(),
      contractEnd: contractEnd || null,
      joinedAt: new Date(),
      isActive: true,
      availabilityStatus: 'available',
      availabilityDetails: {
        reason: 'Reinstated to active squad',
        expectedReturnDate: null,
        source: 'manual'
      }
    });

    player.status = 'active';
    player.currentUserId = linkedUserId || player.currentUserId || null;
    await player.save();

    if (linkedProfile) {
      linkedProfile.playerStatus = 'active';
      linkedProfile.preferredPosition = positionValue;
      linkedProfile.availabilityNotes = null;
      await linkedProfile.save();
    }

    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Player',
      targetId: player._id,
      changes: {
        reinstatedFromArchiveId: archiveRecord._id,
        newMembershipId: membership._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Player reinstated successfully',
      player: {
        id: player._id,
        fullName: player.fullName,
        status: player.status
      },
      membership: {
        id: membership._id,
        primaryPosition: membership.primaryPosition,
        jerseyNumber: membership.jerseyNumber,
        contractType: membership.contractType,
        joinedAt: membership.joinedAt
      }
    });
  } catch (error) {
    console.error('Reinstate player error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reinstate player',
      error: error.message
    });
  }
};

module.exports = {
  listPlayerDomainRecords,
  getAvailabilityBoard,
  updateAvailabilityOverride,
  listArchivedPlayers,
  archiveLegacyProfile,
  reinstateArchivedPlayer
};
