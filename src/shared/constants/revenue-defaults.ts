import { iatSchema } from "@/server/auth/zod.ts";

console.log(iatSchema.parse(1699999999));
