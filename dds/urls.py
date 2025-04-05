from django.urls import path
from . import views

urlpatterns = [
    # API
    path('api/statuses/', views.StatusListCreate.as_view(), name='status-list'),
    path('api/types/', views.TypeListCreate.as_view(), name='type-list'),
    path('api/categories/', views.CategoryListCreate.as_view(), name='category-list'),
    path('api/categories-by-type/', views.CategoryByTypeList.as_view(), name='category-by-type'),
    path('api/subcategories/', views.SubcategoryListCreate.as_view(), name='subcategory-list'),
    path('api/transactions/', views.DDSRecordListCreate.as_view(), name='transaction-list'),

    # Frontend
    path('', views.index, name='index'),
    path('create_transaction/', views.create_transaction, name='create-transaction'),
]