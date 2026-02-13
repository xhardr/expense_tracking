"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getSpendingStatus } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { Wallet, TrendingDown } from "lucide-react";

interface BalanceCardProps {
    totalMoney: number;
    totalSpent: number;
    remainingMoney: number;
}

export function BalanceCard({
    totalMoney,
    totalSpent,
    remainingMoney,
}: BalanceCardProps) {
    const status = getSpendingStatus(remainingMoney, totalMoney);

    const gradientMap = {
        good: "from-emerald-500 to-teal-600",
        caution: "from-amber-500 to-orange-600",
        danger: "from-rose-500 to-red-600",
        neutral: "from-slate-400 to-slate-500",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Card
                className={`overflow-hidden border-0 bg-gradient-to-br ${gradientMap[status.level]} text-white shadow-2xl`}
            >
                <CardContent className="relative p-6">
                    {/* Background decoration */}
                    <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />

                    <div className="relative">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 opacity-80" />
                                <span className="text-sm font-medium opacity-90">
                                    Remaining Today
                                </span>
                            </div>
                            <span className="text-2xl">{status.emoji}</span>
                        </div>

                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                        >
                            <span className="text-4xl font-bold tracking-tight">
                                {formatCurrency(remainingMoney)}
                            </span>
                        </motion.div>

                        <div className="flex items-center gap-4 text-sm opacity-80">
                            <div className="flex items-center gap-1">
                                <span>Budget:</span>
                                <span className="font-medium">
                                    {formatCurrency(totalMoney)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                <span>Spent:</span>
                                <span className="font-medium">
                                    {formatCurrency(totalSpent)}
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        {totalMoney > 0 && (
                            <div className="mt-4">
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                                    <motion.div
                                        className="h-full rounded-full bg-white/60"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${Math.min(
                                                (totalSpent / totalMoney) * 100,
                                                100
                                            )}%`,
                                        }}
                                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
