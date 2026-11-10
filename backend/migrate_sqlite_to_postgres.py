
import os
import sqlite3
from datetime import datetime

import psycopg2
from psycopg2 import sql


# Database locations
SQLITE_PATH = os.path.join(
    os.path.dirname(__file__),
    "instance",
    "quite_battles.db"
)

SUPABASE_URL = os.getenv("SUPABASE_DB_URL")

TABLES = [
    "series",
    "product",
    "chapter",
    "admin",
    "media"
]


def migrate():
    if not SUPABASE_URL:
        raise RuntimeError(
            "SUPABASE_DB_URL environment variable is missing."
        )

    if not os.path.exists(SQLITE_PATH):
        raise FileNotFoundError(SQLITE_PATH)

    print("Connecting to SQLite...")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row

    print("Connecting to Supabase...")
    pg_conn = psycopg2.connect(
        SUPABASE_URL,
        sslmode="require"
    )

    try:
        with pg_conn:
            with pg_conn.cursor() as cursor:

                # Prevent accidental overwriting or duplicate migration
                for table in TABLES:
                    cursor.execute(
                        sql.SQL("SELECT COUNT(*) FROM {}").format(
                            sql.Identifier(table)
                        )
                    )

                    count = cursor.fetchone()[0]

                    if count > 0:
                        raise RuntimeError(
                            f"Supabase table '{table}' already "
                            f"contains {count} records. "
                            "Migration stopped safely."
                        )

                # Copy records in foreign-key-safe order
                for table in TABLES:
                    print(f"Migrating {table}...")

                    rows = sqlite_conn.execute(
                        f'SELECT * FROM "{table}"'
                    ).fetchall()

                    if not rows:
                        continue

                    columns = rows[0].keys()

                    query = sql.SQL(
                        "INSERT INTO {} ({}) VALUES ({})"
                    ).format(
                        sql.Identifier(table),
                        sql.SQL(", ").join(
                            sql.Identifier(col) for col in columns
                        ),
                        sql.SQL(", ").join(
                            sql.Placeholder() for _ in columns
                        )
                    )

                    for row in rows:
                        values = list(row)

                        # Convert SQLite timestamp text to Python datetime
                        if table == "media":
                            created_at_index = list(columns).index(
                                "CreatedAt"
                            )
                            value = values[created_at_index]

                            if isinstance(value, str):
                                values[created_at_index] = (
                                    datetime.fromisoformat(value)
                                )

                        cursor.execute(query, values)

                    print(f"  {len(rows)} records copied.")

                # Reset identity sequences after preserving original IDs
                for table in TABLES:
                    cursor.execute(
                        sql.SQL(
                            """
                            SELECT setval(
                                pg_get_serial_sequence(%s, 'Id'),
                                COALESCE(MAX("Id"), 1),
                                MAX("Id") IS NOT NULL
                            )
                            FROM {}
                            """
                        ).format(sql.Identifier(table)),
                        (f"public.{table}",)
                    )

        print("\nMigration completed successfully!")

    finally:
        sqlite_conn.close()
        pg_conn.close()


if __name__ == "__main__":
    try:
        migrate()
    except Exception as error:
        print("\nMigration failed:")
        print(error)
