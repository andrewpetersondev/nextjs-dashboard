// Server-only utilities (Node.js APIs, database, etc.)

// Example: import { db } from "@/src/db/database";
// export async function seedDatabase() { ... }

import "server-only";

export const formatCurrency = async (amount: number): Promise<string> => {
    return (amount / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
};

export const formatDateToLocal = async (
    dateStr: string,
    locale: string = "en-US",
): Promise<string> => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
    };
    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(date);
};

export const generateYAxis = async (
    revenue: {
        month: string;
        revenue: number;
    }[],
): Promise<{ yAxisLabels: string[]; topLabel: number }> => {
    const yAxisLabels: string[] = [];
    const highestRecord = Math.max(...revenue.map((month) => month.revenue));
    const topLabel = Math.ceil(highestRecord / 1000) * 1000;

    for (let i = topLabel; i >= 0; i -= 100000) {
        yAxisLabels.push(`$${i / 1000}K`);
    }

    return { yAxisLabels, topLabel };
};
