import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface ProfileUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileUpload: React.FC<ProfileUploadProps> = ({
  currentAvatarUrl,
  onAvatarUpdate,
  size = 'md',
  className = ''
}) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });

      onAvatarUpdate?.(publicUrl);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      setPreviewUrl(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      setIsUploading(true);

      // Remove from profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onAvatarUpdate?.('');

      toast({
        title: "Success",
        description: "Profile picture removed.",
      });

    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className={`${sizeClasses[size]} relative group`}>
        <AvatarImage 
          src={previewUrl || undefined} 
          alt="Profile picture"
          className="object-cover"
        />
        <AvatarFallback className="bg-slate-700 text-white">
          <User className="h-1/2 w-1/2" />
        </AvatarFallback>
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="text-white hover:text-white hover:bg-white/20"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Avatar>

      {/* Action buttons */}
      <div className="flex justify-center mt-2 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          {previewUrl ? 'Change' : 'Upload'}
        </Button>
        
        {previewUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="text-xs text-red-500 hover:text-red-600"
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}; 