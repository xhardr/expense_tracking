
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
    const supabase = createClient();

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

    return {
        records,
        loading,
        error,
        fetchMonth,
        stats: { totalSpent, totalBudget, avgDaily },
    };
}
