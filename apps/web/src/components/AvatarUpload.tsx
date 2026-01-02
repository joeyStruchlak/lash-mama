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

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreviewUrl(avatarUrl);
      onUploadComplete(avatarUrl);
      alert('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
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
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gold-600">
              {userId.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
        <div className="px-6 py-2 bg-gold-600 text-white rounded-lg font-serif font-bold hover:bg-gold-700 transition-colors disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Change Photo'}
        </div>
      </label>

      <p className="text-sm text-dark-secondary">
        JPG, PNG or GIF. Max 5MB.
      </p>
    </div>
  );
}