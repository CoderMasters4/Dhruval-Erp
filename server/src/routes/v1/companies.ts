import { Router, Request, Response } from 'express';
import { authenticate, requireCompany } from '../../middleware/auth';
import Company from '../../models/Company';
import User from '../../models/User';
import { logger } from '../../utils/logger';

const router = Router();

// =============================================
// COMPANIES API V1 ROUTES
// =============================================

// GET /api/v1/companies/test - Test endpoint (COMPLETELY PUBLIC - NO AUTH)
router.get('/test', async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/v1/companies/test - Test endpoint');

    res.status(200).json({
      success: true,
      message: 'Companies API v1 is working!',
      data: {
        endpoint: '/api/v1/companies',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        note: 'Most endpoints require authentication'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Test endpoint failed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/companies - List companies (requires authentication)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/v1/companies - Fetching companies list');

    // Return companies with proper structure including status
    const companies = await Company.find({ isActive: true })
      .select('companyName companyCode contactInfo addresses registrationDetails status isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Companies retrieved successfully',
      data: companies,
      count: companies.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch companies',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/companies/stats - Get company statistics (SUPERADMIN CAN ACCESS WITHOUT COMPANY ID)
// MOVED BEFORE /:id route to prevent route conflict
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/v1/companies/stats - Fetching company statistics');

    const stats = await Company.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCompanies: { $sum: 1 },
          activeCompanies: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactiveCompanies: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalCompanies: 0,
      activeCompanies: 0,
      inactiveCompanies: 0
    };

    res.status(200).json({
      success: true,
      message: 'Company statistics retrieved successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error fetching company statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch company statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/companies/:id - Get company by ID with detailed information (SUPERADMIN CAN ACCESS WITHOUT COMPANY ID)
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    logger.info(`GET /api/v1/companies/${id} - Fetching company details`);

    const company = await Company.findById(id)
      .populate('createdBy', 'username personalInfo.firstName personalInfo.lastName email')
      .select('-__v');

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Company not found',
        timestamp: new Date().toISOString()
      });
    }

    // For now, just return company details without users and stats
    res.status(200).json({
      success: true,
      message: 'Company retrieved successfully',
      data: company,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error fetching company:', {
      error: error.message,
      stack: error.stack,
      companyId: id
    });
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch company',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/companies - Create new company (requires authentication)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    logger.info('POST /api/v1/companies - Creating new company', { userId: user.id });

    const { companyName, companyCode, email, phone, website, address, gstin, pan } = req.body;

    // Validation
    if (!companyName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Company name and email are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({
      $or: [
        { 'contactInfo.emails.email': email },
        { companyName },
        { companyCode }
      ]
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Company with this name, code, or email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new company with proper structure
    const company = new Company({
      companyName,
      companyCode: companyCode || companyName.toUpperCase().replace(/\s+/g, ''),
      legalName: companyName,
      contactInfo: {
        emails: [{ type: email, label: 'Primary' }],
        phones: phone ? [{ type: phone, label: 'Primary' }] : [],
        website: website || '',
        socialMedia: {}
      },
      addresses: {
        registeredOffice: {
          street: address?.street || '',
          city: address?.city || '',
          state: address?.state || '',
          country: address?.country || 'India',
          pincode: address?.pincode || ''
        },
        factoryAddress: {
          street: address?.street || '',
          city: address?.city || '',
          state: address?.state || '',
          country: address?.country || 'India',
          pincode: address?.pincode || ''
        },
        warehouseAddresses: []
      },
      registrationDetails: {
        gstin: gstin || '',
        pan: pan || '',
        registrationDate: new Date()
      },
      businessConfig: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        fiscalYearStart: 'April',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: {
          start: '09:00',
          end: '18:00',
          breakStart: '13:00',
          breakEnd: '14:00'
        },
        gstRates: {
          defaultRate: 18,
          rawMaterialRate: 18,
          finishedGoodsRate: 18
        }
      },
      status: 'active',
      createdBy: user.id,
      isActive: true
    });

    await company.save();

    // Get populated company data
    const populatedCompany = await Company.findById(company._id)
      .populate('createdBy', 'username personalInfo.firstName personalInfo.lastName')
      .select('-__v');

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: populatedCompany,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create company',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/companies/:id - Update company (requires authentication)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    logger.info(`PUT /api/v1/companies/${id} - Updating company`, { userId: user.id });

    const { companyName, email, phone, website } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Company not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update company
    const updateData: any = {
      lastModifiedBy: user.id,
      updatedAt: new Date()
    };

    if (companyName) updateData.companyName = companyName;
    if (email) updateData['contactInfo.emails.0.email'] = email;
    if (phone) updateData['contactInfo.phones.0.number'] = phone;
    if (website) updateData['contactInfo.website'] = website;

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('companyName companyCode contactInfo createdAt updatedAt');

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update company',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/companies/:id - Delete company (requires authentication)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    logger.info(`DELETE /api/v1/companies/${id} - Deleting company`, { userId: user.id });

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Company not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete - mark as inactive
    await Company.findByIdAndUpdate(id, {
      isActive: false,
      deletedBy: user.id,
      deletedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete company',
      timestamp: new Date().toISOString()
    });
  }
});



export default router;
