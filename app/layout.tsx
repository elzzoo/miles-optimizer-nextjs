import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miles Optimizer · Par Saloum",
  description: "Comparez cash vs miles — trouvez l'option la moins ch\u00e8re pour chaque vol",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
