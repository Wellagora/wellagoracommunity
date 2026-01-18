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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_commissions: {
        Row: {
          amount_cents: number
          challenge_completion_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          partner_id: string | null
          status: string | null
          stripe_transfer_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          challenge_completion_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          partner_id?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          challenge_completion_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          partner_id?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_challenge_completion_id_fkey"
            columns: ["challenge_completion_id"]
            isOneToOne: false
            referencedRelation: "challenge_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          click_count: number | null
          commission_rate: number | null
          content_id: string | null
          created_at: string | null
          expert_id: string
          id: string
          is_active: boolean | null
          partner_name: string | null
          product_name: string
          product_url: string
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          commission_rate?: number | null
          content_id?: string | null
          created_at?: string | null
          expert_id: string
          id?: string
          is_active?: boolean | null
          partner_name?: string | null
          product_name: string
          product_url: string
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          commission_rate?: number | null
          content_id?: string | null
          created_at?: string | null
          expert_id?: string
          id?: string
          is_active?: boolean | null
          partner_name?: string | null
          product_name?: string
          product_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          language: string
          last_message_at: string
          message_count: number
          project_id: string | null
          started_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          language?: string
          last_message_at?: string
          message_count?: number
          project_id?: string | null
          started_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          language?: string
          last_message_at?: string
          message_count?: number
          project_id?: string | null
          started_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          model: string | null
          role: string
          timestamp: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          model?: string | null
          role: string
          timestamp?: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          model?: string | null
          role?: string
          timestamp?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          device_type: string | null
          event_name: string
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          event_name: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          event_name?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      carbon_handprint_entries: {
        Row: {
          action_type: string
          category: string
          challenge_completion_id: string | null
          created_at: string | null
          description: string | null
          id: string
          impact_kg_co2: number
          metadata: Json | null
          project_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          category: string
          challenge_completion_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_kg_co2?: number
          metadata?: Json | null
          project_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          category?: string
          challenge_completion_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_kg_co2?: number
          metadata?: Json | null
          project_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_handprint_entries_challenge_completion_id_fkey"
            columns: ["challenge_completion_id"]
            isOneToOne: false
            referencedRelation: "challenge_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carbon_handprint_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_completions: {
        Row: {
          challenge_id: string
          completion_date: string
          completion_type: string
          created_at: string
          evidence_data: Json | null
          id: string
          impact_data: Json
          notes: string | null
          organization_id: string | null
          points_earned: number
          project_id: string | null
          updated_at: string
          user_id: string
          validation_score: number | null
          validation_status: string
        }
        Insert: {
          challenge_id: string
          completion_date?: string
          completion_type?: string
          created_at?: string
          evidence_data?: Json | null
          id?: string
          impact_data: Json
          notes?: string | null
          organization_id?: string | null
          points_earned?: number
          project_id?: string | null
          updated_at?: string
          user_id: string
          validation_score?: number | null
          validation_status?: string
        }
        Update: {
          challenge_id?: string
          completion_date?: string
          completion_type?: string
          created_at?: string
          evidence_data?: Json | null
          id?: string
          impact_data?: Json
          notes?: string | null
          organization_id?: string | null
          points_earned?: number
          project_id?: string | null
          updated_at?: string
          user_id?: string
          validation_score?: number | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_definitions: {
        Row: {
          base_impact: Json
          category: string
          created_at: string
          description: string
          difficulty: string
          duration_days: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_continuous: boolean | null
          is_team_challenge: boolean | null
          location: string | null
          max_team_size: number | null
          min_team_size: number | null
          points_base: number
          project_id: string | null
          publication_status: string | null
          sponsor_id: string | null
          start_date: string | null
          title: string
          translations: Json | null
          validation_requirements: Json | null
        }
        Insert: {
          base_impact: Json
          category: string
          created_at?: string
          description: string
          difficulty?: string
          duration_days?: number | null
          end_date?: string | null
          id: string
          image_url?: string | null
          is_active?: boolean | null
          is_continuous?: boolean | null
          is_team_challenge?: boolean | null
          location?: string | null
          max_team_size?: number | null
          min_team_size?: number | null
          points_base?: number
          project_id?: string | null
          publication_status?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          title: string
          translations?: Json | null
          validation_requirements?: Json | null
        }
        Update: {
          base_impact?: Json
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration_days?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_continuous?: boolean | null
          is_team_challenge?: boolean | null
          location?: string | null
          max_team_size?: number | null
          min_team_size?: number | null
          points_base?: number
          project_id?: string | null
          publication_status?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          title?: string
          translations?: Json | null
          validation_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_definitions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_definitions_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_sponsorships: {
        Row: {
          amount_paid: number | null
          challenge_id: string
          created_at: string | null
          credit_cost: number | null
          end_date: string | null
          id: string
          package_type: string
          project_id: string | null
          region: string
          sponsor_organization_id: string | null
          sponsor_user_id: string
          start_date: string
          status: string
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          challenge_id: string
          created_at?: string | null
          credit_cost?: number | null
          end_date?: string | null
          id?: string
          package_type: string
          project_id?: string | null
          region: string
          sponsor_organization_id?: string | null
          sponsor_user_id: string
          start_date?: string
          status?: string
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          challenge_id?: string
          created_at?: string | null
          credit_cost?: number | null
          end_date?: string | null
          id?: string
          package_type?: string
          project_id?: string | null
          region?: string
          sponsor_organization_id?: string | null
          sponsor_user_id?: string
          start_date?: string
          status?: string
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_sponsorships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_sponsorships_sponsor_organization_id_fkey"
            columns: ["sponsor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_answers: {
        Row: {
          answer: string
          created_at: string | null
          expert_id: string
          id: string
          question_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          expert_id: string
          id?: string
          question_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          expert_id?: string
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_creations: {
        Row: {
          caption: string | null
          content_id: string | null
          created_at: string | null
          id: string
          image_url: string
          rating: number | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          rating?: number | null
          user_id: string
        }
        Update: {
          caption?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_creations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      community_questions: {
        Row: {
          content_id: string | null
          created_at: string | null
          id: string
          question: string
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          question: string
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_questions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      content_access: {
        Row: {
          access_type: string | null
          amount_paid: number | null
          content_id: string
          created_at: string
          id: string
          payment_reference: string | null
          purchased_at: string
          sponsorship_id: string | null
          user_id: string
        }
        Insert: {
          access_type?: string | null
          amount_paid?: number | null
          content_id: string
          created_at?: string
          id?: string
          payment_reference?: string | null
          purchased_at?: string
          sponsorship_id?: string | null
          user_id: string
        }
        Update: {
          access_type?: string | null
          amount_paid?: number | null
          content_id?: string
          created_at?: string
          id?: string
          payment_reference?: string | null
          purchased_at?: string
          sponsorship_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_access_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_access_sponsorship_id_fkey"
            columns: ["sponsorship_id"]
            isOneToOne: false
            referencedRelation: "content_sponsorships"
            referencedColumns: ["id"]
          },
        ]
      }
      content_milestones: {
        Row: {
          content: string | null
          content_id: string
          created_at: string | null
          id: string
          image_url: string | null
          order_index: number | null
          tip: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          content_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          tip?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          content_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          tip?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_milestones_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          comment: string | null
          content_id: string
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          content_id: string
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          content_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sponsorships: {
        Row: {
          content_id: string
          created_at: string | null
          discount_description: string | null
          discount_type: string | null
          discount_value: string | null
          id: string
          is_active: boolean | null
          is_category_sponsorship: boolean | null
          is_chain_partner: boolean | null
          max_sponsored_seats: number | null
          redemption_location: string | null
          sponsor_contribution_huf: number | null
          sponsor_id: string
          sponsored_seats_used: number | null
          sponsorship_benefit: string | null
          supported_category: string | null
          total_licenses: number
          used_licenses: number | null
        }
        Insert: {
          content_id: string
          created_at?: string | null
          discount_description?: string | null
          discount_type?: string | null
          discount_value?: string | null
          id?: string
          is_active?: boolean | null
          is_category_sponsorship?: boolean | null
          is_chain_partner?: boolean | null
          max_sponsored_seats?: number | null
          redemption_location?: string | null
          sponsor_contribution_huf?: number | null
          sponsor_id: string
          sponsored_seats_used?: number | null
          sponsorship_benefit?: string | null
          supported_category?: string | null
          total_licenses?: number
          used_licenses?: number | null
        }
        Update: {
          content_id?: string
          created_at?: string | null
          discount_description?: string | null
          discount_type?: string | null
          discount_value?: string | null
          id?: string
          is_active?: boolean | null
          is_category_sponsorship?: boolean | null
          is_chain_partner?: boolean | null
          max_sponsored_seats?: number | null
          redemption_location?: string | null
          sponsor_contribution_huf?: number | null
          sponsor_id?: string
          sponsored_seats_used?: number | null
          sponsorship_benefit?: string | null
          supported_category?: string | null
          total_licenses?: number
          used_licenses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_sponsorships_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_sponsorships_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      content_waitlist: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_waitlist_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_package_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          initial_credits: number
          package_type: string
          processed_at: string | null
          remaining_credits: number
          rollover_credits: number | null
          sponsor_user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          initial_credits: number
          package_type: string
          processed_at?: string | null
          remaining_credits: number
          rollover_credits?: number | null
          sponsor_user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          initial_credits?: number
          package_type?: string
          processed_at?: string | null
          remaining_credits?: number
          rollover_credits?: number | null
          sponsor_user_id?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string | null
          credits: number
          id: string
          name: string
          price_eur: number
          price_huf: number
        }
        Insert: {
          created_at?: string | null
          credits: number
          id?: string
          name: string
          price_eur: number
          price_huf: number
        }
        Update: {
          created_at?: string | null
          credits?: number
          id?: string
          name?: string
          price_eur?: number
          price_huf?: number
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          created_at: string | null
          credits: number
          description: string | null
          id: string
          organization_id: string | null
          related_sponsorship_id: string | null
          sponsor_user_id: string
          subscription_id: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          credits: number
          description?: string | null
          id?: string
          organization_id?: string | null
          related_sponsorship_id?: string | null
          sponsor_user_id: string
          subscription_id?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          credits?: number
          description?: string | null
          id?: string
          organization_id?: string | null
          related_sponsorship_id?: string | null
          sponsor_user_id?: string
          subscription_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_related_sponsorship_id_fkey"
            columns: ["related_sponsorship_id"]
            isOneToOne: false
            referencedRelation: "challenge_sponsorships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "organization_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_all_day: boolean | null
          is_public: boolean | null
          latitude: number | null
          location_address: string | null
          location_name: string | null
          longitude: number | null
          max_participants: number | null
          organization_id: string | null
          program_id: string | null
          project_id: string | null
          recurrence: string | null
          start_date: string
          status: string | null
          title: string
          updated_at: string | null
          village: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_all_day?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number | null
          organization_id?: string | null
          program_id?: string | null
          project_id?: string | null
          recurrence?: string | null
          start_date: string
          status?: string | null
          title: string
          updated_at?: string | null
          village?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_all_day?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number | null
          organization_id?: string | null
          program_id?: string | null
          project_id?: string | null
          recurrence?: string | null
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_contents: {
        Row: {
          access_level: string | null
          access_type: string | null
          category: string | null
          content_type: string | null
          content_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          fixed_sponsor_amount: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          is_sponsored: boolean | null
          max_capacity: number | null
          og_image_url: string | null
          price_huf: number | null
          region_id: string | null
          rejected_at: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seo_description: string | null
          seo_title: string | null
          sponsor_id: string | null
          sponsor_logo_url: string | null
          sponsor_name: string | null
          thumbnail_url: string | null
          title: string
          title_de: string | null
          title_en: string | null
          tools_needed: string | null
          total_licenses: number | null
          updated_at: string | null
          used_licenses: number | null
        }
        Insert: {
          access_level?: string | null
          access_type?: string | null
          category?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          fixed_sponsor_amount?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_sponsored?: boolean | null
          max_capacity?: number | null
          og_image_url?: string | null
          price_huf?: number | null
          region_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sponsor_id?: string | null
          sponsor_logo_url?: string | null
          sponsor_name?: string | null
          thumbnail_url?: string | null
          title: string
          title_de?: string | null
          title_en?: string | null
          tools_needed?: string | null
          total_licenses?: number | null
          updated_at?: string | null
          used_licenses?: number | null
        }
        Update: {
          access_level?: string | null
          access_type?: string | null
          category?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          fixed_sponsor_amount?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_sponsored?: boolean | null
          max_capacity?: number | null
          og_image_url?: string | null
          price_huf?: number | null
          region_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sponsor_id?: string | null
          sponsor_logo_url?: string | null
          sponsor_name?: string | null
          thumbnail_url?: string | null
          title?: string
          title_de?: string | null
          title_en?: string | null
          tools_needed?: string | null
          total_licenses?: number | null
          updated_at?: string | null
          used_licenses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_contents_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_contents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_contents_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_media: {
        Row: {
          ai_suggestion: Json | null
          analyzed_at: string | null
          created_at: string
          expert_id: string
          file_type: string
          file_url: string
          id: string
          program_id: string | null
          status: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          ai_suggestion?: Json | null
          analyzed_at?: string | null
          created_at?: string
          expert_id: string
          file_type: string
          file_url: string
          id?: string
          program_id?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          ai_suggestion?: Json | null
          analyzed_at?: string | null
          created_at?: string
          expert_id?: string
          file_type?: string
          file_url?: string
          id?: string
          program_id?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_media_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_media_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_services: {
        Row: {
          content_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          expert_id: string
          id: string
          is_active: boolean | null
          price_huf: number
          service_type: string | null
          title: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          expert_id: string
          id?: string
          is_active?: boolean | null
          price_huf: number
          service_type?: string | null
          title: string
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          expert_id?: string
          id?: string
          is_active?: boolean | null
          price_huf?: number
          service_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_services_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          feedback_type: string
          id: string
          message: string
          page_url: string | null
          screenshot_url: string | null
          status: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          feedback_type: string
          id?: string
          message: string
          page_url?: string | null
          screenshot_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          feedback_type?: string
          id?: string
          message?: string
          page_url?: string | null
          screenshot_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          billing_address: string | null
          billing_name: string | null
          billing_tax_number: string | null
          created_at: string | null
          credit_transaction_id: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          organization_id: string | null
          paid_at: string | null
          pdf_url: string | null
          status: string | null
          stripe_invoice_id: string | null
          subscription_id: string | null
          tax_amount: number | null
          total_amount: number
          type: string
        }
        Insert: {
          amount: number
          billing_address?: string | null
          billing_name?: string | null
          billing_tax_number?: string | null
          created_at?: string | null
          credit_transaction_id?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          organization_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount: number
          type: string
        }
        Update: {
          amount?: number
          billing_address?: string | null
          billing_name?: string | null
          billing_tax_number?: string | null
          created_at?: string | null
          credit_transaction_id?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          organization_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_credit_transaction_id_fkey"
            columns: ["credit_transaction_id"]
            isOneToOne: false
            referencedRelation: "credit_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_content: {
        Row: {
          content_type: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          section_key: string
          translations: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_key: string
          translations?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_key?: string
          translations?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      local_partners: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          message: string
          message_type: string
          read_at: string | null
          recipient_user_id: string | null
          sender_email: string
          sender_name: string
          status: string
          subject: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message: string
          message_type: string
          read_at?: string | null
          recipient_user_id?: string | null
          sender_email: string
          sender_name: string
          status?: string
          subject?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          read_at?: string | null
          recipient_user_id?: string | null
          sender_email?: string
          sender_name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          admin_enabled: boolean
          community_enabled: boolean
          created_at: string
          id: string
          milestones_enabled: boolean
          push_enabled: boolean
          reminders_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_enabled?: boolean
          community_enabled?: boolean
          created_at?: string
          id?: string
          milestones_enabled?: boolean
          push_enabled?: boolean
          reminders_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_enabled?: boolean
          community_enabled?: boolean
          created_at?: string
          id?: string
          milestones_enabled?: boolean
          push_enabled?: boolean
          reminders_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_invites: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          invite_code: string
          is_active: boolean | null
          max_uses: number | null
          organization_id: string
          use_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          invite_code: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id: string
          use_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id?: string
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          payment_method: string | null
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          payment_method?: string | null
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          payment_method?: string | null
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          co2_reduction_total: number | null
          created_at: string | null
          description: string | null
          employee_count: number | null
          id: string
          industry: string | null
          is_public: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          project_id: string | null
          sustainability_score: number | null
          type: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          co2_reduction_total?: number | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          project_id?: string | null
          sustainability_score?: number | null
          type: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          co2_reduction_total?: number | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          project_id?: string | null
          sustainability_score?: number | null
          type?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_terms_at: string | null
          accepted_terms_version: string | null
          auto_create_drafts: boolean | null
          avatar_url: string | null
          bio: string | null
          bio_de: string | null
          bio_en: string | null
          city: string | null
          company_size: string | null
          country: string | null
          created_at: string
          credit_balance: number | null
          district: string | null
          email: string
          employee_count: number | null
          expert_bio_long: string | null
          expert_title: string | null
          expert_title_de: string | null
          expert_title_en: string | null
          expertise_areas: string[] | null
          first_name: string
          id: string
          industry: string | null
          is_premium: boolean | null
          is_public_profile: boolean | null
          is_super_admin: boolean | null
          is_verified_expert: boolean | null
          last_name: string
          latitude: number | null
          location: string | null
          location_city: string | null
          location_point: unknown
          longitude: number | null
          organization: string | null
          organization_id: string | null
          organization_logo_url: string | null
          organization_name: string | null
          organization_name_de: string | null
          organization_name_en: string | null
          payout_enabled: boolean | null
          payout_preference: string | null
          preferred_language: string | null
          preferred_stakeholder_types: string[] | null
          premium_until: string | null
          primary_region: string | null
          project_id: string | null
          public_display_name: string | null
          references_links: Json | null
          referral_code: string | null
          region: string | null
          region_type: string | null
          role: string | null
          seeking_partnerships: boolean | null
          social_links: Json | null
          sponsor_status: string | null
          stripe_account_id: string | null
          stripe_connect_id: string | null
          stripe_onboarding_complete: boolean | null
          suspended_at: string | null
          suspended_by: string | null
          suspended_reason: string | null
          sustainability_goals: string[] | null
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
          verification_status: string | null
          visibility_radius_km: number | null
          website_url: string | null
          wise_email: string | null
          wise_iban: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          accepted_terms_version?: string | null
          auto_create_drafts?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          bio_de?: string | null
          bio_en?: string | null
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          credit_balance?: number | null
          district?: string | null
          email: string
          employee_count?: number | null
          expert_bio_long?: string | null
          expert_title?: string | null
          expert_title_de?: string | null
          expert_title_en?: string | null
          expertise_areas?: string[] | null
          first_name: string
          id: string
          industry?: string | null
          is_premium?: boolean | null
          is_public_profile?: boolean | null
          is_super_admin?: boolean | null
          is_verified_expert?: boolean | null
          last_name: string
          latitude?: number | null
          location?: string | null
          location_city?: string | null
          location_point?: unknown
          longitude?: number | null
          organization?: string | null
          organization_id?: string | null
          organization_logo_url?: string | null
          organization_name?: string | null
          organization_name_de?: string | null
          organization_name_en?: string | null
          payout_enabled?: boolean | null
          payout_preference?: string | null
          preferred_language?: string | null
          preferred_stakeholder_types?: string[] | null
          premium_until?: string | null
          primary_region?: string | null
          project_id?: string | null
          public_display_name?: string | null
          references_links?: Json | null
          referral_code?: string | null
          region?: string | null
          region_type?: string | null
          role?: string | null
          seeking_partnerships?: boolean | null
          social_links?: Json | null
          sponsor_status?: string | null
          stripe_account_id?: string | null
          stripe_connect_id?: string | null
          stripe_onboarding_complete?: boolean | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          sustainability_goals?: string[] | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
          verification_status?: string | null
          visibility_radius_km?: number | null
          website_url?: string | null
          wise_email?: string | null
          wise_iban?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          accepted_terms_version?: string | null
          auto_create_drafts?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          bio_de?: string | null
          bio_en?: string | null
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          credit_balance?: number | null
          district?: string | null
          email?: string
          employee_count?: number | null
          expert_bio_long?: string | null
          expert_title?: string | null
          expert_title_de?: string | null
          expert_title_en?: string | null
          expertise_areas?: string[] | null
          first_name?: string
          id?: string
          industry?: string | null
          is_premium?: boolean | null
          is_public_profile?: boolean | null
          is_super_admin?: boolean | null
          is_verified_expert?: boolean | null
          last_name?: string
          latitude?: number | null
          location?: string | null
          location_city?: string | null
          location_point?: unknown
          longitude?: number | null
          organization?: string | null
          organization_id?: string | null
          organization_logo_url?: string | null
          organization_name?: string | null
          organization_name_de?: string | null
          organization_name_en?: string | null
          payout_enabled?: boolean | null
          payout_preference?: string | null
          preferred_language?: string | null
          preferred_stakeholder_types?: string[] | null
          premium_until?: string | null
          primary_region?: string | null
          project_id?: string | null
          public_display_name?: string | null
          references_links?: Json | null
          referral_code?: string | null
          region?: string | null
          region_type?: string | null
          role?: string | null
          seeking_partnerships?: boolean | null
          social_links?: Json | null
          sponsor_status?: string | null
          stripe_account_id?: string | null
          stripe_connect_id?: string | null
          stripe_onboarding_complete?: boolean | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          sustainability_goals?: string[] | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
          verification_status?: string | null
          visibility_radius_km?: number | null
          website_url?: string | null
          wise_email?: string | null
          wise_iban?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      program_media_links: {
        Row: {
          created_at: string
          id: string
          media_id: string
          position: number | null
          program_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          position?: number | null
          program_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          position?: number | null
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_media_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "expert_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_media_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "expert_media_with_usage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_media_links_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          branding: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          region_name: string
          settings: Json | null
          slug: string
          translations: Json | null
          updated_at: string | null
          villages: string[] | null
        }
        Insert: {
          branding?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region_name: string
          settings?: Json | null
          slug: string
          translations?: Json | null
          updated_at?: string | null
          villages?: string[] | null
        }
        Update: {
          branding?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region_name?: string
          settings?: Json | null
          slug?: string
          translations?: Json | null
          updated_at?: string | null
          villages?: string[] | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          invitee_email: string | null
          invitee_id: string | null
          joined_at: string | null
          referrer_id: string
          reward_claimed: boolean | null
          reward_points: number | null
          source: string | null
          status: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          invitee_email?: string | null
          invitee_id?: string | null
          joined_at?: string | null
          referrer_id: string
          reward_claimed?: boolean | null
          reward_points?: number | null
          source?: string | null
          status?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          invitee_email?: string | null
          invitee_id?: string | null
          joined_at?: string | null
          referrer_id?: string
          reward_claimed?: boolean | null
          reward_points?: number | null
          source?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          country_code: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          locale: string | null
          name: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          id: string
          is_active?: boolean | null
          locale?: string | null
          name: string
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          name?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      sponsor_activity_log: {
        Row: {
          activity_type: string
          content_id: string | null
          content_title: string | null
          created_at: string | null
          credit_amount: number | null
          id: string
          member_id: string | null
          member_name: string | null
          message: string | null
          sponsor_id: string
        }
        Insert: {
          activity_type: string
          content_id?: string | null
          content_title?: string | null
          created_at?: string | null
          credit_amount?: number | null
          id?: string
          member_id?: string | null
          member_name?: string | null
          message?: string | null
          sponsor_id: string
        }
        Update: {
          activity_type?: string
          content_id?: string | null
          content_title?: string | null
          created_at?: string | null
          credit_amount?: number | null
          id?: string
          member_id?: string | null
          member_name?: string | null
          message?: string | null
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_activity_log_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_alerts: {
        Row: {
          alert_type: string
          email_sent_to: string | null
          id: string
          metadata: Json | null
          sent_at: string | null
          sponsor_user_id: string
        }
        Insert: {
          alert_type: string
          email_sent_to?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          sponsor_user_id: string
        }
        Update: {
          alert_type?: string
          email_sent_to?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          sponsor_user_id?: string
        }
        Relationships: []
      }
      sponsor_credits: {
        Row: {
          available_credits: number | null
          created_at: string | null
          credits_never_expire: boolean | null
          id: string
          initial_credits: number | null
          is_renewed: boolean | null
          low_balance_alert_sent: boolean | null
          organization_id: string | null
          package_end_date: string | null
          package_start_date: string | null
          previous_package_rollover: number | null
          sponsor_user_id: string
          sponsored_category: string | null
          sponsored_expert_id: string | null
          sponsorship_type: string | null
          subscription_id: string | null
          total_credits: number
          updated_at: string | null
          used_credits: number
        }
        Insert: {
          available_credits?: number | null
          created_at?: string | null
          credits_never_expire?: boolean | null
          id?: string
          initial_credits?: number | null
          is_renewed?: boolean | null
          low_balance_alert_sent?: boolean | null
          organization_id?: string | null
          package_end_date?: string | null
          package_start_date?: string | null
          previous_package_rollover?: number | null
          sponsor_user_id: string
          sponsored_category?: string | null
          sponsored_expert_id?: string | null
          sponsorship_type?: string | null
          subscription_id?: string | null
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
        }
        Update: {
          available_credits?: number | null
          created_at?: string | null
          credits_never_expire?: boolean | null
          id?: string
          initial_credits?: number | null
          is_renewed?: boolean | null
          low_balance_alert_sent?: boolean | null
          organization_id?: string | null
          package_end_date?: string | null
          package_start_date?: string | null
          previous_package_rollover?: number | null
          sponsor_user_id?: string
          sponsored_category?: string | null
          sponsored_expert_id?: string | null
          sponsorship_type?: string | null
          subscription_id?: string | null
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_credits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_credits_sponsored_expert_id_fkey"
            columns: ["sponsored_expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_credits_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "organization_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_packages: {
        Row: {
          billing_period: string
          bonus_credits_huf: number | null
          created_at: string | null
          credits_huf: number
          id: string
          is_active: boolean | null
          name_en: string
          name_hu: string
          package_key: string
          platform_fee_huf: number
          total_price_huf: number
        }
        Insert: {
          billing_period: string
          bonus_credits_huf?: number | null
          created_at?: string | null
          credits_huf: number
          id?: string
          is_active?: boolean | null
          name_en: string
          name_hu: string
          package_key: string
          platform_fee_huf: number
          total_price_huf: number
        }
        Update: {
          billing_period?: string
          bonus_credits_huf?: number | null
          created_at?: string | null
          credits_huf?: number
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_hu?: string
          package_key?: string
          platform_fee_huf?: number
          total_price_huf?: number
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location_city: string | null
          logo_url: string | null
          name: string
          slug: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location_city?: string | null
          logo_url?: string | null
          name: string
          slug?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location_city?: string | null
          logo_url?: string | null
          name?: string
          slug?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string | null
          billing_period: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          included_credits: number | null
          is_active: boolean | null
          monthly_credits: number | null
          name: string
          plan_key: string
          price_eur: number
          price_huf: number
          target_user_role: string | null
          yearly_bonus_credits: number | null
        }
        Insert: {
          billing_interval?: string | null
          billing_period?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          included_credits?: number | null
          is_active?: boolean | null
          monthly_credits?: number | null
          name: string
          plan_key: string
          price_eur: number
          price_huf: number
          target_user_role?: string | null
          yearly_bonus_credits?: number | null
        }
        Update: {
          billing_interval?: string | null
          billing_period?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          included_credits?: number | null
          is_active?: boolean | null
          monthly_credits?: number | null
          name?: string
          plan_key?: string
          price_eur?: number
          price_huf?: number
          target_user_role?: string | null
          yearly_bonus_credits?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          included_credits: number | null
          notes: string | null
          organization_id: string | null
          payment_reference: string | null
          plan_type: string
          price_paid: number | null
          start_date: string | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          included_credits?: number | null
          notes?: string | null
          organization_id?: string | null
          payment_reference?: string | null
          plan_type: string
          price_paid?: number | null
          start_date?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          included_credits?: number | null
          notes?: string | null
          organization_id?: string | null
          payment_reference?: string | null
          plan_type?: string
          price_paid?: number | null
          start_date?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sustainability_activities: {
        Row: {
          activity_type: string
          auto_generated: boolean | null
          challenge_completion_id: string | null
          confidence_score: number | null
          created_at: string | null
          date: string | null
          description: string | null
          evidence_url: string | null
          id: string
          impact_amount: number
          organization_id: string | null
          points_earned: number | null
          project_id: string | null
          user_id: string
          validation_method: string | null
        }
        Insert: {
          activity_type: string
          auto_generated?: boolean | null
          challenge_completion_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          impact_amount: number
          organization_id?: string | null
          points_earned?: number | null
          project_id?: string | null
          user_id: string
          validation_method?: string | null
        }
        Update: {
          activity_type?: string
          auto_generated?: boolean | null
          challenge_completion_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          impact_amount?: number
          organization_id?: string | null
          points_earned?: number | null
          project_id?: string | null
          user_id?: string
          validation_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_activities_challenge_completion_id_fkey"
            columns: ["challenge_completion_id"]
            isOneToOne: false
            referencedRelation: "challenge_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sustainability_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sustainability_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sustainability_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          invitee_email: string
          invitee_name: string | null
          inviter_user_id: string
          message: string | null
          organization_id: string
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          invitee_email: string
          invitee_name?: string | null
          inviter_user_id: string
          message?: string | null
          organization_id: string
          status?: string
          token?: string
          updated_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          invitee_email?: string
          invitee_name?: string | null
          inviter_user_id?: string
          message?: string | null
          organization_id?: string
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          amount_creator: number | null
          amount_platform: number | null
          buyer_id: string
          content_id: string
          created_at: string | null
          creator_id: string
          creator_revenue: number
          expert_payout: number | null
          expert_price_huf: number | null
          expert_share: number | null
          gross_amount: number | null
          id: string
          license_count: number | null
          member_payment_amount: number | null
          platform_commission: number | null
          platform_fee: number
          platform_share: number | null
          share_percentage: number | null
          sponsor_id: string | null
          sponsor_payment_amount: number | null
          sponsorship_id: string | null
          status: string | null
          transaction_type: string | null
        }
        Insert: {
          amount: number
          amount_creator?: number | null
          amount_platform?: number | null
          buyer_id: string
          content_id: string
          created_at?: string | null
          creator_id: string
          creator_revenue: number
          expert_payout?: number | null
          expert_price_huf?: number | null
          expert_share?: number | null
          gross_amount?: number | null
          id?: string
          license_count?: number | null
          member_payment_amount?: number | null
          platform_commission?: number | null
          platform_fee: number
          platform_share?: number | null
          share_percentage?: number | null
          sponsor_id?: string | null
          sponsor_payment_amount?: number | null
          sponsorship_id?: string | null
          status?: string | null
          transaction_type?: string | null
        }
        Update: {
          amount?: number
          amount_creator?: number | null
          amount_platform?: number | null
          buyer_id?: string
          content_id?: string
          created_at?: string | null
          creator_id?: string
          creator_revenue?: number
          expert_payout?: number | null
          expert_price_huf?: number | null
          expert_share?: number | null
          gross_amount?: number | null
          id?: string
          license_count?: number | null
          member_payment_amount?: number | null
          platform_commission?: number | null
          platform_fee?: number
          platform_share?: number | null
          share_percentage?: number | null
          sponsor_id?: string | null
          sponsor_payment_amount?: number | null
          sponsorship_id?: string | null
          status?: string | null
          transaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sponsorship_id_fkey"
            columns: ["sponsorship_id"]
            isOneToOne: false
            referencedRelation: "content_sponsorships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_view_state: {
        Row: {
          active_view: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_view?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_view?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voucher_settlements: {
        Row: {
          cancellation_date: string | null
          content_id: string | null
          created_at: string | null
          days_before_event: number | null
          event_date: string | null
          expert_id: string | null
          expert_payout: number
          id: string
          notes: string | null
          original_price: number
          platform_fee: number
          processed_at: string | null
          settlement_status: string | null
          settlement_type: string
          sponsor_contribution: number | null
          sponsor_credit_action: string | null
          sponsor_id: string | null
          user_id: string
          user_payment: number | null
          user_refund: number | null
          voucher_id: string
        }
        Insert: {
          cancellation_date?: string | null
          content_id?: string | null
          created_at?: string | null
          days_before_event?: number | null
          event_date?: string | null
          expert_id?: string | null
          expert_payout?: number
          id?: string
          notes?: string | null
          original_price?: number
          platform_fee?: number
          processed_at?: string | null
          settlement_status?: string | null
          settlement_type: string
          sponsor_contribution?: number | null
          sponsor_credit_action?: string | null
          sponsor_id?: string | null
          user_id: string
          user_payment?: number | null
          user_refund?: number | null
          voucher_id: string
        }
        Update: {
          cancellation_date?: string | null
          content_id?: string | null
          created_at?: string | null
          days_before_event?: number | null
          event_date?: string | null
          expert_id?: string | null
          expert_payout?: number
          id?: string
          notes?: string | null
          original_price?: number
          platform_fee?: number
          processed_at?: string | null
          settlement_status?: string | null
          settlement_type?: string
          sponsor_contribution?: number | null
          sponsor_credit_action?: string | null
          sponsor_id?: string | null
          user_id?: string
          user_payment?: number | null
          user_refund?: number | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_settlements_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_settlements_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_settlements_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_settlements_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          cancellation_date: string | null
          cancellation_type: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          code: string
          content_id: string
          created_at: string | null
          credit_status: string | null
          event_date: string | null
          expert_payout_status: string | null
          expires_at: string | null
          financial_notes: string | null
          id: string
          is_no_show: boolean | null
          no_show_at: string | null
          payout_amount: number | null
          pickup_location: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          refund_amount: number | null
          sponsor_credit_deducted: number | null
          sponsor_credit_status: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          cancellation_date?: string | null
          cancellation_type?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code: string
          content_id: string
          created_at?: string | null
          credit_status?: string | null
          event_date?: string | null
          expert_payout_status?: string | null
          expires_at?: string | null
          financial_notes?: string | null
          id?: string
          is_no_show?: boolean | null
          no_show_at?: string | null
          payout_amount?: number | null
          pickup_location?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          refund_amount?: number | null
          sponsor_credit_deducted?: number | null
          sponsor_credit_status?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          cancellation_date?: string | null
          cancellation_type?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code?: string
          content_id?: string
          created_at?: string | null
          credit_status?: string | null
          event_date?: string | null
          expert_payout_status?: string | null
          expires_at?: string | null
          financial_notes?: string | null
          id?: string
          is_no_show?: boolean | null
          no_show_at?: string | null
          payout_amount?: number | null
          pickup_location?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          refund_amount?: number | null
          sponsor_credit_deducted?: number | null
          sponsor_credit_status?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_task_queue: {
        Row: {
          count: number | null
          label_en: string | null
          label_hu: string | null
          task_type: string | null
        }
        Relationships: []
      }
      expert_media_with_usage: {
        Row: {
          ai_suggestion: Json | null
          analyzed_at: string | null
          created_at: string | null
          expert_id: string | null
          file_type: string | null
          file_url: string | null
          id: string | null
          program_id: string | null
          status: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          usage_count: number | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_media_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_media_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "expert_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      calculate_program_payment: {
        Args: { expert_price_huf: number; sponsor_contribution_huf?: number }
        Returns: {
          expert_payout_huf: number
          member_payment_huf: number
          platform_commission_huf: number
          sponsor_payment_huf: number
          total_collected_huf: number
        }[]
      }
      can_use_view: {
        Args: { _user_id: string; _view: string }
        Returns: boolean
      }
      check_and_reserve_sponsored_seat: {
        Args: { p_sponsorship_id: string; p_user_id: string }
        Returns: {
          message: string
          seats_remaining: number
          success: boolean
        }[]
      }
      check_content_access: {
        Args: { p_content_id: string; p_user_id: string }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_nearby_stakeholders: {
        Args: {
          p_latitude: number
          p_limit?: number
          p_longitude: number
          p_project_id?: string
          p_radius_meters?: number
        }
        Returns: {
          avatar_url: string
          bio: string
          distance_meters: number
          id: string
          industry: string
          location: string
          name: string
          organization: string
          user_role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_admin_platform_stats: { Args: never; Returns: Json }
      get_available_views: { Args: { _user_id: string }; Returns: string[] }
      get_community_impact_stats: {
        Args: { p_project_id?: string }
        Returns: Json
      }
      get_community_impact_summary: {
        Args: { p_project_id?: string }
        Returns: Json
      }
      get_content_access_status: {
        Args: { p_content_id: string; p_user_id: string }
        Returns: Json
      }
      get_content_average_rating: {
        Args: { p_content_id: string }
        Returns: number
      }
      get_content_review_count: {
        Args: { p_content_id: string }
        Returns: number
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_organization_member_profiles: {
        Args: { _organization_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          first_name: string
          id: string
          industry: string
          is_public_profile: boolean
          last_name: string
          location: string
          organization: string
          organization_id: string
          public_display_name: string
          sustainability_goals: string[]
          user_role: Database["public"]["Enums"]["user_role"]
          website_url: string
        }[]
      }
      get_organization_members_for_invitations: {
        Args: { _organization_id: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          public_display_name: string
          user_role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_organization_subscription: {
        Args: { _organization_id: string }
        Returns: {
          current_period_end: string
          current_period_start: string
          included_credits: number
          monthly_credits: number
          plan_id: string
          plan_key: string
          plan_name: string
          status: string
          subscription_id: string
        }[]
      }
      get_public_profile: {
        Args: { _profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          first_name: string
          id: string
          industry: string
          is_public_profile: boolean
          last_name: string
          location: string
          organization: string
          organization_id: string
          public_display_name: string
          sustainability_goals: string[]
          user_role: Database["public"]["Enums"]["user_role"]
          website_url: string
        }[]
      }
      get_regional_village_stats: {
        Args: { p_project_id?: string }
        Returns: Json
      }
      get_user_impact_summary: { Args: { p_user_id?: string }; Returns: Json }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_projects: {
        Args: { _user_id: string }
        Returns: {
          project_id: string
          project_name: string
          project_slug: string
          user_role: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_profile_public: { Args: { _profile_id: string }; Returns: boolean }
      is_project_admin: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_voucher_noshow: { Args: { p_voucher_code: string }; Returns: Json }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      process_credit_expiry: { Args: never; Returns: number }
      process_credit_renewal: {
        Args: {
          p_new_credits: number
          p_package_type?: string
          p_sponsor_user_id: string
        }
        Returns: Json
      }
      process_early_cancellation: {
        Args: { p_processed_by?: string; p_voucher_id: string }
        Returns: Json
      }
      process_noshow_or_late_cancellation: {
        Args: {
          p_cancellation_type: string
          p_processed_by?: string
          p_voucher_id: string
        }
        Returns: Json
      }
      process_sponsored_purchase: {
        Args: {
          p_content_id: string
          p_sponsorship_id: string
          p_user_id: string
        }
        Returns: {
          member_amount: number
          message: string
          sponsor_amount: number
          success: boolean
        }[]
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "business"
        | "government"
        | "ngo"
        | "citizen"
        | "project_admin"
      content_access_level:
        | "free"
        | "registered"
        | "premium"
        | "one_time_purchase"
      user_role:
        | "citizen"
        | "business"
        | "government"
        | "ngo"
        | "creator"
        | "member"
        | "expert"
        | "sponsor"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      app_role: [
        "super_admin",
        "admin",
        "business",
        "government",
        "ngo",
        "citizen",
        "project_admin",
      ],
      content_access_level: [
        "free",
        "registered",
        "premium",
        "one_time_purchase",
      ],
      user_role: [
        "citizen",
        "business",
        "government",
        "ngo",
        "creator",
        "member",
        "expert",
        "sponsor",
      ],
    },
  },
} as const
