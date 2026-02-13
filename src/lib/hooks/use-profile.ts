
"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile(data);
            } else if (error && error.code === 'PGRST116') {
                // Profile missing? Should be auto-created by trigger, but just in case
                const { data: newProfile } = await supabase
                    .from("profiles")
                    .insert({ id: user.id, display_name: user.email?.split('@')[0] || 'User' })
                    .select()
                    .single();
                setProfile(newProfile);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    const updateDisplayName = async (name: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({ id: user.id, display_name: name }) // upsert just in case
                .eq("id", user.id);

            if (error) throw error;
            setProfile((prev) => prev ? { ...prev, display_name: name } : null);
            return true;
        } catch (err) {
            console.error("Error updating profile:", err);
            return false;
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        updateDisplayName,
        refetch: fetchProfile
    };
}
