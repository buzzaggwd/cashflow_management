# Generated by Django 5.1.7 on 2025-04-05 06:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dds', '0002_remove_category_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ddsrecord',
            name='date',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='status',
            name='name',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='subcategory',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dds.category'),
        ),
        migrations.AlterField(
            model_name='type',
            name='name',
            field=models.CharField(max_length=50),
        ),
    ]
