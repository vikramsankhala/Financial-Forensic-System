"""Enable TimescaleDB hypertables for core tables.

Revision ID: 002_timescaledb_hypertables
Revises: 001_timescaledb
Create Date: 2026-01-23 00:00:00.000000
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "002_timescaledb_hypertables"
down_revision = "001_timescaledb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Drop conflicting constraints and create hypertables."""
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb;")

    # Ensure hypertable time columns are non-null before conversion.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'transactions'
            ) THEN
                UPDATE transactions SET timestamp = NOW() WHERE timestamp IS NULL;
                ALTER TABLE transactions ALTER COLUMN timestamp SET NOT NULL;
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'audit_log'
            ) THEN
                UPDATE audit_log SET created_at = NOW() WHERE created_at IS NULL;
                ALTER TABLE audit_log ALTER COLUMN created_at SET NOT NULL;
            END IF;
        END $$;
        """
    )

    # Drop FK/unique constraints that block hypertable creation.
    op.execute("ALTER TABLE IF EXISTS scores DROP CONSTRAINT IF EXISTS scores_transaction_id_fkey;")
    op.execute("ALTER TABLE IF EXISTS case_transactions DROP CONSTRAINT IF EXISTS case_transactions_transaction_id_fkey;")
    op.execute("ALTER TABLE IF EXISTS transactions DROP CONSTRAINT IF EXISTS transactions_transaction_id_key;")
    op.execute("ALTER TABLE IF EXISTS transactions DROP CONSTRAINT IF EXISTS transactions_pkey;")
    op.execute(
        """
        DO $$
        DECLARE
            idx RECORD;
        BEGIN
            FOR idx IN
                SELECT indexname
                FROM pg_indexes
                WHERE schemaname = 'public'
                  AND tablename = 'transactions'
                  AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
                  AND indexdef NOT ILIKE '%("timestamp")%'
            LOOP
                EXECUTE format('DROP INDEX IF EXISTS %I', idx.indexname);
            END LOOP;
        END $$;
        """
    )
    op.execute("ALTER TABLE IF EXISTS audit_log DROP CONSTRAINT IF EXISTS audit_log_pkey;")

    # Create hypertables only when the tables exist.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'transactions'
            ) THEN
                PERFORM create_hypertable(
                    'transactions',
                    'timestamp',
                    if_not_exists => TRUE,
                    migrate_data => TRUE
                );
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM timescaledb_information.hypertables
                WHERE hypertable_name = 'transactions'
            ) THEN
                CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_transaction_id_timestamp
                    ON transactions (transaction_id, "timestamp");
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'audit_log'
            ) THEN
                PERFORM create_hypertable(
                    'audit_log',
                    'created_at',
                    if_not_exists => TRUE,
                    migrate_data => TRUE
                );
            END IF;
        END $$;
        """
    )

    # Add compression policies when hypertables exist.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM timescaledb_information.hypertables
                WHERE hypertable_name = 'transactions'
            ) THEN
                ALTER TABLE transactions SET (
                    timescaledb.compress,
                    timescaledb.compress_orderby = 'timestamp DESC',
                    timescaledb.compress_segmentby = 'transaction_id'
                );
                PERFORM add_compression_policy(
                    'transactions',
                    INTERVAL '30 days',
                    if_not_exists => TRUE
                );
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM timescaledb_information.hypertables
                WHERE hypertable_name = 'audit_log'
            ) THEN
                ALTER TABLE audit_log SET (
                    timescaledb.compress,
                    timescaledb.compress_orderby = 'created_at DESC',
                    timescaledb.compress_segmentby = 'actor_id'
                );
                PERFORM add_compression_policy(
                    'audit_log',
                    INTERVAL '90 days',
                    if_not_exists => TRUE
                );
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    """Remove compression policies (hypertables remain)."""
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM timescaledb_information.hypertables
                WHERE hypertable_name = 'transactions'
            ) THEN
                PERFORM remove_compression_policy('transactions', if_exists => TRUE);
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM timescaledb_information.hypertables
                WHERE hypertable_name = 'audit_log'
            ) THEN
                PERFORM remove_compression_policy('audit_log', if_exists => TRUE);
            END IF;
        END $$;
        """
    )
