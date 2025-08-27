# 🚀 ERP Automated Reporting System Setup Guide

## 📋 Overview

The ERP Automated Reporting System automatically generates daily, weekly, and monthly reports in Excel and CSV formats, sends them via email, stores data in the database, and cleans up generated files. It runs on cron jobs and is fully configurable.

## ✨ Features

- **📊 Automated Reports**: Daily, weekly, and monthly reports
- **📁 Multiple Formats**: Excel (.xlsx) and CSV (.csv) generation
- **📧 Email Delivery**: Automatic email sending with attachments
- **💾 Database Storage**: Report data stored in MongoDB
- **🧹 Auto Cleanup**: Generated files automatically cleaned up
- **⚙️ Configurable**: Fully configurable via environment variables
- **🔒 Secure**: Optional encryption and watermarking
- **📱 Notifications**: Email, Slack, and WhatsApp notifications
- **🌍 Multi-language**: Support for English, Hindi, and Gujarati

## 🛠️ Installation

### 1. Install Dependencies

```bash
# Navigate to server directory
cd server

# Install required packages
npm install exceljs csv-writer node-cron nodemailer

# Install TypeScript types (for development)
npm install --save-dev @types/nodemailer @types/node-cron
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp env.automated-reports.example .env

# Edit the .env file with your settings
nano .env
```

### 3. Email Setup

#### For Gmail:
1. Enable 2-factor authentication
2. Generate an app password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use the generated password in `EMAIL_PASSWORD`

#### For Outlook:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=yourname@outlook.com
EMAIL_PASSWORD=your-password
```

#### For Custom SMTP:
```env
EMAIL_HOST=mail.yourcompany.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=reports@yourcompany.com
EMAIL_PASSWORD=your-password
```

## ⚙️ Configuration

### Basic Configuration

```env
# Email settings
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Report timing (IST timezone)
DAILY_REPORT_TIME=09:00
WEEKLY_REPORT_TIME=10:00
MONTHLY_REPORT_TIME=11:00

# Recipients
DAILY_REPORT_RECIPIENTS=owner@company.com,manager@company.com
WEEKLY_REPORT_RECIPIENTS=owner@company.com,director@company.com
MONTHLY_REPORT_RECIPIENTS=owner@company.com,board@company.com
```

### Advanced Configuration

```env
# Performance
MAX_CONCURRENT_REPORTS=5
REPORT_GENERATION_TIMEOUT=30

# Security
ENCRYPT_SENSITIVE_DATA=false
ADD_REPORT_WATERMARK=true
PASSWORD_PROTECT_LARGE_REPORTS=false

# Storage
STORE_REPORT_DATA=true
REPORT_RETENTION_DAYS=90
ARCHIVE_OLD_REPORTS=false

# Export
EXPORT_DIRECTORY=./exports
MAX_FILE_SIZE_MB=50
COMPRESS_LARGE_FILES=true
```

## 🚀 Integration with Server

### 1. Import the Service

Add to your main server file (`server.ts` or `app.ts`):

```typescript
import { startAutomatedReports } from './services/startAutomatedReports';

// Start automated reports after database connection
async function startServer() {
  try {
    // ... your existing server startup code ...
    
    // Start automated reporting system
    await startAutomatedReports();
    
    console.log('✅ Server started successfully');
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
```

### 2. Add Health Check Endpoint

```typescript
import { automatedReportsHealthCheck } from './services/startAutomatedReports';

// Add to your routes
app.get('/health/automated-reports', (req, res) => {
  const health = automatedReportsHealthCheck();
  res.json(health);
});
```

### 3. Add Manual Trigger Endpoint

```typescript
import { triggerManualReport } from './services/startAutomatedReports';

app.post('/api/trigger-report', async (req, res) => {
  try {
    const { companyId, reportType } = req.body;
    
    if (!companyId || !reportType) {
      return res.status(400).json({
        success: false,
        message: 'companyId and reportType are required'
      });
    }
    
    const result = await triggerManualReport(companyId, reportType);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## 📊 Report Types

### Daily Reports
- **Schedule**: Every day at configured time
- **Content**: Inventory, production, sales, financial, logistics summary
- **Formats**: Excel, CSV
- **Storage**: Database + email delivery

### Weekly Reports
- **Schedule**: Every Monday at configured time
- **Content**: Weekly trends, comparisons, aggregated data
- **Formats**: Excel, CSV
- **Storage**: Database + email delivery

### Monthly Reports
- **Schedule**: 1st of every month at configured time
- **Content**: Monthly totals, averages, growth metrics
- **Formats**: Excel, CSV
- **Storage**: Database + email delivery

## 📁 Generated Files Structure

```
exports/
├── company1/
│   ├── daily_Report_2024-01-15.xlsx
│   ├── daily_Report_2024-01-15.csv
│   ├── weekly_Report_2024-01-15.xlsx
│   └── monthly_Report_2024-01.xlsx
└── company2/
    ├── daily_Report_2024-01-15.xlsx
    └── daily_Report_2024-01-15.csv
```

## 🔍 Monitoring and Debugging

### 1. Check System Status

```typescript
import { getAutomatedReportsStatus } from './services/startAutomatedReports';

const status = getAutomatedReportsStatus();
console.log('Automated Reports Status:', status);
```

### 2. View Logs

The system logs all activities:

```
🚀 Starting automated report cron jobs...
📅 Daily report scheduled for 09:00 IST
📅 Weekly report scheduled for Monday 10:00 IST
📅 Monthly report scheduled for 1st of month 11:00 IST
✅ All cron jobs started successfully

📊 Starting daily report generation...
📊 Generating daily reports for 2 companies...
✅ Daily report generated for company: Company A
✅ Daily report generated for company: Company B
📧 Daily report email sent for company: Company A
💾 Daily report data stored in database for company: Company A
🧹 Daily report files cleaned up for company: Company A
```

### 3. Health Check Endpoint

```bash
curl http://localhost:3000/health/automated-reports
```

Response:
```json
{
  "status": "healthy",
  "message": "Automated reporting system is running normally",
  "details": {
    "isRunning": true,
    "activeTasks": 3,
    "configuration": {
      "dailyTime": "09:00",
      "weeklyTime": "10:00",
      "monthlyTime": "11:00",
      "formats": ["excel", "csv"],
      "recipients": {
        "daily": ["owner@company.com"],
        "weekly": ["owner@company.com"],
        "monthly": ["owner@company.com"]
      }
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Email Not Sending
```bash
# Check email configuration
echo $EMAIL_HOST
echo $EMAIL_USER
echo $EMAIL_PASSWORD

# Test SMTP connection
telnet smtp.gmail.com 587
```

#### 2. Reports Not Generating
```bash
# Check cron job status
curl http://localhost:3000/health/automated-reports

# Check logs for errors
tail -f logs/server.log | grep "Automated Reports"
```

#### 3. File Permission Issues
```bash
# Create exports directory with proper permissions
mkdir -p exports
chmod 755 exports
chown node:node exports  # Replace with your user
```

#### 4. Database Connection Issues
```bash
# Check MongoDB connection
mongo --eval "db.runCommand('ping')"

# Check if models are registered
curl http://localhost:3000/health
```

### Debug Mode

Enable debug logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

## 📈 Performance Optimization

### 1. Concurrent Processing

```env
# Increase concurrent report generation
MAX_CONCURRENT_REPORTS=10
```

### 2. Caching

```env
# Enable report caching
ENABLE_REPORT_CACHING=true
REPORT_CACHE_TTL=120
```

### 3. File Compression

```env
# Compress large files
COMPRESS_LARGE_FILES=true
COMPRESSION_THRESHOLD_MB=5
```

## 🔒 Security Considerations

### 1. Email Security

```env
# Use secure connections
EMAIL_SECURE=true
EMAIL_PORT=465
```

### 2. Data Encryption

```env
# Encrypt sensitive data
ENCRYPT_SENSITIVE_DATA=true
REPORT_ENCRYPTION_KEY=your-secure-key
```

### 3. Access Control

```env
# Add watermarks
ADD_REPORT_WATERMARK=true
REPORT_WATERMARK_TEXT=CONFIDENTIAL

# Password protect reports
PASSWORD_PROTECT_LARGE_REPORTS=true
DEFAULT_REPORT_PASSWORD=SecurePass123!
```

## 📱 Notification Integrations

### 1. Slack Notifications

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 2. WhatsApp Business API

```env
WHATSAPP_NOTIFICATIONS=true
WHATSAPP_API_KEY=your-api-key
WHATSAPP_PHONE_NUMBER=+1234567890
```

## 🧪 Testing

### 1. Manual Report Generation

```bash
# Trigger daily report manually
curl -X POST http://localhost:3000/api/trigger-report \
  -H "Content-Type: application/json" \
  -d '{"companyId": "company123", "reportType": "daily"}'
```

### 2. Test Email Configuration

```typescript
import { AutomatedReportService } from './services/AutomatedReportService';

const testEmail = async () => {
  const service = new AutomatedReportService({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'test-password'
    }
  });
  
  const result = await service.sendReportEmail(
    ['test@example.com'],
    'Test Report',
    '<h1>Test Report</h1>',
    []
  );
  
  console.log('Email sent:', result);
};
```

## 📚 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health/automated-reports` | System health check |
| POST | `/api/trigger-report` | Manually trigger report |

### Request Body for Manual Trigger

```json
{
  "companyId": "company123",
  "reportType": "daily"
}
```

### Response Format

```json
{
  "success": true,
  "message": "Daily report generated and sent successfully"
}
```

## 🔄 Maintenance

### 1. Cleanup Old Reports

```env
# Archive reports older than 1 year
ARCHIVE_OLD_REPORTS=true
ARCHIVE_AFTER_DAYS=365
```

### 2. Monitor Disk Space

```bash
# Check exports directory size
du -sh exports/

# Clean up old files manually
find exports/ -name "*.xlsx" -mtime +30 -delete
find exports/ -name "*.csv" -mtime +30 -delete
```

### 3. Database Maintenance

```javascript
// Clean up old report data
db.advancedreports.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

## 📞 Support

For issues and questions:

1. **Check logs** for error messages
2. **Verify configuration** in `.env` file
3. **Test email settings** manually
4. **Check database connectivity**
5. **Verify file permissions**

## 🎯 Next Steps

1. **Customize Reports**: Modify report templates and content
2. **Add More Formats**: Support for PDF, HTML reports
3. **Advanced Analytics**: Add charts and graphs
4. **Mobile Notifications**: Push notifications for mobile apps
5. **Integration**: Connect with external BI tools

---

**🎉 Congratulations!** Your ERP Automated Reporting System is now set up and running. Reports will be generated automatically and sent to your team via email.
