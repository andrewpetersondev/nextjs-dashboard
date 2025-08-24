import { loadEnvConfig } from "@next/env";

// biome-ignore lint/nursery/useExplicitType: <not shown in nextjs docs>
// biome-ignore lint/suspicious/useAwait: <not shown in nextjs docs>
export default async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
};

// const projectDir = process.cwd();
// loadEnvConfig(projectDir);
