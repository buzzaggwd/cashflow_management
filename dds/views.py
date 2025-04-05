from rest_framework import generics
from .models import Status, Type, Category, Subcategory, DDSRecord
from .serializers import StatusSerializer, TypeSerializer, CategorySerializer, SubcategorySerializer, DDSRecordSerializer
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend

def index(request):
    return render(request, 'dds/index.html')

def create_transaction(request):
    return render(request, 'dds/create_transaction.html')

def manage_reference(request):
    return render(request, 'dds/manage_reference.html')


# Справочники
class StatusListCreate(generics.ListCreateAPIView):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class StatusDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class TypeListCreate(generics.ListCreateAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer

class TypeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer

class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryByTypeList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_fields = ['type']

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SubcategoryListCreate(generics.ListCreateAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer
    filterset_fields = ['category']  # Позволяет фильтровать по category_id
    filter_backends = [DjangoFilterBackend]  # Включает фильтрацию

class SubcategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer

# Записи ДДС
class DDSRecordListCreate(generics.ListCreateAPIView):
    queryset = DDSRecord.objects.all()
    serializer_class = DDSRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'status', 'type', 'category', 'subcategory']

class DDSRecordDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DDSRecord.objects.all()
    serializer_class = DDSRecordSerializer
