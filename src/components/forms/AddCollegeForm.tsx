import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface AddCollegeFormProps {
  onClose: () => void;
  onSubmit: (collegeData: any) => void;
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
      establishedYear: parseInt(formData.establishedYear),
      departments: formData.departments.split(',').map(dept => dept.trim()),
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="primary" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black font-mono uppercase text-black flex items-center gap-3">
              <Building2 size={24} />
              ADD NEW COLLEGE
            </h2>
            <Button variant="danger" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-[#00FF80] border-4 border-black p-4 transform -rotate-1">
              <h3 className="font-black font-mono text-lg text-black uppercase mb-4">
                BASIC INFORMATION
              </h3>
              <div className="space-y-4">
                <Input
                  label="COLLEGE NAME"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., College of Engineering"
                />
                
                <div>
                  <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                    DESCRIPTION
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                    placeholder="Brief description of the college..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ESTABLISHED YEAR"
                    name="establishedYear"
                    type="number"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 1970"
                  />
                  
                  <Input
                    label="WEBSITE"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://college.university.edu"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-[#0080FF] border-4 border-black p-4 transform rotate-1">
              <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                CONTACT INFORMATION
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="CONTACT EMAIL"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    placeholder="contact@college.edu"
                  />
                  
                  <Input
                    label="PHONE NUMBER"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>
            </div>

            {/* Departments */}
            <div className="bg-[#FF0080] border-4 border-black p-4 transform -rotate-1">
              <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                DEPARTMENTS
              </h3>
              <Input
                label="DEPARTMENTS (COMMA SEPARATED)"
                name="departments"
                value={formData.departments}
                onChange={handleChange}
                required
                placeholder="Computer Science, Electrical Engineering, Mechanical Engineering"
              />
            </div>

            {/* Admin Credentials */}
            <div className="bg-[#FF4444] border-4 border-black p-4 transform rotate-1">
              <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                ADMIN CREDENTIALS
              </h3>
              <div className="space-y-4">
                <Input
                  label="ADMIN NAME / DIRECTOR"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  placeholder="Full name of the college director"
                />
                <Input
                  label="ADMIN EMAIL"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="admin@college.edu"
                />
                <Input
                  label="ADMIN CONTACT NUMBER"
                  name="adminContactNumber"
                  value={formData.adminContactNumber}
                  onChange={handleChange}
                  required
                  placeholder="+1-555-0123"
                />
                
                <Input
                  label="ADMIN PASSWORD"
                  name="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  placeholder="Secure password for admin login"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="submit" variant="primary" className="flex-1">
                CREATE COLLEGE
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                CANCEL
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddCollegeForm;