"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { getTodayDate } from "@/lib/utils/format";
import type { Database } from "@/types/database";

type DailyRecord = Database["public"]["Tables"]["daily_records"]["Row"];

export function useDailyRecord() {
    const [record, setRecord] = useState<DailyRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchTodayRecord = useCallback(async () => {
        try {
            setLoading(true);
            const today = getTodayDate();
            const { data, error: fetchError } = await supabase
                .from("daily_records")
                .select("*")
                .eq("date", today)
                .maybeSingle();

            if (fetchError) throw fetchError;
            setRecord(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch record");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const createOrUpdateRecord = useCallback(
        async (totalMoney: number) => {
            try {
                setLoading(true);
                const today = getTodayDate();

                if (record) {
                    // Update existing
                    const { data, error: updateError } = await supabase
                        .from("daily_records")
                        .update({ total_money: totalMoney })
                        .eq("id", record.id)
                        .select()
                        .single();

                    if (updateError) throw updateError;
                    setRecord(data);
                    return data;
                } else {
                    // Create new
                    const { data, error: insertError } = await supabase
                        .from("daily_records")
                        .insert({ total_money: totalMoney, date: today })
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    setRecord(data);
                    return data;
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to save record"
                );
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [supabase, record]
    );

    useEffect(() => {
        fetchTodayRecord();
    }, [fetchTodayRecord]);

    return {
        record,
        loading,
        error,
        createOrUpdateRecord,
        refetch: fetchTodayRecord,
    };
}
