from app import app, db, Admin
from werkzeug.security import generate_password_hash

with app.app_context():

    admin = Admin.query.filter_by(
        Username="admin"
    ).first()

    if admin:
        admin.Password = generate_password_hash(
            "QuietBattle@123"
        )
    else:
        admin = Admin(
            Username="admin",
            Password=generate_password_hash(
                "QuietBattle@123"
            )
        )
        db.session.add(admin)

    db.session.commit()

    print("Admin credentials reset successfully!")