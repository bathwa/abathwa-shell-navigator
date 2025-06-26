
import { User, Mail, Briefcase, Edit, Save } from 'lucide-react'
import { useState } from 'react'
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout'
import { useAuthStore } from '@/store/authStore'

const Profile = () => {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    company: '',
    bio: '',
    location: '',
    phone: ''
  })

  const handleSave = () => {
    console.log('Saving profile:', profileData)
    setIsEditing(false)
    // In real app, this would update Supabase
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Edit className="mr-2" size={20} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Save className="mr-2" size={20} />
              Save Changes
            </button>
          )}
        </div>

        <div className="bg-slate-800 rounded-lg p-8 space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
              <p className="text-slate-400 capitalize">{profileData.role}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg">
                  <User className="text-slate-400" size={20} />
                  <span className="text-white">{profileData.name}</span>
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
                <input
                  type="text"
                  name="company"
                  value={profileData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tell us about yourself and your background..."
              />
            ) : (
              <div className="p-3 bg-slate-700 rounded-lg">
                <span className="text-white">{profileData.bio || 'No bio provided'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
          <div className="space-y-4">
            <button className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors">
              Change Password
            </button>
            <button className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors">
              Email Preferences
            </button>
            <button className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors">
              Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default Profile
