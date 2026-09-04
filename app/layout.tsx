import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentAI — Social Media Content Planner",
  description: "AI-powered social media planning workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.puter.com/v2/" async defer></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
