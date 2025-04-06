from rest_framework import generics, viewsets
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from .models import Status, Type, Category, Subcategory, DDSRecord
from .serializers import (
    StatusSerializer, TypeSerializer, CategorySerializer,
    SubcategorySerializer, DDSRecordSerializer
)

# ---------- HTML-шаблоны ----------

def index(request):
    return render(request, 'dds/index.html')

def create_transaction(request):
    return render(request, 'dds/create_transaction.html')

def admin_reference_data(request):
    return render(request, 'dds/admin_reference_data.html')


# ---------- API для справочников ----------

# Статусы
class StatusListCreate(generics.ListCreateAPIView):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class StatusDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

# Типы
class TypeListCreate(generics.ListCreateAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer

class TypeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer

# Категории
class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# Категории по типу (для фильтрации)
class CategoryByTypeList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_fields = ['type']

# Подкатегории
class SubcategoryListCreate(generics.ListCreateAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer
    filterset_fields = ['category']
    filter_backends = [DjangoFilterBackend]

class SubcategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer


# ---------- API для записей ДДС ----------

class DDSRecordListCreate(generics.ListCreateAPIView):
    queryset = DDSRecord.objects.all()
    serializer_class = DDSRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'status', 'type', 'category', 'subcategory']

class DDSRecordDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DDSRecord.objects.all()
    serializer_class = DDSRecordSerializer