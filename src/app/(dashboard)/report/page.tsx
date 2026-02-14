"use client";

import { useEffect, useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/lib/hooks/use-history";
import { formatCurrency } from "@/lib/utils/format";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from "recharts";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const COLORS = [
    "#10b981", // Emerald (Primary)
    "#f59e0b", // Amber (Warning)
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#14b8a6", // Teal
];

export default function ReportPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const { records, loading, fetchMonth } = useHistory();

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

    // Process Data for Charts
    const categoryData = records.reduce((acc, record) => {
        record.expense_items.forEach(item => {
            const cat = item.category || "Other";
            if (!acc[cat]) acc[cat] = 0;
            acc[cat] += Number(item.amount);
        });
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Daily Trend Data (Last 7 days of the selected month or all?)
    // Let's show all days in month that have spending
    const barData = records
        .map(r => ({
            day: new Date(r.date).getDate(),
            amount: Number(r.total_spent)
        }))
        .reverse(); // Records are desc, we want asc for chart? 
    // Actually chart usually X-axis left to right.
    // If records are desc (newest first), we should reverse.

    return (
        <PageTransition>
            <div className="space-y-5 pb-20">
                <div className="pt-2">
                    <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Monthly spending report
                    </p>
                </div>

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

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : pieData.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No data available for this month
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Pie Chart */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Spending by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatCurrency(Number(value))}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bar Chart */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Daily Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[...barData].reverse()}>
                                            <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `${value / 1000}k`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                formatter={(value) => formatCurrency(Number(value))}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
