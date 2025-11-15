-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (will be done via triggers/functions)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to notify campaign creator on donation
CREATE OR REPLACE FUNCTION notify_creator_on_donation()
RETURNS TRIGGER AS $$
DECLARE
  campaign_creator UUID;
  campaign_title TEXT;
BEGIN
  -- Get campaign creator and title
  SELECT creator_id, title INTO campaign_creator, campaign_title
  FROM campaigns
  WHERE id = NEW.campaign_id;
  
  -- Only notify if donation is successful
  IF NEW.payment_status = 'success' THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      campaign_creator,
      'donation',
      'New Donation Received!',
      'You received ₦' || NEW.amount || ' for "' || campaign_title || '"',
      '/campaign/' || NEW.campaign_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for donation notifications
CREATE TRIGGER donation_notification_trigger
AFTER INSERT ON donations
FOR EACH ROW
EXECUTE FUNCTION notify_creator_on_donation();

-- Function to notify donors on campaign update
CREATE OR REPLACE FUNCTION notify_donors_on_update()
RETURNS TRIGGER AS $$
DECLARE
  donor_record RECORD;
BEGIN
  -- Notify all unique donors of this campaign
  FOR donor_record IN 
    SELECT DISTINCT donor_id
    FROM donations
    WHERE campaign_id = NEW.campaign_id 
      AND donor_id IS NOT NULL
      AND payment_status = 'success'
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      donor_record.donor_id,
      'campaign_update',
      'Campaign Updated!',
      'A campaign you supported has posted a new update: "' || NEW.title || '"',
      '/campaign/' || NEW.campaign_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for campaign update notifications
CREATE TRIGGER campaign_update_notification_trigger
AFTER INSERT ON campaign_updates
FOR EACH ROW
EXECUTE FUNCTION notify_donors_on_update();

-- Function to notify admins on withdrawal request
CREATE OR REPLACE FUNCTION notify_admins_on_withdrawal()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  campaign_title TEXT;
BEGIN
  -- Get campaign title
  SELECT title INTO campaign_title
  FROM campaigns
  WHERE id = NEW.campaign_id;
  
  -- Only notify on new withdrawal requests
  IF NEW.status = 'pending' THEN
    -- Notify all admins
    FOR admin_record IN 
      SELECT DISTINCT user_id
      FROM user_roles
      WHERE role = 'admin'
    LOOP
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        admin_record.user_id,
        'withdrawal_request',
        'New Withdrawal Request',
        'Withdrawal request for ₦' || NEW.amount || ' from "' || campaign_title || '"',
        '/admin/withdrawals'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for withdrawal notifications
CREATE TRIGGER withdrawal_notification_trigger
AFTER INSERT ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION notify_admins_on_withdrawal();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;