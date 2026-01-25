import sqlite3
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db_config import init_db, get_db_connection

print("Initializing database...")
init_db()
print("Database initialized!")

print("\nChecking for chat tables...")
conn = get_db_connection()
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()

print("\nAll tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Check if chat tables exist
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('group_messages', 'direct_messages')")
chat_tables = cursor.fetchall()

if len(chat_tables) == 2:
    print("\n✅ Both chat tables exist!")
else:
    print(f"\n⚠️ Only {len(chat_tables)} chat tables found. Expected 2.")

conn.close()
print("\nDone!")
