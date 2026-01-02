'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onUploadComplete: (url: string) => void;
}

export default function AvatarUpload({ userId, currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setUploading(true);

    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('No file selected');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image to storage');
      }

      // Get public URL with cache busting
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error('Failed to update profile in database');
      }

      // Update local state
      setPreviewUrl(avatarUrl);
      
      // Notify parent component
      onUploadComplete(avatarUrl);
      
      // Dispatch event for header
      window.dispatchEvent(new Event('avatar-updated'));
      
      alert('Profile picture updated successfully!');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      alert(`Error: ${errorMessage}`);
    } finally {
      // ALWAYS reset uploading state
      setUploading(false);
      
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gold-100 border-4 border-gold-300">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Avatar"
              width={128}
              height={128}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gold-600">
              {userId.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <label className={uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}>
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
        <div className="px-6 py-2 bg-gold-600 text-white rounded-lg font-serif font-bold hover:bg-gold-700 transition-colors">
          {uploading ? 'Uploading...' : 'Change Photo'}
        </div>
      </label>

      <p className="text-sm text-dark-secondary">
        JPG, PNG or GIF. Max 5MB.
      </p>
    </div>
  );
}