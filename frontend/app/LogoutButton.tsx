// "use client" indique à Next.js que ce composant doit s'exécuter sur le navigateur de l'utilisateur.
"use client"; // Cette ligne magique autorise les "onClick" !
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  // Fonction asynchrone déclenchée lors du clic
  // Elle est "async" car on doit attendre que les serveurs de Supabase confirment la déconnexion
  const handleLogout = async () => {
    // supabase.auth.signOut() détruit instantanément le "JWT Token" (le badge d'accès de l'utilisateur)
    // stocké dans le navigateur.
    await supabase.auth.signOut();

    // Puisque le token a disparu, le composant <AuthGuard> (Dans layout.tsx)
    // va s'en rendre compte immédiatement et va expulser l'utilisateur vers la page de Login !
  };

  // --- RENDU VISUEL (JSX) ---
  return (
    <button 
      onClick={handleLogout} 
      className="w-full text-left p-3 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded transition flex items-center"
    >
      🚪 Déconnexion
    </button>
  );
}