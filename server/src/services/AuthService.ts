import User from '@/models/User';
import Company from '@/models/Company';
import { logger } from '@/utils/logger';
import { generateTokenPair, setTokenCookies, clearTokenCookies, type JWTPayload } from '@/utils/jwt';

export interface LoginCredentials {
  username: string;
  password: string;
  companyCode?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyCode: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class AuthService {
  /**
   * User login with validation and security checks
   */
  async login(credentials: LoginCredentials, req: any, res: any): Promise<AuthResponse> {
    try {
      const { username, password, companyCode } = credentials;

      // Find user by username, email, or phone
      const user = await User.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() },
          { 'personalInfo.phone': username }
        ],
        isActive: true
      });

      if (!user) {
        logger.warn('Login attempt with invalid username', {
          username,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Username or password is incorrect'
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', {
          userId: user._id,
          username: user.username,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Username or password is incorrect'
        };
      }

      // Log successful login
      logger.info('Successful login', {
        userId: user._id,
        username: user.username,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Generate JWT tokens
      const tokenPayload: JWTPayload = {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin || false,
        companyId: user.primaryCompanyId?.toString(),
        role: user.companyAccess?.[0]?.role || 'user'
      };

      const tokens = generateTokenPair(tokenPayload);

      // Set tokens as HTTP-only cookies
      setTokenCookies(res, tokens);

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens: {
            accessToken: tokens.accessToken,
            expiresIn: '15m'
          }
        }
      };

    } catch (error) {
      logger.error('Error in login service:', error);
      return {
        success: false,
        error: 'Internal server error',
        message: 'Login failed'
      };
    }
  }

  /**
   * User logout - clear cookies
   */
  async logout(req: any, res: any): Promise<AuthResponse> {
    try {
      // Clear JWT cookies
      clearTokenCookies(res);

      logger.info('User logged out', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      logger.error('Error in logout service:', error);
      return {
        success: false,
        error: 'Internal server error',
        message: 'Logout failed'
      };
    }
  }

  /**
   * User registration with company creation
   */
  async register(registerData: RegisterData, req: any): Promise<AuthResponse> {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        companyCode
      } = registerData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() }
        ]
      });

      if (existingUser) {
        logger.warn('Registration attempt with existing credentials', {
          username,
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return {
          success: false,
          error: 'User already exists',
          message: 'A user with this username or email already exists'
        };
      }

      // Check if company exists
      let company = await Company.findOne({ companyCode: companyCode.toUpperCase() });
      
      if (!company) {
        // Create new company if it doesn't exist
        company = new Company({
          companyCode: companyCode.toUpperCase(),
          companyName: `${firstName} ${lastName} Company`,
          legalName: `${firstName} ${lastName} Company`,
          isActive: true
        });

        await company.save();
      }

      // Create new user
      const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        personalInfo: {
          firstName,
          lastName,
          phone,
          displayName: `${firstName} ${lastName}`
        },
        companyAccess: [{
          companyId: company._id,
          role: 'admin',
          isActive: true,
          joinedAt: new Date()
        }],
        primaryCompanyId: company._id,
        isActive: true
      });

      await user.save();

      // Log successful registration
      logger.info('User registration successful', {
        userId: user._id,
        username: user.username,
        companyId: company._id,
        companyCode: company.companyCode,
        ip: req.ip
      });

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: 'Registration successful',
        data: {
          user: userResponse,
          company: {
            _id: company._id,
            companyCode: company.companyCode,
            companyName: company.companyName
          }
        }
      };

    } catch (error) {
      logger.error('Error in registration service:', error);
      return {
        success: false,
        error: 'Internal server error',
        message: 'Registration failed'
      };
    }
  }

  /**
   * Refresh access token (placeholder for now)
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // For now, just return a placeholder response
      // In a real implementation, you would verify the refresh token
      return {
        success: false,
        error: 'Not implemented',
        message: 'Token refresh not implemented yet'
      };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return {
        success: false,
        error: 'Internal server error',
        message: 'Token refresh failed'
      };
    }
  }


}

export default new AuthService(); 
