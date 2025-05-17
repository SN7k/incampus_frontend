import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface EditProfileModalProps {
  onClose: () => void;
  onSave: (updatedProfile: {
    name: string;
    bio: string;
    avatar?: File;
    // Additional fields for comprehensive profile editing
    education?: string;
    program?: string;
    batch?: string;
    hometown?: string;
    phone?: string;
    email?: string;
    interests?: string[];
    achievements?: string[];
  }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Additional profile fields
  const [education, setEducation] = useState(user?.education || 'Brainware University');
  const [program, setProgram] = useState(user?.program || 'Computer Science');
  const [batch, setBatch] = useState(user?.batch || '2022-2026');
  const [hometown, setHometown] = useState('Kolkata, West Bengal');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'student@brainwareuniversity.ac.in');
  
  // Arrays for interests and achievements
  const [interests, setInterests] = useState<string[]>(['Programming', 'Machine Learning', 'Web Development', 'UI/UX Design', 'Photography']);
  const [newInterest, setNewInterest] = useState('');
  
  const [achievements, setAchievements] = useState<string[]>(["Dean's List 2023", 'Winner, University Hackathon 2024', 'Best Project Award, Computer Science Department']);
  const [newAchievement, setNewAchievement] = useState('');
  
  // Active section for accordion
  const [activeSection, setActiveSection] = useState<string>('basic');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile = {
      name,
      bio,
      education,
      program,
      batch,
      hometown,
      phone,
      email,
      interests,
      achievements,
      ...(avatarFile && { avatar: avatarFile })
    };
    
    onSave(updatedProfile);
  };
  
  // Handle adding a new interest
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  
  // Handle removing an interest
  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  // Handle adding a new achievement
  const handleAddAchievement = () => {
    if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };
  
  // Handle removing an achievement
  const handleRemoveAchievement = (achievement: string) => {
    setAchievements(achievements.filter(a => a !== achievement));
  };
  
  // Toggle accordion section
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Basic Information Section */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button 
              type="button" 
              className={`w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 ${activeSection === 'basic' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => toggleSection('basic')}
            >
              Basic Information
              <span className="text-gray-500">{activeSection === 'basic' ? '−' : '+'}</span>
            </button>
            
            {activeSection === 'basic' && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <img
                      src={avatarPreview || user?.avatar}
                      alt={user?.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-100 dark:border-blue-800"
                    />
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-blue-800 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-md"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Click the camera icon to change your profile picture
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button 
              type="button" 
              className={`w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 ${activeSection === 'education' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => toggleSection('education')}
            >
              Education
              <span className="text-gray-500">{activeSection === 'education' ? '−' : '+'}</span>
            </button>
            
            {activeSection === 'education' && (
              <div className="mt-4 space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    University/College
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your educational institution"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Program/Department
                  </label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your program or department"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your batch (e.g., 2022-2026)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button 
              type="button" 
              className={`w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 ${activeSection === 'contact' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => toggleSection('contact')}
            >
              Contact Information
              <span className="text-gray-500">{activeSection === 'contact' ? '−' : '+'}</span>
            </button>
            
            {activeSection === 'contact' && (
              <div className="mt-4 space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your email address"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your phone number"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hometown
                  </label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your hometown"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interests Section */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button 
              type="button" 
              className={`w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 ${activeSection === 'interests' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => toggleSection('interests')}
            >
              Interests
              <span className="text-gray-500">{activeSection === 'interests' ? '−' : '+'}</span>
            </button>
            
            {activeSection === 'interests' && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {interests.map((interest, index) => (
                    <div 
                      key={index} 
                      className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full flex items-center"
                    >
                      <span>{interest}</span>
                      <button 
                        type="button" 
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        onClick={() => handleRemoveInterest(interest)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add a new interest"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                  />
                  <button
                    type="button"
                    className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all"
                    onClick={handleAddInterest}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button 
              type="button" 
              className={`w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 ${activeSection === 'achievements' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => toggleSection('achievements')}
            >
              Achievements
              <span className="text-gray-500">{activeSection === 'achievements' ? '−' : '+'}</span>
            </button>
            
            {activeSection === 'achievements' && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2 mb-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                    >
                      <span className="text-gray-800 dark:text-gray-200">{achievement}</span>
                      <button 
                        type="button" 
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleRemoveAchievement(achievement)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add a new achievement"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                  />
                  <button
                    type="button"
                    className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all"
                    onClick={handleAddAchievement}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save All Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditProfileModal;
