import React, { useState, useRef, useEffect } from "react";
import "./../index.css";

const Logo = "/logo.svg";

interface Link {
  href: string;
  label: string;
}

const links: Link[] = [
  { href: "/about", label: "私たちについて" },
  { href: "/blog", label: "テックブログ" },
  { href: "/faq", label: "よくある質問" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "#", label: "入会申し込み" }, // href を # に変更して、クリックイベントで処理するように
];

const Menu: React.FC = () => {
  // モバイル用ドロップダウンメニューの表示切替用
  const [isOpen, setIsOpen] = useState(false);
  // ポップアップの表示状態
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // ハンバーガーボタンとドロップダウンを囲むコンテナの ref
  const menuRef = useRef<HTMLDivElement>(null);
  // ポップアップコンテンツの ref
  const popupContentRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // ポップアップを開く
  const openPopup = (e: React.MouseEvent) => {
    // 「入会申し込み」リンクの場合、デフォルトの挙動を防止
    if ((e.target as HTMLElement).closest('a')?.textContent === "入会申し込み") {
      e.preventDefault();
      setIsPopupOpen(true);
      document.body.style.overflow = 'hidden'; // スクロールを無効化
    }
  };

  // ポップアップを閉じる
  const closePopup = () => {
    setIsPopupOpen(false);
    document.body.style.overflow = ''; // スクロールを再有効化
  };

  // メニュー以外をクリックしたときに、メニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ポップアップの外側をクリックしたときに、ポップアップを閉じる
  useEffect(() => {
    const handlePopupClickOutside = (event: MouseEvent) => {
      if (
        isPopupOpen &&
        popupContentRef.current &&
        !popupContentRef.current.contains(event.target as Node)
      ) {
        closePopup();
      }
    };

    // ESCキーでポップアップを閉じる
    const handleEscKey = (event: KeyboardEvent) => {
      if (isPopupOpen && event.key === 'Escape') {
        closePopup();
      }
    };

    document.addEventListener("mousedown", handlePopupClickOutside);
    document.addEventListener("keydown", handleEscKey);
    
    return () => {
      document.removeEventListener("mousedown", handlePopupClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isPopupOpen]);

  return (
    <>
      {/* モバイル用ヘッダー */}
      <div className="md:hidden w-full px-4 py-4">
        <div className="flex justify-between items-center">
          {/* 左側：TND Logo と TND（左寄せ） */}
          <a href="/" className="flex items-center gap-2">
            <img
              src={Logo || "/placeholder.svg"}
              alt="TND Logo"
              className="w-12 h-12"
            />
            <h1
              className="text-5xl text-gray-900"
              style={{
                fontFamily: "'Rubik Doodle Shadow', system-ui",
                fontWeight: 400,
              }}
            >
              TND
            </h1>
          </a>
          {/* 右側：ハンバーガーボタン＆ドロップダウン */}
          <div className="relative" ref={menuRef}>
            <button onClick={toggleMenu}>
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {/* ドロップダウンメニュー：ハンバーガーボタンの下に表示 */}
            <div
              className={`absolute right-0 top-full mt-2 w-40 bg-white/80 shadow-md rounded transition-all duration-300 transform z-[100] ${
                isOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              }`}
            >
              <nav className="flex flex-col items-end gap-6 p-4" onClick={openPopup}>
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={link.label === "入会申し込み" ? (e) => {
                      e.preventDefault();
                      setIsOpen(false);
                      setIsPopupOpen(true);
                    } : () => setIsOpen(false)}
                    className={`flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      link.label === "入会申し込み"
                        ? "relative overflow-hidden text-white font-bold py-2 px-4 rounded-lg bg-[#F5BF48] transition-all duration-300 before:absolute before:inset-0 before:bg-[linear-gradient(94deg,#F5BF48_0.43%,#F7BC5B_33.92%,#EFA169_100%)] before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 z-10"
                        : "text-black hover:text-black/60"
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* デスクトップ用メニュー（md以上）：従来の配置 */}
      <div className="hidden md:block p-0 w-40 md:absolute top-[5rem] right-[0rem] pb-[5rem]">
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center items-center gap-2 mb-10">
            <a href="/" className="flex items-center gap-2">
              <img
                src={Logo || "/placeholder.svg"}
                alt="TND Logo"
                className="w-12 h-12"
              />
              <h1
                className="text-5xl text-gray-900"
                style={{
                  fontFamily: "'Rubik Doodle Shadow', system-ui",
                  fontWeight: 400,
                }}
              >
                TND
              </h1>
            </a>
          </div>
          <nav className="w-full" onClick={openPopup}>
            <div className="flex flex-col items-end gap-6 w-full">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    link.label === "入会申し込み"
                      ? "relative overflow-hidden text-white font-bold py-2 px-4 rounded-lg bg-[#F5BF48] transition-all duration-300 before:absolute before:inset-0 before:bg-[linear-gradient(94deg,#F5BF48_0.43%,#F7BC5B_33.92%,#EFA169_100%)] before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 z-10"
                      : "text-black hover:text-black/60"
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* ポップアップ */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div 
            ref={popupContentRef}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-popup"
            style={{
              animation: 'popup 0.4s ease-out forwards'
            }}
          >
            {/* ポップアップヘッダー */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Discordに参加しよう！</h3>
                <button onClick={closePopup} className="text-white hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* ポップアップコンテンツ */}
            <div className="p-6">
              <div className="mb-6">
                <img 
                  src="/sns-discord.svg" 
                  alt="Discord Icon" 
                  className="w-16 h-16 mx-auto text-indigo-600" 
                />
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>4,5月はDiscordを中心に新歓イベントを開催します！</strong>
                </p>
                <p>
                  このDiscordサーバーに参加すると、プログラミングサークルTNDの<strong>仮加入メンバー</strong>となります。
                </p>
                <p>
                  新入生同士でたくさん交流して、プログラミングの楽しさを一緒に体験しましょう！
                </p>
              </div>
              
              <div className="mt-8">
                <a 
                  href="https://discord.gg/k3qMBEn3CC" 
                  target="_blank"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Discordサーバーに参加する
                </a>
                <p className="text-[12px] text-gray-500 mt-2 text-center">
                  ※もしリンクが切れていたら、お手数ですがお問い合わせください。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ポップアップアニメーションのためのスタイル */}
      <style>{`
        @keyframes popup {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Menu;