import logoUrl from "@/assets/logo-white.svg";
import { AccountIcon } from "@/components/icons";

/** デザインのユーザー名は、架空の名前に置き換えて出す (公開する repo に実在の人の名前を載せないため) */
const USER_NAME = "山田花子";

/** 画面の上のヘッダー。表示だけで、押せる要素は無い (一覧以外の機能は作らない) */
export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-between bg-primary-1 px-6 text-white">
      <div className="flex items-center gap-6">
        <img src={logoUrl} alt="Qubena Manager" width={276} height={32} />
        <span className="flex h-8 w-36 items-center justify-center rounded border border-white text-base font-semibold">
          アカウント管理
        </span>
      </div>
      <div className="flex items-center gap-2">
        <AccountIcon />
        <span className="text-base font-semibold">{USER_NAME}</span>
      </div>
    </header>
  );
}
