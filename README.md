
# CoopLoan Management System

A comprehensive cooperative finance management platform built with React, TypeScript, Express, and modern web technologies. This system helps manage cooperative organizations, members, loans, repayments, and financial contributions.

## Features

### 🏢 Organization Management
- Create and manage cooperative organizations
- Track organization details and membership
- Administrative controls for organization settings

### 👥 Member Management
- Add and manage cooperative members
- Track member profiles and contact information
- Member status and role management

### 💰 Loan Management
- Process loan applications
- Track loan statuses and approvals
- Manage loan terms and conditions
- Calculate interest and payment schedules

### 📊 Financial Tracking
- Monitor loan repayments
- Track monthly contributions
- Generate financial reports and analytics
- Real-time dashboard with key metrics

### 📈 Reports & Analytics
- Comprehensive financial reporting
- Export capabilities for data analysis
- Visual charts and graphs for insights
- Time-period based filtering

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Mantine UI** - Rich component library
- **Tailwind CSS** - Utility-first styling
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization

### Backend
- **Express.js** - Web application framework
- **TypeScript** - Server-side type safety
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Relational database
- **Zod** - Schema validation

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - JavaScript bundler
- **Tailwind CSS** - Styling framework
- **PostCSS** - CSS processing

## Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/subhamGhorui1371994/CoopFinanceManager1.git
cd CoopFinanceManager1
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configs
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Database operations
├── shared/                 # Shared types and schemas
└── package.json           # Project dependencies
```

## Configuration

### Database Setup
The application uses PostgreSQL. Configure your database connection in the environment variables or update the connection settings in the server configuration.

### Authentication
Currently configured for mock authentication. To enable full authentication:

1. Set up Supabase or your preferred auth provider
2. Update the authentication configuration in `client/src/lib/supabase.ts`
3. Configure environment variables for your auth service

## Deployment

### Replit Deployment
This project is configured for easy deployment on Replit:

1. The build process is automatically configured
2. Production server starts with `npm run start`
3. Database migrations run with `npm run db:push`

### Manual Deployment
1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Features Overview

### Dashboard
- Real-time financial metrics
- Active loans overview
- Member statistics
- Recent transactions

### Member Management
- Add new members with detailed profiles
- Track member status and roles
- Member search and filtering
- Contact information management

### Loan Processing
- Loan application workflow
- Approval/rejection system
- Interest calculation
- Payment scheduling
- Status tracking

### Financial Reporting
- Monthly/quarterly/yearly reports
- Loan performance analytics
- Member contribution tracking
- Export functionality

## API Endpoints

The backend provides RESTful API endpoints for:
- `/api/organizations` - Organization management
- `/api/members` - Member operations
- `/api/loans` - Loan processing
- `/api/repayments` - Payment tracking
- `/api/contributions` - Contribution management

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Development Guidelines

- Follow TypeScript best practices
- Use the established component patterns
- Maintain responsive design principles
- Write descriptive commit messages
- Test your changes thoroughly

## Security Considerations

- Implement proper authentication before production use
- Secure API endpoints with appropriate middleware
- Validate all user inputs
- Use environment variables for sensitive configuration
- Regular security updates for dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Review the documentation
- Check existing issues for similar problems

## Roadmap

- [ ] Complete Supabase authentication integration
- [ ] Advanced reporting features
- [ ] Mobile-responsive enhancements
- [ ] Real-time notifications
- [ ] Automated backup system
- [ ] Multi-language support

---

Built with ❤️ using modern web technologies for cooperative financial management.
