from database import engine, Base
from models import * # Importam toate modelele ca sa fie inregistrate

print("Generare baza de date...")
Base.metadata.create_all(bind=engine)
print("Succes! Fisierul 'crm.db' a fost creat.")