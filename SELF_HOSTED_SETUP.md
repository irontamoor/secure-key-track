# Self-Hosted Supabase Setup for Key Management System

Complete guide to deploy your own Supabase instance using Docker for the Key Management application.

## Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 2GB | 4GB |
| CPU | 2 cores | 4 cores |
| Storage | 40GB SSD | 80GB SSD |
| OS | Ubuntu 22.04 LTS | Any Docker-compatible OS |

**Prerequisites:** Docker & Docker Compose must be installed.

---

## Phase 1: Deploy Supabase Docker Stack

### Step 1.1: Clone Supabase Repository

```bash
# Create directory
mkdir -p /opt/supabase
cd /opt/supabase

# Clone only the docker folder
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
```

### Step 1.2: Generate Secure Secrets

```bash
# Generate JWT Secret (must be at least 32 characters)
openssl rand -base64 48
# Save this output!

# Generate Postgres Password
openssl rand -base64 32
# Save this output!

# Generate Dashboard Password
openssl rand -base64 16
# Save this output!
```

### Step 1.3: Generate Anon and Service Role Keys

Use the [Supabase Key Generator](https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys) or this Node.js script:

```javascript
// generate-keys.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'YOUR_JWT_SECRET_FROM_STEP_1.2'; // Replace with your secret

// Generate ANON key
const anonPayload = {
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

// Generate SERVICE_ROLE key  
const servicePayload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
};

console.log('ANON_KEY:', jwt.sign(anonPayload, JWT_SECRET));
console.log('SERVICE_ROLE_KEY:', jwt.sign(servicePayload, JWT_SECRET));
```

Run with: `node generate-keys.js`

### Step 1.4: Configure Environment File

```bash
# Copy example env
cp .env.example .env

# Edit the .env file
nano .env
```

**Update these values in `.env`:**

```env
############
# Secrets
############
POSTGRES_PASSWORD=your_postgres_password_from_step_1.2
JWT_SECRET=your_jwt_secret_from_step_1.2
ANON_KEY=your_anon_key_from_step_1.3
SERVICE_ROLE_KEY=your_service_role_key_from_step_1.3

############
# Dashboard
############
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your_dashboard_password_from_step_1.2

############
# API Configuration
############
SITE_URL=http://localhost:3000
API_EXTERNAL_URL=http://localhost:8000

############
# Database
############
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432
```

### Step 1.5: Start Supabase Services

```bash
# Start all services
docker compose up -d

# Check status (wait 2-3 minutes)
docker compose ps

# View logs if needed
docker compose logs -f
```

**Expected running services:**
- `supabase-db` (PostgreSQL)
- `supabase-kong` (API Gateway)
- `supabase-auth`
- `supabase-rest` (PostgREST)
- `supabase-storage`
- `supabase-studio` (Dashboard)

---

## Phase 2: Import Database Schema

### Step 2.1: Create Schema File

Create `init.sql` with the complete schema:

```sql
-- ============================================
-- COMPLETE SCHEMA FOR KEY MANAGEMENT SYSTEM
-- ============================================

-- Create keys table
CREATE TABLE IF NOT EXISTS public.keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
  location TEXT,
  additional_notes TEXT,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT key_number_length CHECK (length(key_number) BETWEEN 1 AND 50),
  CONSTRAINT description_length CHECK (length(description) BETWEEN 1 AND 500),
  CONSTRAINT location_length CHECK (location IS NULL OR length(location) <= 200),
  CONSTRAINT notes_length CHECK (additional_notes IS NULL OR length(additional_notes) <= 1000)
);

-- Create bookings table for audit logging
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES public.keys(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('check_in', 'check_out', 'key_created', 'key_updated', 'key_deleted')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  given_to TEXT,
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  
  CONSTRAINT user_name_length CHECK (length(user_name) BETWEEN 1 AND 100),
  CONSTRAINT given_to_length CHECK (given_to IS NULL OR length(given_to) BETWEEN 1 AND 100),
  CONSTRAINT notes_length_booking CHECK (notes IS NULL OR length(notes) <= 1000)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_keys_number ON public.keys(key_number);
CREATE INDEX IF NOT EXISTS idx_keys_keywords ON public.keys USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_bookings_user_name ON public.bookings(user_name);
CREATE INDEX IF NOT EXISTS idx_bookings_key_id ON public.bookings(key_id);
CREATE INDEX IF NOT EXISTS idx_bookings_timestamp ON public.bookings(timestamp DESC);

-- Enable RLS
ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for keys
CREATE POLICY "Public can view keys" ON public.keys FOR SELECT USING (true);
CREATE POLICY "Public can insert keys" ON public.keys FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update keys" ON public.keys FOR UPDATE USING (true);
CREATE POLICY "Public can delete keys" ON public.keys FOR DELETE USING (true);

-- RLS policies for bookings
CREATE POLICY "Public can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to update key status on booking
CREATE OR REPLACE FUNCTION public.update_key_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.action = 'check_out' THEN
    UPDATE public.keys SET status = 'checked_out' WHERE id = NEW.key_id;
  ELSIF NEW.action = 'check_in' THEN
    UPDATE public.keys SET status = 'available' WHERE id = NEW.key_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_keys_updated_at ON public.keys;
CREATE TRIGGER update_keys_updated_at
  BEFORE UPDATE ON public.keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_key_status_on_booking ON public.bookings;
CREATE TRIGGER update_key_status_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_key_status();

-- Create storage bucket for key images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('key-images', 'key-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read access to key images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'key-images');
CREATE POLICY "Public upload access to key images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'key-images');
CREATE POLICY "Public delete access to key images" ON storage.objects 
  FOR DELETE USING (bucket_id = 'key-images');
CREATE POLICY "Public update access to key images" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'key-images');

-- Table comments
COMMENT ON TABLE public.keys IS 'Stores key inventory with descriptions, locations, and status tracking';
COMMENT ON TABLE public.bookings IS 'Activity log for all key-related actions';
```

### Step 2.2: Import Schema

```bash
# Copy SQL file to server
scp init.sql root@your-server-ip:/opt/supabase/

# SSH into server and import
ssh root@your-server-ip
docker exec -i supabase-db psql -U postgres -d postgres < /opt/supabase/init.sql

# Verify tables
docker exec -it supabase-db psql -U postgres -d postgres -c "\dt public.*"
```

---

## Phase 3: Update Application Configuration

### Step 3.1: Update Environment Variables

Update your application's `.env` file:

```env
# Change FROM (Lovable Cloud):
VITE_SUPABASE_URL="https://dzsigtgnnqougfqhqffe.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Change TO (Self-Hosted):
VITE_SUPABASE_URL="http://localhost:8000"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key_from_step_1.3"
```

### Step 3.2: Test Locally

```bash
npm run dev
```

**Test all functionality:**
- ✅ View keys
- ✅ Search keys
- ✅ Check out/in keys
- ✅ View audit log
- ✅ Admin: Create/Edit/Delete keys
- ✅ Admin: Upload images

### Step 3.3: Deploy Application

When deploying to production, set these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://api.your-domain.com` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your ANON_KEY |

---

## Quick Reference

### Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| API Gateway | `http://localhost:8000` | Main API endpoint |
| Studio | `http://localhost:3000` | Admin dashboard |
| PostgreSQL | `localhost:5432` | Database |
| Storage | `http://localhost:8000/storage/v1` | File storage |

### Useful Docker Commands

```bash
# View all container status
docker compose ps

# View logs
docker compose logs -f          # All services
docker compose logs -f db       # PostgreSQL only
docker compose logs -f kong     # API Gateway only

# Restart services
docker compose restart

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Access PostgreSQL directly
docker exec -it supabase-db psql -U postgres
```

---

## Estimated Setup Time

| Phase | Duration |
|-------|----------|
| Server provisioning | 10-15 min |
| Supabase deployment | 15-20 min |
| Schema import | 5 min |
| Testing | 15-20 min |
| **Total** | **~1 hour** |
