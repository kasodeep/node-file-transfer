import { Fragment_Mono, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Goku Transfer",
  description: "File trnasfer using goku's fire streams!!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${fragmentMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
