"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire de connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Permet de basculer entre Connexion et Inscription
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Vérifie si l'utilisateur est déjà connecté au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Écoute les changements (connexion, déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setIsLogin(true);
      }
    } catch (error: any) {
      setAuthError(error.message || "Une erreur est survenue");
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">Chargement sécurisé...</div>;
  }

  // SI L'UTILISATEUR N'EST PAS CONNECTÉ : On affiche la page de Login
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-orange-600 mb-1">CRM Basket</h1>
            <p className="text-gray-500 text-sm">Veuillez vous identifier pour accéder au portail</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 outline-none" 
              />
            </div>

            {authError && <p className="text-red-500 text-sm font-medium">{authError}</p>}

            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition shadow-lg">
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Nouveau commercial ?" : "Déjà un compte ?"}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-orange-600 font-bold hover:underline">
              {isLogin ? "Créer un compte" : "Connectez-vous"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SI CONNECTÉ : On laisse passer l'application (les enfants)
  return <>{children}</>;
}