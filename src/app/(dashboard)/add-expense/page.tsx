"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDailyRecord } from "@/lib/hooks/use-daily-record";
import { useExpenses } from "@/lib/hooks/use-expenses";
import { formatCurrency } from "@/lib/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Loader2,
    Calculator,
    Check,
} from "lucide-react";
import Link from "next/link";

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface ExpenseRow {
    id: string;
    name: string;
    amount: string;
    category: string;
}

export default function AddExpensePage() {
    const router = useRouter();
    const { record, createOrUpdateRecord } = useDailyRecord();
    const { addExpense } = useExpenses(record?.id);

    const [totalMoney, setTotalMoney] = useState(
        record ? String(record.total_money) : ""
    );
    const [rows, setRows] = useState<ExpenseRow[]>([
        { id: generateId(), name: "", amount: "", category: "Food" },
    ]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const totalExpenses = rows.reduce(
        (sum, row) => sum + (parseFloat(row.amount) || 0),
        0
    );
    const budget = parseFloat(totalMoney) || 0;
    const remaining = budget - totalExpenses - Number(record?.total_spent || 0);

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            { id: generateId(), name: "", amount: "", category: "Food" },
        ]);
    };

    const removeRow = (id: string) => {
        if (rows.length <= 1) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const updateRow = (
        id: string,
        field: "name" | "amount" | "category",
        value: string
    ) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            // Create/update daily record with budget
            const dailyRecord = await createOrUpdateRecord(budget);

            // Add all expense items
            const validRows = rows.filter(
                (r) => r.name.trim() && parseFloat(r.amount) > 0
            );

            for (const row of validRows) {
                await addExpense(row.name.trim(), parseFloat(row.amount), row.category);
            }

            router.push("/");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to save expenses"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageTransition>
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3 pt-2">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Add Expense</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Budget Input */}
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-5">
                            <Label
                                htmlFor="total-money"
                                className="text-sm font-medium text-muted-foreground"
                            >
                                💰 Today&apos;s Budget
                            </Label>
                            <div className="mt-2 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                    Rp
                                </span>
                                <Input
                                    id="total-money"
                                    type="number"
                                    placeholder="0"
                                    value={totalMoney}
                                    onChange={(e) => setTotalMoney(e.target.value)}
                                    className="h-14 pl-10 text-2xl font-bold"
                                    min="0"
                                    step="1000"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expense Items */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                📋 Expense Items
                            </h2>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addRow}
                                className="h-8 text-primary"
                            >
                                <Plus className="mr-1 h-3 w-3" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {rows.map((row, index) => (
                                    <motion.div
                                        key={row.id}
                                        layout
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-0 shadow-sm">
                                            <CardContent className="flex items-center gap-2 p-3">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                    {index + 1}
                                                </span>
                                                <select
                                                    value={row.category}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "category", e.target.value)
                                                    }
                                                    className="h-10 w-[4.5rem] rounded-md border-0 bg-transparent text-xs font-medium focus:ring-0"
                                                >
                                                    <option value="Food">🍔</option>
                                                    <option value="Transport">🚗</option>
                                                    <option value="Shopping">🛍️</option>
                                                    <option value="Bills">📄</option>
                                                    <option value="Entertainment">🎬</option>
                                                    <option value="Health">💊</option>
                                                    <option value="Education">🎓</option>
                                                    <option value="Other">🔹</option>
                                                </select>
                                                <Input
                                                    placeholder="Item name"
                                                    value={row.name}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "name", e.target.value)
                                                    }
                                                    className="h-10 flex-1 border-0 bg-transparent"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={row.amount}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "amount", e.target.value)
                                                    }
                                                    className="h-10 w-28 border-0 bg-transparent text-right font-medium"
                                                    min="0"
                                                    step="500"
                                                />
                                                {rows.length > 1 && (
                                                    <motion.button
                                                        type="button"
                                                        whileTap={{ scale: 0.85 }}
                                                        onClick={() => removeRow(row.id)}
                                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </motion.button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Summary */}
                    <Card className="border-0 bg-muted/50 shadow-sm">
                        <CardContent className="space-y-3 p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calculator className="h-4 w-4" />
                                <span>Summary</span>
                            </div>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">New expenses</span>
                                    <span className="font-medium">
                                        {formatCurrency(totalExpenses)}
                                    </span>
                                </div>
                                {record && Number(record.total_spent) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Previously spent
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(Number(record.total_spent))}
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-base">
                                    <span className="font-medium">Remaining</span>
                                    <span
                                        className={`font-bold ${remaining >= 0 ? "text-emerald-600" : "text-destructive"
                                            }`}
                                    >
                                        {formatCurrency(remaining)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <p className="text-center text-sm text-destructive">{error}</p>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="h-13 w-full text-base font-semibold shadow-lg shadow-primary/25"
                        disabled={saving || budget <= 0}
                        size="lg"
                    >
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="mr-2 h-4 w-4" />
                        )}
                        Save Expenses
                    </Button>
                </form>
            </div>
        </PageTransition>
    );
}
