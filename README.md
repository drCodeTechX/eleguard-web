# eleGuard - Human-Elephant Conflict Management System

A comprehensive web application for managing elephant Human-Elephant Conflict (HEC) monitoring systems, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Real-time metrics, alerts, and system overview
- **Client Management**: Add, view, and manage conservation partners
- **Device Management**: Monitor HEC detection devices, battery levels, and status
- **Settings**: User preferences, notifications, and security settings
- **Billing**: Subscription management and revenue tracking
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React hooks with mock data
- **Theme**: next-themes for dark/light mode
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── clients/           # Client management pages
│   ├── devices/           # Device management pages
│   ├── settings/          # Settings pages
│   ├── billing/           # Billing pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── app-sidebar.tsx   # Main navigation sidebar
│   ├── theme-provider.tsx # Theme context provider
│   └── theme-toggle.tsx  # Dark/light mode toggle
├── lib/                  # Utility functions and mock data
│   └── mock-data.ts      # Mock data for development
├── types/                # TypeScript type definitions
│   └── index.ts          # Application types
└── README.md             # This file
\`\`\`

## Mock Data

The application currently uses mock data for all functionalities. This includes:

- **Users**: System administrators and managers
- **Customers**: Conservation organizations and partners
- **Devices**: HEC monitoring devices with status and metrics
- **Alerts**: System alerts and notifications
- **Billing**: Subscription and payment information
- **Dashboard Metrics**: System performance and statistics

## Backend Integration Requirements

Based on your provided backend files, here's what needs to be implemented for full functionality:

### Missing Backend Components

1. **Authentication & Authorization**
   - JWT token generation and validation
   - Login/logout endpoints
   - Password reset functionality
   - Session management middleware
   - Role-based access control (admin vs regular users)

2. **Alert System**
   \`\`\`typescript
   // Missing Alert Model
   interface Alert {
     deviceId: ObjectId;
     customerId: ObjectId;
     type: 'intrusion' | 'low_battery' | 'device_offline' | 'maintenance';
     severity: 'low' | 'medium' | 'high' | 'critical';
     message: string;
     location: string;
     timestamp: Date;
     acknowledged: boolean;
     acknowledgedBy?: ObjectId;
     acknowledgedAt?: Date;
   }
   \`\`\`

3. **Metrics & Analytics**
   - Dashboard metrics endpoint (`GET /api/dashboard/metrics`)
   - Device performance analytics
   - Historical data aggregation
   - Monthly/weekly trend calculations

4. **Billing System**
   \`\`\`typescript
   // Missing Billing Model
   interface Billing {
     customerId: ObjectId;
     plan: 'basic' | 'premium' | 'enterprise';
     monthlyFee: number;
     devicesIncluded: number;
     additionalDeviceFee: number;
     currentDevices: number;
     lastBillingDate: Date;
     nextBillingDate: Date;
     status: 'active' | 'overdue' | 'suspended';
   }
   \`\`\`

5. **Notification System**
   - Email notification service
   - SMS alert integration
   - Push notification support
   - Notification preferences management

6. **File Upload & Management**
   - Device firmware updates
   - Report generation and export
   - Image/document attachments for alerts

### Backend Issues to Fix

1. **Customer Model Schema Mismatch**
   \`\`\`typescript
   // Current schema missing 'location' field
   // Add to CustomerModel.ts:
   location: {type: String, required: true}
   \`\`\`

2. **Device Model Enhancements**
   \`\`\`typescript
   // Add to DeviceModel.ts:
   customerId: {type: Schema.Types.ObjectId, ref: 'Customer'},
   batteryLevel: {type: Number, min: 0, max: 100},
   lastSeen: {type: Date},
   status: {type: String, enum: ['active', 'inactive', 'maintenance'], default: 'inactive'},
   location: {type: String}
   \`\`\`

3. **API Endpoints Needed**
   \`\`\`
   POST /api/auth/login
   POST /api/auth/logout
   POST /api/auth/refresh
   GET  /api/dashboard/metrics
   GET  /api/alerts
   POST /api/alerts/:id/acknowledge
   GET  /api/billing
   POST /api/notifications/send
   \`\`\`

4. **Middleware Requirements**
   - Authentication middleware for protected routes
   - Request validation middleware
   - Error handling middleware
   - Rate limiting middleware

5. **Database Relationships**
   - Proper population of device references in customers
   - User-customer relationship management
   - Alert-device-customer relationships

### Environment Variables Needed

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/eleguard
DATABASE_URL=mongodb://localhost:27017/eleguard

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Service (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# File Storage (optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=eleguard-files
\`\`\`

## API Integration

To connect the frontend with your backend:

1. **Create API service layer**:
   \`\`\`typescript
   // lib/api.ts
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
   
   export const apiClient = {
     get: (endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`),
     post: (endpoint: string, data: any) => fetch(`${API_BASE_URL}${endpoint}`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
     }),
     // ... other methods
   };
   \`\`\`

2. **Replace mock data with API calls**
3. **Add loading states and error handling**
4. **Implement authentication flow**

## Deployment

1. **Frontend**: Deploy to Vercel, Netlify, or similar
2. **Backend**: Deploy to Railway, Render, or AWS
3. **Database**: MongoDB Atlas for production
4. **Environment**: Set up production environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
