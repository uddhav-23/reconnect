import React, { useState } from 'react';
import { GraduationCap, User, Briefcase, Award, Plus, Trash2, Share2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { FormModalShell, FormSection, selectClassName } from './FormModalShell';
import type { Alumni, Achievement } from '../../types';

interface EditAlumniFormProps {
  onClose: () => void;
  onSubmit: (alumniId: string, alumniData: Partial<Alumni>) => void;
  alumni: Alumni;
}

const EditAlumniForm: React.FC<EditAlumniFormProps> = ({ onClose, onSubmit, alumni }) => {
  const [formData, setFormData] = useState({
    name: alumni.name || '',
    email: alumni.email || '',
    phone: alumni.phone || '',
    address: alumni.address || '',
    graduationYear: alumni.graduationYear?.toString() || '',
    degree: alumni.degree || '',
    department: alumni.department || '',
    currentCompany: alumni.currentCompany || '',
    currentPosition: alumni.currentPosition || '',
    location: alumni.location || '',
    bio: alumni.bio || '',
    skills: alumni.skills?.join(', ') || '',
    linkedin: alumni.socialLinks?.linkedin || '',
    github: alumni.socialLinks?.github || '',
    twitter: alumni.socialLinks?.twitter || '',
    instagram: alumni.socialLinks?.instagram || '',
    personal: alumni.socialLinks?.personal || '',
  });

  const [achievements, setAchievements] = useState<Achievement[]>(alumni.achievements || []);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'professional' as Achievement['category'],
  });

  const handleAddAchievement = () => {
    if (!newAchievement.title || !newAchievement.description) {
      alert('Please fill in title and description');
      return;
    }

    const achievement: Achievement = {
      id: Date.now().toString(),
      ...newAchievement,
      date: newAchievement.date,
      userId: alumni.id,
    };

    setAchievements([...achievements, achievement]);
    setNewAchievement({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'professional',
    });
    setShowAddAchievement(false);
  };

  const handleRemoveAchievement = (id: string) => {
    setAchievements(achievements.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const alumniData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      graduationYear: parseInt(formData.graduationYear, 10),
      degree: formData.degree,
      department: formData.department,
      currentCompany: formData.currentCompany,
      currentPosition: formData.currentPosition,
      location: formData.location,
      bio: formData.bio,
      skills: formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      socialLinks: {
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        instagram: formData.instagram,
        personal: formData.personal,
      },
      achievements,
    };

    onSubmit(alumni.id, alumniData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <FormModalShell
      eyebrow="Directory"
      title="Edit alumni"
      subtitle={alumni.name}
      icon={GraduationCap}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Personal" subtitle="Contact details shown per privacy settings." icon={User} tint="violet">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="Full name" name="name" value={formData.name} onChange={handleChange} required placeholder="Name" />
            <Input label="Email" name="email" type="email" value={formData.email} disabled placeholder="Locked" />
            <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 …" />
          </div>
          <div>
            <label htmlFor="edit-alumni-addr" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Address
            </label>
            <textarea
              id="edit-alumni-addr"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="app-textarea min-h-[72px]"
              placeholder="Address…"
            />
          </div>
        </FormSection>

        <FormSection title="Academic" icon={GraduationCap} tint="cyan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Input
              label="Graduation year"
              name="graduationYear"
              type="number"
              value={formData.graduationYear}
              onChange={handleChange}
              required
              placeholder="2024"
            />
            <Input label="Degree" name="degree" value={formData.degree} onChange={handleChange} required placeholder="Degree" />
            <Input label="Department" name="department" value={formData.department} onChange={handleChange} required placeholder="Dept" />
          </div>
        </FormSection>

        <FormSection title="Professional" icon={Briefcase} tint="amber">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="Company" name="currentCompany" value={formData.currentCompany} onChange={handleChange} placeholder="Company" />
            <Input label="Role" name="currentPosition" value={formData.currentPosition} onChange={handleChange} placeholder="Title" />
            <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City" />
            <Input
              label="Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Skills…"
            />
          </div>
          <div>
            <label htmlFor="edit-alumni-bio" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Bio
            </label>
            <textarea
              id="edit-alumni-bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="app-textarea min-h-[88px]"
              placeholder="Bio…"
            />
          </div>
        </FormSection>

        <FormSection title="Social links" icon={Share2} tint="rose">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="LinkedIn" name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} />
            <Input label="GitHub" name="github" type="url" value={formData.github} onChange={handleChange} />
            <Input label="Twitter / X" name="twitter" type="url" value={formData.twitter} onChange={handleChange} />
            <Input label="Instagram" name="instagram" type="url" value={formData.instagram} onChange={handleChange} />
            <Input label="Website" name="personal" type="url" value={formData.personal} onChange={handleChange} className="md:col-span-2" />
          </div>
        </FormSection>

        <FormSection title="Achievements" subtitle="Highlights that appear on the profile." icon={Award} tint="cyan">
          <div className="flex justify-end mb-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowAddAchievement(!showAddAchievement)}
              className="rounded-xl gap-2"
            >
              <Plus size={16} />
              {showAddAchievement ? 'Close' : 'Add achievement'}
            </Button>
          </div>

          {showAddAchievement && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-4 mb-4 space-y-3">
              <Input
                label="Title"
                name="title"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                placeholder="Title"
              />
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  rows={2}
                  className="app-textarea min-h-[72px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                />
                <div>
                  <label htmlFor="ach-cat" className="block text-sm font-medium text-[var(--muted)] mb-1">
                    Category
                  </label>
                  <select
                    id="ach-cat"
                    value={newAchievement.category}
                    onChange={(e) =>
                      setNewAchievement({ ...newAchievement, category: e.target.value as Achievement['category'] })
                    }
                    className={selectClassName}
                  >
                    <option value="academic">Academic</option>
                    <option value="professional">Professional</option>
                    <option value="personal">Personal</option>
                    <option value="community">Community</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="primary" size="sm" onClick={handleAddAchievement} className="flex-1 rounded-xl">
                  Add
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddAchievement(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {achievements.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-6">No achievements yet.</p>
            ) : (
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--fg)] text-sm">{achievement.title}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{achievement.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="app-tag">{achievement.category}</span>
                      <span className="text-xs text-[var(--muted)]">{new Date(achievement.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveAchievement(achievement.id)}
                    className="shrink-0 rounded-xl"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </FormSection>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1 rounded-xl">
            Save changes
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
};

export default EditAlumniForm;
