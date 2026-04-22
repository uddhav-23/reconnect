import React, { useState } from 'react';
import { GraduationCap, User, Briefcase, Share2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { FormModalShell, FormSection } from './FormModalShell';

interface AddAlumniFormProps {
  onClose: () => void;
  onSubmit: (alumniData: Record<string, unknown>) => void;
  collegeId: string;
  universityId: string;
}

const AddAlumniForm: React.FC<AddAlumniFormProps> = ({ onClose, onSubmit, collegeId, universityId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    graduationYear: '',
    degree: '',
    department: '',
    currentCompany: '',
    currentPosition: '',
    location: '',
    bio: '',
    skills: '',
    linkedin: '',
    github: '',
    twitter: '',
    instagram: '',
    personal: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const alumniData = {
      ...formData,
      graduationYear: parseInt(formData.graduationYear, 10),
      skills: formData.skills.split(',').map((skill) => skill.trim()),
      socialLinks: {
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        instagram: formData.instagram,
        personal: formData.personal,
      },
      collegeId,
      universityId,
      role: 'alumni',
      connections: [],
      achievements: [],
      blogs: [],
      experience: [],
      education: [],
    };

    onSubmit(alumniData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <FormModalShell
      eyebrow="Directory"
      title="Add alumni"
      subtitle="Full profile with login credentials — appears in search once saved."
      icon={GraduationCap}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Personal" subtitle="Identity and initial password for sign-in." icon={User} tint="violet">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="Full name" name="name" value={formData.name} onChange={handleChange} required placeholder="Alex Rivera" />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="alex@email.com"
            />
            <Input
              label="Initial password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min. 6 characters"
              minLength={6}
            />
            <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 555 012 3456" />
          </div>
          <div>
            <label htmlFor="addr" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Address
            </label>
            <textarea
              id="addr"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="app-textarea min-h-[72px]"
              placeholder="City, region…"
            />
          </div>
        </FormSection>

        <FormSection title="Academic" subtitle="Degree metadata for discovery filters." icon={GraduationCap} tint="cyan">
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
            <Input label="Degree" name="degree" value={formData.degree} onChange={handleChange} required placeholder="B.Tech" />
            <Input label="Department" name="department" value={formData.department} onChange={handleChange} required placeholder="CS" />
          </div>
        </FormSection>

        <FormSection title="Professional" subtitle="Optional headline fields for cards and profile." icon={Briefcase} tint="amber">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="Company" name="currentCompany" value={formData.currentCompany} onChange={handleChange} placeholder="Company" />
            <Input label="Role" name="currentPosition" value={formData.currentPosition} onChange={handleChange} placeholder="Job title" />
            <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
            <Input
              label="Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="TypeScript, Cloud, Leadership"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Bio
            </label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} className="app-textarea min-h-[88px]" placeholder="Short professional bio…" />
          </div>
        </FormSection>

        <FormSection title="Social links" subtitle="Optional — helps networking." icon={Share2} tint="rose">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="LinkedIn" name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} placeholder="https://…" />
            <Input label="GitHub" name="github" type="url" value={formData.github} onChange={handleChange} placeholder="https://…" />
            <Input label="Twitter / X" name="twitter" type="url" value={formData.twitter} onChange={handleChange} placeholder="https://…" />
            <Input label="Instagram" name="instagram" type="url" value={formData.instagram} onChange={handleChange} placeholder="https://…" />
            <Input label="Website" name="personal" type="url" value={formData.personal} onChange={handleChange} placeholder="https://…" className="md:col-span-2" />
          </div>
        </FormSection>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1 rounded-xl">
            Create alumni profile
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
};

export default AddAlumniForm;
