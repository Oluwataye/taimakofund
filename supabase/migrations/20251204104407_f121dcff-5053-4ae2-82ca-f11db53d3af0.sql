-- Create moderation_logs table to track all moderator actions
CREATE TABLE public.moderation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id uuid NOT NULL REFERENCES public.profiles(id),
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Moderators and admins can view logs
CREATE POLICY "Moderators and admins can view logs"
ON public.moderation_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

-- System can insert logs (via authenticated moderators)
CREATE POLICY "Authenticated moderators can insert logs"
ON public.moderation_logs
FOR INSERT
WITH CHECK (
  auth.uid() = moderator_id AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'moderator'::app_role)
  )
);

-- Create index for faster queries
CREATE INDEX idx_moderation_logs_moderator ON public.moderation_logs(moderator_id);
CREATE INDEX idx_moderation_logs_target ON public.moderation_logs(target_type, target_id);
CREATE INDEX idx_moderation_logs_created ON public.moderation_logs(created_at DESC);