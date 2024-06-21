# Generated by Django 4.2.7 on 2024-06-17 21:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wrs_api', '0004_alter_gamemode_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='champion',
            name='metadata',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.AlterField(
            model_name='champion',
            name='name',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
