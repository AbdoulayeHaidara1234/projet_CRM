from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    """Utilisateurs du CRM (Le personnel du magasin de basket)"""
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('COMMERCIAL', 'Commercial'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='COMMERCIAL')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Club(models.Model):
    """Table pour gérer les structures/entreprises partenaires"""
    nom_club = models.CharField(max_length=255)
    ville = models.CharField(max_length=100)
    code_postal = models.CharField(max_length=20)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom_club


class Contact(models.Model):
    """Fiches clients détaillées liées à un club"""
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    role_club = models.CharField(max_length=100) # Ex: Président, Coach
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='contacts')

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.club.nom_club})"


class Lead(models.Model):
    """Suivi des prospects et opportunités (Devis de ballons, maillots)"""
    STATUT_CHOICES = [
        ('NOUVEAU', 'Nouveau'),
        ('EN_COURS', 'Qualification/Proposition'),
        ('GAGNE', 'Gagné'),
        ('PERDU', 'Perdu'),
    ]
    
    titre = models.CharField(max_length=255)
    montant_estime = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='NOUVEAU')
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, related_name='leads')
    commercial = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titre} - {self.statut}"


class Task(models.Model):
    """Création de tâches (rappels, rendez-vous, appels)"""
    TYPE_CHOICES = [('APPEL', 'Appel'), ('RDV', 'RDV'), ('EMAIL', 'Email')]
    
    titre = models.CharField(max_length=255)
    type_tache = models.CharField(max_length=10, choices=TYPE_CHOICES)
    echeance = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    est_terminee = models.BooleanField(default=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='taches')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.type_tache} - {self.titre}"