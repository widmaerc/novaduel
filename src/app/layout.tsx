import './globals.css';

// The root layout is minimal —  <html> and <body> are rendered by
// src/app/[locale]/layout.tsx which knows the actual locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
