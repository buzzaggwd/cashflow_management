from rest_framework import serializers
from .models import Status, Type, Category, Subcategory, DDSRecord

# Сериализатор для статуса
class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

# Сериализатор для типа
class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = '__all__'

# Сериализатор для категории
class CategorySerializer(serializers.ModelSerializer):
    type = TypeSerializer(read_only=True)  # Вложенный объект типа для чтения
    type_id = serializers.PrimaryKeyRelatedField(
        queryset=Type.objects.all(), source='type', write_only=True  # Используется для записи ID типа
    )

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'type', 'type_id']

# Сериализатор для подкатегории
class SubcategorySerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Вложенный объект категории для чтения
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True  # Используется для записи ID категории
    )

    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'description', 'category', 'category_id']

# Сериализатор для транзакции (DDSRecord)
class DDSRecordSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)

    class Meta:
        model = DDSRecord
        fields = [
            'id', 'date', 'amount', 'comment',
            'status', 'type', 'category', 'subcategory',
            'status_name', 'type_name', 'category_name', 'subcategory_name'
        ]