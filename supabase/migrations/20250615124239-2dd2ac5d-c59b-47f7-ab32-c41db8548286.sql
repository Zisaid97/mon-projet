
-- This script first removes any duplicate Google integrations for the same user,
-- keeping only the most recent one. Then, it adds a unique constraint on the
-- user_id column to prevent future duplicates, ensuring each user has only
-- one integration.

-- Step 1: Delete duplicate rows, keeping the most recent entry for each user.
DELETE FROM public.google_integrations a
USING public.google_integrations b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id;

-- Step 2: Add a UNIQUE constraint to the user_id column.
ALTER TABLE public.google_integrations
ADD CONSTRAINT google_integrations_user_id_key UNIQUE (user_id);
