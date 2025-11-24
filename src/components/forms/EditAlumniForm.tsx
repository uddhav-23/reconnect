import React, { useState } from 'react';
import { X, GraduationCap, User, Briefcase, Award, Plus, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { Alumni, Achievement } from '../../types';

interface EditAlumniFormProps {
  onClose: () => void;
  onSubmit: (alumniId: string, alumniData: Partial<Alumni>) => void;
  alumni: Alumni;
}

const EditAlumniForm: React.FC<EditAlumniFormProps> = ({ onClose, onSubmit, alumni }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: alumni.name || '',
    email: alumni.email || '',
    phone: alumni.phone || '',
    address: alumni.address || '',
    
    // Academic Information
    graduationYear: alumni.graduationYear?.toString() || '',
    degree: alumni.degree || '',
    department: alumni.department || '',
    
    // Professional Information
    currentCompany: alumni.currentCompany || '',
    currentPosition: alumni.currentPosition || '',
    location: alumni.location || '',
    bio: alumni.bio || '',
    skills: alumni.skills?.join(', ') || '',
    
    // Social Links
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
    setAchievements(achievements.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alumniData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      graduationYear: parseInt(formData.graduationYear),
      degree: formData.degree,
      department: formData.department,
      currentCompany: formData.currentCompany,
      currentPosition: formData.currentPosition,
      location: formData.location,
      bio: formData.bio,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      socialLinks: {
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        instagram: formData.instagram,
        personal: formData.personal,
      },
      achievements: achievements,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="primary" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black font-mono uppercase text-black flex items-center gap-3">
              <User size={24} />
              EDIT ALUMNI PROFILE
            </h2>
            <Button variant="danger" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-[#00FF80] border-4 border-black p-4 transform -rotate-1">
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
                  disabled
                  placeholder="john.doe@email.com"
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
            <div className="bg-[#0080FF] border-4 border-black p-4 transform rotate-1">
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
            <div className="bg-[#FF0080] border-4 border-black p-4 transform -rotate-1">
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
            <div className="bg-[#FF4444] border-4 border-black p-4 transform rotate-1">
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

            {/* Achievements */}
            <div className="bg-[#0080FF] border-4 border-black p-4 transform -rotate-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black font-mono text-lg text-white uppercase flex items-center gap-2">
                  <Award size={20} />
                  ACHIEVEMENTS
                </h3>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setShowAddAchievement(!showAddAchievement)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  ADD ACHIEVEMENT
                </Button>
              </div>

              {/* Add Achievement Form */}
              {showAddAchievement && (
                <div className="bg-white border-4 border-black p-4 mb-4 transform rotate-1">
                  <div className="space-y-3">
                    <Input
                      label="TITLE"
                      name="title"
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                      placeholder="e.g., Best Employee of the Year"
                    />
                    <div>
                      <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                        DESCRIPTION
                      </label>
                      <textarea
                        value={newAchievement.description}
                        onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                        placeholder="Brief description of the achievement..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="DATE"
                        name="date"
                        type="date"
                        value={newAchievement.date}
                        onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                      />
                      <div>
                        <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide text-sm">
                          CATEGORY
                        </label>
                        <select
                          value={newAchievement.category}
                          onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value as Achievement['category'] })}
                          className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white text-black"
                        >
                          <option value="academic">Academic</option>
                          <option value="professional">Professional</option>
                          <option value="personal">Personal</option>
                          <option value="community">Community</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={handleAddAchievement} className="flex-1">
                        ADD
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setShowAddAchievement(false)} className="flex-1">
                        CANCEL
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Achievements */}
              <div className="space-y-3">
                {achievements.length === 0 ? (
                  <p className="font-mono text-white text-center py-4">No achievements added yet</p>
                ) : (
                  achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white border-4 border-black p-3 transform rotate-1 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold font-mono text-black uppercase text-sm mb-1">
                          {achievement.title}
                        </h4>
                        <p className="font-mono text-xs text-gray-700 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="bg-[#FF0080] text-white px-2 py-1 border-2 border-black font-mono text-xs font-bold uppercase">
                            {achievement.category}
                          </span>
                          <span className="font-mono text-xs text-gray-600">
                            {new Date(achievement.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleRemoveAchievement(achievement.id)}
                        className="ml-3"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="submit" variant="primary" className="flex-1">
                UPDATE ALUMNI PROFILE
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

export default EditAlumniForm;

