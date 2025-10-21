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
          updated_at?: string
          user_id?: string
          validation_score?: number | null
          validation_status?: string
        }
        Relationships: []
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
          end_date: string | null
          id: string
          package_type: string
          region: string
          sponsor_organization_id: string | null
          sponsor_user_id: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          challenge_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          package_type: string
          region: string
          sponsor_organization_id?: string | null
          sponsor_user_id: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          challenge_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          package_type?: string
          region?: string
          sponsor_organization_id?: string | null
          sponsor_user_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_sponsorships_sponsor_organization_id_fkey"
            columns: ["sponsor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          sustainability_score?: number | null
          type?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
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
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
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
            foreignKeyName: "sustainability_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sustainability_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "regional_stakeholders"
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
      my_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      regional_stakeholders: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          district: string | null
          first_name: string | null
          id: string | null
          is_public_profile: boolean | null
          last_name: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          organization: string | null
          organization_id: string | null
          preferred_stakeholder_types: string[] | null
          public_display_name: string | null
          region: string | null
          region_type: string | null
          seeking_partnerships: boolean | null
          sustainability_goals: string[] | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          visibility_radius_km: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          district?: string | null
          first_name?: string | null
          id?: string | null
          is_public_profile?: boolean | null
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization?: string | null
          organization_id?: string | null
          preferred_stakeholder_types?: string[] | null
          public_display_name?: string | null
          region?: string | null
          region_type?: string | null
          seeking_partnerships?: boolean | null
          sustainability_goals?: string[] | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          visibility_radius_km?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          district?: string | null
          first_name?: string | null
          id?: string | null
          is_public_profile?: boolean | null
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organization?: string | null
          organization_id?: string | null
          preferred_stakeholder_types?: string[] | null
          public_display_name?: string | null
          region?: string | null
          region_type?: string | null
          seeking_partnerships?: boolean | null
          sustainability_goals?: string[] | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          visibility_radius_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
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
      get_user_organization_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_profile_public: {
        Args: { _profile_id: string }
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
      ],
      user_role: ["citizen", "business", "government", "ngo"],
    },
  },
} as const
