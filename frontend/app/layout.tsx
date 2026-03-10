import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthGuard from "./AuthGuard";
import LogoutButton from "./LogoutButton"; 

const inter = Inter({ subsets: ["latin"] });

// Définition des métadonnées (ce qui s'affiche dans l'onglet du navigateur et sur Google)
export const metadata: Metadata = {
  title: "CRM Basket",
  description: "Gestion des clubs et devis d'équipements",
};

// Composant Layout Principal : Il enveloppe absolument toutes les pages de l'application
// "children" représente la page actuellement visitée (ex: Dashboard, Clubs, etc.)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-100`}>
        <AuthGuard>
          <div className="flex h-screen">
            
            {/* Menu Latéral (Sidebar) */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
              <div className="p-6 text-2xl font-bold border-b border-slate-700 text-orange-500">
                🏀 CRM Basket
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <Link href="/" className="block p-3 rounded hover:bg-slate-800 transition">🏠 Tableau de Bord</Link>
                <Link href="/clubs" className="block p-3 rounded hover:bg-slate-800 transition">🏢 Clubs</Link>
                <Link href="/contacts" className="block p-3 rounded hover:bg-slate-800 transition">👤 Contacts</Link>
                <Link href="/leads" className="block p-3 rounded hover:bg-slate-800 transition">💰 Pipeline (Devis)</Link>
                <Link href="/tasks" className="block p-3 rounded hover:bg-slate-800 transition">✅ Tâches</Link>
              </nav>
              
              {/* On utilise notre composant bouton ici */}
              <div className="p-4 border-t border-slate-700">
                <LogoutButton />
              </div>
            </aside>

            {/* Contenu Principal */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

          </div>
        </AuthGuard>
      </body>
    </html>
  );
}