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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          description: string
          icon: string | null
          sort: number
          stage: string | null
          title: string
        }
        Insert: {
          code: string
          description: string
          icon?: string | null
          sort?: number
          stage?: string | null
          title: string
        }
        Update: {
          code?: string
          description?: string
          icon?: string | null
          sort?: number
          stage?: string | null
          title?: string
        }
        Relationships: []
      }
      ai_tools: {
        Row: {
          category: string
          description: string | null
          featured: boolean
          id: string
          name: string
          pricing: string | null
          skill_level: string
          slug: string
          tagline: string | null
          url: string | null
          use_cases: string[]
          who_for: string | null
        }
        Insert: {
          category: string
          description?: string | null
          featured?: boolean
          id?: string
          name: string
          pricing?: string | null
          skill_level?: string
          slug: string
          tagline?: string | null
          url?: string | null
          use_cases?: string[]
          who_for?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          featured?: boolean
          id?: string
          name?: string
          pricing?: string | null
          skill_level?: string
          slug?: string
          tagline?: string | null
          url?: string | null
          use_cases?: string[]
          who_for?: string | null
        }
        Relationships: []
      }
      career_milestones: {
        Row: {
          completed_at: string
          id: string
          milestone_key: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          milestone_key: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          milestone_key?: string
          user_id?: string
        }
        Relationships: []
      }
      career_plans: {
        Row: {
          created_at: string
          experience_level: string | null
          experience_summary: string | null
          generated_at: string | null
          interests: string[]
          learning_path: string | null
          portfolio_summary: string | null
          roadmap: Json | null
          target_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          experience_summary?: string | null
          generated_at?: string | null
          interests?: string[]
          learning_path?: string | null
          portfolio_summary?: string | null
          roadmap?: Json | null
          target_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          experience_summary?: string | null
          generated_at?: string | null
          interests?: string[]
          learning_path?: string | null
          portfolio_summary?: string | null
          roadmap?: Json | null
          target_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coming_soon_interest: {
        Row: {
          created_at: string
          feature: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_spaces: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
          sort: number
          stage: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
          sort?: number
          stage?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort?: number
          stage?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string | null
          description: string | null
          duration_minutes: number
          hub: string | null
          id: string
          level: string
          path_slug: string | null
          slug: string
          sort: number
          title: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          duration_minutes?: number
          hub?: string | null
          id?: string
          level?: string
          path_slug?: string | null
          slug: string
          sort?: number
          title: string
        }
        Update: {
          category?: string | null
          description?: string | null
          duration_minutes?: number
          hub?: string | null
          id?: string
          level?: string
          path_slug?: string | null
          slug?: string
          sort?: number
          title?: string
        }
        Relationships: []
      }
      elite_members: {
        Row: {
          discovery_source: string | null
          founding_number: number | null
          joined_at: string
          last_active_at: string
          user_id: string
        }
        Insert: {
          discovery_source?: string | null
          founding_number?: number | null
          joined_at?: string
          last_active_at?: string
          user_id: string
        }
        Update: {
          discovery_source?: string | null
          founding_number?: number | null
          joined_at?: string
          last_active_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string
          enquiry_type: string
          id: string
          message: string
          name: string
          organisation: string | null
          source_page: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          enquiry_type: string
          id?: string
          message: string
          name: string
          organisation?: string | null
          source_page?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          enquiry_type?: string
          id?: string
          message?: string
          name?: string
          organisation?: string | null
          source_page?: string | null
          status?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_slug: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_slug: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_slug?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_items: {
        Row: {
          body: string | null
          created_at: string
          id: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_votes: {
        Row: {
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_votes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "feedback_items"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      goal_recommendations: {
        Row: {
          description: string | null
          id: string
          label: string
          path_slug: string | null
          slug: string
          steps: string[]
          tool_slugs: string[]
          track: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          label: string
          path_slug?: string | null
          slug: string
          steps?: string[]
          tool_slugs?: string[]
          track?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          label?: string
          path_slug?: string | null
          slug?: string
          steps?: string[]
          tool_slugs?: string[]
          track?: string | null
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          audience: string | null
          description: string | null
          icon: string | null
          id: string
          slug: string
          sort: number
          subtitle: string | null
          title: string
        }
        Insert: {
          audience?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          slug: string
          sort?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          audience?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          slug?: string
          sort?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          course_slug: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_slug: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_slug?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          duration_minutes: number
          id: string
          module_id: string
          sort: number
          title: string
        }
        Insert: {
          content?: string | null
          duration_minutes?: number
          id?: string
          module_id: string
          sort?: number
          title: string
        }
        Update: {
          content?: string | null
          duration_minutes?: number
          id?: string
          module_id?: string
          sort?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      member_achievements: {
        Row: {
          achievement_code: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_code: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_code?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_achievements_achievement_code_fkey"
            columns: ["achievement_code"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["code"]
          },
        ]
      }
      modules: {
        Row: {
          course_slug: string
          id: string
          sort: number
          summary: string | null
          title: string
        }
        Insert: {
          course_slug: string
          id?: string
          sort?: number
          summary?: string | null
          title: string
        }
        Update: {
          course_slug?: string
          id?: string
          sort?: number
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          created_at: string
          id: string
          media_path: string | null
          media_type: string | null
          media_url: string | null
          space_slug: string
          tags: string[]
          title: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          media_path?: string | null
          media_type?: string | null
          media_url?: string | null
          space_slug: string
          tags?: string[]
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          media_path?: string | null
          media_type?: string | null
          media_url?: string | null
          space_slug?: string
          tags?: string[]
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career_goal: string | null
          certifications: string[]
          created_at: string
          experience_level: string | null
          full_name: string | null
          goals: string[]
          headline: string | null
          id: string
          industry: string | null
          institution: string | null
          interests: string[]
          is_public: boolean
          links: Json
          location: string | null
          onboarding_completed: boolean
          skills: string[]
          slug: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career_goal?: string | null
          certifications?: string[]
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          goals?: string[]
          headline?: string | null
          id: string
          industry?: string | null
          institution?: string | null
          interests?: string[]
          is_public?: boolean
          links?: Json
          location?: string | null
          onboarding_completed?: boolean
          skills?: string[]
          slug?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career_goal?: string | null
          certifications?: string[]
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          goals?: string[]
          headline?: string | null
          id?: string
          industry?: string | null
          institution?: string | null
          interests?: string[]
          is_public?: boolean
          links?: Json
          location?: string | null
          onboarding_completed?: boolean
          skills?: string[]
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          link: string | null
          status: string
          summary: string | null
          tags: string[]
          title: string
          tools: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          link?: string | null
          status?: string
          summary?: string | null
          tags?: string[]
          title: string
          tools?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          link?: string | null
          status?: string
          summary?: string | null
          tags?: string[]
          title?: string
          tools?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          description: string | null
          hub: string
          id: string
          kind: string | null
          sort: number
          title: string
          url: string | null
        }
        Insert: {
          category: string
          description?: string | null
          hub: string
          id?: string
          kind?: string | null
          sort?: number
          title: string
          url?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          hub?: string
          id?: string
          kind?: string | null
          sort?: number
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      tool_saves: {
        Row: {
          created_at: string
          id: string
          tool_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tool_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tool_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_views: {
        Row: {
          created_at: string
          id: string
          tool_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tool_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tool_slug?: string
          user_id?: string
        }
        Relationships: []
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
      feedback_vote_counts: {
        Row: {
          item_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_votes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "feedback_items"
            referencedColumns: ["id"]
          },
        ]
      }
      like_counts: {
        Row: {
          like_count: number | null
          post_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_membership: { Args: { _full_name?: string }; Returns: number }
      founding_spots_taken: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "member"],
    },
  },
} as const
