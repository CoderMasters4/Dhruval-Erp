import { Router, Request, Response } from 'express';
import { authenticate } from '@/middleware/auth';
import User from '@/models/User';
import { logger } from '@/utils/logger';

const router = Router();

// =============================================
// USERS API V1 ROUTES
// =============================================

// GET /api/v1/users/test - Test endpoint (public)
router.get('/test', async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/v1/users/test - Test endpoint');

    res.status(200).json({
      success: true,
      message: 'Users API v1 is working!',
      data: {
        endpoint: '/api/v1/users',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        note: 'Most endpoints require authentication'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error in users test endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Test endpoint failed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/users - List users (requires authentication)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/v1/users - Fetching users list');

    const users = await User.find({ isActive: true })
      .select('username email firstName lastName role isActive createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch users',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/v1/users/${id} - Fetching user details`);

    const user = await User.findById(id)
      .select('username email firstName lastName role isActive createdAt updatedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch user',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/users - Create new user (requires authentication)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    logger.info('POST /api/v1/users - Creating new user', { userId: currentUser.id });

    const { username, email, password, personalInfo, role, department, designation } = req.body;

    // Validation
    if (!username || !email || !password || !personalInfo?.firstName || !personalInfo?.lastName || !personalInfo?.phone) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Username, email, password, firstName, lastName, and phone are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'User with this email or username already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      personalInfo: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
        displayName: `${personalInfo.firstName} ${personalInfo.lastName}`
      },
      role: role || 'user',
      department: department || '',
      designation: designation || '',
      isActive: true,
      createdBy: currentUser.id
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create user',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/users/:id - Update user (requires authentication)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    logger.info(`PUT /api/v1/users/${id} - Updating user`, { userId: currentUser.id });

    const { username, email, personalInfo, role, department, designation, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Prepare update object
    const updateData: any = {
      lastModifiedBy: currentUser.id,
      updatedAt: new Date()
    };

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (designation !== undefined) updateData.designation = designation;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (personalInfo) {
      if (personalInfo.firstName || personalInfo.lastName || personalInfo.phone) {
        updateData.personalInfo = {
          ...user.personalInfo,
          ...(personalInfo.firstName && { firstName: personalInfo.firstName }),
          ...(personalInfo.lastName && { lastName: personalInfo.lastName }),
          ...(personalInfo.phone && { phone: personalInfo.phone })
        };

        // Update display name if first or last name changed
        if (personalInfo.firstName || personalInfo.lastName) {
          const firstName = personalInfo.firstName || user.personalInfo?.firstName || '';
          const lastName = personalInfo.lastName || user.personalInfo?.lastName || '';
          updateData.personalInfo.displayName = `${firstName} ${lastName}`.trim();
        }
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update user',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/users/:id - Delete user (requires authentication)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    logger.info(`DELETE /api/v1/users/${id} - Deleting user`, { userId: currentUser.id });

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete - mark as inactive
    await User.findByIdAndUpdate(id, {
      isActive: false,
      deletedBy: currentUser.id,
      deletedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete user',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
