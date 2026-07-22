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
      assignment_files: {
        Row: {
          assignment_id: string
          created_at: string
          file_name: string
          file_size_bytes: number
          file_url: string
          id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          file_name: string
          file_size_bytes?: number
          file_url: string
          id?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          file_name?: string
          file_size_bytes?: number
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_files_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submission_files: {
        Row: {
          created_at: string
          file_name: string
          file_size_bytes: number
          file_url: string
          id: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size_bytes?: number
          file_url: string
          id?: string
          submission_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size_bytes?: number
          file_url?: string
          id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          feedback: string | null
          feedback_given_at: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          outcome: string | null
          status: string
          submitted_at: string | null
          text_content: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          feedback?: string | null
          feedback_given_at?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          outcome?: string | null
          status?: string
          submitted_at?: string | null
          text_content?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          feedback?: string | null
          feedback_given_at?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          outcome?: string | null
          status?: string
          submitted_at?: string | null
          text_content?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          end_at: string
          id: string
          order_index: number
          pass_grade: number
          start_at: string
          title: string
          total_grade: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          end_at: string
          id?: string
          order_index?: number
          pass_grade: number
          start_at: string
          title: string
          total_grade: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          end_at?: string
          id?: string
          order_index?: number
          pass_grade?: number
          start_at?: string
          title?: string
          total_grade?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_courses: {
        Row: {
          bundle_id: string
          course_id: string
          created_at: string
          position: number
        }
        Insert: {
          bundle_id: string
          course_id: string
          created_at?: string
          position?: number
        }
        Update: {
          bundle_id?: string
          course_id?: string
          created_at?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_courses_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_purchases: {
        Row: {
          amount_piastres: number
          bundle_id: string
          courses_included: number
          created_at: string
          id: string
          payment_transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount_piastres: number
          bundle_id: string
          courses_included: number
          created_at?: string
          id?: string
          payment_transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount_piastres?: number
          bundle_id?: string
          courses_included?: number
          created_at?: string
          id?: string
          payment_transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_purchases_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_purchases_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount_expires_at: string | null
          discount_price_piastres: number | null
          id: string
          is_paid: boolean
          price_piastres: number | null
          slug: string | null
          stage_id: string | null
          status: string
          subject_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_expires_at?: string | null
          discount_price_piastres?: number | null
          id?: string
          is_paid?: boolean
          price_piastres?: number | null
          slug?: string | null
          stage_id?: string | null
          status?: string
          subject_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_expires_at?: string | null
          discount_price_piastres?: number | null
          id?: string
          is_paid?: boolean
          price_piastres?: number | null
          slug?: string | null
          stage_id?: string | null
          status?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundles_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundles_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      card_templates: {
        Row: {
          back_design: Json
          created_at: string
          front_design: Json
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          back_design?: Json
          created_at?: string
          front_design?: Json
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          back_design?: Json
          created_at?: string
          front_design?: Json
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          content_drip_enabled: boolean
          created_at: string
          created_by: string | null
          description: string | null
          discount_expires_at: string | null
          discount_price_piastres: number | null
          id: string
          is_paid: boolean
          price_piastres: number | null
          scheduled_publish_at: string | null
          scheduled_publish_job_id: string | null
          stage_id: string | null
          status: string
          subject_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_drip_enabled?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_expires_at?: string | null
          discount_price_piastres?: number | null
          id?: string
          is_paid?: boolean
          price_piastres?: number | null
          scheduled_publish_at?: string | null
          scheduled_publish_job_id?: string | null
          stage_id?: string | null
          status?: string
          subject_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_drip_enabled?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_expires_at?: string | null
          discount_price_piastres?: number | null
          id?: string
          is_paid?: boolean
          price_piastres?: number | null
          scheduled_publish_at?: string | null
          scheduled_publish_job_id?: string | null
          stage_id?: string | null
          status?: string
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
          unlock_quiz_id: string | null
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
          unlock_quiz_id?: string | null
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
          unlock_quiz_id?: string | null
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
          {
            foreignKeyName: "lessons_unlock_quiz_id_fkey"
            columns: ["unlock_quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_payment_methods: {
        Row: {
          account_holder_name: string
          account_number: string
          created_at: string
          id: string
          is_enabled: boolean
          method_type: string
          support_whatsapp_number: string
          updated_at: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          method_type: string
          support_whatsapp_number: string
          updated_at?: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          method_type?: string
          support_whatsapp_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      manual_payment_proofs: {
        Row: {
          created_at: string
          id: string
          manual_payment_method_id: string
          payment_transaction_id: string
          proof_image_url: string
          sender_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          manual_payment_method_id: string
          payment_transaction_id: string
          proof_image_url: string
          sender_number: string
        }
        Update: {
          created_at?: string
          id?: string
          manual_payment_method_id?: string
          payment_transaction_id?: string
          proof_image_url?: string
          sender_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_payment_proofs_manual_payment_method_id_fkey"
            columns: ["manual_payment_method_id"]
            isOneToOne: false
            referencedRelation: "manual_payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_payment_proofs_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateway_methods: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          gateway_id: string
          id: string
          is_enabled: boolean
          last_seen_at: string | null
          method_key: string
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          gateway_id: string
          id?: string
          is_enabled?: boolean
          last_seen_at?: string | null
          method_key: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          gateway_id?: string
          id?: string
          is_enabled?: boolean
          last_seen_at?: string | null
          method_key?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateway_methods_gateway_id_fkey"
            columns: ["gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateway_secrets: {
        Row: {
          config: Json
          created_at: string
          gateway_id: string
          id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          gateway_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          gateway_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateway_secrets_gateway_id_fkey"
            columns: ["gateway_id"]
            isOneToOne: true
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          created_at: string
          display_name: string
          gateway_key: string
          id: string
          is_enabled: boolean
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          gateway_key: string
          id?: string
          is_enabled?: boolean
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          gateway_key?: string
          id?: string
          is_enabled?: boolean
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_piastres: number
          bundle_id: string | null
          course_id: string | null
          created_at: string
          failure_reason: string | null
          gateway_id: string
          gateway_metadata: Json
          id: string
          purpose: string
          reference_number: string
          requires_manual_review: boolean
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          topup_amount_piastres: number | null
          user_id: string
          wallet_transaction_id: string | null
        }
        Insert: {
          amount_piastres: number
          bundle_id?: string | null
          course_id?: string | null
          created_at?: string
          failure_reason?: string | null
          gateway_id: string
          gateway_metadata?: Json
          id?: string
          purpose?: string
          reference_number: string
          requires_manual_review?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status: string
          topup_amount_piastres?: number | null
          user_id: string
          wallet_transaction_id?: string | null
        }
        Update: {
          amount_piastres?: number
          bundle_id?: string | null
          course_id?: string | null
          created_at?: string
          failure_reason?: string | null
          gateway_id?: string
          gateway_metadata?: Json
          id?: string
          purpose?: string
          reference_number?: string
          requires_manual_review?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          topup_amount_piastres?: number | null
          user_id?: string
          wallet_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_gateway_id_fkey"
            columns: ["gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_wallet_transaction_id_fkey"
            columns: ["wallet_transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
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
          qr_token: string
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
          qr_token?: string
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
          qr_token?: string
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
      qr_display_settings: {
        Row: {
          id: number
          show_assignment_stats: boolean
          show_avatar: boolean
          show_enrolled_courses_count: boolean
          show_enrolled_courses_list: boolean
          show_full_name: boolean
          show_phone: boolean
          show_quiz_attempts_list: boolean
          show_quiz_stats: boolean
          show_stage: boolean
          show_student_id: boolean
          show_weak_courses: boolean
          show_weak_subjects: boolean
          updated_at: string
        }
        Insert: {
          id: number
          show_assignment_stats?: boolean
          show_avatar?: boolean
          show_enrolled_courses_count?: boolean
          show_enrolled_courses_list?: boolean
          show_full_name?: boolean
          show_phone?: boolean
          show_quiz_attempts_list?: boolean
          show_quiz_stats?: boolean
          show_stage?: boolean
          show_student_id?: boolean
          show_weak_courses?: boolean
          show_weak_subjects?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          show_assignment_stats?: boolean
          show_avatar?: boolean
          show_enrolled_courses_count?: boolean
          show_enrolled_courses_list?: boolean
          show_full_name?: boolean
          show_phone?: boolean
          show_quiz_attempts_list?: boolean
          show_quiz_stats?: boolean
          show_stage?: boolean
          show_student_id?: boolean
          show_weak_courses?: boolean
          show_weak_subjects?: boolean
          updated_at?: string
        }
        Relationships: []
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
      student_quiz_attempt_grants: {
        Row: {
          created_at: string
          extra_attempts: number
          granted_by: string | null
          id: string
          note: string | null
          quiz_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extra_attempts?: number
          granted_by?: string | null
          id?: string
          note?: string | null
          quiz_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          extra_attempts?: number
          granted_by?: string | null
          id?: string
          note?: string | null
          quiz_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_quiz_attempt_grants_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
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
      top_up_cards: {
        Row: {
          batch_id: string | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_redeemed: boolean
          redeemed_at: string | null
          redeemed_by: string | null
          value_piastres: number
        }
        Insert: {
          batch_id?: string | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
          value_piastres: number
        }
        Update: {
          batch_id?: string | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
          value_piastres?: number
        }
        Relationships: [
          {
            foreignKeyName: "top_up_cards_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_gateway_settings: {
        Row: {
          id: number
          max_wallet_balance_piastres: number
          updated_at: string
        }
        Insert: {
          id: number
          max_wallet_balance_piastres?: number
          updated_at?: string
        }
        Update: {
          id?: number
          max_wallet_balance_piastres?: number
          updated_at?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount_piastres: number
          balance_after_piastres: number
          created_at: string
          id: string
          notes: string | null
          performed_by: string | null
          reference_number: string
          related_card_id: string | null
          type: string
          wallet_id: string
        }
        Insert: {
          amount_piastres: number
          balance_after_piastres: number
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          reference_number: string
          related_card_id?: string | null
          type: string
          wallet_id: string
        }
        Update: {
          amount_piastres?: number
          balance_after_piastres?: number
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          reference_number?: string
          related_card_id?: string | null
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_related_card_id_fkey"
            columns: ["related_card_id"]
            isOneToOne: false
            referencedRelation: "top_up_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance_piastres: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_piastres?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_piastres?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      _enroll_user_in_bundle: {
        Args: { _bundle_id: string; _user_id: string }
        Returns: number
      }
      _finalize_attempt: { Args: { _attempt_id: string }; Returns: undefined }
      _gen_payment_reference: { Args: never; Returns: string }
      _gen_txn_reference: { Args: never; Returns: string }
      _grade_answer: { Args: { _answer_id: string }; Returns: undefined }
      add_answer_time: {
        Args: { _attempt_id: string; _delta: number; _question_id: string }
        Returns: undefined
      }
      admin_adjust_wallet: {
        Args: { p_amount_piastres: number; p_type: string; p_user_id: string }
        Returns: Json
      }
      admin_approve_payment_request: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      admin_bulk_adjust_wallets: {
        Args: { p_amount_piastres: number; p_type: string }
        Returns: Json
      }
      admin_finalize_not_submitted: {
        Args: { _submission_id: string }
        Returns: Json
      }
      admin_generate_top_up_cards: {
        Args: {
          p_expires_at?: string
          p_quantity: number
          p_value_piastres: number
        }
        Returns: Json
      }
      admin_get_student: { Args: { _uid: string }; Returns: Json }
      admin_grant_quiz_attempt: {
        Args: {
          _extra?: number
          _note?: string
          _quiz_id: string
          _user_id: string
        }
        Returns: Json
      }
      admin_list_bundles: {
        Args: never
        Returns: {
          courses_count: number
          cover_image_url: string
          created_at: string
          discount_expires_at: string
          discount_price_piastres: number
          id: string
          is_paid: boolean
          price_piastres: number
          purchases_count: number
          revenue_piastres: number
          slug: string
          status: string
          title: string
        }[]
      }
      admin_list_payment_requests: {
        Args: {
          _limit?: number
          _offset?: number
          _purpose?: string
          _status?: string
        }
        Returns: {
          amount_piastres: number
          course_id: string
          course_title: string
          created_at: string
          failure_reason: string
          gateway_display_name: string
          method_account_holder: string
          method_account_number: string
          method_type: string
          method_whatsapp: string
          proof_image_url: string
          purpose: string
          reference_number: string
          review_notes: string
          reviewed_at: string
          sender_number: string
          status: string
          student_name: string
          student_phone: string
          student_student_id: string
          topup_amount_piastres: number
          total_count: number
          transaction_id: string
          user_id: string
        }[]
      }
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
      admin_list_wallet_transactions: {
        Args: {
          _limit?: number
          _offset?: number
          _type?: string
          _user_search?: string
        }
        Returns: {
          amount_piastres: number
          balance_after_piastres: number
          created_at: string
          id: string
          notes: string
          performed_by: string
          performed_by_name: string
          reference_number: string
          student_id_code: string
          student_name: string
          student_phone: string
          total_count: number
          type: string
          user_id: string
          wallet_id: string
        }[]
      }
      admin_regenerate_qr_token: { Args: { _uid: string }; Returns: string }
      admin_reject_payment_request: {
        Args: { p_reason: string; p_transaction_id: string }
        Returns: Json
      }
      admin_reset_all_wallets: { Args: never; Returns: Json }
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
      assignment_window_open: {
        Args: { _assignment_id: string }
        Returns: boolean
      }
      auto_publish_scheduled_courses: { Args: never; Returns: Json }
      create_pending_gateway_transaction: {
        Args: {
          p_course_id?: string
          p_gateway_key: string
          p_purpose: string
          p_topup_amount_piastres?: number
        }
        Returns: Json
      }
      effective_bundle_price: { Args: { _bundle_id: string }; Returns: number }
      expire_stale_fawaterak_pending: { Args: never; Returns: number }
      finalize_gateway_transaction: {
        Args: {
          p_failure_reason?: string
          p_reference: string
          p_success: boolean
        }
        Returns: Json
      }
      get_assignment_platform_metrics: { Args: never; Returns: Json }
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
      get_most_failed_assignments: {
        Args: { _limit?: number }
        Returns: {
          assignment_id: string
          assignment_title: string
          course_id: string
          course_title: string
          failed_count: number
          failure_rate: number
          stage_id: string
          stage_name: string
          subject_id: string
          subject_name: string
          total_evaluated: number
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
      get_own_payment_transaction_status: {
        Args: { p_reference: string }
        Returns: Json
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
      get_student_qr_snapshot: { Args: { _token: string }; Returns: Json }
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
      list_assignment_submissions:
        | {
            Args: {
              _assignment_id?: string
              _course_id?: string
              _limit?: number
              _offset?: number
              _stage_id?: string
              _subject_id?: string
              _ungraded_only?: boolean
              _user_search?: string
            }
            Returns: {
              assignment_id: string
              assignment_title: string
              computed_outcome: string
              course_id: string
              course_title: string
              end_at: string
              feedback_given_at: string
              grade: number
              graded_at: string
              has_feedback: boolean
              outcome: string
              pass_grade: number
              stage_id: string
              stage_name: string
              status: string
              student_email: string
              student_name: string
              student_phone: string
              student_student_id: string
              subject_id: string
              subject_name: string
              submission_id: string
              submitted_at: string
              total_count: number
              total_grade: number
              user_id: string
            }[]
          }
        | {
            Args: {
              _course_id?: string
              _limit?: number
              _offset?: number
              _stage_id?: string
              _subject_id?: string
              _ungraded_only?: boolean
              _user_search?: string
            }
            Returns: {
              assignment_id: string
              assignment_title: string
              computed_outcome: string
              course_id: string
              course_title: string
              end_at: string
              feedback_given_at: string
              grade: number
              graded_at: string
              has_feedback: boolean
              outcome: string
              pass_grade: number
              stage_id: string
              stage_name: string
              status: string
              student_email: string
              student_name: string
              student_phone: string
              student_student_id: string
              subject_id: string
              subject_name: string
              submission_id: string
              submitted_at: string
              total_count: number
              total_grade: number
              user_id: string
            }[]
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
      purchase_bundle: { Args: { p_bundle_id: string }; Returns: Json }
      purchase_course: { Args: { p_course_id: string }; Returns: Json }
      redeem_top_up_card: { Args: { p_code: string }; Returns: Json }
      resolve_course_lock_state: {
        Args: { _course_id: string; _user_id: string }
        Returns: {
          gate_quiz_id: string
          gate_quiz_title: string
          is_completed: boolean
          is_locked: boolean
          item_id: string
          item_type: string
          ord: number
          reason: string
          unit_id: string
        }[]
      }
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
      student_effective_quiz_max_attempts: {
        Args: { _quiz_id: string; _user_id: string }
        Returns: number
      }
      student_list_own_payment_requests: {
        Args: never
        Returns: {
          amount_piastres: number
          course_id: string
          course_title: string
          created_at: string
          failure_reason: string
          gateway_display_name: string
          method_account_number: string
          method_type: string
          method_whatsapp: string
          proof_image_url: string
          purpose: string
          reference_number: string
          review_notes: string
          reviewed_at: string
          sender_number: string
          status: string
          topup_amount_piastres: number
          transaction_id: string
        }[]
      }
      submit_manual_bundle_payment: {
        Args: {
          p_bundle_id: string
          p_method_id: string
          p_proof_image_url: string
          p_sender_number: string
        }
        Returns: Json
      }
      submit_manual_course_payment: {
        Args: {
          p_course_id: string
          p_method_id: string
          p_proof_image_url: string
          p_sender_number: string
        }
        Returns: Json
      }
      submit_manual_wallet_topup: {
        Args: {
          p_amount_piastres: number
          p_method_id: string
          p_proof_image_url: string
          p_sender_number: string
        }
        Returns: Json
      }
      submit_quiz_attempt: { Args: { _attempt_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "student"
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
      video_provider: ["youtube", "bunny", "vimeo"],
    },
  },
} as const
