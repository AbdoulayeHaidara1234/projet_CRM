"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // On charge toutes les données nécessaires pour les statistiques
    api.get('leads/').then(response => setLeads(response.data)).catch(console.error);
    api.get('tasks/').then(response => setTasks(response.data)).catch(console.error);
  }, []);

  // --- CALCUL DES STATISTIQUES ---
  // 1. Chiffre d'Affaires (Leads Gagnés)
  const caGagne = leads
    .filter((l: any) => l.statut === 'GAGNE')
    .reduce((somme, l: any) => somme + parseFloat(l.montant_estime), 0);

  // 2. Pipeline en cours (Leads en négociation)
  const caEnCours = leads
    .filter((l: any) => l.statut === 'EN_COURS')
    .reduce((somme, l: any) => somme + parseFloat(l.montant_estime), 0);

  // 3. Tâches non terminées
  const tachesAfaire = tasks.filter((t: any) => !t.est_terminee);
  
  // 4. Objectif mensuel fictif (ex: 10 000€)
  const OBJECTIF = 10000;
  const progression = Math.min(100, Math.round((caGagne / OBJECTIF) * 100));

  return (
    <div className="p-10 bg-slate-50 min-h-screen relative">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord</h1>
      <p className="text-gray-500 mb-8">Bienvenue ! Voici le résumé de votre activité commerciale.</p>

      {/* LIGNE 1 : LES WIDGETS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Carte CA Réalisé */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <div className="text-sm text-gray-500 font-medium mb-1">Chiffre d'Affaires Ventes</div>
          <div className="text-3xl font-black text-gray-800">{caGagne.toLocaleString('fr-FR')} €</div>
        </div>

        {/* Carte Pipeline */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
          <div className="text-sm text-gray-500 font-medium mb-1">Pipeline (En cours)</div>
          <div className="text-3xl font-black text-gray-800">{caEnCours.toLocaleString('fr-FR')} €</div>
        </div>

        {/* Carte Total Prospects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <div className="text-sm text-gray-500 font-medium mb-1">Total Opportunités</div>
          <div className="text-3xl font-black text-gray-800">{leads.length}</div>
        </div>

        {/* Carte Tâches */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
          <div className="text-sm text-gray-500 font-medium mb-1">Tâches en attente</div>
          <div className="text-3xl font-black text-gray-800">{tachesAfaire.length}</div>
        </div>

      </div>

      {/* LIGNE 2 : GRAPHIQUE ET TÂCHES URGENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Objectif */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Objectif Mensuel (10 000 €)</h2>
          
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-bold text-green-600">{caGagne.toLocaleString('fr-FR')} €</span>
            <span className="text-gray-500 font-medium">{progression}% atteint</span>
          </div>
          
          {/* Barre de progression Tailwind */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progression}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {caGagne >= OBJECTIF 
              ? "🎉 Objectif explosé ! Bravo !" 
              : `Il manque ${(OBJECTIF - caGagne).toLocaleString('fr-FR')} € pour atteindre l'objectif.`}
          </p>
        </div>

        {/* Section Tâches à faire */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Tâches urgentes</h2>
            <Link href="/tasks" className="text-sm text-indigo-600 hover:underline">
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-3">
            {tachesAfaire.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">Aucune tâche en attente. Tout est à jour !</p>
            ) : (
              tachesAfaire.slice(0, 4).map((tache: any) => (
                <div key={tache.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border border-gray-100 transition">
                  <div>
                    <div className="font-medium text-gray-800">{tache.titre}</div>
                    <div className="text-xs text-gray-500">{tache.type_tache}</div>
                  </div>
                  <div className={`text-sm font-bold ${new Date(tache.echeance) < new Date() ? 'text-red-500' : 'text-gray-600'}`}>
                    {new Date(tache.echeance).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}