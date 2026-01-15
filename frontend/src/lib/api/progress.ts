// src/lib/api/progress.ts - Exam and Practice API Service
import { TokenService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== EXAM TYPES ====================

export interface ExamResult {
  id: number;
  user_id: number;
  course_id: string;
  exam_title: string;
  exam_type: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  time_spent_minutes?: number;
  attempts: number;
  questions_data?: any;
  created_at: string;
}

export interface SubmitExamData {
  course_id: string;
  exam_title: string;
  exam_type: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  time_spent_minutes?: number;
  attempts?: number;
  questions_data?: any;
}

// ==================== PRACTICE TYPES ====================

export interface PracticeResult {
  id: number;
  user_id: number;
  course_id: string;
  practice_title: string;
  practice_type: string;
  score: number;
  total_points: number;
  percentage: number;
  time_spent_minutes?: number;
  attempts: number;
  completed: boolean;
  questions_data?: any;
  feedback?: any;
  created_at: string;
}

export interface SubmitPracticeData {
  course_id: string;
  practice_title: string;
  practice_type: string;
  score: number;
  total_points: number;
  percentage: number;
  time_spent_minutes?: number;
  attempts?: number;
  completed?: boolean;
  questions_data?: any;
  feedback?: any;
}

// ==================== LESSON TYPES ====================

export interface LessonCompletion {
  id: number;
  user_id: number;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  quiz_score: number | null;
  completed_at: string | null;
}

// ==================== EXAM API ====================

export const ExamsAPI = {
  async submitExamResult(data: SubmitExamData): Promise<ExamResult> {
    const response = await fetch(`${API_BASE_URL}/exams/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit exam result');
    }

    return response.json();
  },

  async getMyExamResults(): Promise<ExamResult[]> {
    const response = await fetch(`${API_BASE_URL}/exams/results`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exam results');
    }

    return response.json();
  },

  async getExamResultsByCourse(courseId: string): Promise<ExamResult[]> {
    const response = await fetch(`${API_BASE_URL}/exams/results/${courseId}`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exam results for course');
    }

    return response.json();
  }
};

// ==================== PRACTICE API ====================

export const PracticesAPI = {
  async submitPracticeResult(data: SubmitPracticeData): Promise<PracticeResult> {
    const response = await fetch(`${API_BASE_URL}/practices/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit practice result');
    }

    return response.json();
  },

  async getMyPracticeResults(): Promise<PracticeResult[]> {
    const response = await fetch(`${API_BASE_URL}/practices/results`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch practice results');
    }

    return response.json();
  },

  async getPracticeResultsByCourse(courseId: string): Promise<PracticeResult[]> {
    const response = await fetch(`${API_BASE_URL}/practices/results/${courseId}`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch practice results for course');
    }

    return response.json();
  },

  async getPracticeProgress(courseId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/practices/progress/${courseId}`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch practice progress');
    }

    return response.json();
  }
};

// ==================== LESSON API ====================

export const LessonsAPI = {
  async completeLesson(data: {
    course_id: string;
    lesson_id: string;
    completed?: boolean;
    quiz_score?: number | null;
  }): Promise<LessonCompletion> {
    const response = await fetch(`${API_BASE_URL}/lessons/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify({
        course_id: data.course_id,
        lesson_id: data.lesson_id,
        completed: data.completed ?? true,
        quiz_score: data.quiz_score ?? null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark lesson as complete');
    }

    return response.json();
  },

  async getCourseProgress(courseId: string): Promise<LessonCompletion[]> {
    const response = await fetch(`${API_BASE_URL}/lessons/progress/${courseId}`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course progress');
    }

    return response.json();
  }
};
