import sqlite3

conn = sqlite3.connect('college_app.db')
cursor = conn.cursor()

# Drop the courses table if it exists
cursor.execute('DROP TABLE IF EXISTS courses')
conn.commit()

print('Dropped courses table')

conn.close()