
"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Database } from "@/types/database";

type Family = Database["public"]["Tables"]["families"]["Row"];
type FamilyMember = Database["public"]["Tables"]["family_members"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"] | null
};

// Helper to generate 6-char random code
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useFamily() {
    const { user } = useAuth();
    const [family, setFamily] = useState<Family | null>(null);
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchFamily = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 1. Check if user is in a family
            console.log("Fetching membership for user:", user.id);
            const { data: membership, error: memError } = await supabase
                .from("family_members")
                .select("family_id, families(*)")
                .eq("user_id", user.id)
                .maybeSingle();

            if (memError) {
                console.error("Error fetching membership:", memError);
                throw memError;
            }

            console.log("Membership result:", membership);

            if (membership && membership.families) {
                setFamily(membership.families as Family);

                // 2. Fetch all members
                console.log("Fetching members for family:", membership.family_id);
                const { data: allMembers, error: listError } = await supabase
                    .from("family_members")
                    .select("*, profiles(*)")
                    .eq("family_id", membership.family_id);

                if (listError) {
                    console.error("Error fetching family members list:", listError);
                    throw listError;
                }
                console.log("Members result:", allMembers);
                setMembers(allMembers as FamilyMember[]);
            } else {
                console.log("No family found for user");
                setFamily(null);
                setMembers([]);
            }

        } catch (err) {
            console.error("Error fetching family:", err);
            // Don't set UI error for "no family found", just null state
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    const createFamily = async (name: string) => {
        if (!user) return;
        try {
            setLoading(true);
            const inviteCode = generateInviteCode();

            // 0. Ensure profile exists (to satisfy FK constraint)
            const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();

            if (!profile) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        id: user.id,
                        display_name: user.email?.split('@')[0] || 'User'
                    });

                if (profileError) {
                    console.error("Error ensuring profile exists:", profileError);
                    // Continue anyway, maybe it exists but RLS hid it? 
                    // Or let it fail at next step with clear error
                }
            }

            // 1. Create family
            const payload = {
                name,
                invite_code: inviteCode,
                created_by: user.id
            };
            console.log("Attempting to create family with payload:", payload);

            const { data: newFamily, error: createError } = await supabase
                .from("families")
                .insert(payload)
                .select()
                .single();

            if (createError) {
                console.error("Error creating family record (JSON):", JSON.stringify(createError, null, 2));
                console.error("Error creating family record (raw):", createError);
                throw createError;
            }

            // 2. Add creator as admin
            const { error: joinError } = await supabase
                .from("family_members")
                .insert({
                    family_id: newFamily.id,
                    user_id: user.id,
                    role: 'admin'
                });

            if (joinError) {
                console.error("Error adding creator as member:", joinError);
                throw joinError;
            }

            await fetchFamily();
            return newFamily;

        } catch (err) {
            console.error("Full createFamily error:", err);
            setError(err instanceof Error ? err.message : "Failed to create family");
            setLoading(false);
            throw err;
        }
    };

    const joinFamily = async (inviteCode: string) => {
        if (!user) return;
        try {
            setLoading(true);

            // 0. Ensure profile exists (using same logic as create for safety)
            const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
            if (!profile) {
                await supabase.from("profiles").insert({ id: user.id, display_name: user.email?.split('@')[0] || 'User' });
            }

            // 1. Call secure RPC
            const { data: result, error: rpcError } = await supabase
                .rpc('join_family_by_invite_code', { code_input: inviteCode });

            if (rpcError) throw rpcError;

            // Result is JSON object
            // @ts-expect-error JSON type handling
            if (!result.success) {
                // @ts-expect-error JSON type handling
                throw new Error(result.message || "Failed to join family");
            }

            await fetchFamily();
            return true;

        } catch (err) {
            console.error("Join family error:", err);
            setError(err instanceof Error ? err.message : "Failed to join family");
            setLoading(false);
            throw err;
        }
    };

    const leaveFamily = async () => {
        if (!user || !family) return;
        try {
            setLoading(true);

            const { error: leaveError } = await supabase
                .from("family_members")
                .delete()
                .eq("family_id", family.id)
                .eq("user_id", user.id);

            if (leaveError) throw leaveError;

            setFamily(null);
            setMembers([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to leave family");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamily();
    }, [fetchFamily]);

    const getFamilyActivity = async () => {
        if (!user || !family) return [];

        try {
            const today = new Date().toISOString().split("T")[0];

            // Get all daily records for family members today (excluding self)
            const { data: records, error: recordError } = await supabase
                .from("daily_records")
                .select(`
                    id, 
                    user_id, 
                    total_spent,
                    profiles:user_id (display_name),
                    expense_items (
                        id, item_name, amount, created_at
                    )
                `)
                .eq("date", today)
                .neq("user_id", user.id) // Exclude self
                .in("user_id", members.map(m => m.user_id));

            if (recordError) {
                console.error("Error fetching family activity (JSON):", JSON.stringify(recordError, null, 2));
                throw recordError;
            }

            return records || [];
        } catch (err) {
            console.error("Error fetching family activity:", err);
            return [];
        }
    };

    return {
        family,
        members,
        loading,
        error,
        createFamily,
        joinFamily,
        leaveFamily,
        getFamilyActivity,
        refetch: fetchFamily
    };
}
