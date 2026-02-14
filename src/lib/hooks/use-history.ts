
"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useState } from "react";
import type { Database } from "@/types/database";

type DailyRecord = Database["public"]["Tables"]["daily_records"]["Row"];
type ExpenseItem = Database["public"]["Tables"]["expense_items"]["Row"];

export type DailyRecordWithExpenses = DailyRecord & {
    expense_items: ExpenseItem[];
    profiles?: { display_name: string } | null;
};

export function useHistory() {
    const [records, setRecords] = useState<DailyRecordWithExpenses[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [supabase] = useState(() => createClient());

    const fetchMonth = useCallback(
        async (year: number, month: number) => {
            try {
                setLoading(true);
                setError(null);

                const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
                const endDate =
                    month === 12
                        ? `${year + 1}-01-01`
                        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

                const { data, error: fetchError } = await supabase
                    .from("daily_records")
                    .select("*, profiles(display_name), expense_items(*)")
                    .gte("date", startDate)
                    .lt("date", endDate)
                    .order("date", { ascending: false });

                if (fetchError) throw fetchError;

                // transform data to match type if needed, though Supabase returns it close enough
                setRecords((data as DailyRecordWithExpenses[]) ?? []);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to fetch history"
                );
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    const totalSpent = records.reduce((sum, r) => sum + Number(r.total_spent), 0);
    const totalBudget = records.reduce(
        (sum, r) => sum + Number(r.total_money),
        0
    );
    const avgDaily =
        records.length > 0 ? totalSpent / records.length : 0;

    const deleteRecord = useCallback(
        async (id: string) => {
            try {
                setLoading(true);
                setError(null);

                const { error: deleteError } = await supabase
                    .from("daily_records")
                    .delete()
                    .eq("id", id);

                if (deleteError) throw deleteError;

                // Update local state
                setRecords((prev) => prev.filter((r) => r.id !== id));
                return true;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to delete record"
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    const deleteExpenseItem = useCallback(
        async (itemId: string, dailyRecordId: string, amount: number) => {
            try {
                setLoading(true);
                setError(null);

                const { error: deleteError } = await supabase
                    .from("expense_items")
                    .delete()
                    .eq("id", itemId);

                if (deleteError) throw deleteError;

                // Update local state: find the day, remove item, update total_spent
                setRecords((prev) =>
                    prev.map((record) => {
                        if (record.id === dailyRecordId) {
                            return {
                                ...record,
                                total_spent: Number(record.total_spent) - amount,
                                expense_items: record.expense_items.filter((i) => i.id !== itemId),
                            };
                        }
                        return record;
                    })
                );
                return true;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to delete expense item"
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    return {
        records,
        loading,
        error,
        fetchMonth,
        deleteRecord,
        deleteExpenseItem,
        stats: { totalSpent, totalBudget, avgDaily },
    };
}
