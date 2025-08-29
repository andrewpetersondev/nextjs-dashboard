// biome-ignore lint/correctness/noNodejsModules: <file is used for files outside of next.js runtime>
import process from "node:process";
import { loadEnvConfig } from "@next/env";

// biome-ignore lint/suspicious/useAwait: <not shown in nextjs docs>
export default async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
};

// const projectDir = process.cwd();
// loadEnvConfig(projectDir);
