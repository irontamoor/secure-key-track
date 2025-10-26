-- Add given_to column to bookings table for tracking who receives/returns keys
ALTER TABLE public.bookings
ADD COLUMN given_to TEXT;