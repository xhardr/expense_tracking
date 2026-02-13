
"use client";

import { useEffect, useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHistory, type DailyRecordWithExpenses } from "@/lib/hooks/use-history";
import { useFamily } from "@/lib/hooks/use-family";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    TrendingUp,
    Wallet,
    BarChart3,
} from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function HistoryPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { records, loading, stats, fetchMonth } = useHistory();
    const { family } = useFamily();
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<"my" | "family">("my");

    useEffect(() => {
        fetchMonth(year, month);
    }, [year, month, fetchMonth]);

    const goToPrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const goToNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const isCurrentMonth =
        year === now.getFullYear() && month === now.getMonth() + 1;

    // Filter records based on view mode
    const filteredRecords = records.filter(r =>
        viewMode === "family" ? true : r.user_id === user?.id
    );

    // Recalculate stats for filtered records
    const currentStats = {
        totalBudget: filteredRecords.reduce((sum, r) => sum + Number(r.total_money), 0),
        totalSpent: filteredRecords.reduce((sum, r) => sum + Number(r.total_spent), 0),
        avgDaily: filteredRecords.length > 0
            ? filteredRecords.reduce((sum, r) => sum + Number(r.total_spent), 0) / filteredRecords.length
            : 0
    };

    return (
        <PageTransition>
            <div className="space-y-5">
                {/* Header */}
                <div className="pt-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">History</h1>
                        <p className="text-sm text-muted-foreground">
                            Spending records
                        </p>
                    </div>
                </div>

                {/* Family Toggle */}
                {family && (
                    <Tabs value={viewMode} onValueChange={(v: string) => setViewMode(v as "my" | "family")}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="my">My Expenses</TabsTrigger>
                            <TabsTrigger value="family">Family</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}

                {/* Month Selector */}
                <Card className="border-0 shadow-md">
                    <CardContent className="flex items-center justify-between p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPrevMonth}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                                {MONTHS[month - 1]} {year}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNextMonth}
                            disabled={isCurrentMonth}
                            className="rounded-xl"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Monthly Summary */}
                {!loading && filteredRecords.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-3 gap-2"
                    >
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-3 text-center">
                                <Wallet className="mx-auto mb-1 h-4 w-4 text-primary" />
                                <p className="text-xs text-muted-foreground">Total Budget</p>
                                <p className="text-sm font-bold">
                                    {formatCurrency(currentStats.totalBudget)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-3 text-center">
                                <TrendingUp className="mx-auto mb-1 h-4 w-4 text-destructive" />
                                <p className="text-xs text-muted-foreground">Total Spent</p>
                                <p className="text-sm font-bold text-destructive">
                                    {formatCurrency(currentStats.totalSpent)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-3 text-center">
                                <BarChart3 className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                                <p className="text-xs text-muted-foreground">Avg/Day</p>
                                <p className="text-sm font-bold">
                                    {formatCurrency(currentStats.avgDaily)}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Records List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="mb-3 text-4xl">📭</div>
                        <p className="font-medium text-muted-foreground">
                            No records this month
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {filteredRecords.map((record, index) => (
                                <DayCard
                                    key={record.id}
                                    record={record}
                                    index={index}
                                    isExpanded={expandedId === record.id}
                                    onToggle={() =>
                                        setExpandedId(
                                            expandedId === record.id ? null : record.id
                                        )
                                    }
                                    currentUserId={user?.id}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}

function DayCard({
    record,
    index,
    isExpanded,
    onToggle,
    currentUserId,
}: {
    record: DailyRecordWithExpenses;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    currentUserId?: string;
}) {
    const remaining = Number(record.remaining_money);
    const total = Number(record.total_money);
    const ratio = total > 0 ? remaining / total : 0;
    const isOwner = record.user_id === currentUserId;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
        >
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <button
                        onClick={onToggle}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-3">
                            {!isOwner && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                        {record.profiles?.display_name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div>
                                <p className="text-sm font-medium">
                                    {formatDate(record.date, "relative")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {!isOwner ? record.profiles?.display_name : formatDate(record.date, "full")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-destructive">
                                    -{formatCurrency(Number(record.total_spent))}
                                </p>
                                <Badge
                                    variant={ratio > 0.5 ? "default" : ratio > 0.2 ? "secondary" : "destructive"}
                                    className="text-[10px]"
                                >
                                    {formatCurrency(remaining)} left
                                </Badge>
                            </div>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                        </div>
                    </button>

                    <AnimatePresence>
                        {isExpanded && record.expense_items.length > 0 && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <Separator />
                                <div className="space-y-2 p-4 pt-3">
                                    {record.expense_items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground">
                                                {item.item_name}
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(Number(item.amount))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}
