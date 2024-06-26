# Generated by Django 4.2.7 on 2024-03-07 00:18

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Platform',
            fields=[
                ('code', models.CharField(choices=[('na1', 'na1'), ('euw1', 'euw1'), ('br1', 'br1')], primary_key=True, serialize=False)),
            ],
        ),
    ]





from django.db import migrations, models
import django.db.models.deletion
import psqlextra.backend.migrations.operations.add_default_partition
import psqlextra.backend.migrations.operations.create_partitioned_model
import psqlextra.manager.manager
import psqlextra.models.partitioned
import psqlextra.types

from psqlextra.backend.migrations.operations import PostgresAddListPartition


class Migration(migrations.Migration):

    dependencies = [
        ('wrs_api', '0001_initial'),
    ]

    operations = [
        psqlextra.backend.migrations.operations.create_partitioned_model.PostgresCreatePartitionedModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('matchId', models.CharField(max_length=20)),
                ('platform', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='wrs_api.platform')),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
            partitioning_options={
                'method': psqlextra.types.PostgresPartitioningMethod['LIST'],
                'key': ['platform_id'],
            },
            bases=(psqlextra.models.partitioned.PostgresPartitionedModel,),
            managers=[
                ('objects', psqlextra.manager.manager.PostgresManager()),
            ],
        ),
        psqlextra.backend.migrations.operations.add_default_partition.PostgresAddDefaultPartition(
            model_name='Match',
            name='default',
        ),
        PostgresAddListPartition(
           model_name="Match",
           name="na1",
           values=["na1"],
        ),
        PostgresAddListPartition(
           model_name="Match",
           name="euw1",
           values=["euw1"],
        ),
        PostgresAddListPartition(
           model_name="Match",
           name="br1",
           values=["br1"],
        )
    ]


BEGIN
    -- Set all constraints to immediate check, deferred foreign key constraint won't catch exception
    SET CONSTRAINTS ALL IMMEDIATE;

    -- Attempt insertion into wrs_api_banstat
    BEGIN
        INSERT INTO wrs_api_banstat ("championId", "elo", "banned", "season_id", "patch", "platform")
        VALUES (-68, 'Silver 2', 1, 1, '14.12.594.4901', 'na1')
        ON CONFLICT ("platform", "championId", "patch", "elo", "season_id")
        DO UPDATE SET 
        banned = wrs_api_banstat.banned + EXCLUDED.banned;
    EXCEPTION
        WHEN foreign_key_violation THEN
            -- Handle the foreign key violation
            RAISE NOTICE 'Foreign key violation caught: %', SQLERRM;

            -- Write referenced row to wrs_api_champion
       
            INSERT INTO wrs_api_champion ("championId", "name", metadata)
            VALUES (-68, NULL, NULL)
            ON CONFLICT ("championId") DO NOTHING;
            

            -- Retry  insertion into wrs_api_banstat
            INSERT INTO wrs_api_banstat ("championId", "elo", "banned", "season_id", "patch", "platform")
            VALUES (-68, 'Silver 2', 1, 1, '14.12.594.4901', 'na1')
            ON CONFLICT ("platform", "championId", "patch", "elo", "season_id")
            DO UPDATE SET 
            banned = wrs_api_banstat.banned + EXCLUDED.banned;
    END;
END $$;