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
      campaign_comments: {
        Row: {
          campaign_id: string
          content: string
          created_at: string | null
          id: string
          moderated: boolean | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string | null
          id?: string
          moderated?: boolean | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string | null
          id?: string
          moderated?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_comments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_updates: {
        Row: {
          campaign_id: string
          content: string
          created_at: string | null
          creator_id: string
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string | null
          creator_id: string
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string | null
          creator_id?: string
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_updates_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          bank_details: Json | null
          category: Database["public"]["Enums"]["campaign_category"]
          created_at: string | null
          creator_id: string
          currency: string | null
          current_amount: number | null
          deadline: string | null
          description: string
          featured: boolean | null
          goal_amount: number
          id: string
          image_url: string | null
          location_lga: string | null
          location_state: string
          status: Database["public"]["Enums"]["campaign_status"] | null
          story: string
          title: string
          updated_at: string | null
          verification_documents: Json | null
          verified: boolean | null
          video_url: string | null
        }
        Insert: {
          bank_details?: Json | null
          category: Database["public"]["Enums"]["campaign_category"]
          created_at?: string | null
          creator_id: string
          currency?: string | null
          current_amount?: number | null
          deadline?: string | null
          description: string
          featured?: boolean | null
          goal_amount: number
          id?: string
          image_url?: string | null
          location_lga?: string | null
          location_state: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          story: string
          title: string
          updated_at?: string | null
          verification_documents?: Json | null
          verified?: boolean | null
          video_url?: string | null
        }
        Update: {
          bank_details?: Json | null
          category?: Database["public"]["Enums"]["campaign_category"]
          created_at?: string | null
          creator_id?: string
          currency?: string | null
          current_amount?: number | null
          deadline?: string | null
          description?: string
          featured?: boolean | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          location_lga?: string | null
          location_state?: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          story?: string
          title?: string
          updated_at?: string | null
          verification_documents?: Json | null
          verified?: boolean | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string | null
          currency: string | null
          donor_id: string | null
          id: string
          is_anonymous: boolean | null
          message: string | null
          payment_method: string | null
          payment_reference: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          paystack_reference: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string | null
          currency?: string | null
          donor_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_reference: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          paystack_reference?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string | null
          currency?: string | null
          donor_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_reference?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          paystack_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bvn_verified: boolean | null
          created_at: string | null
          full_name: string
          id: string
          location_lga: string | null
          location_state: string | null
          phone_number: string | null
          updated_at: string | null
          verified_status: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bvn_verified?: boolean | null
          created_at?: string | null
          full_name: string
          id: string
          location_lga?: string | null
          location_state?: string | null
          phone_number?: string | null
          updated_at?: string | null
          verified_status?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bvn_verified?: boolean | null
          created_at?: string | null
          full_name?: string
          id?: string
          location_lga?: string | null
          location_state?: string | null
          phone_number?: string | null
          updated_at?: string | null
          verified_status?: boolean | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reported_type?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          bank_name: string
          campaign_id: string
          creator_id: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          bank_name: string
          campaign_id: string
          creator_id: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          bank_name?: string
          campaign_id?: string
          creator_id?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "campaign_creator" | "donor"
      campaign_category:
        | "education"
        | "healthcare"
        | "business"
        | "community"
        | "emergency"
      campaign_status:
        | "draft"
        | "pending"
        | "active"
        | "completed"
        | "suspended"
        | "rejected"
      payment_status: "pending" | "successful" | "failed" | "refunded"
      report_status: "pending" | "investigating" | "resolved" | "dismissed"
      withdrawal_status: "pending" | "processing" | "completed" | "rejected"
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
      app_role: ["admin", "moderator", "campaign_creator", "donor"],
      campaign_category: [
        "education",
        "healthcare",
        "business",
        "community",
        "emergency",
      ],
      campaign_status: [
        "draft",
        "pending",
        "active",
        "completed",
        "suspended",
        "rejected",
      ],
      payment_status: ["pending", "successful", "failed", "refunded"],
      report_status: ["pending", "investigating", "resolved", "dismissed"],
      withdrawal_status: ["pending", "processing", "completed", "rejected"],
    },
  },
} as const
