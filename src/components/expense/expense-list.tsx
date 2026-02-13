"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag } from "lucide-react";
import type { Database } from "@/types/database";

type ExpenseItem = Database["public"]["Tables"]["expense_items"]["Row"];

interface ExpenseListProps {
    expenses: ExpenseItem[];
    onDelete?: (id: string) => void;
    showDelete?: boolean;
}

export function ExpenseList({
    expenses,
    onDelete,
    showDelete = true,
}: ExpenseListProps) {
    if (expenses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
            >
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                    No expenses yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                    Tap the + button to add your first expense
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-2">
            <AnimatePresence mode="popLayout">
                {expenses.map((expense, index) => (
                    <motion.div
                        key={expense.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{
                            duration: 0.2,
                            delay: index * 0.03,
                        }}
                    >
                        <Card className="border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <ShoppingBag className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium leading-tight">
                                            {expense.item_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(expense.created_at).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-destructive">
                                        -{formatCurrency(expense.amount)}
                                    </span>
                                    {showDelete && onDelete && (
                                        <motion.button
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() => onDelete(expense.id)}
                                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </motion.button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
