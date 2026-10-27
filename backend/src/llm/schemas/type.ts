import { z } from "zod";

export type TradeTool<T extends z.ZodTypeAny> = {
  name: string;
  description: string;
  inputSchema: T;
  execute: (args: z.infer<T>) => Promise<any>;
};

