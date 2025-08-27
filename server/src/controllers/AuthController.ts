import { Request, Response } from 'express';
import AuthService from '@/services/AuthService';
import { logger } from '@/utils/logger';

class AuthController {
  /**
   * User login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, companyCode } = req.body;

      // Basic validation
      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Username and password are required'
        });
        return;
      }

      const result = await AuthService.login({ username, password, companyCode }, req);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }

    } catch (error) {
      logger.error('Error in login controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Login failed'
      });
    }
  }

  /**
   * User registration
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        companyCode
      } = req.body;

      // Basic validation
      if (!username || !email || !password || !firstName || !lastName || !phone || !companyCode) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'All fields are required'
        });
        return;
      }

      const result = await AuthService.register({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        companyCode
      }, req);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Error in register controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Registration failed'
      });
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Missing refresh token',
          message: 'Refresh token is required'
        });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }

    } catch (error) {
      logger.error('Error in refresh token controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Token refresh failed'
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const result = await AuthService.logout(userId);
      res.status(200).json(result);

    } catch (error) {
      logger.error('Error in logout controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Logout failed'
      });
    }
  }

  /**
   * Health check
   */
  async health(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        refreshToken: 'POST /api/v1/auth/refresh-token',
        logout: 'POST /api/v1/auth/logout'
      }
    });
  }
}

export default new AuthController();
