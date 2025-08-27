# 🚀 Quick Environment Setup for Automated Reports

## 📋 **REQUIRED Environment Variables**

Create a `.env` file in your server directory with these **ESSENTIAL** variables:

```bash
# =============================================
# MINIMAL REQUIRED VARIABLES
# =============================================

# DATABASE
MONGODB_URI=mongodb://localhost:27017/factory-erp

# EMAIL (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# COMPANY
DEFAULT_COMPANY_ID=your-company-id-here
COMPANY_NAME=Your Company Name

# RECIPIENTS
DAILY_REPORT_RECIPIENTS=owner@company.com,manager@company.com
WEEKLY_REPORT_RECIPIENTS=owner@company.com,director@company.com
MONTHLY_REPORT_RECIPIENTS=owner@company.com,board@company.com

# SECURITY
JWT_SECRET=your-jwt-secret-key-here

# TIMING (Optional - Defaults shown)
DAILY_REPORT_TIME=09:00
WEEKLY_REPORT_TIME=10:00
MONTHLY_REPORT_TIME=11:00

# FEATURES (Optional - Defaults shown)
STORE_REPORT_DATA=true
GENERATE_EXCEL_REPORTS=true
GENERATE_CSV_REPORTS=true
SEND_EMAIL_REPORTS=true

# EXPORT (Optional - Defaults shown)
EXPORT_DIRECTORY=./exports
MAX_FILE_SIZE_MB=50
FILE_RETENTION_DAYS=30
```

## ⚡ **Quick Setup Steps**

### 1. **Create .env file**
```bash
cd server
cp env.automated-reports.example .env
```

### 2. **Edit .env file**
```bash
nano .env
# or
code .env
```

### 3. **Fill in REQUIRED values**
- `MONGODB_URI` - Your MongoDB connection string
- `EMAIL_USER` - Your email address
- `EMAIL_PASSWORD` - Your email password/app password
- `EMAIL_FROM` - Your email address (same as EMAIL_USER for Gmail)
- `DEFAULT_COMPANY_ID` - Your company ID from database
- `COMPANY_NAME` - Your company name
- `DAILY_REPORT_RECIPIENTS` - Comma-separated email addresses
- `JWT_SECRET` - Any secure random string

### 4. **Test setup**
```bash
npm run reports:setup
npm run reports:test
```

## 🔑 **Gmail App Password Setup**

If using Gmail:

1. **Enable 2-Factor Authentication**
   - Go to Google Account → Security → 2-Step Verification

2. **Generate App Password**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password

3. **Use App Password**
   - Copy the generated password (16 characters)
   - Paste in `EMAIL_PASSWORD` in your `.env` file

## 📧 **Email Configuration Examples**

### **Gmail**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=yourname@gmail.com
```

### **Outlook**
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=yourname@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=yourname@outlook.com
```

### **Custom SMTP**
```bash
EMAIL_HOST=mail.yourcompany.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=reports@yourcompany.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=reports@yourcompany.com
```

## ✅ **Validation Checklist**

Before running, ensure you have:

- [ ] MongoDB running and accessible
- [ ] Email credentials working
- [ ] **EMAIL_FROM set correctly** (same as EMAIL_USER for Gmail)
- [ ] Company ID from your database
- [ ] Recipient email addresses
- [ ] JWT secret configured
- [ ] Export directory writable

## 🚨 **Common Issues**

### **Email not sending?**
- Check SMTP credentials
- **Verify EMAIL_FROM is set correctly**
- Verify app password for Gmail
- Check firewall/network settings

### **Reports not generating?**
- Verify MongoDB connection
- Check company ID exists
- Monitor logs in `logs/` directory

### **Permission errors?**
- Ensure `exports/` directory is writable
- Check file permissions: `chmod 755 exports/`

## 📞 **Need Help?**

1. **Check logs**: `tail -f logs/automated-reports.log`
2. **Test system**: `npm run reports:test`
3. **Health check**: Check `/health/automated-reports` endpoint
4. **Review setup**: `npm run reports:setup`

## 🎯 **Next Steps After Setup**

1. **Test the system**: `npm run reports:test`
2. **Start automation**: `npm run reports:start`
3. **Monitor logs**: `npm run reports:logs`
4. **Check status**: `npm run reports:status`

---

**🎉 Once configured, your system will automatically generate and email reports every day, week, and month!**

## 🔧 **Missing Keys Fixed**

The following important keys were missing and have been added:

- ✅ `EMAIL_FROM` - Required for sending emails
- ✅ `PORT` - Server port configuration
- ✅ `NODE_ENV` - Environment setting
- ✅ `HOST` - Server host configuration
- ✅ All email examples now include `EMAIL_FROM`
- ✅ Validation rules updated
- ✅ Notes section enhanced
