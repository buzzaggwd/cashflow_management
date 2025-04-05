from rest_framework import serializers
from .models import Status, Type, Category, Subcategory, DDSRecord

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = '__all__'

class DDSRecordSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='status.name', read_only=True)
    type = serializers.CharField(source='type.name', read_only=True)
    category = serializers.CharField(source='category.name', read_only=True)
    subcategory = serializers.CharField(source='subcategory.name', read_only=True)
    
    class Meta:
        model = DDSRecord
        fields = '__all__'