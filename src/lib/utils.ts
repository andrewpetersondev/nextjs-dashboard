export const formatCurrency = (amount: number) => {
	return (amount / 100).toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
	});
};

export const formatDateToLocal = (dateStr: string, locale = "en-US") => {
	const date = new Date(dateStr);
	const options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
	};
	const formatter = new Intl.DateTimeFormat(locale, options);
	return formatter.format(date);
};

export const generateYAxis = (
	revenue: {
		month: string;
		revenue: number;
	}[],
) => {
	const yAxisLabels: string[] = [];
	const highestRecord = Math.max(...revenue.map((month) => month.revenue));
	const topLabel = Math.ceil(highestRecord / 1000) * 1000;

	for (let i = topLabel; i >= 0; i -= 100000) {
		yAxisLabels.push(`$${i / 1000}K`);
	}

	return { yAxisLabels, topLabel };
};
