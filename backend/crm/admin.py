from django.contrib import admin
from .models import User, Club, Contact, Lead, Task

# 1. Enregistrement des Utilisateurs (Commerciaux/Admins)
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role',)

# 2. Enregistrement des Clubs
@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('nom_club', 'ville', 'code_postal', 'date_creation')
    search_fields = ('nom_club', 'ville') # Ajoute une barre de recherche

# 3. Enregistrement des Contacts
@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('prenom', 'nom', 'email', 'role_club', 'club')
    search_fields = ('nom', 'prenom', 'email')
    list_filter = ('club',) # Permet de filtrer par club sur le côté

# 4. Enregistrement des Leads (Opportunités)
@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('titre', 'montant_estime', 'statut', 'contact', 'commercial')
    list_filter = ('statut', 'commercial') # Filtres très utiles pour un CRM
    search_fields = ('titre',)

# 5. Enregistrement des Tâches
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('titre', 'type_tache', 'echeance', 'est_terminee', 'lead')
    list_filter = ('est_terminee', 'type_tache')