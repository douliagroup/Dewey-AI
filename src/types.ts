export interface Profile {
  id: string;
  full_name: string;
  role: 'parent' | 'student' | 'teacher' | 'admin';
  avatar_url?: string;
  student_id?: string; // For parents to link to their child
}

export interface AcademicResult {
  id: string;
  student_id: string;
  subject: string;
  grade: number;
  term: string;
  year: string;
  attendance_rate: number;
  comments?: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
