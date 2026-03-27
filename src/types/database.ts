export interface Student {
  id: string;
  full_name: string;
  phone: string;
  goal?: string;
  payment_status: boolean;
  monthly_fee: number;
  payment_day: number;
  target_load?: number;
  monthly_goal?: number;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  student_id: string;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  load: string;
  created_at: string;
  workout_exercises: {
    exercises: {
      name: string;
    };
  };
}