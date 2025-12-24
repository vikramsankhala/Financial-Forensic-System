"""Add TimescaleDB hypertables for transactions and audit_log.

Revision ID: 001_timescaledb
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision = '001_timescaledb'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Convert transactions and audit_log tables to TimescaleDB hypertables."""
    # Check if TimescaleDB extension is available
    op.execute("""
        CREATE EXTENSION IF NOT EXISTS timescaledb;
    """)
    
    # Check if transactions table exists before converting to hypertable
    connection = op.get_bind()
    result = connection.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'transactions'
        );
    """))
    transactions_exists = result.scalar()
    
    if transactions_exists:
        # Check if it's already a hypertable
        result = connection.execute(text("""
            SELECT EXISTS (
                SELECT FROM timescaledb_information.hypertables 
                WHERE hypertable_name = 'transactions'
            );
        """))
        is_hypertable = result.scalar()
        
        if not is_hypertable:
            op.execute(text("""
                SELECT create_hypertable('transactions', 'timestamp', 
                    if_not_exists => TRUE,
                    chunk_time_interval => INTERVAL '1 day'
                );
            """))
    
    # Check if audit_log table exists before converting to hypertable
    result = connection.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'audit_log'
        );
    """))
    audit_log_exists = result.scalar()
    
    if audit_log_exists:
        # Check if it's already a hypertable
        result = connection.execute(text("""
            SELECT EXISTS (
                SELECT FROM timescaledb_information.hypertables 
                WHERE hypertable_name = 'audit_log'
            );
        """))
        is_hypertable = result.scalar()
        
        if not is_hypertable:
            op.execute(text("""
                SELECT create_hypertable('audit_log', 'created_at',
                    if_not_exists => TRUE,
                    chunk_time_interval => INTERVAL '7 days'
                );
            """))
    
    # Add compression policies only if hypertables were created
    if transactions_exists and not is_hypertable:
        op.execute(text("""
            SELECT add_compression_policy('transactions', INTERVAL '30 days', if_not_exists => TRUE);
        """))
    
    if audit_log_exists:
        result = connection.execute(text("""
            SELECT EXISTS (
                SELECT FROM timescaledb_information.hypertables 
                WHERE hypertable_name = 'audit_log'
            );
        """))
        is_audit_hypertable = result.scalar()
        if not is_audit_hypertable:
            op.execute(text("""
                SELECT add_compression_policy('audit_log', INTERVAL '90 days', if_not_exists => TRUE);
            """))
    
    # Add retention policies (optional - uncomment if you want automatic data deletion)
    # op.execute("""
    #     SELECT add_retention_policy('transactions', INTERVAL '2 years', if_not_exists => TRUE);
    # """)
    # op.execute("""
    #     SELECT add_retention_policy('audit_log', INTERVAL '7 years', if_not_exists => TRUE);
    # """)


def downgrade() -> None:
    """Remove TimescaleDB hypertables (convert back to regular tables)."""
    # Note: Converting hypertables back to regular tables requires data migration
    # This is a simplified downgrade - in production, you'd want to preserve data
    
    # Drop compression policies
    op.execute("""
        SELECT remove_compression_policy('transactions', if_exists => TRUE);
    """)
    op.execute("""
        SELECT remove_compression_policy('audit_log', if_exists => TRUE);
    """)
    
    # Note: Dropping hypertables requires careful handling
    # In practice, you might want to keep the hypertables and just remove compression
    # Uncomment below only if you're sure you want to remove TimescaleDB features
    # op.execute("DROP TABLE IF EXISTS transactions CASCADE;")
    # op.execute("DROP TABLE IF EXISTS audit_log CASCADE;")

