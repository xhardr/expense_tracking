
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    display_name: string
                    created_at: string
                    updated_at: string
                    monthly_budget: number
                }
                Insert: {
                    id: string
                    display_name?: string
                    created_at?: string
                    updated_at?: string
                    monthly_budget?: number
                }
                Update: {
                    id?: string
                    display_name?: string
                    created_at?: string
                    updated_at?: string
                    monthly_budget?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            families: {
                Row: {
                    id: string
                    name: string
                    invite_code: string
                    created_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    invite_code: string
                    created_by?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    invite_code?: string
                    created_by?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "families_created_by_fkey"
                        columns: ["created_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            family_members: {
                Row: {
                    id: string
                    family_id: string
                    user_id: string
                    role: string
                    joined_at: string
                }
                Insert: {
                    id?: string
                    family_id: string
                    user_id: string
                    role?: string
                    joined_at?: string
                }
                Update: {
                    id?: string
                    family_id?: string
                    user_id?: string
                    role?: string
                    joined_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "family_members_family_id_fkey"
                        columns: ["family_id"]
                        referencedRelation: "families"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "family_members_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "family_members_user_id_profiles_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            daily_records: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    total_money: number
                    total_spent: number
                    remaining_money: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    date?: string
                    total_money?: number
                    total_spent?: number
                    remaining_money?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    total_money?: number
                    total_spent?: number
                    remaining_money?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "daily_records_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "daily_records_user_id_profiles_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            expense_items: {
                Row: {
                    id: string
                    daily_record_id: string
                    item_name: string
                    amount: number
                    category: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    daily_record_id: string
                    item_name: string
                    amount: number
                    category?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    daily_record_id?: string
                    item_name?: string
                    amount?: number
                    category?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "expense_items_daily_record_id_fkey"
                        columns: ["daily_record_id"]
                        referencedRelation: "daily_records"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_family_member: {
                Args: { target_user_id: string }
                Returns: boolean
            },
            join_family_by_invite_code: {
                Args: { code_input: string }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
