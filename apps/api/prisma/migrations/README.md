# Prisma Migrations

This directory contains Prisma migrations for the EngineO.ai database schema.

## ADMIN-OPS-1 Migration Notes

**Migration name suggestion:** `admin_ops_1_internal_roles_audit_log_quota_reset`

### Schema Changes

1. **New Enums:**
   - `InternalAdminRole`: `SUPPORT_AGENT`, `OPS_ADMIN`, `MANAGEMENT_CEO`
   - `AccountStatus`: `ACTIVE`, `SUSPENDED`

2. **User Model Updates:**
   - Added `adminRole` (nullable `InternalAdminRole`)
   - Added `accountStatus` (defaults to `ACTIVE`)

3. **New Models:**
   - `AdminAuditLog`: Immutable audit log for admin actions
   - `AiMonthlyQuotaReset`: Quota reset tracking without deleting ledger

### Data Backfill

After running the migration, execute the following to ensure existing admins have a role:

```sql
-- Backfill: Existing User.role=ADMIN records get adminRole=OPS_ADMIN when null (to avoid lockout)
UPDATE "User"
SET "adminRole" = 'OPS_ADMIN'
WHERE "role" = 'ADMIN' AND "adminRole" IS NULL;
```

Alternatively, include this in a follow-up migration or script.

## Running Migrations

```bash
# Development
pnpm --filter api prisma migrate dev

# Production
pnpm --filter api prisma migrate deploy

# Test database
pnpm db:test:migrate
```
