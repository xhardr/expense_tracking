import { create } from "zustand";
import type { Database } from "@/types/database";

type DailyRecord = Database["public"]["Tables"]["daily_records"]["Row"];
type ExpenseItem = Database["public"]["Tables"]["expense_items"]["Row"];

interface ExpenseState {
    // Today's data
    todayRecord: DailyRecord | null;
    todayExpenses: ExpenseItem[];

    // UI state
    isAddingExpense: boolean;

    // Actions
    setTodayRecord: (record: DailyRecord | null) => void;
    setTodayExpenses: (expenses: ExpenseItem[]) => void;
    addExpenseOptimistic: (expense: ExpenseItem) => void;
    removeExpenseOptimistic: (expenseId: string) => void;
    setIsAddingExpense: (value: boolean) => void;
    reset: () => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
    todayRecord: null,
    todayExpenses: [],
    isAddingExpense: false,

    setTodayRecord: (record) => set({ todayRecord: record }),
    setTodayExpenses: (expenses) => set({ todayExpenses: expenses }),
    addExpenseOptimistic: (expense) =>
        set((state) => ({
            todayExpenses: [expense, ...state.todayExpenses],
        })),
    removeExpenseOptimistic: (expenseId) =>
        set((state) => ({
            todayExpenses: state.todayExpenses.filter((e) => e.id !== expenseId),
        })),
    setIsAddingExpense: (value) => set({ isAddingExpense: value }),
    reset: () =>
        set({
            todayRecord: null,
            todayExpenses: [],
            isAddingExpense: false,
        }),
}));
