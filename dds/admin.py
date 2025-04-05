from django.contrib import admin
from .models import Status, Type, Category, Subcategory, DDSRecord

@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Type)
class TypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'description')

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