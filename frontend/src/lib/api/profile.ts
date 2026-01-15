// src/lib/api/profile.ts - Profile API Service
import { TokenService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  created_at: string;
  is_active: boolean;
  profile_picture?: string;
  bio?: string;
  grade_level?: string;
  major?: string;
  learning_style?: string;
  notification_enabled: boolean;
  theme_preference: string;
}

export interface ProfileStats {
  total_exams_taken: number;
  total_practices_completed: number;
  total_lessons_completed: number;
  total_conversations: number;
  average_exam_score: number;
  average_practice_score: number;
  member_since: string;
}

export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  profile_picture?: string;
  bio?: string;
  grade_level?: string;
  major?: string;
  learning_style?: string;
  notification_enabled?: boolean;
  theme_preference?: string;
}

export const ProfileAPI = {
  async getMyProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  },

  async getStats(): Promise<ProfileStats> {
    const response = await fetch(`${API_BASE_URL}/profile/stats`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  }
};
