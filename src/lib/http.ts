/** 通信の失敗の原因 */
export type HttpErrorKind = "network" | "timeout" | "status" | "parse";

/**
 * 通信の失敗を表すエラー。原因の種類 (kind) を持つ。
 * 画面はどの種類も同じ通信エラーとして扱い、種類を読むのはテストだけ。
 */
export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  /** kind が "status" のときの HTTP の状態コード */
  readonly status: number | undefined;

  constructor(
    kind: HttpErrorKind,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(`通信に失敗しました (${kind})`, { cause: options.cause });
    this.name = "HttpError";
    this.kind = kind;
    this.status = options.status;
  }
}

/** 応答を待つ上限 (10 秒)。超えたら通信の失敗 (timeout) として扱う */
const DEFAULT_TIMEOUT_MS = 10_000;

type FetchJsonOptions = {
  /** 呼び出し元の中断。TanStack Query が渡す signal */
  signal?: AbortSignal;
  /** 応答を待つ上限。テストで短くするために渡せる */
  timeoutMs?: number;
};

/**
 * URL から JSON を取得する。失敗は HttpError で投げる。
 *
 * 呼び出し元の中断 (signal) だけは HttpError にせず、元のエラー (AbortError) のまま投げる。
 * 中断は通信の失敗ではないので、失敗の種類に数えない。TanStack Query は、条件を切り替えて
 * 前の取得を中断すると、この関数が何を投げても取り消しとして扱う (クエリを前の状態に戻す)。
 *
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation
 */
export async function fetchJson(
  url: string,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchJsonOptions = {},
): Promise<unknown> {
  // 呼び出し元の中断とタイムアウトの、どちらが先に起きても fetch を止める
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(url, { signal: combinedSignal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new HttpError(timeoutSignal.aborted ? "timeout" : "network", {
      cause: error,
    });
  }

  // fetch は 404 や 500 でも成功として返すので、ここで失敗にする
  if (!response.ok) {
    throw new HttpError("status", { status: response.status });
  }

  try {
    return await response.json();
  } catch (error) {
    // 本文を読んでいる途中にも、中断とタイムアウトは起きうる
    if (signal?.aborted) throw error;
    throw new HttpError(timeoutSignal.aborted ? "timeout" : "parse", {
      cause: error,
    });
  }
}
