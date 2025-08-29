import { loadEnvConfig } from "@next/env";

// biome-ignore lint/suspicious/useAwait: <not shown in nextjs docs>
export default async () => {
  // biome-ignore lint/correctness/noProcessGlobal: <temp>
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
};

// const projectDir = process.cwd();
// loadEnvConfig(projectDir);
