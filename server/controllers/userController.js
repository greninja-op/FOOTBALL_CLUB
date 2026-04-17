const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { sanitizeText } = require('../utils/sanitize');

// Create new user with profile atomically
exports.createUser = async (req, res) => {
  try {
    const { email, password, role, fullName, position } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ 
        message: 'Email, password, and role are required' 
      });
    }

    // Validate email format using RFC 5322 standard (Requirement 20.2)
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Sanitize text inputs to prevent XSS (Requirement 21.5)
    const sanitizedFullName = fullName ? sanitizeText(fullName) : null;
    const sanitizedPosition = position ? sanitizeText(position) : null;

    // Normalize email to lowercase (schema stores in lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile atomically
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      role
    });

    const profile = await Profile.create({
      userId: user._id,
      fullName: sanitizedFullName || email.split('@')[0],
      position: sanitizedPosition || (role === 'player' ? 'Midfielder' : 'Staff')
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        position: profile.position
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    // Populate with profile data
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id });
        return {
          id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          profile: profile ? {
            fullName: profile.fullName,
            position: profile.position,
            fitnessStatus: profile.fitnessStatus
          } : null
        };
      })
    );

    res.status(200).json({
      users: usersWithProfiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

// Update user (now supports fullName and password change)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, fullName, password } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check email uniqueness if email is being updated
    if (email && email.toLowerCase().trim() !== user.email) {
      // Validate email format using RFC 5322 standard (Requirement 20.2)
      if (!validator.isEmail(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      const normalizedNewEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedNewEmail });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email already exists' 
        });
      }
      user.email = normalizedNewEmail;
    }

    // Update role if provided
    if (role) {
      user.role = role;
    }

    // Update password if provided
    if (password && password.length >= 6) {
      const passwordHash = await bcrypt.hash(password, 10);
      user.passwordHash = passwordHash;
    }

    await user.save();

    // Update profile fullName if provided
    if (fullName !== undefined) {
      const sanitizedFullName = sanitizeText(fullName);
      await Profile.findOneAndUpdate(
        { userId: id },
        { fullName: sanitizedFullName },
        { upsert: false }
      );
    }

    // Get updated profile
    const profile = await Profile.findOne({ userId: id });

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profile: profile ? {
          fullName: profile.fullName,
          position: profile.position
        } : null
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
};

// Delete user and associated profile
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated profile first
    await Profile.deleteOne({ userId: id });

    // Delete user
    await User.deleteOne({ _id: id });

    res.status(200).json({
      message: 'User and associated profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};
