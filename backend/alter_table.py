import sqlite3

conn = sqlite3.connect('../college_app.db')
cursor = conn.cursor()

# Check existing columns
cursor.execute('PRAGMA table_info(students)')
columns = [col[1] for col in cursor.fetchall()]
print('Existing columns:', columns)

if 'section' not in columns:
    conn.execute("ALTER TABLE students ADD COLUMN section TEXT DEFAULT 'A'")
    conn.commit()
    print('Added section column')
else:
    print('Section column already exists')

conn.close()