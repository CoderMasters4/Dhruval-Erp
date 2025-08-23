"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const auth_2 = __importDefault(require("../auth"));
const companies_1 = __importDefault(require("./companies"));
const users_1 = __importDefault(require("./users"));
const visitors_1 = __importDefault(require("./visitors"));
const visitorsSimple_1 = __importDefault(require("./visitorsSimple"));
const customers_1 = __importDefault(require("./customers"));
const suppliers_1 = __importDefault(require("./suppliers"));
const inventory_1 = __importDefault(require("./inventory"));
const production_1 = __importDefault(require("./production"));
const customer_orders_1 = __importDefault(require("./customer-orders"));
const invoices_1 = __importDefault(require("./invoices"));
const purchase_orders_1 = __importDefault(require("./purchase-orders"));
const quotations_1 = __importDefault(require("./quotations"));
const roles_1 = __importDefault(require("./roles"));
const vehicles_1 = __importDefault(require("./vehicles"));
const warehouses_1 = __importDefault(require("./warehouses"));
const stock_movements_1 = __importDefault(require("./stock-movements"));
const financial_transactions_1 = __importDefault(require("./financial-transactions"));
const audit_logs_1 = __importDefault(require("./audit-logs"));
const security_logs_1 = __importDefault(require("./security-logs"));
const business_analytics_1 = __importDefault(require("./business-analytics"));
const boiler_monitoring_1 = __importDefault(require("./boiler-monitoring"));
const electricity_monitoring_1 = __importDefault(require("./electricity-monitoring"));
const hospitality_1 = __importDefault(require("./hospitality"));
const dispatch_1 = __importDefault(require("./dispatch"));
const reports_1 = __importDefault(require("./reports"));
const spares_1 = __importDefault(require("./spares"));
const manpower_1 = __importDefault(require("./manpower"));
const stickers_1 = __importDefault(require("./stickers"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dhruval Exim ERP API v1 is healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            name: 'Factory ERP API',
            version: '2.0.0',
            description: 'Complete Factory ERP System with 27 Models',
            features: [
                'Multi-tenant Company Management',
                'Advanced User Management with Dynamic Roles',
                'Complete Visitor Management',
                'Comprehensive Inventory Management',
                'Production Order Management',
                'Sales & Purchase Management',
                'Financial Transaction Management',
                'Security & Audit Logging',
                'Business Analytics & Reporting',
                'Industrial Monitoring Systems',
                'Hospitality Management',
                'Advanced Logistics & Dispatch',
                'Dynamic Report Generation',
                'Manpower & Attendance Management',
                'Barcode & Sticker System'
            ],
            endpoints: {
                auth: '/api/v1/auth',
                companies: '/api/v1/companies',
                users: '/api/v1/users',
                visitors: '/api/v1/visitors',
                customers: '/api/v1/customers',
                suppliers: '/api/v1/suppliers',
                inventory: '/api/v1/inventory',
                production: '/api/v1/production',
                customerOrders: '/api/v1/customer-orders',
                invoices: '/api/v1/invoices',
                purchaseOrders: '/api/v1/purchase-orders',
                quotations: '/api/v1/quotations',
                roles: '/api/v1/roles',
                vehicles: '/api/v1/vehicles',
                warehouses: '/api/v1/warehouses',
                stockMovements: '/api/v1/stock-movements',
                financialTransactions: '/api/v1/financial-transactions',
                auditLogs: '/api/v1/audit-logs',
                securityLogs: '/api/v1/security-logs',
                businessAnalytics: '/api/v1/business-analytics',
                boilerMonitoring: '/api/v1/boiler-monitoring',
                electricityMonitoring: '/api/v1/electricity-monitoring',
                hospitality: '/api/v1/hospitality',
                dispatch: '/api/v1/dispatch',
                reports: '/api/v1/reports',
                spares: '/api/v1/spares',
                manpower: '/api/v1/manpower',
                stickers: '/api/v1/stickers'
            }
        },
        timestamp: new Date().toISOString()
    });
});
router.use('/auth', auth_2.default);
router.use('/companies', companies_1.default);
router.use('/users', users_1.default);
router.use('/visitors', visitors_1.default);
router.use('/visitors-simple', visitorsSimple_1.default);
router.use('/customers', customers_1.default);
router.use('/suppliers', suppliers_1.default);
router.use('/inventory', inventory_1.default);
router.use('/production', production_1.default);
router.use('/customer-orders', customer_orders_1.default);
router.use('/invoices', invoices_1.default);
router.use('/purchase-orders', purchase_orders_1.default);
router.use('/quotations', quotations_1.default);
router.use('/roles', roles_1.default);
router.use('/vehicles', vehicles_1.default);
router.use('/warehouses', warehouses_1.default);
router.use('/stock-movements', stock_movements_1.default);
router.use('/financial-transactions', financial_transactions_1.default);
router.use('/audit-logs', audit_logs_1.default);
router.use('/security-logs', security_logs_1.default);
router.use('/business-analytics', business_analytics_1.default);
router.use('/boiler-monitoring', boiler_monitoring_1.default);
router.use('/electricity-monitoring', electricity_monitoring_1.default);
router.use('/hospitality', hospitality_1.default);
router.use('/dispatch', dispatch_1.default);
router.use('/reports', reports_1.default);
router.use('/spares', spares_1.default);
router.use('/manpower', manpower_1.default);
router.use('/stickers', stickers_1.default);
router.get('/protected', auth_1.authenticate, (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        message: 'Access granted to protected route',
        user: {
            id: user.userId || user._id,
            username: user.username,
            email: user.email,
            companyId: user.companyId,
            isSuperAdmin: user.isSuperAdmin
        },
        timestamp: new Date().toISOString()
    });
});
router.use('*', (req, res) => {
    logger_1.logger.warn('API v1 route not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: {
            health: 'GET /api/v1/health',
            info: 'GET /api/v1/info',
            auth: {
                login: 'POST /api/v1/auth/login',
                register: 'POST /api/v1/auth/register',
                refresh: 'POST /api/v1/auth/refresh',
                logout: 'POST /api/v1/auth/logout',
                profile: 'GET /api/v1/auth/profile'
            },
            companies: {
                list: 'GET /api/v1/companies',
                create: 'POST /api/v1/companies',
                get: 'GET /api/v1/companies/:id',
                update: 'PUT /api/v1/companies/:id',
                delete: 'DELETE /api/v1/companies/:id'
            },
            users: {
                list: 'GET /api/v1/users',
                create: 'POST /api/v1/users',
                profile: 'GET /api/v1/users/profile',
                get: 'GET /api/v1/users/:id',
                update: 'PUT /api/v1/users/:id',
                delete: 'DELETE /api/v1/users/:id'
            },
            visitors: {
                list: 'GET /api/v1/visitors',
                create: 'POST /api/v1/visitors',
                get: 'GET /api/v1/visitors/:id',
                checkin: 'POST /api/v1/visitors/:id/checkin',
                checkout: 'POST /api/v1/visitors/:id/checkout',
                approve: 'POST /api/v1/visitors/:id/approve',
                reject: 'POST /api/v1/visitors/:id/reject'
            }
        },
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map