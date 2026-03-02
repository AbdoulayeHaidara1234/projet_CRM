"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [clubs, setClubs] = useState([]);
  
  // NOUVEAU : État pour la barre de recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    role_club: '',
    club: ''
  });

  useEffect(() => {
    api.get('contacts/').then(response => setContacts(response.data)).catch(console.error);
    api.get('clubs/').then(response => setClubs(response.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        club: formData.club ? parseInt(formData.club) : null
      };
      const response = await api.post('contacts/', dataToSend);
      setContacts([response.data, ...contacts] as any);
      setShowForm(false);
      setFormData({ prenom: '', nom: '', email: '', role_club: '', club: '' });
    } catch (error) {
      console.error("Erreur création:", error);
      alert("Erreur lors de la création du contact.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce contact ?")) return;
    try {
      await api.delete(`contacts/${id}/`);
      setContacts(contacts.filter((c: any) => c.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Impossible de supprimer ce contact.");
    }
  };

  const handleSendEmail = async (email: string, prenom: string) => {
    if (!window.confirm(`Voulez-vous envoyer le catalogue à ${email} ?`)) return;
    try {
      await api.post('send-email/', { email: email, nom: prenom });
      alert(`✅ E-mail envoyé avec succès à ${prenom} !`);
    } catch (error) {
      console.error("Erreur envoi email:", error);
      alert("❌ Erreur lors de l'envoi de l'e-mail.");
    }
  };

  const getClubName = (clubId: number | null) => {
    if (!clubId) return <span className="text-gray-400 italic">Indépendant</span>;
    const club: any = clubs.find((c: any) => c.id === clubId);
    return club ? club.nom_club : "Inconnu";
  };

  // NOUVEAU : Filtrage dynamique des contacts
  // Cette liste se met à jour à chaque lettre tapée dans la barre de recherche !
  const filteredContacts = contacts.filter((contact: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.prenom.toLowerCase().includes(searchLower) ||
      contact.nom.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.role_club && contact.role_club.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-10 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Répertoire des Contacts</h1>
          <p className="text-gray-500 mt-1">Gérez vos relations avec les clubs partenaires</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition">
          + Nouveau Contact
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[500px]">
            <h2 className="text-xl font-bold mb-4">Ajouter un contact</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input type="text" required value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse E-mail</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <input type="text" value={formData.role_club} onChange={(e) => setFormData({...formData, role_club: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Club affilié</label>
                  <select value={formData.club} onChange={(e) => setFormData({...formData, club: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black">
                    <option value="">-- Aucun --</option>
                    {clubs.map((club: any) => <option key={club.id} value={club.id}>{club.nom_club}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOUVEAU : LA BARRE DE RECHERCHE */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="🔍 Rechercher par nom, prénom, email ou rôle..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4 font-medium">Nom complet</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Rôle</th>
              <th className="p-4 font-medium">Club</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* ATTENTION : On utilise filteredContacts au lieu de contacts ici ! */}
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  {searchTerm ? "Aucun contact ne correspond à votre recherche." : "Aucun contact enregistré."}
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact: any) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">
                    {contact.prenom} <span className="uppercase">{contact.nom}</span>
                  </td>
                  <td className="p-4 text-blue-600">{contact.email}</td>
                  <td className="p-4 text-gray-600">{contact.role_club || "-"}</td>
                  <td className="p-4 font-medium text-gray-800">{getClubName(contact.club)}</td>
                  
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleSendEmail(contact.email, contact.prenom)} className="text-emerald-600 hover:text-emerald-800 font-medium px-3 py-1 bg-emerald-50 rounded transition" title="Envoyer le catalogue par e-mail">
                      ✉️ Envoyer
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded transition">
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