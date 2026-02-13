"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import type { Database } from "@/types/database";

type ExpenseItem = Database["public"]["Tables"]["expense_items"]["Row"];

export function useExpenses(dailyRecordId: string | undefined) {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchExpenses = useCallback(async () => {
        if (!dailyRecordId) {
            setExpenses([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from("expense_items")
                .select("*")
                .eq("daily_record_id", dailyRecordId)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;
            setExpenses(data ?? []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch expenses"
            );
        } finally {
            setLoading(false);
        }
    }, [supabase, dailyRecordId]);

    const addExpense = useCallback(
        async (itemName: string, amount: number) => {
            if (!dailyRecordId) throw new Error("No daily record");

            // Optimistic update
            const tempId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            const optimistic: ExpenseItem = {
                id: tempId,
                daily_record_id: dailyRecordId,
                item_name: itemName,
                amount,
                created_at: new Date().toISOString(),
            };
            setExpenses((prev) => [optimistic, ...prev]);

            try {
                const { data, error: insertError } = await supabase
                    .from("expense_items")
                    .insert({
                        daily_record_id: dailyRecordId,
                        item_name: itemName,
                        amount,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                // Replace optimistic with real data
                setExpenses((prev) => prev.map((e) => (e.id === tempId ? data : e)));
                return data;
            } catch (err) {
                // Rollback optimistic
                setExpenses((prev) => prev.filter((e) => e.id !== tempId));
                throw err;
            }
        },
        [supabase, dailyRecordId]
    );

    const deleteExpense = useCallback(
        async (expenseId: string) => {
            // Optimistic removal
            const backup = expenses;
            setExpenses((prev) => prev.filter((e) => e.id !== expenseId));

            try {
                const { error: deleteError } = await supabase
                    .from("expense_items")
                    .delete()
                    .eq("id", expenseId);

                if (deleteError) throw deleteError;
            } catch (err) {
                // Rollback
                setExpenses(backup);
                throw err;
            }
        },
        [supabase, expenses]
    );

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    return {
        expenses,
        loading,
        error,
        addExpense,
        deleteExpense,
        refetch: fetchExpenses,
    };
}
