import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { 
  School, 
  MapPin, 
  BookOpen, 
  Calendar, 
  Mail, 
  Phone, 
  Award
} from 'lucide-react';

interface AboutViewProps {
  displayUser: User;
  isCurrentUserProfile: boolean;
}

const AboutView: React.FC<AboutViewProps> = ({ displayUser }) => {
  
  // Mock additional user data
  const additionalInfo = {
    phone: '+91 98765 43210',
    email: displayUser.email || 'student@brainwareuniversity.ac.in',
    joinDate: 'August 2022',
    hometown: 'Kolkata, West Bengal',
    interests: ['Programming', 'Machine Learning', 'Web Development', 'UI/UX Design', 'Photography'],
    achievements: [
      'Dean\'s List 2023',
      'Winner, University Hackathon 2024',
      'Best Project Award, Computer Science Department'
    ]
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  
  // No longer need edit functionality as it's handled in the main EditProfileModal
  
  return (
    <motion.div 
      className="py-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Overview Section */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
        variants={item}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Overview</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <School className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Education</h4>
              <p className="text-gray-600 dark:text-gray-400">{displayUser.role === 'student' ? 'Student' : 'Faculty'} at Brainware University</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">{displayUser.program || 'Computer Science'}</p>
              {displayUser.role === 'student' && displayUser.batch && (
                <p className="text-gray-500 dark:text-gray-500 text-sm">Batch: {displayUser.batch}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Current Location</h4>
              <p className="text-gray-600 dark:text-gray-400">University Campus</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">Barasat, West Bengal</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Hometown</h4>
              <p className="text-gray-600 dark:text-gray-400">{additionalInfo.hometown}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Joined InCampus</h4>
              <p className="text-gray-600 dark:text-gray-400">{additionalInfo.joinDate}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Contact Information */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
        variants={item}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Contact Information</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Email</h4>
              <p className="text-gray-600 dark:text-gray-400">{additionalInfo.email}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Phone</h4>
              <p className="text-gray-600 dark:text-gray-400">{additionalInfo.phone}</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">Only visible to friends</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <School className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">University ID</h4>
              <p className="text-gray-600 dark:text-gray-400">{displayUser.universityId}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Bio Section */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
        variants={item}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Bio</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <p className="text-gray-600 dark:text-gray-400">{displayUser.bio || 'No bio available'}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Interests Section */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
        variants={item}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Interests</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {additionalInfo.interests.map((interest, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </motion.div>
      
      {/* Achievements Section */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
        variants={item}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Achievements</h3>
        </div>
        
        <div className="space-y-3">
          {additionalInfo.achievements.map((achievement, index) => (
            <div key={index} className="flex items-start">
              <Award className="w-5 h-5 text-amber-500 mt-0.5 mr-3" />
              <p className="text-gray-600 dark:text-gray-400">{achievement}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutView;
