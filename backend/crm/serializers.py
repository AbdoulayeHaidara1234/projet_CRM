from rest_framework import serializers
from .models import User, Club, Contact, Lead, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role'] # On cache le mot de passe pour la sécurité

class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = '__all__' # Transforme toutes les colonnes en JSON

class ContactSerializer(serializers.ModelSerializer):
    # Optionnel: Affiche le nom du club au lieu de juste son ID
    club_nom = serializers.CharField(source='club.nom_club', read_only=True)
    
    class Meta:
        model = Contact
        fields = '__all__'

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'