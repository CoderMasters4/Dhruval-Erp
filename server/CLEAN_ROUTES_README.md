# Clean Routes Structure - Factory ERP Server

## Overview
This document describes the new clean and organized routes structure for the Factory ERP Server. The old scattered route files have been consolidated into a single, well-organized structure.

## New Structure

### 1. Consolidated Routes File: `src/routes/index.ts`
All routes are now organized in a single file with clear sections:

#### Public Routes (No Authentication Required)
- `/auth/*` - Authentication routes
- `/setup/*` - Setup routes  
- `/health` - Health check endpoint
- `/debug/cookies` - Cookie debug endpoint
- `/2fa/*` - 2FA routes for login verification
- `/info` - Public API information

#### Protected Routes (Authentication Required)
- `/admin/*` - Admin routes (require admin/super admin access)
- `/dashboard/*` - Dashboard routes
- `/reports/*` - Reports routes
- `/companies/*` - Companies routes
- `/users/*` - Users routes
- `/orders/*` - Orders routes
- `/inventory/*` - Inventory routes
- `/customers/*` - Customers routes
- `/suppliers/*` - Suppliers routes
- `/roles/*` - Roles routes
- `/visitors/*` - Visitor routes
- `/spares/*` - Spares routes
- `/customer-visits/*` - Customer visits routes
- `/vehicles/*` - Vehicles routes
- `/warehouses/*` - Warehouses routes

#### V1 API Routes (Complete Business Management System)
- **Core Business Management**
  - `/v1/companies/*` - Company management
  - `/v1/users/*` - User management
  - `/v1/customers/*` - Customer management
  - `/v1/suppliers/*` - Supplier management

- **Inventory and Production**
  - `/v1/inventory/*` - Inventory management
  - `/v1/production/*` - Production management
  - `/v1/warehouses/*` - Warehouse management
  - `/v1/stock-movements/*` - Stock tracking
  - `/v1/spares/*` - Spare parts management

- **Orders and Financial**
  - `/v1/customer-orders/*` - Customer orders
  - `/v1/purchase-orders/*` - Purchase orders
  - `/v1/invoices/*` - Invoice management
  - `/v1/quotations/*` - Quotation management
  - `/v1/financial-transactions/*` - Financial management

- **Operations and Management**
  - `/v1/manpower/*` - Manpower management
  - `/v1/stickers/*` - Sticker & label system
  - `/v1/visitors/*` - Visitor management
  - `/v1/vehicles/*` - Vehicle management

- **Monitoring and Analytics**
  - `/v1/boiler-monitoring/*` - Boiler monitoring
  - `/v1/electricity-monitoring/*` - Electricity monitoring
  - `/v1/business-analytics/*` - Business analytics
  - `/v1/security-logs/*` - Security logging
  - `/v1/audit-logs/*` - Audit trail

- **Specialized Services**
  - `/v1/hospitality/*` - Hospitality management
  - `/v1/dispatch/*` - Dispatch management
  - `/v1/reports/*` - Report generation

### 2. Clean Server File: `src/server-clean.ts`
The new server file is much cleaner and simpler:
- Removed all individual route imports
- Single import for consolidated routes
- Cleaner middleware setup
- Better organized sections
- Reduced from ~738 lines to ~400 lines

## Benefits of New Structure

1. **Single Source of Truth**: All routes are defined in one place
2. **Better Organization**: Clear separation between public, protected, and V1 routes
3. **Easier Maintenance**: No need to update multiple files when adding new routes
4. **Cleaner Server File**: Main server file is much more readable
5. **Better Documentation**: Clear API endpoint structure
6. **Easier Testing**: Single route file to test
7. **Reduced Duplication**: No more scattered route definitions

## Migration Guide

### To Use New Structure:

1. **Replace the old server.ts**:
   ```bash
   cp src/server-clean.ts src/server.ts
   ```

2. **Update package.json scripts** (if needed):
   ```json
   {
     "scripts": {
       "start": "ts-node src/server.ts",
       "dev": "ts-node-dev src/server.ts"
     }
   }
   ```

3. **Test the new structure**:
   ```bash
   npm run dev
   ```

### To Add New Routes:

1. **Create the route file** in `src/routes/` or `src/routes/v1/`
2. **Import it** in `src/routes/index.ts`
3. **Mount it** in the appropriate section (public, protected, or V1)

## File Organization

```
src/
├── routes/
│   ├── index.ts              # NEW: Consolidated routes file
│   ├── auth.ts               # Authentication routes
│   ├── setup.ts              # Setup routes
│   ├── dashboard.ts          # Dashboard routes
│   ├── companies.ts          # Companies routes
│   ├── users.ts              # Users routes
│   ├── inventory.ts          # Inventory routes
│   ├── customers.ts          # Customers routes
│   ├── suppliers.ts          # Suppliers routes
│   ├── v1/                   # V1 API routes
│   │   ├── companies.ts      # V1 Companies
│   │   ├── users.ts          # V1 Users
│   │   ├── inventory.ts      # V1 Inventory
│   │   └── ...               # Other V1 routes
│   └── ...                   # Other route files
├── server.ts                 # OLD: Complex server file
├── server-clean.ts           # NEW: Clean server file
└── ...
```

## API Endpoints Summary

### Public Endpoints
- `GET /api/v1/health` - Health check
- `GET /api/v1/info` - API information
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/setup/*` - Setup endpoints

### Protected Endpoints (Require Authentication)
All other endpoints require valid authentication token in the Authorization header.

### V1 API Endpoints
All V1 endpoints follow the pattern `/api/v1/{resource}/*` and provide the complete business management system functionality.

## Next Steps

1. **Test the new structure** thoroughly
2. **Update any client code** that might depend on specific route patterns
3. **Remove old route files** once testing is complete
4. **Update documentation** to reflect new structure
5. **Consider adding route validation** and rate limiting

## Notes

- The old `server.ts` file is kept as backup
- All existing functionality is preserved
- Route paths remain the same for backward compatibility
- Middleware and authentication logic is unchanged
- WebSocket functionality is preserved
- Error handling and logging remain intact
