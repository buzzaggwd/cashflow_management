from django.db import models
from django.utils import timezone

# Модель для статуса
class Status(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

# Модель для типа
class Type(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

# Модель для категории (привязана к типу)
class Category(models.Model):
    name = models.CharField(max_length=50)
    type = models.ForeignKey(Type, on_delete=models.CASCADE, default=1)  # При удалении типа — удалятся и все категории
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

# Модель для подкатегории (привязана к категории)
class Subcategory(models.Model):
    name = models.CharField(max_length=50)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # Удаление категории — удалит и все подкатегории
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.category.name} / {self.name}"

# Основная модель записи транзакции
class DDSRecord(models.Model):
    date = models.DateField(default=timezone.now)  # По умолчанию — текущая дата
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)
    type = models.ForeignKey(Type, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    subcategory = models.ForeignKey(Subcategory, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Сумма до 99999999.99
    comment = models.TextField(blank=True)

    def __str__(self):
        status_name = self.status.name if self.status else 'Без статуса'
        type_name = self.type.name if self.type else 'Без типа'
        return f"{self.date} - {self.amount} руб. ({type_name}, {status_name})"