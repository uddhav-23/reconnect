import React, { useState } from 'react';
import { X, UserPlus, Lock, Building2, GraduationCap } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface CreateUserFormProps {
  onClose: () => void;
  onSubmit: (userData: any) => void;
  userRole: 'superadmin' | 'subadmin' | 'alumni' | 'student' | 'user';
  colleges?: Array<{ id: string; name: string }>;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onClose, onSubmit, userRole, colleges = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    demoPassword: '',
    confirmPassword: '',
    phone: '',
    // For subadmin and alumni
    collegeId: '',
    // For alumni
    graduationYear: '',
    degree: '',
    department: '',
    currentCompany: '',
    currentPosition: '',
    location: '',
    // For student
    currentYear: '',
    rollNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.demoPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.demoPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.demoPassword,
      role: userRole,
      phone: formData.phone || undefined,
      ...(userRole === 'subadmin' && { collegeId: formData.collegeId }),
      ...(userRole === 'alumni' && {
        collegeId: formData.collegeId,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        degree: formData.degree,
        department: formData.department,
        currentCompany: formData.currentCompany,
        currentPosition: formData.currentPosition,
        location: formData.location,
      }),
      ...(userRole === 'student' && {
        currentYear: formData.currentYear ? parseInt(formData.currentYear) : undefined,
        rollNumber: formData.rollNumber,
      }),
    };
    
    onSubmit(userData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'superadmin': return 'SUPER ADMIN';
      case 'subadmin': return 'SUB-ADMIN';
      case 'alumni': return 'ALUMNI';
      case 'student': return 'STUDENT';
      default: return 'USER';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="primary" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black font-mono uppercase text-black flex items-center gap-3">
              <UserPlus size={24} />
              CREATE {getRoleTitle()}
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
                  label="FULL NAME"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
                
                <Input
                  label="EMAIL ADDRESS"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="user@example.com"
                />
                
                <Input
                  label="PHONE NUMBER (OPTIONAL)"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-[#FF0080] border-4 border-black p-4 transform rotate-1">
              <h3 className="font-black font-mono text-lg text-white uppercase mb-4 flex items-center gap-2">
                <Lock size={20} />
                DEMO LOGIN CREDENTIALS
              </h3>
              <p className="font-mono text-sm text-white mb-4">
                These credentials will be assigned to the user for login.
              </p>
              <div className="space-y-4">
                <Input
                  label="DEMO PASSWORD"
                  name="demoPassword"
                  type="password"
                  value={formData.demoPassword}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
                
                <Input
                  label="CONFIRM PASSWORD"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  minLength={6}
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {userRole === 'subadmin' && (
              <div className="bg-[#FF0080] border-4 border-black p-4 transform rotate-1">
                <h3 className="font-black font-mono text-lg text-white uppercase mb-4 flex items-center gap-2">
                  <Building2 size={20} />
                  SUB-ADMIN INFORMATION
                </h3>
                <div>
                  <label className="block text-white font-bold mb-2 font-mono uppercase tracking-wide">
                    ASSIGN TO COLLEGE *
                  </label>
                  <select
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                  >
                    <option value="">Select a college...</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                  {colleges.length === 0 && (
                    <p className="font-mono text-xs text-white mt-2">
                      No colleges available. Please create a college first.
                    </p>
                  )}
                </div>
              </div>
            )}

            {userRole === 'alumni' && (
              <div className="bg-[#0080FF] border-4 border-black p-4 transform -rotate-1">
                <h3 className="font-black font-mono text-lg text-white uppercase mb-4 flex items-center gap-2">
                  <GraduationCap size={20} />
                  ALUMNI INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-white font-bold mb-2 font-mono uppercase tracking-wide">
                      ASSIGN TO COLLEGE *
                    </label>
                    <select
                      name="collegeId"
                      value={formData.collegeId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                    >
                      <option value="">Select a college...</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                    {colleges.length === 0 && (
                      <p className="font-mono text-xs text-white mt-2">
                        No colleges available. Please create a college first.
                      </p>
                    )}
                  </div>
                  
                  <Input
                    label="GRADUATION YEAR"
                    name="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="2020"
                  />
                  
                  <Input
                    label="DEGREE"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="Bachelor of Technology"
                  />
                  
                  <Input
                    label="DEPARTMENT"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Computer Science"
                  />
                  
                  <Input
                    label="CURRENT COMPANY"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleChange}
                    placeholder="Google"
                  />
                  
                  <Input
                    label="CURRENT POSITION"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                  />
                  
                  <Input
                    label="LOCATION"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            )}

            {userRole === 'student' && (
              <div className="bg-[#0080FF] border-4 border-black p-4 transform -rotate-1">
                <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                  STUDENT INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="CURRENT YEAR"
                    name="currentYear"
                    type="number"
                    value={formData.currentYear}
                    onChange={handleChange}
                    placeholder="3"
                  />
                  
                  <Input
                    label="ROLL NUMBER"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="CS2022001"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="submit" variant="primary" className="flex-1">
                CREATE {getRoleTitle()}
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

export default CreateUserForm;

