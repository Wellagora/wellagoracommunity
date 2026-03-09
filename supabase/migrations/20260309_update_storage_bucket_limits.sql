-- Raise file_size_limit to 250MB on buckets that accept video uploads
-- This matches the client-side MAX_VIDEO_SIZE = 250 * 1024 * 1024

UPDATE storage.buckets
SET file_size_limit = 262144000  -- 250 MB in bytes
WHERE id IN ('expert-media', 'expert-content');

-- Also ensure the expert-content bucket exists (used by ProgramCreatorWizard)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('expert-content', 'expert-content', true, 262144000)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 262144000;

-- Ensure expert-media bucket limit is updated
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('expert-media', 'expert-media', true, 262144000)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 262144000;
