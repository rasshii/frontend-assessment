/**
 * 先生のテスト用データ。API (GET /api/facilitators) の応答の data に入る 1 件と同じ形で作る。
 * 単体・部品のテスト (MSW) と E2E が、同じ関数でデータを作る。
 */
export type FacilitatorRecord = {
  id: number;
  name: string;
  loginId: string;
};

/**
 * id が 1 から count までの先生を作る。名前は「先生{id}」、ログインID は「facilitator_{id}」。
 */
export function createFacilitators(count: number): FacilitatorRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return { id, name: `先生${id}`, loginId: `facilitator_${id}` };
  });
}
