import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LayItRight - Tile Planning Calculator",
  description:
    "Plan your DIY tiling projects with precision. Calculate tiles, area, waste, and see live previews.",
  keywords: [
    "tile calculator",
    "DIY tiling",
    "tile planning",
    "home improvement",
    "flooring",
  ],
  authors: [{ name: "LayItRight Team" }],
  openGraph: {
    title: "LayItRight - Tile Planning Calculator",
    description: "Plan your DIY tiling projects with precision",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">
        <div className=" bg-background">{children}</div>
      </body>
    </html>
  );
}
