import React, { useState } from 'react';
import { UserPlus, Lock, Building2, GraduationCap } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { FormModalShell, FormSection, selectClassName } from './FormModalShell';

interface CreateUserFormProps {
  onClose: () => void;
  onSubmit: (userData: Record<string, unknown>) => void | Promise<void>;
  userRole: 'superadmin' | 'subadmin' | 'alumni' | 'student' | 'user';
  colleges?: Array<{ id: string; name: string }>;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onClose, onSubmit, userRole, colleges = [] }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    demoPassword: '',
    confirmPassword: '',
    phone: '',
    collegeId: '',
    graduationYear: '',
    degree: '',
    department: '',
    currentCompany: '',
    currentPosition: '',
    location: '',
    currentYear: '',
    rollNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    if (!name) {
      alert('Please enter the full name.');
      return;
    }
    if (!email) {
      alert('Please enter an email address.');
      return;
    }

    if (formData.demoPassword !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (formData.demoPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if ((userRole === 'subadmin' || userRole === 'alumni') && !formData.collegeId) {
      alert(
        userRole === 'subadmin'
          ? 'Please select which college this sub-admin is responsible for.'
          : 'Please select a college for the alumni.'
      );
      return;
    }

    if (userRole === 'alumni') {
      if (colleges.length === 0) {
        alert('Add at least one college on this dashboard before creating alumni.');
        return;
      }
      const gy = formData.graduationYear.trim();
      if (!gy || !/^\d{4}$/.test(gy)) {
        alert('Please enter a valid 4-digit graduation year (e.g. 2024).');
        return;
      }
      const y = parseInt(gy, 10);
      if (y < 1950 || y > new Date().getFullYear() + 10) {
        alert(`Graduation year must be between 1950 and ${new Date().getFullYear() + 10}.`);
        return;
      }
      if (!formData.degree.trim()) {
        alert('Please enter a degree (e.g. B.Tech).');
        return;
      }
      if (!formData.department.trim()) {
        alert('Please enter a department (e.g. Computer Science).');
        return;
      }
    }

    if (userRole === 'subadmin' && colleges.length === 0) {
      alert('Add at least one college in Firestore (or use “Add college” on this dashboard) before creating a sub-admin.');
      return;
    }

    const userData = {
      name,
      email,
      password: formData.demoPassword,
      role: userRole,
      phone: formData.phone || undefined,
      ...(userRole === 'subadmin' && { collegeId: formData.collegeId }),
      ...(userRole === 'alumni' && {
        collegeId: formData.collegeId,
        graduationYear: parseInt(formData.graduationYear.trim(), 10),
        degree: formData.degree.trim(),
        department: formData.department.trim(),
        currentCompany: formData.currentCompany.trim() || undefined,
        currentPosition: formData.currentPosition.trim() || undefined,
        location: formData.location.trim() || undefined,
      }),
      ...(userRole === 'student' && {
        currentYear: formData.currentYear ? parseInt(formData.currentYear, 10) : undefined,
        rollNumber: formData.rollNumber,
      }),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(userData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const roleTitle =
    userRole === 'superadmin'
      ? 'Super admin'
      : userRole === 'subadmin'
        ? 'Sub-admin'
        : userRole === 'alumni'
          ? 'Alumni'
          : userRole === 'student'
            ? 'Student'
            : 'User';

  const roleEyebrow =
    userRole === 'superadmin'
      ? 'Platform'
      : userRole === 'subadmin'
        ? 'College scope'
        : userRole === 'alumni'
          ? 'Directory'
          : userRole === 'student'
            ? 'Student body'
            : 'Account';

  return (
    <FormModalShell
      eyebrow={roleEyebrow}
      title={`Create ${roleTitle.toLowerCase()}`}
      subtitle="Issue credentials they can use on first sign-in."
      icon={UserPlus}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Identity" subtitle="Legal name and contact email." icon={UserPlus} tint="violet">
          <Input label="Full name" name="name" value={formData.name} onChange={handleChange} required placeholder="Jordan Lee" />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="user@example.com"
          />
          <Input
            label="Phone (optional)"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 555 012 3456"
          />
        </FormSection>

        <FormSection title="Login credentials" subtitle="Minimum six characters; share through a secure channel." icon={Lock} tint="rose">
          <Input
            label="Password"
            name="demoPassword"
            type="password"
            value={formData.demoPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
            minLength={6}
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Repeat password"
            minLength={6}
          />
        </FormSection>

        {userRole === 'subadmin' && (
          <FormSection title="College assignment" subtitle="Each sub-admin is scoped to one college." icon={Building2} tint="cyan">
            <div>
              <label htmlFor="collegeId" className="block text-sm font-medium text-[var(--muted)] mb-1">
                College
              </label>
              <select
                id="collegeId"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                <option value="">Select a college…</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
              {colleges.length === 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">Add a college first, then assign a sub-admin.</p>
              )}
            </div>
          </FormSection>
        )}

        {userRole === 'alumni' && (
          <FormSection
            title="Alumni profile"
            subtitle="Academic and career fields used in the directory."
            icon={GraduationCap}
            tint="cyan"
          >
            <div>
              <label htmlFor="alumni-college" className="block text-sm font-medium text-[var(--muted)] mb-1">
                College
              </label>
              <select
                id="alumni-college"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                <option value="">Select a college…</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
              {colleges.length === 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">Create a college before onboarding alumni.</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Input label="Graduation year" name="graduationYear" type="number" value={formData.graduationYear} onChange={handleChange} placeholder="2024" />
              <Input label="Degree" name="degree" value={formData.degree} onChange={handleChange} placeholder="B.Tech" />
              <Input label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="Computer Science" />
              <Input label="Current company" name="currentCompany" value={formData.currentCompany} onChange={handleChange} placeholder="Acme Inc." />
              <Input label="Role / title" name="currentPosition" value={formData.currentPosition} onChange={handleChange} placeholder="Software engineer" />
              <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
            </div>
          </FormSection>
        )}

        {userRole === 'student' && (
          <FormSection title="Student record" subtitle="Enrollment details." icon={GraduationCap} tint="amber">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Input label="Current year" name="currentYear" type="number" value={formData.currentYear} onChange={handleChange} placeholder="2" />
              <Input label="Roll number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="CS2024001" />
            </div>
          </FormSection>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1 rounded-xl">
            {isSubmitting ? 'Creating…' : `Create ${roleTitle}`}
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
};

export default CreateUserForm;
