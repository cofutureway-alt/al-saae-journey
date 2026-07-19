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
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          stage_id: string | null
          status: Database["public"]["Enums"]["course_status"]
          subject_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          subject_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          subject_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_file_downloads: {
        Row: {
          created_at: string
          download_count: number
          id: string
          lesson_file_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          id?: string
          lesson_file_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number
          id?: string
          lesson_file_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_file_downloads_lesson_file_id_fkey"
            columns: ["lesson_file_id"]
            isOneToOne: false
            referencedRelation: "lesson_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_file_downloads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_files: {
        Row: {
          allow_download: boolean
          created_at: string
          download_limit: number | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
        }
        Insert: {
          allow_download?: boolean
          created_at?: string
          download_limit?: number | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
        }
        Update: {
          allow_download?: boolean
          created_at?: string
          download_limit?: number | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_files_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_watch_progress: {
        Row: {
          course_id: string
          created_at: string
          duration_seconds: number
          furthest_position_seconds: number
          id: string
          last_position_seconds: number
          lesson_id: string
          updated_at: string
          user_id: string
          watch_percentage: number
          watched_seconds: number
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_seconds?: number
          furthest_position_seconds?: number
          id?: string
          last_position_seconds?: number
          lesson_id: string
          updated_at?: string
          user_id: string
          watch_percentage?: number
          watched_seconds?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_seconds?: number
          furthest_position_seconds?: number
          id?: string
          last_position_seconds?: number
          lesson_id?: string
          updated_at?: string
          user_id?: string
          watch_percentage?: number
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_watch_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_watch_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_watch_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          position: number
          title: string
          unit_id: string
          updated_at: string
          video_provider: Database["public"]["Enums"]["video_provider"] | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title: string
          unit_id: string
          updated_at?: string
          video_provider?: Database["public"]["Enums"]["video_provider"] | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title?: string
          unit_id?: string
          updated_at?: string
          video_provider?: Database["public"]["Enums"]["video_provider"] | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_email: string | null
          avatar_url: string | null
          created_at: string
          custom_fields: Json
          email: string | null
          full_name: string | null
          gender: string | null
          governorate: string | null
          guardian_phone: string | null
          id: string
          is_banned: boolean
          phone_number: string | null
          registration_type: string | null
          role: Database["public"]["Enums"]["app_role"]
          stage_id: string | null
          student_id: string | null
        }
        Insert: {
          auth_email?: string | null
          avatar_url?: string | null
          created_at?: string
          custom_fields?: Json
          email?: string | null
          full_name?: string | null
          gender?: string | null
          governorate?: string | null
          guardian_phone?: string | null
          id: string
          is_banned?: boolean
          phone_number?: string | null
          registration_type?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          stage_id?: string | null
          student_id?: string | null
        }
        Update: {
          auth_email?: string | null
          avatar_url?: string | null
          created_at?: string
          custom_fields?: Json
          email?: string | null
          full_name?: string | null
          gender?: string | null
          governorate?: string | null
          guardian_phone?: string | null
          id?: string
          is_banned?: boolean
          phone_number?: string | null
          registration_type?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          stage_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          answered_at: string | null
          attempt_id: string
          created_at: string
          fill_blank_text: string | null
          id: string
          is_correct: boolean | null
          option_order: Json
          points_earned: number
          question_id: string
          selected_option_ids: Json
          time_spent_seconds: number
          updated_at: string
        }
        Insert: {
          answered_at?: string | null
          attempt_id: string
          created_at?: string
          fill_blank_text?: string | null
          id?: string
          is_correct?: boolean | null
          option_order?: Json
          points_earned?: number
          question_id: string
          selected_option_ids?: Json
          time_spent_seconds?: number
          updated_at?: string
        }
        Update: {
          answered_at?: string | null
          attempt_id?: string
          created_at?: string
          fill_blank_text?: string | null
          id?: string
          is_correct?: boolean | null
          option_order?: Json
          points_earned?: number
          question_id?: string
          selected_option_ids?: Json
          time_spent_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          earned_points: number
          expires_at: string
          feedback: string | null
          feedback_given_at: string | null
          form_number: number
          id: string
          passed: boolean | null
          percentage: number | null
          question_order: Json
          quiz_id: string
          started_at: string
          status: string
          submitted_at: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_number: number
          created_at?: string
          earned_points?: number
          expires_at: string
          feedback?: string | null
          feedback_given_at?: string | null
          form_number: number
          id?: string
          passed?: boolean | null
          percentage?: number | null
          question_order: Json
          quiz_id: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          earned_points?: number
          expires_at?: string
          feedback?: string | null
          feedback_given_at?: string | null
          form_number?: number
          id?: string
          passed?: boolean | null
          percentage?: number | null
          question_order?: Json
          quiz_id?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_question_options: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_correct: boolean
          order_index: number
          question_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_correct?: boolean
          order_index?: number
          question_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_correct?: boolean
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          content: Json
          created_at: string
          form_number: number
          id: string
          image_url: string | null
          model_answer_text: string | null
          order_index: number
          points: number
          quiz_id: string
          type: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          form_number: number
          id?: string
          image_url?: string | null
          model_answer_text?: string | null
          order_index?: number
          points: number
          quiz_id: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          form_number?: number
          id?: string
          image_url?: string | null
          model_answer_text?: string | null
          order_index?: number
          points?: number
          quiz_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          attempt_result_policy: string
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          end_at: string | null
          forms_count: number
          id: string
          max_attempts: number
          order_index: number
          pass_percentage: number
          randomize_enabled: boolean
          start_at: string | null
          title: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          attempt_result_policy?: string
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_at?: string | null
          forms_count?: number
          id?: string
          max_attempts?: number
          order_index?: number
          pass_percentage?: number
          randomize_enabled?: boolean
          start_at?: string | null
          title: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          attempt_result_policy?: string
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_at?: string | null
          forms_count?: number
          id?: string
          max_attempts?: number
          order_index?: number
          pass_percentage?: number
          randomize_enabled?: boolean
          start_at?: string | null
          title?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_form_fields: {
        Row: {
          created_at: string
          field_key: string
          field_type: string
          id: string
          is_locked: boolean
          is_required: boolean
          label: string
          options: Json | null
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_key: string
          field_type: string
          id?: string
          is_locked?: boolean
          is_required?: boolean
          label: string
          options?: Json | null
          order_index?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          field_type?: string
          id?: string
          is_locked?: boolean
          is_required?: boolean
          label?: string
          options?: Json | null
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      stages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      video_player_settings: {
        Row: {
          allowed_speeds: Json
          completion_gate_enabled: boolean
          completion_required_percentage: number
          double_tap_seek_enabled: boolean
          id: number
          seek_backward_seconds: number
          seek_forward_seconds: number
          speed_control_enabled: boolean
          updated_at: string
          watermark_color: string
          watermark_opacity: number
          watermark_show_email: boolean
          watermark_show_name: boolean
          watermark_speed_seconds: number
        }
        Insert: {
          allowed_speeds?: Json
          completion_gate_enabled?: boolean
          completion_required_percentage?: number
          double_tap_seek_enabled?: boolean
          id?: number
          seek_backward_seconds?: number
          seek_forward_seconds?: number
          speed_control_enabled?: boolean
          updated_at?: string
          watermark_color?: string
          watermark_opacity?: number
          watermark_show_email?: boolean
          watermark_show_name?: boolean
          watermark_speed_seconds?: number
        }
        Update: {
          allowed_speeds?: Json
          completion_gate_enabled?: boolean
          completion_required_percentage?: number
          double_tap_seek_enabled?: boolean
          id?: number
          seek_backward_seconds?: number
          seek_forward_seconds?: number
          speed_control_enabled?: boolean
          updated_at?: string
          watermark_color?: string
          watermark_opacity?: number
          watermark_show_email?: boolean
          watermark_show_name?: boolean
          watermark_speed_seconds?: number
        }
        Relationships: []
      }
    }
    Views: {
      lessons_public: {
        Row: {
          id: string | null
          position: number | null
          title: string | null
          unit_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _finalize_attempt: { Args: { _attempt_id: string }; Returns: undefined }
      _grade_answer: { Args: { _answer_id: string }; Returns: undefined }
      add_answer_time: {
        Args: { _attempt_id: string; _delta: number; _question_id: string }
        Returns: undefined
      }
      admin_get_student: { Args: { _uid: string }; Returns: Json }
      admin_list_students: {
        Args: {
          _custom_filters?: Json
          _known_filters?: Json
          _limit?: number
          _offset?: number
          _search?: string
        }
        Returns: {
          auth_email: string
          avatar_url: string
          created_at: string
          custom_fields: Json
          email: string
          enrollments_count: number
          full_name: string
          gender: string
          governorate: string
          id: string
          is_banned: boolean
          phone_number: string
          registration_type: string
          stage_id: string
          stage_name: string
          student_id: string
          total_count: number
        }[]
      }
      admin_save_feedback: {
        Args: { _attempt_id: string; _feedback: string }
        Returns: Json
      }
      admin_save_grading: {
        Args: { _attempt_id: string; _updates: Json }
        Returns: Json
      }
      admin_student_enrollments: {
        Args: { _uid: string }
        Returns: {
          course_id: string
          course_title: string
          enrolled_at: string
          stage_name: string
          subject_name: string
        }[]
      }
      get_attempt_details: { Args: { _attempt_id: string }; Returns: Json }
      get_attempt_questions: { Args: { _attempt_id: string }; Returns: Json }
      get_lessons_public: {
        Args: never
        Returns: {
          id: string
          position: number
          title: string
          unit_id: string
        }[]
      }
      get_most_failed_quizzes: {
        Args: { _limit?: number }
        Returns: {
          course_id: string
          course_title: string
          failed_count: number
          quiz_id: string
          quiz_title: string
          stage_id: string
          stage_name: string
          subject_id: string
          subject_name: string
          total_official: number
        }[]
      }
      get_official_result: {
        Args: { _quiz_id: string; _user_id: string }
        Returns: Json
      }
      get_or_finalize_attempt: {
        Args: { _attempt_id: string }
        Returns: {
          attempt_number: number
          created_at: string
          earned_points: number
          expires_at: string
          feedback: string | null
          feedback_given_at: string | null
          form_number: number
          id: string
          passed: boolean | null
          percentage: number | null
          question_order: Json
          quiz_id: string
          started_at: string
          status: string
          submitted_at: string | null
          total_points: number
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "quiz_attempts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_question_analysis: {
        Args: { _form: number; _quiz_id: string }
        Returns: {
          content: Json
          correct_count: number
          incorrect_count: number
          order_index: number
          points: number
          question_id: string
          total_count: number
          type: string
          unanswered_count: number
        }[]
      }
      get_quiz_for_student: { Args: { _quiz_id: string }; Returns: Json }
      get_unit_quizzes: {
        Args: { _unit_id: string }
        Returns: {
          duration_minutes: number
          end_at: string
          id: string
          max_attempts: number
          order_index: number
          pass_percentage: number
          start_at: string
          title: string
          unit_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      heartbeat_quiz_attempt: {
        Args: { _attempt_id: string }
        Returns: boolean
      }
      increment_file_download: {
        Args: { p_lesson_file_id: string }
        Returns: number
      }
      is_current_user_banned: { Args: never; Returns: boolean }
      is_enrolled_in_lesson_course: {
        Args: { _lesson_id: string; _user_id: string }
        Returns: boolean
      }
      list_my_quiz_attempts: {
        Args: { _quiz_id: string }
        Returns: {
          attempt_number: number
          created_at: string
          earned_points: number
          expires_at: string
          feedback: string | null
          feedback_given_at: string | null
          form_number: number
          id: string
          passed: boolean | null
          percentage: number | null
          question_order: Json
          quiz_id: string
          started_at: string
          status: string
          submitted_at: string | null
          total_points: number
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "quiz_attempts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_quiz_attempts:
        | {
            Args: {
              _course_id?: string
              _limit?: number
              _needs_review_only?: boolean
              _offset?: number
              _stage_id?: string
              _subject_id?: string
              _user_search?: string
            }
            Returns: {
              attempt_id: string
              attempt_number: number
              course_id: string
              course_title: string
              earned_points: number
              feedback_given_at: string
              form_number: number
              has_feedback: boolean
              pass_percentage: number
              passed: boolean
              percentage: number
              quiz_id: string
              quiz_title: string
              stage_id: string
              stage_name: string
              status: string
              student_email: string
              student_name: string
              subject_id: string
              subject_name: string
              submitted_at: string
              total_count: number
              total_points: number
              user_id: string
            }[]
          }
        | {
            Args: {
              _course_id?: string
              _limit?: number
              _needs_review_only?: boolean
              _offset?: number
              _quiz_id?: string
              _stage_id?: string
              _subject_id?: string
              _user_search?: string
            }
            Returns: {
              attempt_id: string
              attempt_number: number
              course_id: string
              course_title: string
              earned_points: number
              feedback_given_at: string
              form_number: number
              has_feedback: boolean
              pass_percentage: number
              passed: boolean
              percentage: number
              quiz_id: string
              quiz_title: string
              stage_id: string
              stage_name: string
              status: string
              student_email: string
              student_name: string
              subject_id: string
              subject_name: string
              submitted_at: string
              total_count: number
              total_points: number
              user_id: string
            }[]
          }
      next_unit_order_index: { Args: { _unit_id: string }; Returns: number }
      resolve_login_email: { Args: { _identifier: string }; Returns: string }
      save_quiz_answer: {
        Args: {
          _attempt_id: string
          _fill_blank_text: string
          _question_id: string
          _selected_option_ids: Json
          _time_delta_seconds?: number
        }
        Returns: undefined
      }
      start_quiz_attempt: { Args: { _quiz_id: string }; Returns: string }
      submit_quiz_attempt: { Args: { _attempt_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "student"
      course_status: "draft" | "published"
      video_provider: "youtube" | "bunny" | "vimeo"
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
      app_role: ["admin", "student"],
      course_status: ["draft", "published"],
      video_provider: ["youtube", "bunny", "vimeo"],
    },
  },
} as const
