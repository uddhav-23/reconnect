import React, { useState } from 'react';
import { X, User, Lock } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';

interface EditProfileFormProps {
  onClose: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    bio: (user as any)?.bio || '',
    location: (user as any)?.location || '',
    currentCompany: (user as any)?.currentCompany || '',
    currentPosition: (user as any)?.currentPosition || '',
    skills: (user as any)?.skills?.join(', ') || '',
    linkedin: (user as any)?.socialLinks?.linkedin || '',
    github: (user as any)?.socialLinks?.github || '',
    twitter: (user as any)?.socialLinks?.twitter || '',
    personal: (user as any)?.socialLinks?.personal || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedData = {
        ...profileData,
        skills: profileData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        socialLinks: {
          linkedin: profileData.linkedin,
          github: profileData.github,
          twitter: profileData.twitter,
          personal: profileData.personal,
        },
      };
      
      await updateProfile(updatedData);
      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      alert('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (error) {
      alert('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="primary" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black font-mono uppercase text-black">
              EDIT PROFILE
            </h2>
            <Button variant="danger" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'profile' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2"
            >
              <User size={16} />
              PROFILE
            </Button>
            <Button
              variant={activeTab === 'password' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('password')}
              className="flex items-center gap-2"
            >
              <Lock size={16} />
              PASSWORD
            </Button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-[#00FF80] border-4 border-black p-4 transform -rotate-1">
                <h3 className="font-black font-mono text-lg text-black uppercase mb-4">
                  BASIC INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="FULL NAME"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="EMAIL"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="PHONE"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="LOCATION"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              {/* Professional Information */}
              {(user?.role === 'alumni' || user?.role === 'student') && (
                <div className="bg-[#0080FF] border-4 border-black p-4 transform rotate-1">
                  <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                    PROFESSIONAL INFORMATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="CURRENT COMPANY"
                      name="currentCompany"
                      value={profileData.currentCompany}
                      onChange={handleProfileChange}
                    />
                    <Input
                      label="CURRENT POSITION"
                      name="currentPosition"
                      value={profileData.currentPosition}
                      onChange={handleProfileChange}
                    />
                    <Input
                      label="SKILLS (COMMA SEPARATED)"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleProfileChange}
                      className="md:col-span-2"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2 font-mono uppercase tracking-wide">
                      BIO
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      rows={3}
                      className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                    />
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="bg-[#FF0080] border-4 border-black p-4 transform -rotate-1">
                <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                  SOCIAL LINKS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="LINKEDIN"
                    name="linkedin"
                    type="url"
                    value={profileData.linkedin}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="GITHUB"
                    name="github"
                    type="url"
                    value={profileData.github}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="TWITTER"
                    name="twitter"
                    type="url"
                    value={profileData.twitter}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="PERSONAL WEBSITE"
                    name="personal"
                    type="url"
                    value={profileData.personal}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'UPDATING...' : 'UPDATE PROFILE'}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                  CANCEL
                </Button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="bg-[#FF4444] border-4 border-black p-4 transform rotate-1">
                <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                  CHANGE PASSWORD
                </h3>
                <div className="space-y-4">
                  <Input
                    label="CURRENT PASSWORD"
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Input
                    label="NEW PASSWORD"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Input
                    label="CONFIRM NEW PASSWORD"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'CHANGING...' : 'CHANGE PASSWORD'}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                  CANCEL
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EditProfileForm;