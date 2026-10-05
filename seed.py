from .database import SessionLocal
from .models import User
from .auth import hash_password
from .database import settings
from .database import settings

db = SessionLocal()

admin = db.query(User).filter(
    User.email == settings.ADMIN_EMAIL
).first()

if not admin:
    admin = User(
        name="Administrator",
        email=settings.ADMIN_EMAIL,
        password_hash=hash_password(
            settings.ADMIN_PASSWORD
        ),
        is_admin=True
    )

    db.add(admin)
    db.commit()

    print("Admin created")

else:
    print("Admin already exists")

db.close()