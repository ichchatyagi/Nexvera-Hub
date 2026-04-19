import "./globals.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata = {
  title: "Nexvera Hub",
  description: "Next-generation learning platform for professionals and students.",
  icons: {
    icon: "/favlog.png",
    shortcut: "/favlog.png",
    apple: "/favlog.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
