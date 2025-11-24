import React, { useState } from 'react';
import { X, GraduationCap, User, Briefcase } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface AddAlumniFormProps {
  onClose: () => void;
  onSubmit: (alumniData: any) => void;
  collegeId: string;
  universityId: string;
}

const AddAlumniForm: React.FC<AddAlumniFormProps> = ({ onClose, onSubmit, collegeId, universityId }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    
    // Academic Information
    graduationYear: '',
    degree: '',
    department: '',
    
    // Professional Information
    currentCompany: '',
    currentPosition: '',
    location: '',
    bio: '',
    skills: '',
    
    // Social Links
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
      graduationYear: parseInt(formData.graduationYear),
      skills: formData.skills.split(',').map(skill => skill.trim()),
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="primary" className="transform -rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black font-mono uppercase text-black flex items-center gap-3">
              <GraduationCap size={24} />
              ADD NEW ALUMNI
            </h2>
            <Button variant="danger" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-[#00FF80] border-4 border-black p-4 transform rotate-1">
              <h3 className="font-black font-mono text-lg text-black uppercase mb-4 flex items-center gap-2">
                <User size={20} />
                PERSONAL INFORMATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="john.doe@email.com"
                />
                
                <Input
                  label="DEMO PASSWORD (For User Login)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters - will be assigned to user"
                  minLength={6}
                />
                <p className="font-mono text-xs text-gray-600 -mt-2">
                  This password will be assigned to the alumni for login
                </p>
                
                <Input
                  label="PHONE NUMBER"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0123"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                  ADDRESS
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                  placeholder="Full address..."
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-[#0080FF] border-4 border-black p-4 transform -rotate-1">
              <h3 className="font-black font-mono text-lg text-white uppercase mb-4 flex items-center gap-2">
                <GraduationCap size={20} />
                ACADEMIC INFORMATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="GRADUATION YEAR"
                  name="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                  placeholder="2020"
                />
                
                <Input
                  label="DEGREE"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  required
                  placeholder="Bachelor of Technology"
                />
                
                <Input
                  label="DEPARTMENT"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  placeholder="Computer Science"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-[#FF0080] border-4 border-black p-4 transform rotate-1">
              <h3 className="font-black font-mono text-lg text-white uppercase mb-4 flex items-center gap-2">
                <Briefcase size={20} />
                PROFESSIONAL INFORMATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                
                <Input
                  label="SKILLS (COMMA SEPARATED)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="JavaScript, Python, React"
                />
              </div>
              
              <div>
                <label className="block text-white font-bold mb-2 font-mono uppercase tracking-wide">
                  BIO
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                  placeholder="Brief professional bio..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-[#FF4444] border-4 border-black p-4 transform -rotate-1">
              <h3 className="font-black font-mono text-lg text-white uppercase mb-4">
                SOCIAL LINKS (OPTIONAL)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="LINKEDIN"
                  name="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/johndoe"
                />
                
                <Input
                  label="GITHUB"
                  name="github"
                  type="url"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/johndoe"
                />
                
                <Input
                  label="TWITTER"
                  name="twitter"
                  type="url"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/johndoe"
                />
                
                <Input
                  label="INSTAGRAM"
                  name="instagram"
                  type="url"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/johndoe"
                />
                
                <Input
                  label="PERSONAL WEBSITE"
                  name="personal"
                  type="url"
                  value={formData.personal}
                  onChange={handleChange}
                  placeholder="https://johndoe.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="submit" variant="primary" className="flex-1">
                CREATE ALUMNI PROFILE
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

export default AddAlumniForm;