"use client"; // Cette ligne magique autorise les "onClick" !
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button 
      onClick={handleLogout} 
      className="w-full text-left p-3 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded transition flex items-center"
    >
      🚪 Déconnexion
    </button>
  );
}