import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Meat Point",
  description: "Book meat items quickly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-zinc-50 text-zinc-900">
        <Providers>
          <div className="mx-auto w-full max-w-5xl px-4 py-6">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
