
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileUpload: React.FC<ProfileUploadProps> = ({
  currentAvatarUrl,
  onAvatarUpdate,
  size = 'md'
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarUpdate(data.publicUrl);

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50`}>
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <label htmlFor="avatar-upload">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </>
              )}
            </span>
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
          disabled={uploading}
        />
        <p className="text-xs text-gray-500 text-center">
          JPG, PNG or GIF (max 5MB)
        </p>
      </div>
    </div>
  );
};
