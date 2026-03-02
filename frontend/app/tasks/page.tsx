"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]); // Pour lier une tâche à un devis
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    type_tache: 'APPEL', // Valeur par défaut
    echeance: '',
    lead: ''
  });

  // 1. Charger les Tâches et les Leads
  useEffect(() => {
    api.get('tasks/').then(response => setTasks(response.data)).catch(console.error);
    api.get('leads/').then(response => setLeads(response.data)).catch(console.error);
  }, []);

  // 2. Créer une nouvelle tâche
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        lead: formData.lead ? parseInt(formData.lead) : null,
        est_terminee: false // Par défaut, une nouvelle tâche n'est pas terminée
      };

      const response = await api.post('tasks/', dataToSend);
      setTasks([response.data, ...tasks] as any);
      
      setShowForm(false);
      setFormData({ titre: '', type_tache: 'APPEL', echeance: '', lead: '' });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création de la tâche.");
    }
  };

  // 3. Supprimer une tâche
  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;
    try {
      await api.delete(`tasks/${id}/`);
      setTasks(tasks.filter((t: any) => t.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  // 4. NOUVEAU : Cocher/Décocher une tâche (Marquer comme terminée)
  const handleToggleComplete = async (task: any) => {
    try {
      // On utilise PATCH car on ne modifie qu'un seul champ (est_terminee)
      const response = await api.patch(`tasks/${task.id}/`, {
        est_terminee: !task.est_terminee
      });
      // On met à jour l'affichage avec la nouvelle donnée
      setTasks(tasks.map((t: any) => t.id === task.id ? response.data : t) as any);
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      alert("Erreur lors de la mise à jour de la tâche.");
    }
  };

  const getLeadName = (leadId: number | null) => {
    if (!leadId) return <span className="text-gray-400 italic">-</span>;
    const lead: any = leads.find((l: any) => l.id === leadId);
    return lead ? lead.titre : "Inconnu";
  };

  return (
    <div className="p-10 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tâches & Relances</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          + Nouvelle Tâche
        </button>
      </div>

      {/* FENÊTRE MODALE */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[400px]">
            <h2 className="text-xl font-bold mb-4">Ajouter une tâche</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre (ex: Rappeler pour le devis)</label>
                <input type="text" required value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type d'action</label>
                  <select value={formData.type_tache} onChange={(e) => setFormData({...formData, type_tache: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black">
                    <option value="APPEL">📞 Appel</option>
                    <option value="EMAIL">✉️ E-mail</option>
                    <option value="RDV">🤝 Rendez-vous</option>
                    <option value="RELANCE">⚠️ Relance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Échéance</label>
                  <input type="date" required value={formData.echeance} onChange={(e) => setFormData({...formData, echeance: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Devis (Lead) associé</label>
                <select value={formData.lead} onChange={(e) => setFormData({...formData, lead: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black">
                  <option value="">-- Aucun --</option>
                  {leads.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLEAU DES TÂCHES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4 font-medium w-16 text-center">État</th>
              <th className="p-4 font-medium">À faire</th>
              <th className="p-4 font-medium">Devis concerné</th>
              <th className="p-4 font-medium">Échéance</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Aucune tâche en cours !</td>
              </tr>
            ) : (
              tasks.map((task: any) => (
                <tr key={task.id} className={`hover:bg-gray-50 transition ${task.est_terminee ? 'bg-gray-50 opacity-70' : ''}`}>
                  
                  {/* BOUTON COCHER/DÉCOCHER */}
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleToggleComplete(task)}
                      className={`w-6 h-6 rounded border flex items-center justify-center transition ${task.est_terminee ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-500'}`}
                    >
                      {task.est_terminee && "✓"}
                    </button>
                  </td>

                  <td className="p-4">
                    <div className={`font-medium ${task.est_terminee ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.titre}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{task.type_tache}</div>
                  </td>
                  
                  <td className="p-4 text-indigo-600 font-medium">{getLeadName(task.lead)}</td>
                  
                  <td className={`p-4 ${new Date(task.echeance) < new Date() && !task.est_terminee ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                    {new Date(task.echeance).toLocaleDateString('fr-FR')}
                  </td>
                  
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded transition">
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