# Database Documentation

This directory contains all database-related files for the Pet Care Marketplace application.

## Structure

```
database/
├── migrations/     # Database schema migrations (run in order)
├── seeds/         # Sample data for development/testing
└── README.md      # This documentation
```

## Migrations

Database migrations should be run in the following order:

### 1. `001_initial_schema.sql`
- Creates the main `services` table
- Sets up basic Row Level Security (RLS)
- Establishes the foundation for the marketplace

### 2. `002_consultation_bookings.sql`
- Creates the `consultation_bookings` table
- Links bookings to services and users
- Includes status tracking and scheduling

### 3. `003_provider_availability.sql`
- Creates the `provider_availability` table
- Manages service provider schedules
- Supports recurring availability patterns

### 4. `004_add_service_types.sql`
- Adds service type categorization
- Enhances service filtering capabilities
- Includes predefined service categories

### 5. `005_add_work_type.sql`
- Adds work type classification
- Supports different provider types
- Enables provider specialization filtering

### 6. `006_fix_rls_policies.sql`
- Updates Row Level Security policies
- Ensures proper access control
- Fixes any policy conflicts

## Seeds

Sample data files for development and testing:

### `001_sample_services.sql`
- Inserts sample pet care services
- Includes various service types and locations
- Useful for development and testing

## Usage

### Running Migrations

1. Open your Supabase SQL Editor
2. Copy and paste each migration file in order
3. Execute each migration before proceeding to the next
4. Verify the migration completed successfully

### Loading Sample Data

1. After running all migrations
2. Copy and paste seed files into Supabase SQL Editor
3. Execute to populate with sample data

### Verification

After running migrations, verify the setup:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check sample data (if seeds were run)
SELECT COUNT(*) FROM services;
```

## Schema Overview

### Services Table
- Primary marketplace listings
- Service details, pricing, location
- Provider information and ratings

### Consultation Bookings Table
- Appointment scheduling
- User-service relationships
- Booking status and history

### Provider Availability Table
- Service provider schedules
- Time slot management
- Recurring availability patterns

### Profiles Table
- User profile information
- Provider details and verification
- Authentication integration

## Security

All tables implement Row Level Security (RLS):

- **Public read access** for service listings
- **Authenticated access** for bookings and profiles
- **Owner-only access** for sensitive data
- **Provider access** for their own data

## Maintenance

### Adding New Migrations

1. Create new file with next sequential number
2. Follow naming convention: `XXX_description.sql`
3. Include rollback instructions in comments
4. Test thoroughly before deployment

### Backup Strategy

- Regular automated backups via Supabase
- Export schema before major changes
- Keep migration history for rollback capability

## Troubleshooting

### Common Issues

1. **RLS Policy Conflicts**: Run `006_fix_rls_policies.sql`
2. **Missing Tables**: Verify migration order
3. **Permission Errors**: Check RLS policies and user roles
4. **Data Consistency**: Verify foreign key constraints

### Getting Help

1. Check Supabase logs for detailed error messages
2. Verify migration files were run in correct order
3. Ensure proper environment variables are set
4. Review RLS policies for access issues