-- ====================================================================
-- VEXIM PLATFORM V2.0 — SUPABASE AUTH & ROLE MANAGEMENT MIGRATION
-- Migration: 20260908_auth_and_user_management.sql
-- Fixed: 42P10 ON CONFLICT matching for Supabase auth.users & identities
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE / UPDATE USER ROLE ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM (
      'SUPER_ADMIN',
      'OPS_MANAGER',
      'PPC_SPECIALIST',
      'SUPPLY_CHAIN_SPECIALIST',
      'BRAND_CS_SPECIALIST',
      'COMPLIANCE_SPECIALIST',
      'ACCOUNT_EXECUTIVE',
      'CLIENT_SUPPLIER'
    );
  ELSE
    -- Add new role values if missing
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'PPC_SPECIALIST';
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'SUPPLY_CHAIN_SPECIALIST';
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'BRAND_CS_SPECIALIST';
  END IF;
END $$;

-- 3. ENSURE ORGANIZATIONS TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  country VARCHAR(10) DEFAULT 'VN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.organizations (id, name, slug, country)
VALUES ('00000000-0000-0000-0000-000000000001', 'Vexim Global Holdings', 'vexim-global', 'VN')
ON CONFLICT (id) DO NOTHING;

-- 4. ENSURE USERS TABLE EXISTS (PUBLIC SCHEMA)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  client_id UUID, -- References clients(id) when created
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'PPC_SPECIALIST',
  department VARCHAR(255),
  title VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  can_approve_high_risk BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FUNCTION FOR SUPER ADMIN TO CREATE STAFF ACCOUNT (NO ON-CONFLICT ERROR)
CREATE OR REPLACE FUNCTION public.create_staff_user(
  p_email VARCHAR(255),
  p_password TEXT,
  p_full_name VARCHAR(255),
  p_role user_role_enum,
  p_department VARCHAR(255),
  p_title VARCHAR(255) DEFAULT NULL,
  p_phone VARCHAR(50) DEFAULT NULL,
  p_can_approve_high_risk BOOLEAN DEFAULT FALSE,
  p_client_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_encrypted_pw TEXT;
  v_existing_auth_id UUID;
BEGIN
  -- Get default organization ID
  SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
  IF v_org_id IS NULL THEN
    v_org_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  v_encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- 1. Check if user already exists in auth.users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    SELECT id INTO v_existing_auth_id FROM auth.users WHERE email = p_email LIMIT 1;

    IF v_existing_auth_id IS NOT NULL THEN
      v_user_id := v_existing_auth_id;
      -- Update existing auth record
      UPDATE auth.users
      SET
        encrypted_password = v_encrypted_pw,
        raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'role', p_role::text),
        updated_at = NOW()
      WHERE id = v_user_id;
    ELSE
      v_user_id := uuid_generate_v4();
      -- Insert new auth record
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud
      )
      VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        v_encrypted_pw,
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('full_name', p_full_name, 'role', p_role::text),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
      );
    END IF;

    -- Also link auth.identities if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      )
      VALUES (
        uuid_generate_v4(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', p_email),
        'email',
        p_email,
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING;
    END IF;
  ELSE
    -- If auth schema is not available, check public.users
    SELECT id INTO v_user_id FROM public.users WHERE email = p_email LIMIT 1;
    IF v_user_id IS NULL THEN
      v_user_id := uuid_generate_v4();
    END IF;
  END IF;

  -- 2. Insert or update public.users profile
  INSERT INTO public.users (
    id,
    organization_id,
    client_id,
    email,
    full_name,
    role,
    department,
    title,
    phone,
    can_approve_high_risk,
    is_active,
    updated_at
  )
  VALUES (
    v_user_id,
    v_org_id,
    p_client_id,
    p_email,
    p_full_name,
    p_role,
    p_department,
    p_title,
    p_phone,
    p_can_approve_high_risk,
    TRUE,
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    title = EXCLUDED.title,
    phone = EXCLUDED.phone,
    can_approve_high_risk = EXCLUDED.can_approve_high_risk,
    updated_at = NOW();

  RETURN v_user_id;
END;
$$;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES ON USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Super Admin has full CRUD access to all users
DROP POLICY IF EXISTS super_admin_all_users ON public.users;
CREATE POLICY super_admin_all_users ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
    OR auth.uid() IS NULL -- Allow initial setup scripts and service role
  );

-- Regular users can only read their own profile
DROP POLICY IF EXISTS user_read_own_profile ON public.users;
CREATE POLICY user_read_own_profile ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
  );

-- Regular users can only update their own phone or avatar
DROP POLICY IF EXISTS user_update_own_profile ON public.users;
CREATE POLICY user_update_own_profile ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 7. EXECUTE: SEED 9 OFFICIAL PERSONNEL ACCOUNTS (Password: Anthai@88)
-- ====================================================================

DO $$
BEGIN
  -- 1. Master Super Admin: Lương Văn Học
  PERFORM public.create_staff_user(
    'hocluongvan88@gmail.com',
    'Anthai@88',
    'Lương Văn Học',
    'SUPER_ADMIN',
    'Ban Điều Hành & Quản Trị Tối Cao',
    'Chief Executive Officer & Super Admin',
    '+84 988 888 888',
    TRUE,
    NULL
  );

  -- 2. Operations Director: Nguyễn Tuấn Anh
  PERFORM public.create_staff_user(
    'hocluongvan25@gmail.com',
    'Anthai@88',
    'Nguyễn Tuấn Anh',
    'OPS_MANAGER',
    'Ban Quản Trị & Vận Hành Tổng Thể',
    'Amazon Operations Director',
    '+84 925 252 525',
    TRUE,
    NULL
  );

  -- 3. PPC Lead: Lương Hoàng Minh
  PERFORM public.create_staff_user(
    'luonghoangminh88@gmail.com',
    'Anthai@88',
    'Lương Hoàng Minh',
    'PPC_SPECIALIST',
    'Team Quảng Cáo & Growth PPC',
    'Lead PPC & Growth Engineering Specialist',
    '+84 988 123 456',
    FALSE,
    NULL
  );

  -- 4. Logistics Hub: Ánh Nguyễn
  PERFORM public.create_staff_user(
    'anhnguyen94@gmail.com',
    'Anthai@88',
    'Ánh Nguyễn',
    'SUPPLY_CHAIN_SPECIALIST',
    'Team Kho Vận & Chuỗi Cung Ứng FBA',
    'Senior FBA Logistics & 3PL Manager',
    '+84 994 949 494',
    FALSE,
    NULL
  );

  -- 5. Brand & CS Lead: Trần Thu Hà
  PERFORM public.create_staff_user(
    'hocluongvan26@gmail.com',
    'Anthai@88',
    'Trần Thu Hà',
    'BRAND_CS_SPECIALIST',
    'Team Listing, CRO & Chăm Sóc Khách Hàng',
    'Brand Experience & Listing Optimization Manager',
    '+84 926 262 626',
    FALSE,
    NULL
  );

  -- 6. Legal & Compliance Counsel: Lê Hoàng Nam
  PERFORM public.create_staff_user(
    'hocluongvan2588@gmail.com',
    'Anthai@88',
    'Lê Hoàng Nam',
    'COMPLIANCE_SPECIALIST',
    'Team Pháp Lý, FDA & Soạn Đơn Kháng Cáo POA',
    'Head of Amazon Compliance & Policy Counsel',
    '+84 925 888 888',
    TRUE,
    NULL
  );

  -- 7. Senior Account Executive: Phạm Minh Trang
  PERFORM public.create_staff_user(
    'hocluongvan2788@gmail.com',
    'Anthai@88',
    'Phạm Minh Trang',
    'ACCOUNT_EXECUTIVE',
    'Team Quản Lý Khách Hàng & Đối Tác',
    'Senior Account Executive',
    '+84 927 888 888',
    FALSE,
    NULL
  );

  -- 8. Client Supplier 1: Nguyễn Văn Hùng (CEO Vinacacao Organics)
  PERFORM public.create_staff_user(
    'hocluongvan22@gmail.com',
    'Anthai@88',
    'Nguyễn Văn Hùng',
    'CLIENT_SUPPLIER',
    'Công ty Cổ phần Vinacacao Việt Nam',
    'Tổng Giám Đốc (CEO)',
    '+84 908 123 456',
    FALSE,
    NULL
  );

  -- 9. Client Supplier 2: Trần Thị Thu Thảo (Founder Thảo Mộc An An)
  PERFORM public.create_staff_user(
    'hocluongvvan33@gmail.com',
    'Anthai@88',
    'Trần Thị Thu Thảo',
    'CLIENT_SUPPLIER',
    'Công ty TNHH Thảo Mộc An An',
    'Nhà Sáng Lập (Founder)',
    '+84 912 345 678',
    FALSE,
    NULL
  );
END $$;
