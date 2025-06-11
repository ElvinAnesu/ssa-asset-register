# Hesu Investment Limited - Asset Register System

A modern, full-featured asset management system built with Next.js 15, Supabase, and shadcn/ui.

## 🚀 Features

### ✅ **Core Functionality**
- **Device Management**: Add, edit, delete, and track all company devices
- **Employee Assignment**: Assign devices to employees (multiple devices per employee)
- **Status Tracking**: Monitor device status (Active, Available, Maintenance)
- **Real-time Updates**: Live data synchronization across all users
- **Search & Filter**: Advanced filtering by type, status, and employee

### ✅ **Dashboard & Analytics**
- **Overview Dashboard**: Key metrics and device statistics
- **Device Categories**: Track computers, printers, scanners, SIM cards, phones
- **Employee Analytics**: View employees with multiple device assignments
- **Recent Activity**: Monitor latest device assignments and changes

### ✅ **Reports & Export**
- **PDF Export**: Generate professional reports with company branding
- **Excel Export**: Export data to CSV/Excel format
- **Employee Reports**: Detailed assignment reports per employee
- **Device Reports**: Complete device inventory reports

### ✅ **Database Integration**
- **Supabase Backend**: PostgreSQL database with real-time capabilities
- **Offline Mode**: Works with demo data when database not configured
- **Data Persistence**: All changes saved to database
- **Backup & Restore**: Export/import functionality

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Real-time**: Supabase Realtime subscriptions

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional - works with demo data)

### Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd hesu-asset-register
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the application**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

The application will start with demo data. Follow the setup guide to connect to Supabase.

## 🗄️ Database Setup (Optional)

### Option 1: Use Demo Data
The application works perfectly with built-in demo data. No setup required!

### Option 2: Connect to Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and API key

2. **Configure Environment Variables**
   Create `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   \`\`\`

3. **Setup Database**
   - Go to Supabase SQL Editor
   - Run `scripts/01-create-tables.sql`
   - Run `scripts/02-seed-data.sql`

4. **Restart Application**
   \`\`\`bash
   npm run dev
   \`\`\`

## 📱 Usage Guide

### Adding Devices
1. Navigate to **Devices** page
2. Click **Add Device** button
3. Fill in device information
4. Assign to employee (optional)
5. Set status and notes
6. Click **Register Device**

### Managing Assignments
- Employees can have multiple devices
- Change assignments by editing devices
- Track assignment history
- Monitor device status changes

### Generating Reports
1. Go to **Reports** page
2. Select report type:
   - All Devices
   - Employee Assignments
3. Click **Export PDF** or **Export Excel**
4. Reports include company branding

### Dashboard Overview
- View total device counts by category
- Monitor active vs available devices
- Track employees with multiple devices
- See recent assignment activity

## 🔧 Configuration

### Environment Variables
\`\`\`env
# Required for Supabase integration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Customization
- **Company Branding**: Update company name in components
- **Device Types**: Modify device types in context
- **Colors**: Customize theme in `globals.css`
- **Reports**: Modify export templates in reports page

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Works with standard Next.js deployment
- **Railway**: Supports Next.js apps
- **Self-hosted**: Use `npm run build` and `npm start`

## 📊 Database Schema

### Devices Table
\`\`\`sql
- id (UUID, Primary Key)
- type (VARCHAR) - Device category
- serial_number (VARCHAR, Unique) - Device identifier
- assigned_to (VARCHAR) - Employee name
- status (VARCHAR) - Active/Available/Maintenance
- date_assigned (DATE) - Assignment date
- notes (TEXT) - Additional information
- created_at (TIMESTAMP) - Record creation
- updated_at (TIMESTAMP) - Last modification
\`\`\`

## 🔒 Security Features

- **Row Level Security**: Enabled on all tables
- **API Authentication**: Supabase handles auth
- **Input Validation**: Client and server-side validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Configured for security

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
1. **Environment Variables**: Check `.env.local` file
2. **Database Connection**: Verify Supabase credentials
3. **Build Errors**: Clear `.next` folder and rebuild

### Getting Help
- Check the setup guide in `/SUPABASE_SETUP.md`
- Review the settings page for connection status
- Open an issue on GitHub

## 🎯 Roadmap

### Planned Features
- [ ] User Authentication & Permissions
- [ ] Device Images & Photos
- [ ] Barcode/QR Code Scanning
- [ ] Email Notifications
- [ ] Advanced Analytics
- [ ] Mobile App
- [ ] API Documentation
- [ ] Bulk Import/Export
- [ ] Audit Logging
- [ ] Custom Fields

---

**Built with ❤️ for Hesu Investment Limited**
