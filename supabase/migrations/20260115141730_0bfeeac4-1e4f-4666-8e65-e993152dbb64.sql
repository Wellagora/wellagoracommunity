-- =============================================
-- THE GREAT PURGE: Complete cleanup (all dependencies)
-- =============================================

-- Delete ALL dependent records first
DELETE FROM public.transactions WHERE content_id IS NOT NULL;
DELETE FROM public.content_reviews;
DELETE FROM public.content_access;
DELETE FROM public.content_sponsorships;
DELETE FROM public.content_milestones;
DELETE FROM public.content_waitlist;
DELETE FROM public.expert_services;
DELETE FROM public.expert_media;
DELETE FROM public.community_creations;
DELETE FROM public.community_answers;
DELETE FROM public.community_questions;

-- Now delete main content
DELETE FROM public.expert_contents;

-- Delete events and related
DELETE FROM public.event_rsvps;
DELETE FROM public.events;

-- Delete vouchers
DELETE FROM public.vouchers;