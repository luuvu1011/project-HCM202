import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hành Trình Ra Đi Tìm Đường Cứu Nước — Nguyễn Tất Thành",
  description:
    "Trải nghiệm cinematic tương tác: hành trình ra đi tìm đường cứu nước của Nguyễn Tất Thành — từ Bến Nhà Rồng 1911 đến khi Đảng ra đời 1930.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-foreground">{children}</body>
    </html>
  );
}
