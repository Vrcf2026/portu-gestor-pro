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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      checklist_template_items: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
          template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          category: string
          created_at: string
          equipment_type: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          equipment_type?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          equipment_type?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          company: string
          contract_end: string | null
          contract_start: string | null
          contracted_hours: number | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          used_hours: number
        }
        Insert: {
          address?: string | null
          city?: string | null
          company: string
          contract_end?: string | null
          contract_start?: string | null
          contracted_hours?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          used_hours?: number
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string
          contract_end?: string | null
          contract_start?: string | null
          contracted_hours?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          used_hours?: number
        }
        Relationships: []
      }
      contracts: {
        Row: {
          active: boolean
          client_id: string
          created_at: string
          end_date: string
          hourly_rate: number
          hours: number
          id: string
          name: string
          notes: string | null
          start_date: string
          updated_at: string
          used_hours: number
        }
        Insert: {
          active?: boolean
          client_id: string
          created_at?: string
          end_date: string
          hourly_rate?: number
          hours?: number
          id?: string
          name: string
          notes?: string | null
          start_date: string
          updated_at?: string
          used_hours?: number
        }
        Update: {
          active?: boolean
          client_id?: string
          created_at?: string
          end_date?: string
          hourly_rate?: number
          hours?: number
          id?: string
          name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          used_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          brand: string
          client_id: string
          created_at: string
          id: string
          install_date: string | null
          model: string
          notes: string | null
          serial_number: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at: string
          warranty_end: string | null
        }
        Insert: {
          brand: string
          client_id: string
          created_at?: string
          id?: string
          install_date?: string | null
          model: string
          notes?: string | null
          serial_number?: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string
          warranty_end?: string | null
        }
        Update: {
          brand?: string
          client_id?: string
          created_at?: string
          id?: string
          install_date?: string | null
          model?: string
          notes?: string | null
          serial_number?: string | null
          type?: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string
          warranty_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          hourly_rate: number
          hours: number
          id: string
          invoice_id: string
          total: number
          work_log_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          hourly_rate?: number
          hours?: number
          id?: string
          invoice_id: string
          total?: number
          work_log_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          hourly_rate?: number
          hours?: number
          id?: string
          invoice_id?: string
          total?: number
          work_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_work_log_id_fkey"
            columns: ["work_log_id"]
            isOneToOne: false
            referencedRelation: "work_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklist_items: {
        Row: {
          checked: boolean
          checked_at: string | null
          checklist_id: string
          created_at: string
          id: string
          label: string
          notes: string | null
          sort_order: number
        }
        Insert: {
          checked?: boolean
          checked_at?: string | null
          checklist_id: string
          created_at?: string
          id?: string
          label: string
          notes?: string | null
          sort_order?: number
        }
        Update: {
          checked?: boolean
          checked_at?: string | null
          checklist_id?: string
          created_at?: string
          id?: string
          label?: string
          notes?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "task_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklists: {
        Row: {
          created_at: string
          id: string
          name: string
          task_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          task_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          task_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_checklists_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          client_id: string
          completed_date: string | null
          created_at: string
          description: string
          expected_date: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_date?: string | null
          created_at?: string
          description: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_date?: string | null
          created_at?: string
          description?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_notes: {
        Row: {
          category: string
          client_id: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          client_id: string
          content?: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      work_logs: {
        Row: {
          client_id: string
          created_at: string
          date: string
          deduct_from_contract: boolean
          description: string
          hourly_rate: number | null
          hours: number
          id: string
          minutes: number
          task_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string
          deduct_from_contract?: boolean
          description: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          minutes?: number
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          deduct_from_contract?: boolean
          description?: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          minutes?: number
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      equipment_type: "PC" | "NAS" | "Router" | "Switch" | "CCTV" | "Servidor"
      invoice_status: "rascunho" | "emitida" | "paga" | "cancelada"
      task_priority: "baixa" | "media" | "alta"
      task_status:
        | "novo"
        | "pendente"
        | "em_progresso"
        | "aguarda_cliente"
        | "aguarda_pecas"
        | "concluido"
        | "faturado"
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
      equipment_type: ["PC", "NAS", "Router", "Switch", "CCTV", "Servidor"],
      invoice_status: ["rascunho", "emitida", "paga", "cancelada"],
      task_priority: ["baixa", "media", "alta"],
      task_status: [
        "novo",
        "pendente",
        "em_progresso",
        "aguarda_cliente",
        "aguarda_pecas",
        "concluido",
        "faturado",
      ],
    },
  },
} as const
