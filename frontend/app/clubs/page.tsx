"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  
  // États pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom_club: '',
    ville: '',
    code_postal: ''
  });

  // 1. Charger les Clubs au démarrage
  useEffect(() => {
    api.get('clubs/').then(response => {
      setClubs(response.data);
    }).catch(error => console.error("Erreur API:", error));
  }, []);

  // 2. Fonction de création
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('clubs/', formData);
      setClubs([response.data, ...clubs] as any);
      
      // On ferme et on vide le formulaire
      setShowForm(false);
      setFormData({ nom_club: '', ville: '', code_postal: '' });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création du club.");
    }
  };

  // 3. Fonction de suppression
  const handleDelete = async (id: number) => {
    // Avertissement spécifique : un club peut contenir des contacts !
    if (!window.confirm("Voulez-vous vraiment supprimer ce club ? Attention, l'opération sera bloquée s'il contient encore des contacts.")) return;
    
    try {
      await api.delete(`clubs/${id}/`);
      setClubs(clubs.filter((club: any) => club.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Impossible de supprimer ce club. Il contient probablement des contacts rattachés.");
    }
  };

  return (
    <div className="p-10 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Clubs Partenaires</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          + Nouveau Club
        </button>
      </div>

      {/* FENÊTRE MODALE DU FORMULAIRE */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Ajouter un club</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom du club</label>
                <input 
                  type="text" 
                  required 
                  value={formData.nom_club} 
                  onChange={(e) => setFormData({...formData, nom_club: e.target.value})} 
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" 
                  placeholder="ex: Paris Basketball"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ville</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.ville} 
                    onChange={(e) => setFormData({...formData, ville: e.target.value})} 
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code Postal</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.code_postal} 
                    onChange={(e) => setFormData({...formData, code_postal: e.target.value})} 
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLEAU DES CLUBS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4 font-medium">Nom du Club</th>
              <th className="p-4 font-medium">Ville</th>
              <th className="p-4 font-medium">Code Postal</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clubs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Aucun club enregistré.</td>
              </tr>
            ) : (
              clubs.map((club: any) => (
                <tr key={club.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-orange-600">{club.nom_club}</td>
                  <td className="p-4 text-gray-800">{club.ville}</td>
                  <td className="p-4 text-gray-500">{club.code_postal}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(club.id)} className="text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded transition">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}