export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          auto_correct: boolean | null
          created_at: string
          id: string
          image_url: string | null
          points_awarded: number | null
          problem_id: string
          response_text: string | null
          selected_choice: string | null
          submission_id: string
          teacher_comment: string | null
          updated_at: string
        }
        Insert: {
          auto_correct?: boolean | null
          created_at?: string
          id?: string
          image_url?: string | null
          points_awarded?: number | null
          problem_id: string
          response_text?: string | null
          selected_choice?: string | null
          submission_id: string
          teacher_comment?: string | null
          updated_at?: string
        }
        Update: {
          auto_correct?: boolean | null
          created_at?: string
          id?: string
          image_url?: string | null
          points_awarded?: number | null
          problem_id?: string
          response_text?: string | null
          selected_choice?: string | null
          submission_id?: string
          teacher_comment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          class_id: string
          created_at: string
          due_at: string | null
          id: string
          instructions: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          archived: boolean
          created_at: string
          description: string | null
          id: string
          join_code: string
          name: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          description?: string | null
          id?: string
          join_code: string
          name: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          description?: string | null
          id?: string
          join_code?: string
          name?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      classroom_students: {
        Row: {
          course_id: string
          course_name: string | null
          created_at: string
          email: string | null
          family_name: string | null
          full_name: string | null
          given_name: string | null
          google_user_id: string
          id: string
          joined_at: string | null
          last_synced_at: string
          updated_at: string
        }
        Insert: {
          course_id: string
          course_name?: string | null
          created_at?: string
          email?: string | null
          family_name?: string | null
          full_name?: string | null
          given_name?: string | null
          google_user_id: string
          id?: string
          joined_at?: string | null
          last_synced_at?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          course_name?: string | null
          created_at?: string
          email?: string | null
          family_name?: string | null
          full_name?: string | null
          given_name?: string | null
          google_user_id?: string
          id?: string
          joined_at?: string | null
          last_synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      classroom_submissions: {
        Row: {
          assigned_grade: number | null
          course_id: string
          coursework_id: string
          coursework_title: string | null
          created_at: string
          due_at: string | null
          gc_updated_at: string | null
          google_user_id: string
          id: string
          last_synced_at: string
          late: boolean
          state: string | null
          updated_at: string
        }
        Insert: {
          assigned_grade?: number | null
          course_id: string
          coursework_id: string
          coursework_title?: string | null
          created_at?: string
          due_at?: string | null
          gc_updated_at?: string | null
          google_user_id: string
          id?: string
          last_synced_at?: string
          late?: boolean
          state?: string | null
          updated_at?: string
        }
        Update: {
          assigned_grade?: number | null
          course_id?: string
          coursework_id?: string
          coursework_title?: string | null
          created_at?: string
          due_at?: string | null
          gc_updated_at?: string | null
          google_user_id?: string
          id?: string
          last_synced_at?: string
          late?: boolean
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          class_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          assignment_id: string
          choices: Json | null
          correct_answer: string | null
          created_at: string
          id: string
          points: number
          position: number
          prompt: string
          type: Database["public"]["Enums"]["problem_type"]
        }
        Insert: {
          assignment_id: string
          choices?: Json | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          points?: number
          position?: number
          prompt: string
          type: Database["public"]["Enums"]["problem_type"]
        }
        Update: {
          assignment_id?: string
          choices?: Json | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          points?: number
          position?: number
          prompt?: string
          type?: Database["public"]["Enums"]["problem_type"]
        }
        Relationships: [
          {
            foreignKeyName: "problems_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          classroom_course_id: string | null
          classroom_google_user_id: string | null
          classroom_match_status: string
          created_at: string
          email: string
          grade_level: string | null
          id: string
          parent_first_name: string | null
          parent_last_name: string | null
          phone: string | null
          student_first_name: string | null
          student_last_name: string | null
        }
        Insert: {
          classroom_course_id?: string | null
          classroom_google_user_id?: string | null
          classroom_match_status?: string
          created_at?: string
          email: string
          grade_level?: string | null
          id?: string
          parent_first_name?: string | null
          parent_last_name?: string | null
          phone?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
        }
        Update: {
          classroom_course_id?: string | null
          classroom_google_user_id?: string | null
          classroom_match_status?: string
          created_at?: string
          email?: string
          grade_level?: string | null
          id?: string
          parent_first_name?: string | null
          parent_last_name?: string | null
          phone?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assignment_id: string
          auto_score: number | null
          created_at: string
          final_score: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          max_score: number
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at: string | null
          teacher_feedback: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          auto_score?: number | null
          created_at?: string
          final_score?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          auto_score?: number | null
          created_at?: string
          final_score?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_enrolled: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      join_class_by_code: {
        Args: { _code: string }
        Returns: {
          already_enrolled: boolean
          class_id: string
          class_name: string
        }[]
      }
      owns_assignment: {
        Args: { _assignment_id: string; _user_id: string }
        Returns: boolean
      }
      owns_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "teacher" | "student"
      problem_type: "short" | "mcq" | "free"
      submission_status: "in_progress" | "submitted" | "graded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "teacher", "student"],
      problem_type: ["short", "mcq", "free"],
      submission_status: ["in_progress", "submitted", "graded"],
    },
  },
} as const
