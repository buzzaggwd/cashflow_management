from django.urls import path
from . import views

urlpatterns = [
    # Frontend-страницы
    path('', views.index, name='index'),
    path('create_transaction/', views.create_transaction, name='create-transaction'),
    path('manage_reference/', views.manage_reference, name='manage-reference'),
]