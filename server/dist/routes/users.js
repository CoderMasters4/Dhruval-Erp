"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const User_1 = __importDefault(require("@/models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10, search = '', role = '', status = 'all' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let query = {};
        if (user.isSuperAdmin) {
            query = { isActive: true };
        }
        else {
            query = {
                'companyAccess.companyId': user.companyId,
                'companyAccess.isActive': true,
                isActive: true
            };
        }
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
                { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
                { 'personalInfo.email': { $regex: search, $options: 'i' } }
            ];
        }
        if (status !== 'all') {
            if (status === 'active') {
                query.lastLoginAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
            }
            else if (status === 'inactive') {
                query.$or = [
                    { lastLoginAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                    { lastLoginAt: { $exists: false } }
                ];
            }
        }
        const users = await User_1.default.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'companyAccess.companyId',
                    foreignField: '_id',
                    as: 'companies'
                }
            },
            {
                $addFields: {
                    primaryCompany: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$companies',
                                    cond: { $eq: ['$$this._id', { $arrayElemAt: ['$companyAccess.companyId', 0] }] }
                                }
                            },
                            0
                        ]
                    },
                    isOnline: {
                        $gte: ['$lastLoginAt', new Date(Date.now() - 5 * 60 * 1000)]
                    }
                }
            },
            {
                $project: {
                    username: 1,
                    personalInfo: 1,
                    isActive: 1,
                    isSuperAdmin: 1,
                    lastLoginAt: 1,
                    createdAt: 1,
                    isOnline: 1,
                    primaryCompany: {
                        _id: 1,
                        companyName: 1,
                        companyCode: 1
                    },
                    companyAccess: {
                        $map: {
                            input: '$companyAccess',
                            as: 'access',
                            in: {
                                companyId: '$$access.companyId',
                                role: '$$access.role',
                                isActive: '$$access.isActive'
                            }
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum }
        ]);
        const total = await User_1.default.countDocuments(query);
        res.json({
            success: true,
            data: users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            message: 'An error occurred while fetching users'
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const user = req.user;
        let stats = {};
        if (user.isSuperAdmin) {
            const totalUsers = await User_1.default.countDocuments({ isActive: true });
            const activeUsers = await User_1.default.countDocuments({
                isActive: true,
                lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            const onlineUsers = await User_1.default.countDocuments({
                isActive: true,
                lastLoginAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
            });
            const superAdmins = await User_1.default.countDocuments({ isSuperAdmin: true, isActive: true });
            stats = {
                totalUsers,
                activeUsers,
                onlineUsers,
                superAdmins,
                inactiveUsers: totalUsers - activeUsers,
                newUsersThisMonth: await User_1.default.countDocuments({
                    isActive: true,
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                })
            };
        }
        else {
            const totalUsers = await User_1.default.countDocuments({
                'companyAccess.companyId': user.companyId,
                'companyAccess.isActive': true,
                isActive: true
            });
            const activeUsers = await User_1.default.countDocuments({
                'companyAccess.companyId': user.companyId,
                'companyAccess.isActive': true,
                isActive: true,
                lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            const onlineUsers = await User_1.default.countDocuments({
                'companyAccess.companyId': user.companyId,
                'companyAccess.isActive': true,
                isActive: true,
                lastLoginAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
            });
            stats = {
                totalUsers,
                activeUsers,
                onlineUsers,
                inactiveUsers: totalUsers - activeUsers,
                newUsersThisMonth: await User_1.default.countDocuments({
                    'companyAccess.companyId': user.companyId,
                    'companyAccess.isActive': true,
                    isActive: true,
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                })
            };
        }
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch user statistics',
            message: 'An error occurred while fetching user statistics'
        });
    }
});
router.get('/:userId', async (req, res) => {
    try {
        const user = req.user;
        const { userId } = req.params;
        let query = { _id: userId, isActive: true };
        if (!user.isSuperAdmin) {
            query['companyAccess.companyId'] = user.companyId;
            query['companyAccess.isActive'] = true;
        }
        const targetUser = await User_1.default.findOne(query)
            .populate('companyAccess.companyId', 'companyName companyCode')
            .select('-password -refreshTokens');
        if (!targetUser) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user was not found or you do not have permission to view them'
            });
        }
        res.json({
            success: true,
            data: targetUser
        });
    }
    catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            error: 'Failed to fetch user',
            message: 'An error occurred while fetching user details'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const user = req.user;
        const { username, email, password, personalInfo, companyAccess } = req.body;
        if (!user.isSuperAdmin && !user.companyAccess?.some((access) => access.permissions?.users?.create && access.isActive)) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'You do not have permission to create users'
            });
        }
        const existingUser = await User_1.default.findOne({ $or: [{ username }, { email: email?.toLowerCase() }] });
        if (existingUser) {
            return res.status(400).json({
                error: 'Username already exists',
                message: 'A user with this username already exists'
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        let userCompanyAccess = companyAccess;
        let userPrimaryCompanyId = null;
        if (!user.isSuperAdmin) {
            userPrimaryCompanyId = user.primaryCompanyId || user.companyAccess?.[0]?.companyId;
            userCompanyAccess = [{
                    companyId: userPrimaryCompanyId,
                    role: 'operator',
                    department: 'Production',
                    isActive: true,
                    joinedAt: new Date(),
                    permissions: {
                        inventory: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        production: { view: true, create: true, edit: false, delete: false, approve: false, viewReports: false },
                        orders: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        financial: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        security: {
                            gateManagement: false,
                            visitorManagement: false,
                            vehicleTracking: false,
                            cctvAccess: false,
                            emergencyResponse: false,
                            securityReports: false,
                            incidentManagement: false,
                            accessControl: false,
                            patrolManagement: false
                        },
                        hr: {
                            viewEmployees: false,
                            manageEmployees: false,
                            manageAttendance: false,
                            manageSalary: false,
                            manageLeaves: false,
                            viewReports: false,
                            recruitment: false,
                            performance: false,
                            training: false,
                            disciplinary: false
                        },
                        admin: { userManagement: false, systemSettings: false, backupRestore: false, auditLogs: false }
                    }
                }];
        }
        const newUser = new User_1.default({
            username,
            email: email?.toLowerCase(),
            password: hashedPassword,
            personalInfo,
            primaryCompanyId: userPrimaryCompanyId,
            companyAccess: userCompanyAccess,
            isActive: true,
            createdAt: new Date()
        });
        await newUser.save();
        const userResponse = await User_1.default.findById(newUser._id)
            .populate('companyAccess.companyId', 'companyName companyCode')
            .select('-password -refreshTokens');
        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            error: 'Failed to create user',
            message: 'An error occurred while creating the user'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map