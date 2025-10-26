-- ============================================================================
-- SECURITY DOCUMENTATION: SECURITY DEFINER Functions
-- ============================================================================
-- This migration adds security documentation to existing SECURITY DEFINER functions.
-- These functions are intentionally designed to bypass RLS for automated system operations.
--
-- SECURITY REVIEW NOTES:
-- - These functions are SAFE in their current form (simple, no user input)
-- - SECURITY DEFINER is REQUIRED for automated triggers to work
-- - Fixed search_path = public prevents SQL injection attacks
-- - DO NOT modify these functions to accept user input without security review
-- - Any future modifications MUST be carefully reviewed for security implications
-- ============================================================================

-- Document the update_updated_at_column() function
COMMENT ON FUNCTION public.update_updated_at_column() IS 
'SECURITY DEFINER function for automated timestamp updates via triggers.
SECURITY IMPLICATIONS:
- Executes with owner privileges, bypassing RLS
- Fixed search_path = public prevents SQL injection
- Does NOT accept user input - triggered automatically on UPDATE
- Simple operation: only sets updated_at = now()
WARNING: Do not modify to accept parameters or add complex logic without security review.
JUSTIFICATION: SECURITY DEFINER required for trigger to update timestamps regardless of user permissions.';

-- Document the update_key_status() function
COMMENT ON FUNCTION public.update_key_status() IS 
'SECURITY DEFINER function for automated key status updates via booking triggers.
SECURITY IMPLICATIONS:
- Executes with owner privileges, bypassing RLS
- Fixed search_path = public prevents SQL injection
- Triggered by INSERT on bookings table (indirect user action)
- Performs UPDATE on keys table, bypassing normal RLS policies
- Simple conditional: check_out -> checked_out, check_in -> available
WARNING: Do not modify to accept parameters, add user input, or add complex logic without security review.
JUSTIFICATION: SECURITY DEFINER required to automatically update key availability status when bookings are created, regardless of user permissions. This is a controlled system operation.';

-- Add table-level comment for user_roles to document security model
COMMENT ON TABLE public.user_roles IS 
'Stores user role assignments for role-based access control (RBAC).
SECURITY MODEL:
- Separate from auth.users to prevent privilege escalation
- Used with has_role() security definer function to avoid RLS recursion
- RLS policies: users can view own roles, admins can manage all
- Never store roles in localStorage/sessionStorage (client-side manipulation risk)';

-- Add comment to has_role() function
COMMENT ON FUNCTION public.has_role(_user_id uuid, _role app_role) IS 
'SECURITY DEFINER function to check if a user has a specific role.
SECURITY IMPLICATIONS:
- Executes with owner privileges to avoid RLS recursion
- Fixed search_path = public prevents SQL injection
- Simple EXISTS query on user_roles table
- Used in RLS policies to enforce role-based access control
JUSTIFICATION: SECURITY DEFINER required to query user_roles table within RLS policies without causing infinite recursion. This is a standard Supabase security pattern.';