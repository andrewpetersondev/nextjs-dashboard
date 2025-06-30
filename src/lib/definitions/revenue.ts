export type Revenue = {
	month: string;
	revenue: number;
};

// biome-ignore lint/style/useNamingConvention: ignore
export interface YAxisResult {
	yAxisLabels: string[];
	topLabel: number;
}
