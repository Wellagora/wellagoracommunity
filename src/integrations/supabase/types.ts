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
          points_earned?: number
          project_id?: string | null
          updated_at?: string
          user_id?: string
          validation_score?: number | null
          validation_status?: string
        }
        Relationships: [
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
          id: string
          is_active: boolean | null
          is_team_challenge: boolean | null
          max_team_size: number | null
          min_team_size: number | null
          points_base: number
          title: string
          validation_requirements: Json | null
        }
        Insert: {
          base_impact: Json
          category: string
          created_at?: string
          description: string
          difficulty?: string
          duration_days?: number | null
          id: string
          is_active?: boolean | null
          is_team_challenge?: boolean | null
          max_team_size?: number | null
          min_team_size?: number | null
          points_base?: number
          title: string
          validation_requirements?: Json | null
        }
        Update: {
          base_impact?: Json
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          is_team_challenge?: boolean | null
          max_team_size?: number | null
          min_team_size?: number | null
          points_base?: number
          title?: string
          validation_requirements?: Json | null
        }
        Relationships: []
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
          related_sponsorship_id: string | null
          sponsor_user_id: string
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          credits: number
          description?: string | null
          id?: string
          related_sponsorship_id?: string | null
          sponsor_user_id: string
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          credits?: number
          description?: string | null
          id?: string
          related_sponsorship_id?: string | null
          sponsor_user_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_related_sponsorship_id_fkey"
            columns: ["related_sponsorship_id"]
            isOneToOne: false
            referencedRelation: "challenge_sponsorships"
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
          avatar_url: string | null
          bio: string | null
          city: string | null
          company_size: string | null
          country: string | null
          created_at: string
          district: string | null
          email: string
          employee_count: number | null
          first_name: string
          id: string
          industry: string | null
          is_public_profile: boolean | null
          last_name: string
          latitude: number | null
          location: string | null
          longitude: number | null
          organization: string | null
          organization_id: string | null
          preferred_language: string | null
          preferred_stakeholder_types: string[] | null
          project_id: string | null
          public_display_name: string | null
          region: string | null
          region_type: string | null
          role: string
          seeking_partnerships: boolean | null
          sustainability_goals: string[] | null
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
          visibility_radius_km: number | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          district?: string | null
          email: string
          employee_count?: number | null
          first_name: string
          id: string
          industry?: string | null
          is_public_profile?: boolean | null
          last_name: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization?: string | null
          organization_id?: string | null
          preferred_language?: string | null
          preferred_stakeholder_types?: string[] | null
          project_id?: string | null
          public_display_name?: string | null
          region?: string | null
          region_type?: string | null
          role: string
          seeking_partnerships?: boolean | null
          sustainability_goals?: string[] | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
          visibility_radius_km?: number | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          district?: string | null
          email?: string
          employee_count?: number | null
          first_name?: string
          id?: string
          industry?: string | null
          is_public_profile?: boolean | null
          last_name?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization?: string | null
          organization_id?: string | null
          preferred_language?: string | null
          preferred_stakeholder_types?: string[] | null
          project_id?: string | null
          public_display_name?: string | null
          region?: string | null
          region_type?: string | null
          role?: string
          seeking_partnerships?: boolean | null
          sustainability_goals?: string[] | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
          visibility_radius_km?: number | null
          website_url?: string | null
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
          updated_at?: string | null
          villages?: string[] | null
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
      sponsor_credits: {
        Row: {
          available_credits: number | null
          created_at: string | null
          id: string
          sponsor_user_id: string
          total_credits: number
          updated_at: string | null
          used_credits: number
        }
        Insert: {
          available_credits?: number | null
          created_at?: string | null
          id?: string
          sponsor_user_id: string
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
        }
        Update: {
          available_credits?: number | null
          created_at?: string | null
          id?: string
          sponsor_user_id?: string
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      user_role: "citizen" | "business" | "government" | "ngo"
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
      app_role: [
        "super_admin",
        "admin",
        "business",
        "government",
        "ngo",
        "citizen",
        "project_admin",
      ],
      user_role: ["citizen", "business", "government", "ngo"],
    },
  },
} as const
