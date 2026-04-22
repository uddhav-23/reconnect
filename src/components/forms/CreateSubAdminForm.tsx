import React, { useMemo, useState } from 'react';
import { Shield, UserCircle, Mail, Phone, KeyRound } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { FormModalShell, FormSection } from './FormModalShell';
import type { College } from '../../types';

interface CreateSubAdminFormProps {
  college: College;
  onClose: () => void;
  onSubmit: (payload: {
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    adminContactNumber: string;
  }) => void;
}

const CreateSubAdminForm: React.FC<CreateSubAdminFormProps> = ({ college, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    adminName: college.adminName || '',
    adminEmail: college.adminEmail || '',
    adminPassword: college.adminPassword || '',
    adminContactNumber: college.adminContactNumber || '',
  });

  const domainHint = useMemo(() => {
    try {
      if (college.website) {
        const url = new URL(college.website.startsWith('http') ? college.website : `https://${college.website}`);
        return url.hostname.replace(/^www\./, '');
      }
    } catch {
      // ignore
    }

    if (college.contactEmail?.includes('@')) {
      return college.contactEmail.split('@')[1];
    }

    return null;
  }, [college]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.adminName || !formData.adminEmail || !formData.adminPassword || !formData.adminContactNumber) {
      alert('Please fill in all sub-admin details.');
      return;
    }

    if (domainHint && !formData.adminEmail.endsWith(`@${domainHint}`)) {
      alert(`Sub-admin email must end with @${domainHint}`);
      return;
    }

    onSubmit(formData);
  };

  return (
    <FormModalShell
      eyebrow="College"
      title="Assign sub-admin"
      subtitle={college.name}
      icon={Shield}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Primary contact" subtitle="Official director or delegated administrator." icon={UserCircle} tint="violet">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="Name"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              required
              placeholder="Director full name"
            />
            <Input
              label="Phone"
              name="adminContactNumber"
              value={formData.adminContactNumber}
              onChange={handleChange}
              required
              placeholder="+1 555 012 3456"
            />
          </div>
        </FormSection>

        <FormSection title="Email & access" subtitle="Domain must match the institution." icon={Mail} tint="cyan">
          <Input
            label="Official email"
            name="adminEmail"
            type="email"
            value={formData.adminEmail}
            onChange={handleChange}
            required
            placeholder={domainHint ? `name@${domainHint}` : 'user@college.edu'}
          />
          {domainHint && (
            <p className="text-xs text-[var(--muted)] -mt-2 mb-2">Use an address on @{domainHint}</p>
          )}
          <Input
            label="Initial password"
            name="adminPassword"
            type="password"
            value={formData.adminPassword}
            onChange={handleChange}
            required
            placeholder="Temporary password for first login"
          />
        </FormSection>

        <FormSection title="Security note" icon={KeyRound} tint="slate">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Share credentials through a secure channel. Ask them to change their password under account settings after first login.
          </p>
        </FormSection>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1 rounded-xl">
            Save credentials
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
};

export default CreateSubAdminForm;
