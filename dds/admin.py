from django.contrib import admin
from .models import Status, Type, Category, Subcategory, DDSRecord

# Регистрация модели "Статус" в админке
@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    # Показываем эти поля в списке
    list_display = ('name', 'description')

# Регистрация модели "Тип"
@admin.register(Type)
class TypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

# Регистрация модели "Категория"
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'description')

# Регистрация модели "Подкатегория"
@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'description')

# Регистрация модели транзакции (DDSRecord)
@admin.register(DDSRecord)
class DDSRecordAdmin(admin.ModelAdmin):
    list_display = (
        'date', 'amount', 'status', 'type', 
        'category', 'subcategory', 'comment'
    )
    list_filter = ('status', 'type', 'category', 'subcategory')
    search_fields = ('comment',) 
    date_hierarchy = 'date'
    ordering = ('-date',)