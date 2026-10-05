import bcrypt
from db import get_db_connection

def create_admin():
    print("=== Admin Account Creation ===")
    
    username = input("Enter admin username: ")
    email = input("Enter admin email: ")
    password = input("Enter password: ")

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    try:
  
        db = get_db_connection()
        cursor = db.cursor()
        
        sql = "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, 'admin')"
        val = (username, email, hashed_password)
        
        cursor.execute(sql, val)
        db.commit()
        
        print(f"\n ✅ Admin '{username}' has been successfully added!")

    except Exception as e:
        print(f"\n ❌ An error occurred while adding the admin: {e}")
    finally:
        if 'cursor' in locals() and cursor is not None:
            cursor.close()
        if 'db' in locals() and db.is_connected():
            db.close()

if __name__ == '__main__':
    create_admin()