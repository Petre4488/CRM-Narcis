from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Aici specificăm unde va sta fișierul bazei de date (crm.db)
SQLALCHEMY_DATABASE_URL = "sqlite:///./crm.db"

# Creăm motorul (Engine) care gestionează conexiunea
# "check_same_thread": False este necesar doar pentru SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Creăm o "fabrică" de sesiuni. De fiecare dată când avem nevoie să vorbim cu DB,
# folosim o instanță din SessionLocal.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base este clasa părinte pentru toate modelele (tabelele) pe care le vom crea ulterior
Base = declarative_base()

# Funcție utilitară pentru a obține o sesiune de bază de date
# O vom folosi mai târziu în API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()