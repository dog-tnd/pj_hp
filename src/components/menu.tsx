import type React from "react";
import "./../index.css";

const Logo = "/logo.svg";

interface Link {
  href: string;
  label: string;
}

const links: Link[] = [
  { href: "/", label: "私たちについて" },
  { href: "/", label: "テックブログ" },
  { href: "/", label: "よくある質問" },
  { href: "/", label: "お問い合わせ" },
  { href: "/", label: "入会申し込み" },
];

const Menu: React.FC = () => {
  return (
    <div className="p-0 w-40 md:absolute top-[5rem] right-[0rem] pb-[5rem]">
      <div className="flex flex-col items-center w-full">
        <div className="flex justify-center items-center gap-2 mb-10">
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
  );
};

export default Menu;
