from django.urls import path, include
from rest_framework.routers import DefaultRouter
# On importe bien notre nouvelle vue "send_catalog_email"
from .views import UserViewSet, ClubViewSet, ContactViewSet, LeadViewSet, TaskViewSet, send_catalog_email

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'clubs', ClubViewSet)
router.register(r'contacts', ContactViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Voici la nouvelle adresse pour envoyer l'e-mail
    path('send-email/', send_catalog_email, name='send_email'), 
]