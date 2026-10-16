import { z } from "zod";
import type { Facilitator } from "@/features/facilitators/lib/facilitator";

/**
 * GET /api/facilitators の応答。
 * 課題の PDF の画像と現行の API は形が違っていたので、応答を信用せずに検証する。
 * satisfies で、検証した値が lib の型に合うことを型検査で確かめる
 * (lib の型にある項目をスキーマが欠くと、tsc が落ちる)。
 */
export const facilitatorListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      loginId: z.string(),
    }),
  ),
  totalCount: z.number().int().nonnegative(),
}) satisfies z.ZodType<{ data: Facilitator[]; totalCount: number }>;
