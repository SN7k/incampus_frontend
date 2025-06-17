import API from './api';
import { ProfileData } from '../types/profile';

/**
 * Get the profile data for the current user
 * @returns Profile data for the current user
 */
export const getMyProfile = async (): Promise<ProfileData> => {
  const response = await API.get<{ data: ProfileData }>('/profile/me');
  return response.data.data;
};

/**
 * Get the profile data for a specific user
 * @param userId The ID of the user to get profile data for
 * @returns Profile data for the specified user
 */
export const getUserProfile = async (userId: string): Promise<ProfileData> => {
  const response = await API.get<{ data: ProfileData }>(`/profile/${userId}`);
  return response.data.data;
};

/**
 * Update the current user's profile
 * @param profileData The updated profile data
 * @returns The updated profile data
 */
export const updateProfile = async (profileData: Partial<ProfileData>): Promise<ProfileData> => {
  const response = await API.patch<{ data: ProfileData }>('/profile', profileData);
  return response.data.data;
};

/**
 * Upload a profile picture
 * @param file The image file to upload
 * @returns The updated profile data with the new avatar URL
 */
export const uploadProfilePicture = async (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await API.post<{ data: { avatarUrl: string } }>('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

/**
 * Upload a cover photo
 * @param file The image file to upload
 * @returns The updated profile data with the new cover photo URL
 */
export const uploadCoverPhoto = async (file: File): Promise<{ coverPhotoUrl: string }> => {
  const formData = new FormData();
  formData.append('coverPhoto', file);
  
  const response = await API.post<{ data: { coverPhoto: { url: string } } }>('/profile/cover', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return { coverPhotoUrl: response.data.data.coverPhoto.url };
};

/**
 * Update user education information
 * @param educationData The education data to update
 * @returns The updated profile data
 */
export const updateEducation = async (educationData: any): Promise<ProfileData> => {
  const response = await API.put<{ data: ProfileData }>('/profile/education', educationData);
  return response.data.data;
};

/**
 * Update user experience information
 * @param experienceData The experience data to update
 * @returns The updated profile data
 */
export const updateExperience = async (experienceData: any): Promise<ProfileData> => {
  const response = await API.put<{ data: ProfileData }>('/profile/experience', experienceData);
  return response.data.data;
};

/**
 * Update user skills
 * @param skills Array of skills to update
 * @returns The updated profile data
 */
export const updateSkills = async (skills: string[]): Promise<ProfileData> => {
  const response = await API.put<{ data: ProfileData }>('/profile/skills', { skills });
  return response.data.data;
};

// Export all functions as a single object for easier imports
export const profileApi = {
  getMyProfile,
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  updateEducation,
  updateExperience,
  updateSkills
};
