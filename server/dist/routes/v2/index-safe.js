"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API v2 is healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dhruval Exim ERP API v1 - Complete Business Management System',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        description: 'Comprehensive Factory ERP API with all business modules',
        endpoints: {
            health: '/api/v1/health',
            info: '/api/v1/info',
            auth: '/api/v1/auth/*',
            companies: '/api/v1/companies/*',
            users: '/api/v1/users/*',
            customers: '/api/v1/customers/*',
            suppliers: '/api/v1/suppliers/*',
            inventory: '/api/v1/inventory/*',
            production: '/api/v1/production/*',
            'purchase-orders': '/api/v1/purchase-orders/*',
            invoices: '/api/v1/invoices/*',
            visitors: '/api/v1/visitors/*'
        },
        features: [
            'Complete Authentication & Authorization',
            'Company & User Management',
            'Customer & Supplier Management',
            'Inventory Management',
            'Production Planning & Control',
            'Purchase Order Management',
            'Invoice & Billing',
            'Visitor Management System',
            'Real-time Performance Monitoring',
            'Advanced Caching & Optimization'
        ]
    });
});
console.log('🔄 Loading V2 routes safely...');
try {
    console.log('📝 Loading auth routes...');
    const authRoutes = require('../auth').default;
    router.use('/auth', authRoutes);
    console.log('✅ Auth routes loaded');
    console.log('📝 Loading company routes...');
    const companyRoutes = require('./companies').default;
    router.use('/companies', auth_1.authenticate, companyRoutes);
    console.log('✅ Company routes loaded');
    console.log('📝 Loading user routes...');
    const userRoutes = require('./users').default;
    router.use('/users', auth_1.authenticate, userRoutes);
    console.log('✅ User routes loaded');
    console.log('📝 Loading visitor routes...');
    const visitorRoutes = require('./visitors').default;
    router.use('/visitors', auth_1.authenticate, visitorRoutes);
    console.log('✅ Visitor routes loaded');
    console.log('🎉 Essential V2 routes loaded successfully!');
}
catch (error) {
    console.error('❌ Error loading V2 routes:', error);
    logger_1.logger.error('Error loading V2 routes', { error });
}
try {
    console.log('📝 Loading business routes...');
    const customerRoutes = require('./customers').default;
    router.use('/customers', auth_1.authenticate, customerRoutes);
    console.log('✅ Customer routes loaded');
    const supplierRoutes = require('./suppliers').default;
    router.use('/suppliers', auth_1.authenticate, supplierRoutes);
    console.log('✅ Supplier routes loaded');
    const inventoryRoutes = require('./inventory').default;
    router.use('/inventory', auth_1.authenticate, inventoryRoutes);
    console.log('✅ Inventory routes loaded');
    const productionRoutes = require('./production').default;
    router.use('/production', auth_1.authenticate, productionRoutes);
    console.log('✅ Production routes loaded');
    const purchaseOrderRoutes = require('./purchase-orders').default;
    router.use('/purchase-orders', auth_1.authenticate, purchaseOrderRoutes);
    console.log('✅ Purchase Order routes loaded');
    const invoiceRoutes = require('./invoices').default;
    router.use('/invoices', auth_1.authenticate, invoiceRoutes);
    console.log('✅ Invoice routes loaded');
    const customerOrderRoutes = require('./customer-orders').default;
    router.use('/customer-orders', auth_1.authenticate, customerOrderRoutes);
    console.log('✅ Customer Order routes loaded');
    const quotationRoutes = require('./quotations').default;
    router.use('/quotations', auth_1.authenticate, quotationRoutes);
    console.log('✅ Quotation routes loaded');
    const warehouseRoutes = require('./warehouses').default;
    router.use('/warehouses', auth_1.authenticate, warehouseRoutes);
    console.log('✅ Warehouse routes loaded');
    const stockMovementRoutes = require('./stock-movements').default;
    router.use('/stock-movements', auth_1.authenticate, stockMovementRoutes);
    console.log('✅ Stock Movement routes loaded');
    console.log('✅ All business routes loaded successfully!');
}
catch (error) {
    console.error('❌ Error loading business routes:', error);
    logger_1.logger.error('Error loading business routes', { error });
}
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API v1 endpoint not found',
        path: req.originalUrl,
        suggestion: 'Check /api/v1/info for all available endpoints',
        availableEndpoints: [
            '/api/v1/health',
            '/api/v1/info',
            '/api/v1/auth/*',
            '/api/v1/companies/*',
            '/api/v1/users/*',
            '/api/v1/customers/*',
            '/api/v1/suppliers/*',
            '/api/v1/inventory/*',
            '/api/v1/production/*',
            '/api/v1/purchase-orders/*',
            '/api/v1/invoices/*',
            '/api/v1/visitors/*'
        ]
    });
});
exports.default = router;
//# sourceMappingURL=index-safe.js.map