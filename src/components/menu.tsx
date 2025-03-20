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
  { href: "/application", label: "入会申し込み" },
];

const Menu: React.FC = () => {
  // モバイル用ドロップダウンメニューの表示切替用
  const [isOpen, setIsOpen] = useState(false);
  // ハンバーガーボタンとドロップダウンを囲むコンテナの ref
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
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
              <nav className="flex flex-col items-end gap-6 p-4">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
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
          <nav className="w-full">
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
    </>
  );
};

export default Menu;
