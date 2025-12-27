# Salone SkillsHub

A comprehensive job marketplace and employment platform designed specifically for Sierra Leone, connecting job seekers (students, graduates, and artisans) with employers across the country.

## Overview

Salone SkillsHub is a Next.js-based platform that facilitates the connection between employers and job seekers in Sierra Leone. The platform supports various employment types including gigs, internships, part-time, and full-time positions, with a focus on empowering both formal graduates and skilled artisans to find meaningful work opportunities.

## Features

### For Job Seekers
- **Profile Creation**: Create detailed profiles with skills, education, work experience, and portfolio items
- **Multiple Pathways**: Support for students, graduates, and artisans
- **Job Applications**: Apply to jobs with cover letters and CV uploads
- **Skill Management**: Showcase skills with proficiency levels
- **Portfolio**: Display portfolio items with file attachments
- **Application Tracking**: Track application status (Applied, Shortlisted, Hired, Rejected)
- **Contract Management**: Manage contracts with milestone tracking
- **Messaging**: Communicate with employers through contract-based message threads
- **Reviews**: Give and receive reviews after contract completion

### For Employers
- **Company Profiles**: Create and verify organization profiles
- **Job Posting**: Post various job types (GIG, INTERNSHIP, PART_TIME, FULL_TIME)
- **Application Management**: Review and manage job applications
- **Contract Creation**: Create contracts with milestone-based payments
- **Candidate Matching**: Find candidates based on required skills
- **Messaging**: Communicate with job seekers
- **Reviews**: Provide feedback on completed work

### Platform Features
- **Role-Based Access Control**: USER, JOB_SEEKER, EMPLOYER, and ADMIN roles
- **Sierra Leone Location Support**: Complete regions and districts database
- **File Management**: Secure file storage for resumes, CVs, cover letters, and portfolio items
- **Email Verification**: Email verification system for new accounts
- **Password Reset**: Secure password reset functionality
- **Authentication**: Auth.js v5 integration for secure authentication
- **Audit Logging**: Role change tracking and audit logs

## Tech Stack

- **Framework**: [Next.js 15.5.6](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Authentication**: Auth.js v5
- **Font**: Geist (Sans & Mono)

## Project Structure

```
salone-skillshub/
├── app/                      # Next.js App Router directory
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── prisma/
│   ├── schema.prisma        # Prisma database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Database Schema

The application uses a comprehensive PostgreSQL database schema with the following main entities:

- **User Management**: Users, Roles, Email Verification, Password Reset
- **Profiles**: SeekerProfile, EmployerProfile
- **Jobs**: Jobs, Applications, Skills, SkillOnJob, SkillOnProfile
- **Contracts**: Contracts, Milestones
- **Messaging**: MessageThread, Message
- **Reviews**: Review system for completed contracts
- **Education & Experience**: Education, VocationalTraining, WorkExperience
- **Portfolio**: PortfolioItem
- **Location**: RegionSL, DistrictSL, Address
- **Files**: FileObject for managing uploads
- **Auth**: Account, Session (Auth.js v5)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Environment variables configured (see below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd salone-skillshub
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory (copy from `env.example`):
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/salone_skillshub"
DIRECT_URL="postgresql://user:password@localhost:5432/salone_skillshub"

# Admin Credentials (for seeding)
ADMIN_EMAIL="admin@skillshub.sl"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="Admin@123"

# AWS S3 Configuration for File Storage
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="salone-skillshub-files"
AWS_S3_ENDPOINT="" # Leave empty for AWS S3, or set for S3-compatible services
AWS_S3_FORCE_PATH_STYLE="false"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_S3_URL="" # If using CDN, set your CDN URL here

# File Upload Limits
MAX_FILE_SIZE=5242880 # 5MB
ALLOWED_FILE_TYPES="application/pdf,application/msword,image/jpeg,image/png,text/plain"
```

**Note**: For S3 setup:
- Create an S3 bucket (or use S3-compatible service like DigitalOcean Spaces, Cloudflare R2)
- Create IAM user with S3 read/write permissions
- Add credentials to `.env` file
- Ensure bucket has appropriate CORS settings for web uploads

4. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Database Seeding

The seed script creates comprehensive test data:
- **Sierra Leone regions and districts** (5 regions, 16 districts)
- **40+ skills** across technical, business, creative, artisan, and professional categories
- **1 Admin user**
- **4 Employer accounts** with verified and unverified profiles
- **6 Job Seeker profiles** (students, graduates, artisans)
- **8 Job postings** (full-time, part-time, internships, gigs)
- **3 Applications** with different statuses
- **Education records** for seekers
- **Work experience** entries
- **Portfolio items** with file attachments
- **Contract with milestones**

To seed the database:
```bash
npx prisma db seed
```

**Default Demo Credentials:**
- **Admin**: Configure via `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars (default: `admin@skillshub.sl` / `Admin@123`)
- **Employers**: All use password `Employer@123`
  - `employer@skillshub.sl` - Salone Digital Co. (verified)
  - `hr@salonetech.sl` - Salone Tech Solutions (verified)
  - `info@greenleaf.sl` - GreenLeaf NGO (unverified)
  - `contact@westcoast.sl` - West Coast Trading (verified)
- **Job Seekers**: All use password `Seeker@123`
  - `seeker@skillshub.sl` - Mariama Kamara (Graduate, Front-end Developer)
  - `ahmed@skillshub.sl` - Ahmed Koroma (Student, Web Developer)
  - `isatu@skillshub.sl` - Isatu Conteh (Artisan, Tailor)
  - `musa@skillshub.sl` - Musa Bangura (Graduate, Digital Marketer)
  - `hawa@skillshub.sl` - Hawa Jalloh (Graduate, Graphic Designer)
  - `alhaji@skillshub.sl` - Alhaji Sankoh (Artisan, Welder)

## Key Concepts

### User Roles
- **USER**: Default role after basic registration
- **JOB_SEEKER**: Assigned after creating a SeekerProfile
- **EMPLOYER**: Assigned after creating an EmployerProfile
- **ADMIN**: System administrator role

### Job Types
- **GIG**: Short-term, task-based work
- **INTERNSHIP**: Internship opportunities
- **PART_TIME**: Part-time employment
- **FULL_TIME**: Full-time employment

### Pathways (for Job Seekers)
- **STUDENT**: Currently studying
- **GRADUATE**: Recent or past graduate
- **ARTISAN**: Skilled informal worker (tailor, welder, electrician, etc.)

### Application Status
- **APPLIED**: Initial application submitted
- **SHORTLISTED**: Candidate shortlisted for further review
- **HIRED**: Candidate selected for the position
- **REJECTED**: Application not successful

## Development

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Code Style

The project uses ESLint for code quality. Run linting with:
```bash
npm run lint
```

## Deployment

### Database Setup
Ensure your PostgreSQL database is configured with the correct connection strings in your production environment variables.

### Environment Variables
Make sure all required environment variables are set in your production environment:
- `DATABASE_URL`
- `DIRECT_URL`
- Any authentication secrets (if using Auth.js)

### Build and Deploy
```bash
npm run build
npm run start
```

For deployment platforms like Vercel, the build process is handled automatically.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## File Storage (S3)

The application uses AWS S3 (or S3-compatible services) for file storage. Files are organized by type:

- `profiles/resumes/` - User CVs and resumes
- `profiles/portfolio/` - Portfolio items
- `applications/cv/` - CVs attached to job applications
- `applications/cover-letters/` - Cover letters for applications
- `misc/` - Other files

### File Upload API

Use the `/api/upload` endpoint to upload files:

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("fileType", "cv"); // cv | cover-letter | resume | portfolio | other
formData.append("userId", "123"); // Optional

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

### S3 Utilities

The application includes utilities in `lib/s3.ts` and `lib/file-upload.ts`:
- `uploadFileToS3()` - Upload files to S3
- `getFileUrl()` - Get presigned URLs for file access
- `deleteFileFromS3()` - Delete files from S3
- `uploadAndCreateFileRecord()` - Upload file and create database record

## Support

For support, please contact the development team or open an issue in the repository.

---

Built with ❤️ for Sierra Leone
