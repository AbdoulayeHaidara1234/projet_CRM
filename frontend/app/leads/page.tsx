"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    montant_estime: '',
    statut: 'NOUVEAU',
    contact: ''
  });

  // Les 4 étapes de notre Pipeline
  const COLONNES = [
    { id: 'NOUVEAU', titre: 'Nouvelles opportunités', couleur: 'border-blue-500', bg: 'bg-blue-50' },
    { id: 'EN_COURS', titre: 'En négociation', couleur: 'border-yellow-500', bg: 'bg-yellow-50' },
    { id: 'GAGNE', titre: 'Gagné (Ventes)', couleur: 'border-green-500', bg: 'bg-green-50' },
    { id: 'PERDU', titre: 'Perdu', couleur: 'border-red-500', bg: 'bg-red-50' },
  ];

  useEffect(() => {
    api.get('leads/').then(response => setLeads(response.data)).catch(console.error);
    api.get('contacts/').then(response => setContacts(response.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        contact: formData.contact ? parseInt(formData.contact) : null
      };
      const response = await api.post('leads/', dataToSend);
      setLeads([response.data, ...leads] as any);
      setShowForm(false);
      setFormData({ titre: '', montant_estime: '', statut: 'NOUVEAU', contact: '' });
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce devis ?")) return;
    try {
      await api.delete(`leads/${id}/`);
      setLeads(leads.filter((lead: any) => lead.id !== id));
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // NOUVELLE FONCTION : Changer de colonne (Mise à jour du statut)
  const handleStatusChange = async (id: number, nouveauStatut: string) => {
    try {
      // On utilise PATCH pour ne modifier QUE le statut dans la base de données
      const response = await api.patch(`leads/${id}/`, { statut: nouveauStatut });
      // On met à jour l'affichage avec la nouvelle carte
      setLeads(leads.map((lead: any) => lead.id === id ? response.data : lead) as any);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      alert("Impossible de changer le statut.");
    }
  };

  const getContactName = (contactId: number | null) => {
    if (!contactId) return "Aucun contact";
    const contact: any = contacts.find((c: any) => c.id === contactId);
    return contact ? `${contact.prenom} ${contact.nom}` : "Inconnu";
  };

  return (
    <div className="p-10 relative h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pipeline Commercial</h1>
          <p className="text-gray-500 mt-1">Suivez l'évolution de vos devis d'équipements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow transition">
          + Nouveau Devis
        </button>
      </div>

      {/* FENÊTRE MODALE (Inchangée) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Créer une opportunité</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input type="text" required value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact associé</label>
                <select value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black">
                  <option value="">-- Aucun --</option>
                  {contacts.map((contact: any) => (
                    <option key={contact.id} value={contact.id}>{contact.prenom} {contact.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant estimé (€)</label>
                <input type="number" step="0.01" required value={formData.montant_estime} onChange={(e) => setFormData({...formData, montant_estime: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut initial</label>
                <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black">
                  <option value="NOUVEAU">Nouveau</option>
                  <option value="EN_COURS">En négociation</option>
                  <option value="GAGNE">Gagné</option>
                  <option value="PERDU">Perdu</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LE PIPELINE (KANBAN) */}
      <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
        {COLONNES.map(colonne => {
          // On filtre les leads pour ne garder que ceux de cette colonne
          const leadsColonne = leads.filter((l: any) => l.statut === colonne.id);
          // On calcule le total € de la colonne
          const totalColonne = leadsColonne.reduce((sum: number, l: any) => sum + parseFloat(l.montant_estime), 0);

          return (
            <div key={colonne.id} className={`flex-1 min-w-[300px] rounded-xl border-t-4 ${colonne.couleur} ${colonne.bg} p-4 flex flex-col`}>
              
              {/* En-tête de la colonne */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-700 uppercase text-sm">{colonne.titre}</h2>
                <span className="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  {leadsColonne.length}
                </span>
              </div>
              <div className="text-sm text-gray-500 font-medium mb-4">
                Total: {totalColonne.toLocaleString('fr-FR')} €
              </div>

              {/* Liste des cartes (Devis) */}
              <div className="flex flex-col gap-3 overflow-y-auto">
                {leadsColonne.map((lead: any) => (
                  <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition group">
                    
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800">{lead.titre}</h3>
                      <button onClick={() => handleDelete(lead.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        ✖
                      </button>
                    </div>
                    
                    <div className="text-2xl font-black text-gray-700 mb-2">
                      {parseFloat(lead.montant_estime).toLocaleString('fr-FR')} €
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                      <span>👤</span> {getContactName(lead.contact)}
                    </div>

                    {/* Menu pour changer de colonne */}
                    <div className="pt-3 border-t border-gray-100">
                      <select 
                        value={lead.statut}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-1 cursor-pointer hover:bg-gray-100 transition"
                      >
                        {COLONNES.map(col => (
                          <option key={col.id} value={col.id}>
                            ➡️ Déplacer vers : {col.titre}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}