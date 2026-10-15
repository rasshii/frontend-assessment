import { setupServer } from "msw/node";
import { handlers } from "@/testing/handlers";

/** Node.js のテスト (Vitest) で通信を受け取る MSW の server。開始と終了は setup.ts が受け持つ。 */
export const server = setupServer(...handlers);
