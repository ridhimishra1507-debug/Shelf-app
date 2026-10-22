# Database migrations

All schema changes are committed as timestamped SQL migrations in this directory. Create a new
migration with `npx supabase migration new <descriptive_name>`; do not edit an applied migration.

Every user-owned table added in a future phase must include appropriate indexes, constraints, and
Row-Level Security policies in the same migration.
