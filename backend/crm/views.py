from django.shortcuts import render
from rest_framework import serializers
from .models import User, Club, Contact, Lead, Task
from rest_framework import viewsets
from .serializers import UserSerializer, ClubSerializer, ContactSerializer, LeadSerializer, TaskSerializer

import os
import resend
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


class UserViewSet(viewsets.ModelViewSet):
    """Gère la création, lecture, modification et suppression des Utilisateurs"""
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ClubViewSet(viewsets.ModelViewSet):
    """Gère les fiches des Clubs de basket"""
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

class ContactViewSet(viewsets.ModelViewSet):
    """Gère les contacts rattachés aux clubs"""
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class LeadViewSet(viewsets.ModelViewSet):
    """Gère les opportunités (devis maillots/ballons)"""
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

class TaskViewSet(viewsets.ModelViewSet):
    """Gère les tâches des commerciaux"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


# Configuration de la clé API depuis le fichier .env
resend.api_key = os.environ.get('RESEND_API_KEY')

@api_view(['POST'])
def send_catalog_email(request):
    """Envoie un e-mail avec le catalogue/devis via Resend"""
    email_destinataire = request.data.get('email')
    nom_client = request.data.get('nom', 'Client')
    
    if not email_destinataire:
        return Response({'erreur': 'Adresse e-mail manquante'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        # Paramétrage de l'e-mail
        params = {
            # "onboarding@resend.dev" est l'adresse de test obligatoire tant que 
            # tu n'as pas acheté ton propre nom de domaine.
            "from": "CRM Basket <onboarding@resend.dev>", 
            "to": [email_destinataire],
            "subject": "Votre devis / catalogue Équipements Basket",
            "html": f"""
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #ea580c;">Bonjour {nom_client},</h2>
                    <p>Suite à notre échange, vous trouverez ci-joint les informations concernant notre catalogue d'équipements (maillots et ballons).</p>
                    <p>N'hésitez pas à me recontacter pour finaliser votre devis.</p>
                    <br>
                    <p>Sportivement,</p>
                    <p><strong>L'équipe Commerciale</strong></p>
                </div>
            """,
        }
        
        email_response = resend.Emails.send(params)
        return Response({'succes': 'E-mail envoyé avec succès !', 'id': email_response['id']})
        
    except Exception as e:
        return Response({'erreur': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)