# J.P. Transport Management System

A comprehensive, production-ready transport management web application built with Next.js, TypeScript, and Supabase. Designed for managing truck operations, trips, payments, and comprehensive reporting.

## 🚀 Features

### Core Functionality
- **Trip Management**: Create, edit, and track truck trips with comprehensive details
- **Payment Processing**: Record and track payments with multiple methods
- **Party Management**: Manage consignors, consignees, owners, and transport parties
- **Dashboard Analytics**: KPI cards, charts, and real-time insights
- **Advanced Reporting**: Receivables aging, RTO summaries, revenue analytics
- **CSV Export**: Export filtered data for external analysis

### Technical Features
- **Responsive Design**: Mobile-first design that works on all devices
- **Authentication**: Secure user authentication with Supabase Auth
- **Real-time Calculations**: Automatic calculation of totals, taxes, and balances
- **Advanced Filtering**: Multi-criteria filtering with date ranges, status, and more
- **Data Validation**: Comprehensive form validation with Zod
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd jp-transport-management
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase project details:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to the SQL Editor
3. Copy and run the entire `supabase-schema.sql` file to create:
   - Database schema with all tables
   - Indexes for performance
   - Row Level Security (RLS) policies
   - Database triggers for automatic calculations
   - Sample data for testing

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

### Core Entities

#### Parties
- **consignor**: Goods sender
- **consignee**: Goods receiver  
- **owner**: Truck owner
- **transport**: Transport company

#### Trips
- Complete trip information with origin/destination
- Driver details and cargo information
- Financial calculations (freight, RTO, tolls, etc.)
- Automatic total and balance calculations
- Payment status tracking

#### Payments
- Multiple payment methods (Cash, UPI, Bank, Other)
- Reference numbers and notes
- Automatic trip balance updates

## 💰 Calculations Logic

The system implements sophisticated financial calculations:

### Trip Totals
```
Subtotal = Freight + RTO + Toll + Loading/Unloading + Other - Diesel Advance
Tax Amount = Subtotal × Tax Percentage / 100
Total Amount = Subtotal + Tax Amount
```

### Payment Status
- **UNPAID**: No payments received
- **PARTIAL**: Some payment received (< total)
- **PAID**: Full payment received (≥ total)

### Balance Calculation
```
Balance Due = Total Amount - Amount Received
```

All calculations are handled automatically via database triggers when trips or payments are modified.

## 📱 Pages & Features

### Authentication
- `/login` - User sign in
- `/register` - User registration

### Dashboard (`/dashboard`)
- KPI cards (Total Due, Received, RTO, Trips Today, Open Trips)
- Monthly payments chart
- Top consignees by revenue

### Trips Management (`/trips`)
- List all trips with advanced filtering
- Create new trip (`/trips/new`)
- View trip details (`/trips/[id]`)
- Edit trip (`/trips/[id]/edit`)
- CSV export functionality

### Payments (`/payments`)
- List all payments with filters
- Quick payment creation
- CSV export

### Parties (`/parties`)
- Manage all party types
- Inline creation from trip forms

### Reports (`/reports`)
- Receivables aging analysis
- RTO charges summary
- Revenue by truck reports

## 🎨 Customization Guide

### Adding New Fields

#### 1. Database Level
Update the `trips` table in `supabase-schema.sql`:
```sql
ALTER TABLE trips ADD COLUMN new_field_name TEXT;
```

#### 2. TypeScript Types
Update `src/types/db.ts`:
```typescript
// Add to Trip interface
new_field_name: string | null
```

#### 3. Validation Schema
Update `src/lib/validators.ts`:
```typescript
// Add to TripSchema
new_field_name: z.string().optional().nullable(),
```

#### 4. Forms
Update trip forms in `src/components/forms/TripForm.tsx`

### Styling Customization

#### Colors & Branding
Update `tailwind.config.ts` for color schemes:
```typescript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))", // Your brand color
      // ... other colors
    }
  }
}
```

#### CSS Variables
Update `src/app/globals.css` for theme colors:
```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Your brand color */
  /* ... other variables */
}
```

### Adding New Charge Types
To add new charge types to trip calculations:

1. Add database column
2. Update TypeScript types
3. Update validation schema
4. Update calculation functions in `src/lib/calculations.ts`
5. Update forms and displays

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security
- **Authentication Required**: All app routes protected
- **Input Validation**: Comprehensive form validation
- **SQL Injection Protection**: Parameterized queries via Supabase

## 📈 Performance Optimizations

- **Database Indexes**: Optimized for common queries
- **Server Components**: Reduced client-side JavaScript
- **Pagination**: Large datasets handled efficiently
- **Caching**: Supabase built-in caching

## 🧪 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Type checking
```

## 📦 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication pages
│   ├── (dashboard)/    # Protected dashboard pages
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   ├── ui/            # shadcn/ui components
│   ├── forms/         # Form components
│   ├── tables/        # Table components
│   ├── charts/        # Chart components
│   └── filters/       # Filter components
├── lib/               # Utility libraries
│   ├── supabase/      # Database clients
│   ├── calculations.ts # Business logic
│   ├── validators.ts  # Zod schemas
│   ├── csv.ts        # CSV export
│   └── utils.ts      # General utilities
├── types/             # TypeScript definitions
└── actions/          # Server actions (future)
```

## 🔄 Future Enhancements

### Planned Features
- Real-time server actions implementation
- Advanced party management with inline creation
- Attachment upload functionality  
- Email notifications
- Multi-tenant support
- Mobile app (React Native)
- WhatsApp integration
- GPS tracking integration

### Scalability Considerations
- Database connection pooling
- Redis caching layer
- CDN for static assets
- Microservices architecture
- Load balancing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the sample data and schema

## 🎯 Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### Environment Variables for Production
Ensure these are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Built with ❤️ for the transport industry**