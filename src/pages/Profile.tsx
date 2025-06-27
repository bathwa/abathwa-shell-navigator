import { User, Mail, Briefcase, Edit, Save, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout'
import { useAuthStore } from '@/store/authStore'
import { ProfileUpload } from '@/components/ui/profile-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

const Profile = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    bio: '',
    location: '',
    phone: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setProfileData({
          name: data.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          role: data.role || user.user_metadata?.role || '',
          company: data.profile_data_jsonb?.company || '',
          bio: data.profile_data_jsonb?.bio || '',
          location: data.profile_data_jsonb?.location || '',
          phone: data.profile_data_jsonb?.phone || '',
          avatar_url: data.avatar_url || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      const profileUpdate = {
        full_name: profileData.name,
        profile_data_jsonb: {
          company: profileData.company,
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone
        },
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarUpdate = (url: string) => {
    setProfileData(prev => ({
      ...prev,
      avatar_url: url
    }))
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Edit className="mr-2" size={20} />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                <Save className="mr-2" size={20} />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ProfileUpload
                currentAvatarUrl={profileData.avatar_url}
                onAvatarUpdate={handleAvatarUpdate}
                size="lg"
              />
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg">
                      <User className="text-slate-400" size={20} />
                      <span className="text-white">{profileData.name || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg">
                    <Mail className="text-slate-400" size={20} />
                    <span className="text-white">{profileData.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg">
                    <Briefcase className="text-slate-400" size={20} />
                    <span className="text-white capitalize">{profileData.role}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="company"
                      value={profileData.company}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Your company name"
                    />
                  ) : (
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <span className="text-white">{profileData.company || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="City, Country"
                    />
                  ) : (
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <span className="text-white">{profileData.location || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <span className="text-white">{profileData.phone || 'Not specified'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full"
                    placeholder="Tell us about yourself and your background..."
                  />
                ) : (
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <span className="text-white">{profileData.bio || 'No bio provided'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Email Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}

export default Profile
