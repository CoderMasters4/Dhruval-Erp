"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = exports.app = void 0;
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const environment_1 = __importDefault(require("@/config/environment"));
const database_1 = __importDefault(require("@/config/database"));
const logger_1 = __importStar(require("@/utils/logger"));
mongoose_1.default.set('debug', false);
console.log('✅ Basic imports loaded');
console.log('✅ About to import middleware...');
const security_1 = require("@/middleware/security");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
console.log('✅ Middleware imported');
console.log('✅ About to import routes...');
const auth_2 = __importDefault(require("@/routes/auth"));
console.log('✅ Auth routes imported');
const dashboard_1 = __importDefault(require("@/routes/dashboard"));
console.log('✅ Dashboard routes imported');
console.log('✅ Reports routes imported');
console.log('✅ Companies routes imported');
const users_1 = __importDefault(require("@/routes/users"));
console.log('✅ Users routes imported');
const orders_1 = __importDefault(require("@/routes/orders"));
console.log('✅ Orders routes imported');
const twoFactor_1 = __importDefault(require("@/routes/twoFactor"));
const adminTwoFactor_1 = __importDefault(require("@/routes/adminTwoFactor"));
const adminUsers_1 = __importDefault(require("@/routes/adminUsers"));
const adminCompanies_1 = __importDefault(require("@/routes/adminCompanies"));
const userManagement_1 = __importDefault(require("@/routes/userManagement"));
console.log('✅ 2FA and admin routes imported');
const inventory_1 = __importDefault(require("@/routes/inventory"));
console.log('✅ Inventory routes imported');
const customers_1 = __importDefault(require("@/routes/customers"));
console.log('✅ Customers routes imported');
const suppliers_1 = __importDefault(require("@/routes/suppliers"));
console.log('✅ Suppliers routes imported');
const roles_1 = __importDefault(require("@/routes/roles"));
console.log('✅ Roles routes imported');
const setup_1 = __importDefault(require("@/routes/setup"));
console.log('✅ Setup routes imported');
console.log('✅ Visitor routes imported');
const spares_1 = __importDefault(require("@/routes/spares"));
console.log('✅ Spares routes imported');
const customerVisits_1 = __importDefault(require("@/routes/customerVisits"));
console.log('✅ Customer visits routes imported');
const vehicles_1 = __importDefault(require("@/routes/vehicles"));
console.log('✅ Vehicles routes imported');
const enhancedInventory_1 = __importDefault(require("@/routes/enhancedInventory"));
console.log('✅ Enhanced inventory routes imported');
const warehouses_1 = __importDefault(require("@/routes/warehouses"));
console.log('✅ Warehouses routes imported');
const companies_1 = __importDefault(require("@/routes/v1/companies"));
console.log('✅ V1 Companies routes imported');
const users_2 = __importDefault(require("@/routes/v1/users"));
console.log('✅ V1 Users routes imported');
const quotations_1 = __importDefault(require("@/routes/v1/quotations"));
console.log('✅ V1 Quotations routes imported');
const manpower_1 = __importDefault(require("@/routes/v1/manpower"));
console.log('✅ V1 Manpower routes imported');
const stickers_1 = __importDefault(require("@/routes/v1/stickers"));
console.log('✅ V1 Sticker routes imported');
const customers_2 = __importDefault(require("@/routes/v1/customers"));
console.log('✅ V1 Customers routes imported');
const suppliers_2 = __importDefault(require("@/routes/v1/suppliers"));
console.log('✅ V1 Suppliers routes imported');
const inventory_2 = __importDefault(require("@/routes/v1/inventory"));
console.log('✅ V1 Inventory routes imported');
const production_1 = __importDefault(require("@/routes/v1/production"));
console.log('✅ V1 Production routes imported');
const customer_orders_1 = __importDefault(require("@/routes/v1/customer-orders"));
console.log('✅ V1 Customer Orders routes imported');
const purchase_orders_1 = __importDefault(require("@/routes/v1/purchase-orders"));
console.log('✅ V1 Purchase Orders routes imported');
const invoices_1 = __importDefault(require("@/routes/v1/invoices"));
console.log('✅ V1 Invoices routes imported');
const warehouses_2 = __importDefault(require("@/routes/v1/warehouses"));
console.log('✅ V1 Warehouses routes imported');
const stock_movements_1 = __importDefault(require("@/routes/v1/stock-movements"));
console.log('✅ V1 Stock Movements routes imported');
const financial_transactions_1 = __importDefault(require("@/routes/v1/financial-transactions"));
console.log('✅ V1 Financial Transactions routes imported');
const visitors_1 = __importDefault(require("@/routes/v1/visitors"));
console.log('✅ V1 Visitors routes imported');
const vehicles_2 = __importDefault(require("@/routes/v1/vehicles"));
console.log('✅ V1 Vehicles routes imported');
const security_logs_1 = __importDefault(require("@/routes/v1/security-logs"));
console.log('✅ V1 Security Logs routes imported');
const audit_logs_1 = __importDefault(require("@/routes/v1/audit-logs"));
console.log('✅ V1 Audit Logs routes imported');
const business_analytics_1 = __importDefault(require("@/routes/v1/business-analytics"));
console.log('✅ V1 Business Analytics routes imported');
const boiler_monitoring_1 = __importDefault(require("@/routes/v1/boiler-monitoring"));
console.log('✅ V1 Boiler Monitoring routes imported');
const electricity_monitoring_1 = __importDefault(require("@/routes/v1/electricity-monitoring"));
console.log('✅ V1 Electricity Monitoring routes imported');
const hospitality_1 = __importDefault(require("@/routes/v1/hospitality"));
console.log('✅ V1 Hospitality routes imported');
const dispatch_1 = __importDefault(require("@/routes/v1/dispatch"));
console.log('✅ V1 Dispatch routes imported');
const reports_1 = __importDefault(require("@/routes/v1/reports"));
console.log('✅ V1 Reports routes imported');
const spares_2 = __importDefault(require("@/routes/v1/spares"));
console.log('✅ V1 Spares routes imported');
console.log('✅ V2 routes successfully migrated to V1 - V2 folder removed');
console.log('✅ All routes imported successfully!');
console.log('🚀 About to create Express app...');
console.log('🚀 Creating Express app...');
const app = (0, express_1.default)();
exports.app = app;
console.log('✅ Express app created');
if (environment_1.default.TRUST_PROXY) {
    app.set('trust proxy', 1);
}
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.use((0, cookie_parser_1.default)(environment_1.default.COOKIE_SECRET));
app.use((0, express_session_1.default)({
    name: environment_1.default.SESSION_NAME,
    secret: environment_1.default.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: environment_1.default.COOKIE_SECURE,
        httpOnly: environment_1.default.COOKIE_HTTP_ONLY,
        maxAge: environment_1.default.SESSION_MAX_AGE,
        sameSite: environment_1.default.COOKIE_SAME_SITE,
        domain: environment_1.default.NODE_ENV === 'production' ? environment_1.default.COOKIE_DOMAIN : undefined,
        path: '/'
    },
    store: connect_mongo_1.default.create({
        mongoUrl: environment_1.default.MONGODB_URI,
        touchAfter: 24 * 3600,
        ttl: environment_1.default.SESSION_MAX_AGE / 1000,
        autoRemove: 'native',
        crypto: {
            secret: environment_1.default.SESSION_SECRET
        }
    })
}));
app.use(security_1.securityMiddleware);
if (environment_1.default.NODE_ENV === 'development') {
    app.use(logger_1.morganMiddleware.dev);
}
else {
    app.use(logger_1.morganMiddleware.combined);
}
app.use(logger_1.requestLoggerMiddleware);
app.use(security_1.requestLogger);
app.get('/health', async (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
        environment: environment_1.default.NODE_ENV,
        version: environment_1.default.APP_VERSION,
        checks: {
            database: false,
            memory: false,
            disk: false
        }
    };
    try {
        healthCheck.checks.database = await database_1.default.healthCheck();
        const memUsage = process.memoryUsage();
        const memUsageMB = {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        };
        healthCheck.checks.memory = memUsageMB.heapUsed < 1000;
        healthCheck.memory = memUsageMB;
        const isHealthy = Object.values(healthCheck.checks).every(check => check === true);
        if (isHealthy) {
            (0, logger_1.logHealth)('application', 'healthy', healthCheck);
            res.status(200).json(healthCheck);
        }
        else {
            (0, logger_1.logHealth)('application', 'unhealthy', healthCheck);
            res.status(503).json(healthCheck);
        }
    }
    catch (error) {
        (0, logger_1.logHealth)('application', 'unhealthy', { error: error instanceof Error ? error.message : 'Unknown error' });
        res.status(503).json({
            ...healthCheck,
            message: 'Service Unavailable',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.get('/ready', async (req, res) => {
    try {
        const dbHealthy = await database_1.default.healthCheck();
        if (dbHealthy) {
            res.status(200).json({ status: 'ready' });
        }
        else {
            res.status(503).json({ status: 'not ready', reason: 'database not available' });
        }
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            reason: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,X-Company-ID,X-API-Key,X-Request-ID,X-User-Agent,X-Forwarded-For,Origin,Accept,Cache-Control,Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.status(200).end();
});
const apiRouter = express_1.default.Router();
apiRouter.use('/auth', auth_2.default);
apiRouter.use('/setup', setup_1.default);
apiRouter.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: environment_1.default.NODE_ENV,
        version: environment_1.default.APP_VERSION
    });
});
apiRouter.get('/debug/cookies', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Cookie debug info',
        cookies: {
            received: req.cookies,
            headers: req.headers.cookie,
            origin: req.headers.origin,
            userAgent: req.headers['user-agent']
        },
        config: {
            cookieDomain: environment_1.default.COOKIE_DOMAIN,
            cookieSecure: environment_1.default.COOKIE_SECURE,
            cookieSameSite: environment_1.default.COOKIE_SAME_SITE,
            nodeEnv: environment_1.default.NODE_ENV
        }
    });
});
apiRouter.use('/2fa', twoFactor_1.default);
apiRouter.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dhruval Exim ERP API v1 - Complete Business Management System',
        version: '2.0.0',
        description: 'Complete Factory ERP Management System with 24 Business Models',
        availableEndpoints: [
            'GET /api/v1/info - API information (public)',
            'POST /api/v1/auth/login - User login (public)',
            'POST /api/v1/auth/register - User registration (public)',
            'GET /api/v1/companies - Company management (auth required)',
            'GET /api/v1/users - User management (auth required)',
            'GET /api/v1/customers - Customer management (auth required)',
            'GET /api/v1/suppliers - Supplier management (auth required)',
            'GET /api/v1/inventory - Inventory management (auth required)',
            'GET /api/v1/production - Production management (auth required)',
            'GET /api/v1/customer-orders - Customer orders (auth required)',
            'GET /api/v1/purchase-orders - Purchase orders (auth required)',
            'GET /api/v1/invoices - Invoice management (auth required)',
            'GET /api/v1/quotations - Quotation management (auth required)',
            'GET /api/v1/warehouses - Warehouse management (auth required)',
            'GET /api/v1/stock-movements - Stock tracking (auth required)',
            'GET /api/v1/financial-transactions - Financial management (auth required)',
            'GET /api/v1/visitors - Visitor management (auth required)',
            'GET /api/v1/vehicles - Vehicle management (auth required)',
            'GET /api/v1/security-logs - Security logging (auth required)',
            'GET /api/v1/audit-logs - Audit trail (auth required)',
            'GET /api/v1/business-analytics - Business analytics (auth required)',
            'GET /api/v1/boiler-monitoring - Boiler monitoring (auth required)',
            'GET /api/v1/electricity-monitoring - Electricity monitoring (auth required)',
            'GET /api/v1/hospitality - Hospitality management (auth required)',
            'GET /api/v1/dispatch - Dispatch management (auth required)',
            'GET /api/v1/reports - Report generation (auth required)',
            'GET /api/v1/spares - Spare parts management (auth required)',
            'GET /api/v1/manpower - Manpower management (auth required)',
            'GET /api/v1/stickers - Sticker & label system (auth required)',
            'GET /api/v1/dashboard - Dashboard data (auth required)'
        ],
        authentication: {
            required: 'Most endpoints require authentication',
            loginEndpoint: '/api/v1/auth/login',
            tokenType: 'Bearer token in Authorization header'
        },
        timestamp: new Date().toISOString()
    });
});
apiRouter.use(auth_1.authenticate);
apiRouter.use('/admin', adminTwoFactor_1.default);
apiRouter.use('/admin', adminUsers_1.default);
apiRouter.use('/admin', adminCompanies_1.default);
apiRouter.use('/admin/users', userManagement_1.default);
apiRouter.use(auth_1.requireCompany);
apiRouter.use('/dashboard', dashboard_1.default);
apiRouter.use('/users', users_1.default);
apiRouter.use('/orders', orders_1.default);
apiRouter.use('/inventory', inventory_1.default);
apiRouter.use('/inventory-enhanced', enhancedInventory_1.default);
apiRouter.use('/customers', customers_1.default);
apiRouter.use('/suppliers', suppliers_1.default);
apiRouter.use('/roles', roles_1.default);
apiRouter.use('/spares', spares_1.default);
apiRouter.use('/customer-visits', customerVisits_1.default);
apiRouter.use('/vehicles', vehicles_1.default);
apiRouter.use('/warehouses', warehouses_1.default);
app.use(environment_1.default.API_PREFIX, apiRouter);
app.use('/api/v1/companies-legacy', companies_1.default);
app.use('/api/v1/users-legacy', users_2.default);
app.use('/api/v1/quotations-legacy', quotations_1.default);
app.use('/api/v1/manpower-legacy', manpower_1.default);
app.use('/api/v1/stickers-legacy', stickers_1.default);
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dhruval Exim ERP API',
        version: '2.0.0',
        description: 'Complete Factory ERP Management System with 24 Business Models',
        endpoints: {
            v1: '/api/v1/',
            health: '/api/v1/health',
            info: '/api/v1/info',
            auth: '/api/v1/auth/*',
            companies: '/api/v1/companies/*',
            users: '/api/v1/users/*',
            customers: '/api/v1/customers/*',
            suppliers: '/api/v1/suppliers/*',
            inventory: '/api/v1/inventory/*',
            production: '/api/v1/production/*',
            orders: '/api/v1/customer-orders/*',
            purchaseOrders: '/api/v1/purchase-orders/*',
            invoices: '/api/v1/invoices/*',
            quotations: '/api/v1/quotations/*',
            warehouses: '/api/v1/warehouses/*',
            stockMovements: '/api/v1/stock-movements/*',
            financial: '/api/v1/financial-transactions/*',
            visitors: '/api/v1/visitors/*',
            vehicles: '/api/v1/vehicles/*',
            security: '/api/v1/security-logs/*',
            audit: '/api/v1/audit-logs/*',
            analytics: '/api/v1/business-analytics/*',
            boiler: '/api/v1/boiler-monitoring/*',
            electricity: '/api/v1/electricity-monitoring/*',
            hospitality: '/api/v1/hospitality/*',
            dispatch: '/api/v1/dispatch/*',
            reports: '/api/v1/reports/*',
            spares: '/api/v1/spares/*',
            manpower: '/api/v1/manpower/*',
            stickers: '/api/v1/stickers/*',
            dashboard: '/api/v1/dashboard/*'
        },
        timestamp: new Date().toISOString()
    });
});
app.use('/api/v1/companies', companies_1.default);
app.use('/api/v1/users', users_2.default);
app.use('/api/v1/quotations', quotations_1.default);
app.use('/api/v1/manpower', manpower_1.default);
app.use('/api/v1/stickers', stickers_1.default);
app.use('/api/v1/customers', customers_2.default);
app.use('/api/v1/suppliers', suppliers_2.default);
app.use('/api/v1/inventory', inventory_2.default);
app.use('/api/v1/production', production_1.default);
app.use('/api/v1/customer-orders', customer_orders_1.default);
app.use('/api/v1/purchase-orders', purchase_orders_1.default);
app.use('/api/v1/invoices', invoices_1.default);
app.use('/api/v1/warehouses', warehouses_2.default);
app.use('/api/v1/stock-movements', stock_movements_1.default);
app.use('/api/v1/financial-transactions', financial_transactions_1.default);
app.use('/api/v1/visitors', visitors_1.default);
app.use('/api/v1/vehicles', vehicles_2.default);
app.use('/api/v1/security-logs', security_logs_1.default);
app.use('/api/v1/audit-logs', audit_logs_1.default);
app.use('/api/v1/business-analytics', business_analytics_1.default);
app.use('/api/v1/boiler-monitoring', boiler_monitoring_1.default);
app.use('/api/v1/electricity-monitoring', electricity_monitoring_1.default);
app.use('/api/v1/hospitality', hospitality_1.default);
app.use('/api/v1/dispatch', dispatch_1.default);
app.use('/api/v1/reports', reports_1.default);
app.use('/api/v1/spares', spares_2.default);
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
let io = null;
exports.io = io;
if (environment_1.default.ENABLE_WEBSOCKETS) {
    exports.io = io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: environment_1.default.CORS_ORIGIN,
            credentials: environment_1.default.CORS_CREDENTIALS
        },
        transports: ['websocket', 'polling']
    });
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication token required'));
            }
            next();
        }
        catch (error) {
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.default.info('WebSocket client connected', {
            socketId: socket.id,
            userId: socket.userId,
            ip: socket.handshake.address
        });
        socket.on('disconnect', (reason) => {
            logger_1.default.info('WebSocket client disconnected', {
                socketId: socket.id,
                reason,
                userId: socket.userId
            });
        });
        socket.on('join-company', (companyId) => {
            socket.join(`company:${companyId}`);
            logger_1.default.info('Client joined company room', {
                socketId: socket.id,
                companyId,
                userId: socket.userId
            });
        });
        socket.on('leave-company', (companyId) => {
            socket.leave(`company:${companyId}`);
            logger_1.default.info('Client left company room', {
                socketId: socket.id,
                companyId,
                userId: socket.userId
            });
        });
    });
}
app.use(security_1.securityErrorHandler);
app.use(logger_1.errorLoggerMiddleware);
app.use('*', (req, res) => {
    logger_1.default.warn('Route not found', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const gracefulShutdown = async (signal) => {
    logger_1.default.info(`Received ${signal}. Starting graceful shutdown...`);
    httpServer.close(() => {
        logger_1.default.info('HTTP server closed');
    });
    if (io) {
        io.close(() => {
            logger_1.default.info('WebSocket server closed');
        });
    }
    try {
        await database_1.default.disconnect();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error closing database connection', { error });
    }
    process.exit(0);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});
const startServer = async () => {
    try {
        logger_1.default.info('🚀 Starting Factory ERP Server...');
        logger_1.default.info('📊 Attempting database connection...');
        await database_1.default.connect();
        logger_1.default.info('✅ Database connected successfully!');
        httpServer.listen(environment_1.default.PORT, () => {
            logger_1.default.info(`🚀 Factory ERP Server started successfully`, {
                port: environment_1.default.PORT,
                environment: environment_1.default.NODE_ENV,
                version: environment_1.default.APP_VERSION,
                database: database_1.default.getConnectionStatus(),
                websockets: environment_1.default.ENABLE_WEBSOCKETS,
                cors: environment_1.default.CORS_ORIGIN,
                apiPrefix: environment_1.default.API_PREFIX
            });
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map