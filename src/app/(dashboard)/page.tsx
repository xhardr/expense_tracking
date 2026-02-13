
"use client";

import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/expense/balance-card";
import { ExpenseList } from "@/components/expense/expense-list";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDailyRecord } from "@/lib/hooks/use-daily-record";
import { useExpenses } from "@/lib/hooks/use-expenses";
import { useProfile } from "@/lib/hooks/use-profile";
import { useFamily } from "@/lib/hooks/use-family";
import { getGreeting, formatCurrency } from "@/lib/utils/format";
import { Plus, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Types for family activity
interface FamilyRecord {
    id: string;
    user_id: string;
    total_spent: number;
    profiles: { display_name: string } | null;
    expense_items: {
        id: string;
        item_name: string;
        amount: number;
        created_at: string;
    }[];
}

export default function DashboardPage() {
    const { profile } = useProfile();
    const { record, loading: recordLoading } = useDailyRecord();
    const { expenses, loading: expensesLoading, deleteExpense } = useExpenses(
        record?.id
    );
    const { family, getFamilyActivity } = useFamily();
    const [familyActivity, setFamilyActivity] = useState<FamilyRecord[]>([]);

    useEffect(() => {
        if (family) {
            getFamilyActivity().then(records => {
                setFamilyActivity(records);
            });
        }
    }, [family, getFamilyActivity]); // Added getFamilyActivity to dependency array

    const greeting = getGreeting();
    // Use profile display name or fall back to "there"
    const displayName = profile?.display_name || "there";

    if (recordLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6 pb-20">
                {/* Header */}
                <div className="pt-2">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-sm text-muted-foreground">{greeting} 👋</p>
                        <h1 className="text-2xl font-bold tracking-tight capitalize">
                            {displayName}
                        </h1>
                    </motion.div>
                </div>

                {/* Balance Card */}
                {record ? (
                    <BalanceCard
                        totalMoney={Number(record.total_money)}
                        totalSpent={Number(record.total_spent)}
                        remainingMoney={Number(record.remaining_money)}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center"
                    >
                        <div className="mx-auto mb-3 text-4xl">📝</div>
                        <h3 className="font-semibold">No record for today</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set your daily budget to start tracking
                        </p>
                        <Link href="/add-expense">
                            <Button className="mt-4 shadow-lg shadow-primary/25" size="lg">
                                <Plus className="mr-2 h-4 w-4" />
                                Start Today
                            </Button>
                        </Link>
                    </motion.div>
                )}

                {/* Recent Expenses */}
                {record && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Today&apos;s Expenses</h2>
                            {expenses.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {expenses.length} item{expenses.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                        {expensesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <ExpenseList
                                expenses={expenses}
                                onDelete={deleteExpense}
                            />
                        )}
                    </motion.div>
                )}

                {/* Family Activity Section */}
                {family && familyActivity.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="pt-2"
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <h2 className="text-lg font-semibold">Family Activity</h2>
                        </div>

                        <div className="space-y-3">
                            {familyActivity.map((rec) => (
                                <Card key={rec.id} className="border-0 bg-muted/30 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                                    {rec.profiles?.display_name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold capitalize">
                                                    {rec.profiles?.display_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Spent {formatCurrency(Number(rec.total_spent))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pl-11">
                                            {rec.expense_items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{item.item_name}</span>
                                                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* FAB — Quick Add */}
                {record && (
                    <Link href="/add-expense">
                        <motion.div
                            className="fixed bottom-24 right-4 z-40"
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Button
                                size="lg"
                                className="h-14 w-14 rounded-full p-0 shadow-2xl shadow-primary/30"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </motion.div>
                    </Link>
                )}
            </div>
        </PageTransition>
    );
}
