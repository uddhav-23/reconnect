import React, { useState } from 'react';
import { Building2, Landmark, Phone, Layers, Shield } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { FormModalShell, FormSection, selectClassName } from './FormModalShell';

interface AddCollegeFormProps {
  onClose: () => void;
  onSubmit: (collegeData: Record<string, unknown>) => void;
}

const AddCollegeForm: React.FC<AddCollegeFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    establishedYear: '',
    website: '',
    contactEmail: '',
    phone: '',
    departments: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminContactNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const websiteDomain = (() => {
      try {
        if (!formData.website) return null;
        const parsed = new URL(formData.website.startsWith('http') ? formData.website : `https://${formData.website}`);
        return parsed.hostname.replace(/^www\./, '');
      } catch {
        return null;
      }
    })();

    const fallbackEmailDomain = formData.contactEmail.split('@')[1];
    const requiredDomain = websiteDomain || fallbackEmailDomain;

    if (requiredDomain && !formData.adminEmail.endsWith(`@${requiredDomain}`)) {
      alert(`Admin email must use the college domain: @${requiredDomain}`);
      return;
    }

    const collegeData = {
      ...formData,
      establishedYear: parseInt(formData.establishedYear, 10),
      departments: formData.departments.split(',').map((dept) => dept.trim()),
    };

    onSubmit(collegeData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <FormModalShell
      eyebrow="Administration"
      title="Add college"
      subtitle="Create an institution record and provisional sub-admin credentials."
      icon={Building2}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="College profile" subtitle="Official name and public description." icon={Landmark} tint="violet">
          <Input
            label="College name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. College of Engineering"
          />
          <div>
            <label htmlFor="college-desc" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Description
            </label>
            <textarea
              id="college-desc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="app-textarea min-h-[100px]"
              placeholder="Brief description of the college…"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="Established year"
              name="establishedYear"
              type="number"
              value={formData.establishedYear}
              onChange={handleChange}
              required
              placeholder="1970"
            />
            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://college.university.edu"
            />
          </div>
        </FormSection>

        <FormSection title="Contact" subtitle="Primary channels for your institution." icon={Phone} tint="cyan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="Contact email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              placeholder="contact@college.edu"
            />
            <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 555 012 3456" />
          </div>
        </FormSection>

        <FormSection title="Departments" subtitle="Comma-separated list." icon={Layers} tint="amber">
          <Input
            label="Departments"
            name="departments"
            value={formData.departments}
            onChange={handleChange}
            required
            placeholder="Computer Science, Electrical Engineering, Mechanical Engineering"
          />
        </FormSection>

        <FormSection
          title="Sub-admin credentials"
          subtitle="Used for the first login; share securely and rotate after onboarding."
          icon={Shield}
          tint="rose"
        >
          <Input
            label="Director / admin name"
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            required
            placeholder="Full name"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="Admin email"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              placeholder="admin@college.edu"
            />
            <Input
              label="Admin phone"
              name="adminContactNumber"
              value={formData.adminContactNumber}
              onChange={handleChange}
              required
              placeholder="+1 555 012 3456"
            />
          </div>
          <Input
            label="Initial password"
            name="adminPassword"
            type="password"
            value={formData.adminPassword}
            onChange={handleChange}
            required
            placeholder="Strong temporary password"
          />
        </FormSection>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1 rounded-xl">
            Create college
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
};

export default AddCollegeForm;
