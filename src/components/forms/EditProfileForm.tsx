import React, { useState } from 'react';
import { User, Lock, Shield, GraduationCap, Share2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { FormModalShell, FormSection } from './FormModalShell';

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
    openToMentoring: (user as any)?.openToMentoring !== false,
    profilePrivate: (user as any)?.profileVisibility === 'private',
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
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        currentCompany: profileData.currentCompany,
        currentPosition: profileData.currentPosition,
        skills: profileData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        socialLinks: {
          linkedin: profileData.linkedin,
          github: profileData.github,
          twitter: profileData.twitter,
          personal: profileData.personal,
        },
        profileVisibility: profileData.profilePrivate ? ('private' as const) : ('public' as const),
        ...(user?.role === 'alumni' ? { openToMentoring: profileData.openToMentoring } : {}),
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
    <FormModalShell
      eyebrow="Account"
      title="Edit profile"
      subtitle={activeTab === 'profile' ? 'Update how you appear across Reconnect.' : 'Use a strong, unique password.'}
      icon={activeTab === 'profile' ? User : Lock}
      onClose={onClose}
    >
      <div className="flex gap-2 mb-6 p-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card)]'
          }`}
        >
          <User size={16} />
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'password'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card)]'
          }`}
        >
          <Lock size={16} />
          Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <FormSection title="Basics" subtitle="Core identity on your profile." icon={User} tint="violet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Input label="Full name" name="name" value={profileData.name} onChange={handleProfileChange} required />
              <Input label="Email" name="email" type="email" value={profileData.email} onChange={handleProfileChange} required />
              <Input label="Phone" name="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} />
              <Input label="Location" name="location" value={profileData.location} onChange={handleProfileChange} />
            </div>
          </FormSection>

          {(user?.role === 'alumni' || user?.role === 'student') && (
            <FormSection title="Professional" subtitle="Shown on cards and expanded profile." icon={Shield} tint="cyan">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Input label="Current company" name="currentCompany" value={profileData.currentCompany} onChange={handleProfileChange} />
                <Input label="Current role" name="currentPosition" value={profileData.currentPosition} onChange={handleProfileChange} />
                <Input
                  label="Skills (comma separated)"
                  name="skills"
                  value={profileData.skills}
                  onChange={handleProfileChange}
                  className="md:col-span-2"
                />
              </div>
              <div>
                <label htmlFor="edit-bio" className="block text-sm font-medium text-[var(--muted)] mb-1">
                  Bio
                </label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  rows={3}
                  className="app-textarea min-h-[88px]"
                />
              </div>
            </FormSection>
          )}

          <FormSection title="Privacy & visibility" subtitle="Control discovery and contact exposure." icon={Shield} tint="slate">
            <label className="flex items-start gap-3 cursor-pointer text-[var(--fg)] mb-4">
              <input
                type="checkbox"
                name="profilePrivate"
                checked={profileData.profilePrivate}
                onChange={(e) => setProfileData({ ...profileData, profilePrivate: e.target.checked })}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border)]"
              />
              <span className="text-sm leading-relaxed text-[var(--muted)]">
                <span className="font-medium text-[var(--fg)]">Private profile</span> — hide email, phone, address, and social links
                from people you are not connected with (accepted connection).
              </span>
            </label>
            {user?.role === 'alumni' && (
              <label className="flex items-start gap-3 cursor-pointer text-[var(--fg)]">
                <input
                  type="checkbox"
                  name="openToMentoring"
                  checked={profileData.openToMentoring}
                  onChange={(e) => setProfileData({ ...profileData, openToMentoring: e.target.checked })}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border)]"
                />
                <span className="text-sm leading-relaxed text-[var(--muted)] flex items-start gap-2">
                  <GraduationCap size={16} className="shrink-0 mt-0.5 text-violet-500" />
                  <span>
                    <span className="font-medium text-[var(--fg)]">Open to mentorship</span> — when off, you will not receive
                    mentorship requests and your profile shows &quot;Not ready for mentorship&quot;.
                  </span>
                </span>
              </label>
            )}
          </FormSection>

          <FormSection title="Social links" subtitle="Optional networking URLs." icon={Share2} tint="rose">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Input label="LinkedIn" name="linkedin" type="url" value={profileData.linkedin} onChange={handleProfileChange} />
              <Input label="GitHub" name="github" type="url" value={profileData.github} onChange={handleProfileChange} />
              <Input label="Twitter / X" name="twitter" type="url" value={profileData.twitter} onChange={handleProfileChange} />
              <Input label="Personal website" name="personal" type="url" value={profileData.personal} onChange={handleProfileChange} />
            </div>
          </FormSection>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 rounded-xl" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <FormSection title="Change password" subtitle="Enter your current password once and your new password twice." icon={Lock} tint="rose">
            <Input
              label="Current password"
              name="oldPassword"
              type="password"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </FormSection>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 rounded-xl" disabled={isLoading}>
              {isLoading ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </form>
      )}
    </FormModalShell>
  );
};

export default EditProfileForm;