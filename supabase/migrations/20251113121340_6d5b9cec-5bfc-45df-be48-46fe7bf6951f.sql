-- Create storage buckets for campaign images and verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('campaign-images', 'campaign-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('verification-documents', 'verification-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']);

-- RLS policies for campaign-images bucket (public read, authenticated upload)
CREATE POLICY "Campaign images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-images');

CREATE POLICY "Authenticated users can upload campaign images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own campaign images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own campaign images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for verification-documents bucket (private)
CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can upload verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own verification documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own verification documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);