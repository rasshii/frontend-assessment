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

/** 応答を待つ上限 (完了条件 H の 10 秒) */
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
 * TanStack Query は、条件を切り替えたときに前の取得を中断し、その取得を失敗ではなく
 * 取り消しとして扱う (クエリを取得の前の状態に戻す)。ここで失敗に変えると、
 * 切り替えのたびにエラーダイアログが出てしまう。
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
