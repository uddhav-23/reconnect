import React, { useMemo, useState } from 'react';
import { X, Shield } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { College } from '../../types';

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
      // ignore invalid URL
    }

    if (college.contactEmail?.includes('@')) {
      return college.contactEmail.split('@')[1];
    }

    return null;
  }, [college]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-xl w-full">
        <Card variant="primary" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black font-mono uppercase text-black flex items-center gap-3">
                <Shield size={24} />
                ASSIGN SUB-ADMIN
              </h2>
              <p className="font-mono text-sm text-gray-600 uppercase mt-1">
                {college.name}
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="DIRECTOR / SUB-ADMIN NAME"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                required
                placeholder="Director full name"
              />
              <Input
                label="CONTACT NUMBER"
                name="adminContactNumber"
                value={formData.adminContactNumber}
                onChange={handleChange}
                required
                placeholder="+1-555-0123"
              />
            </div>

            <Input
              label="OFFICIAL EMAIL ID"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              placeholder={domainHint ? `user@${domainHint}` : 'user@college.edu'}
            />
            {domainHint && (
              <p className="font-mono text-xs text-gray-600 -mt-4">
                Email must use the college domain: @{domainHint}
              </p>
            )}

            <Input
              label="DEMO PASSWORD"
              name="adminPassword"
              type="text"
              value={formData.adminPassword}
              onChange={handleChange}
              required
              placeholder="Temporary password for first login"
            />

            <p className="font-mono text-xs text-gray-600">
              Share these credentials securely with the sub-admin. They should update their password after first login.
            </p>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" className="flex-1">
                Save Credentials
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateSubAdminForm;

