import { facilitatorListResponseSchema } from "@/features/facilitators/api/facilitator-schema";
import {
  type FacilitatorListResult,
  PAGE_SIZE,
} from "@/features/facilitators/lib/facilitator";
import type { ListParams } from "@/features/facilitators/lib/list-params";
import { classifyListResult } from "@/features/facilitators/lib/list-result";
import { fetchJson } from "@/lib/http";

/**
 * 応答が不正なときの失敗。画面は通信エラーとして扱う。
 * - schema: 応答がスキーマに合わない
 * - inconsistent: 行が空なのに総件数があり、要求したページは範囲内
 */
export class InvalidResponseError extends Error {
  readonly reason: "schema" | "inconsistent";

  constructor(
    reason: "schema" | "inconsistent",
    options?: { cause?: unknown },
  ) {
    super(`応答が不正です (${reason})`, options);
    this.name = "InvalidResponseError";
    this.reason = reason;
  }
}

/**
 * 一覧の条件で先生を取得し、検証して分類した結果を返す。
 * 結果には要求したページを持たせる (前の結果を出しているあいだも、件数表示を行と合わせるため)。
 */
export async function fetchFacilitators(
  params: ListParams,
  { signal }: { signal?: AbortSignal } = {},
): Promise<FacilitatorListResult> {
  const json = await fetchJson(`/api/facilitators?${toApiQuery(params)}`, {
    signal,
  });

  const parsed = facilitatorListResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new InvalidResponseError("schema", { cause: parsed.error });
  }

  const { data, totalCount } = parsed.data;
  const kind = classifyListResult({
    rowCount: data.length,
    totalCount,
    page: params.page,
  });
  if (kind === "inconsistent") {
    throw new InvalidResponseError("inconsistent");
  }
  return { kind, facilitators: data, totalCount, page: params.page };
}

/** API に送るクエリ。検索語が無いときは search を送らない */
function toApiQuery({ page, sort, order, search }: ListParams) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    sort,
    order,
  });
  if (search !== "") query.set("search", search);
  return query.toString();
}
