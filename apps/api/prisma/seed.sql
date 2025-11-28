-- Seed script to create a demo user and project
-- This ensures at least one Project row exists for /projects/[id] to work

-- Create demo user if it doesn't exist
INSERT INTO "User" (id, email, password, name, "createdAt", "updatedAt")
SELECT 
  'demo-user-123',
  'demo@seoengine.io',
  'demo-password-hash',
  'Demo User',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "User" WHERE email = 'demo@seoengine.io'
);

-- Create demo project if it doesn't exist
INSERT INTO "Project" (id, "userId", name, domain, "connectedType", "createdAt")
SELECT 
  'demo-project-123',
  'demo-user-123',
  'Demo Project',
  'example.com',
  'website',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Project" WHERE id = 'demo-project-123'
);

