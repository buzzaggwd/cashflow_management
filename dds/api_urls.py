from django.urls import path
from .views import (
    StatusListCreate, StatusDetail,
    TypeListCreate, TypeDetail,
    CategoryListCreate, CategoryDetail,
    SubcategoryListCreate, SubcategoryDetail,
    DDSRecordListCreate, DDSRecordDetail
)

urlpatterns = [
    # Справочники
    path('statuses/', StatusListCreate.as_view(), name='status-list'),
    path('statuses/<int:pk>/', StatusDetail.as_view(), name='status-detail'),
    
    path('types/', TypeListCreate.as_view(), name='type-list'),
    path('types/<int:pk>/', TypeDetail.as_view(), name='type-detail'),
    
    path('categories/', CategoryListCreate.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),
    
    path('subcategories/', SubcategoryListCreate.as_view(), name='subcategory-list'),
    path('subcategories/<int:pk>/', SubcategoryDetail.as_view(), name='subcategory-detail'),
    
    # Записи ДДС
    path('transactions/', DDSRecordListCreate.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', DDSRecordDetail.as_view(), name='transaction-detail'),
]