from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from datetime import datetime, date, timedelta
from sqlalchemy import func, extract
from fastapi.responses import StreamingResponse
from io import BytesIO
import pandas as pd
import models
import schemas
import os
import json
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Creeaza tabelele (daca nu exista)
models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:3000", 
]

# Initiaza aplicatia
app = FastAPI(title="CRM Educational API", version="1.0.0")

# --- CONFIGURARE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Functie care ne da acces la baza de date
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def get_google_service(db: Session):
    """Returneaza serviciul Google Calendar sau None daca nu suntem logati."""
    db_token = db.query(models.GoogleToken).first()
    if not db_token:
        return None
    
    creds = Credentials(
        token=db_token.access_token,
        refresh_token=db_token.refresh_token,
        token_uri=db_token.token_uri,
        client_id=db_token.client_id,
        client_secret=db_token.client_secret,
        scopes=json.loads(db_token.scopes)
    )
    return build('calendar', 'v3', credentials=creds)

# ========================== RUTE PARTENERI ==========================

# 1. CREATE Partener
@app.post("/parteneri/", response_model=schemas.Partener)
def create_partener(partener: schemas.PartenerCreate, db: Session = Depends(get_db)):
    db_partener = models.Partener(
        nume=partener.nume,
        tip=partener.tip,
        oras=partener.oras,
        adresa_completa=partener.adresa_completa,
        cui_fiscal=partener.cui_fiscal,
        persoana_contact=partener.persoana_contact,
        telefon=partener.telefon,
        email=partener.email,
        status=partener.status,
        note=partener.note
    )
    db.add(db_partener)
    db.commit()
    db.refresh(db_partener)
    return db_partener

# 2. READ ALL Parteneri
@app.get("/parteneri/", response_model=List[schemas.Partener])
def read_parteneri(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    parteneri = db.query(models.Partener).offset(skip).limit(limit).all()
    return parteneri

# 3. READ ONE Partener
@app.get("/parteneri/{partener_id}", response_model=schemas.Partener)
def read_partener(partener_id: int, db: Session = Depends(get_db)):
    partener = db.query(models.Partener).filter(models.Partener.id == partener_id).first()
    if partener is None:
        raise HTTPException(status_code=404, detail="Partenerul nu a fost gasit")
    return partener

# 4. UPDATE Partener
@app.put("/parteneri/{partener_id}", response_model=schemas.Partener)
def update_partener(partener_id: int, partener_update: schemas.PartenerCreate, db: Session = Depends(get_db)):
    db_partener = db.query(models.Partener).filter(models.Partener.id == partener_id).first()
    if db_partener is None:
        raise HTTPException(status_code=404, detail="Partenerul nu a fost gasit")
    
    # Actualizam campurile
    db_partener.nume = partener_update.nume
    db_partener.tip = partener_update.tip
    db_partener.oras = partener_update.oras
    db_partener.telefon = partener_update.telefon
    db_partener.email = partener_update.email
    # ... poti adauga si restul campurilor daca vrei sa fie editabile

    db.commit()
    db.refresh(db_partener)
    return db_partener

# 5. DELETE Partener
@app.delete("/parteneri/{partener_id}")
def delete_partener(partener_id: int, db: Session = Depends(get_db)):
    partener = db.query(models.Partener).filter(models.Partener.id == partener_id).first()
    if partener is None:
        raise HTTPException(status_code=404, detail="Partenerul nu a fost gasit")
    
    db.delete(partener)
    db.commit()
    return {"message": "Partener sters cu succes"}


# ========================== RUTE LEADURI ==========================

# 1. CREATE Lead
@app.post("/leaduri/", response_model=schemas.Lead)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    if lead.partener_id:
        partener = db.query(models.Partener).filter(models.Partener.id == lead.partener_id).first()
        if not partener:
             raise HTTPException(status_code=404, detail="Partenerul specificat nu exista")

    db_lead = models.Lead(
        nume_contact=lead.nume_contact,
        telefon_contact=lead.telefon_contact,
        email_contact=lead.email_contact,
        status=lead.status,
        sursa_lead=lead.sursa_lead,
        note=lead.note,
        partener_id=lead.partener_id
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

# 2. READ ALL Leaduri
@app.get("/leaduri/", response_model=List[schemas.Lead])
def read_leaduri(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    leaduri = db.query(models.Lead).offset(skip).limit(limit).all()
    return leaduri

# 3. UPDATE Lead
@app.put("/leaduri/{lead_id}", response_model=schemas.Lead)
def update_lead(lead_id: int, lead_update: schemas.LeadCreate, db: Session = Depends(get_db)):
    db_lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if db_lead is None:
        raise HTTPException(status_code=404, detail="Lead-ul nu a fost gasit")
    
    # Actualizam campurile
    db_lead.nume_contact = lead_update.nume_contact
    db_lead.telefon_contact = lead_update.telefon_contact
    db_lead.email_contact = lead_update.email_contact
    db_lead.status = lead_update.status
    db_lead.sursa_lead = lead_update.sursa_lead
    db_lead.note = lead_update.note
    db_lead.partener_id = lead_update.partener_id
    
    db.commit()
    db.refresh(db_lead)
    return db_lead

# 4. DELETE Lead
@app.delete("/leaduri/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    db_lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if db_lead is None:
        raise HTTPException(status_code=404, detail="Lead-ul nu a fost gasit")
    
    db.delete(db_lead)
    db.commit()
    return {"message": "Lead sters cu succes"}


# ========================== RUTE CONTRACTE ==========================

# 1. CREATE Contract
@app.post("/contracte/", response_model=schemas.Contract)
def create_contract(contract: schemas.ContractCreate, db: Session = Depends(get_db)):
    
    # --- MODIFICARE: AM SCOS PARSAREA MANUALA ---
    # Acum "contract.data_semnarii" este deja obiect DATE (multumita lui schemas.py)
    # Nu mai trebuie sa facem datetime.strptime()
    
    db_contract = models.Contract(
        nume_contract=contract.nume_contract,
        valoare=contract.valoare,
        data_semnarii=contract.data_semnarii, # Il folosim direct!
        status=contract.status,
        partener_id=contract.partener_id
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

# 2. READ ALL Contracte
@app.get("/contracte/", response_model=List[schemas.Contract])
def read_contracte(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Contract).offset(skip).limit(limit).all()

# 3. UPDATE Contract
@app.put("/contracte/{contract_id}", response_model=schemas.Contract)
def update_contract(contract_id: int, contract_update: schemas.ContractCreate, db: Session = Depends(get_db)):
    db_contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    if db_contract is None:
        raise HTTPException(status_code=404, detail="Contractul nu a fost gasit")
    
    # Actualizam campurile
    # Pydantic (schemas) se ocupa deja de conversia Datelor, deci atribuim direct
    db_contract.nume_contract = contract_update.nume_contract
    db_contract.valoare = contract_update.valoare
    db_contract.data_semnarii = contract_update.data_semnarii
    db_contract.status = contract_update.status
    db_contract.partener_id = contract_update.partener_id
    
    db.commit()
    db.refresh(db_contract)
    return db_contract

# 3. DELETE Contract
@app.delete("/contracte/{contract_id}")
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    db_contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    if db_contract is None:
        raise HTTPException(status_code=404, detail="Contractul nu a fost gasit")
    
    db.delete(db_contract)
    db.commit()
    return {"message": "Contract sters cu succes"}


# ========================== RUTE HR (PROFESORI) ==========================

# 1. CREATE Profesor
@app.post("/profesori/", response_model=schemas.Profesor)
def create_profesor(profesor: schemas.ProfesorCreate, db: Session = Depends(get_db)):
    db_profesor = models.Profesor(
        nume_complet=profesor.nume_complet,
        email=profesor.email,
        telefon=profesor.telefon,
        tip_contract=profesor.tip_contract,
        tarif_orar_default=profesor.tarif_orar_default,
        is_active=profesor.is_active,
        data_start=profesor.data_start,
        note=profesor.note
    )
    db.add(db_profesor)
    db.commit()
    db.refresh(db_profesor)
    return db_profesor

# 2. READ ALL Profesori
@app.get("/profesori/", response_model=List[schemas.Profesor])
def read_profesori(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Profesor).offset(skip).limit(limit).all()

# 3. UPDATE Profesor
@app.put("/profesori/{profesor_id}", response_model=schemas.Profesor)
def update_profesor(profesor_id: int, profesor_update: schemas.ProfesorCreate, db: Session = Depends(get_db)):
    db_profesor = db.query(models.Profesor).filter(models.Profesor.id == profesor_id).first()
    if db_profesor is None:
        raise HTTPException(status_code=404, detail="Profesorul nu a fost gasit")
    
    db_profesor.nume_complet = profesor_update.nume_complet
    db_profesor.email = profesor_update.email
    db_profesor.telefon = profesor_update.telefon
    db_profesor.tip_contract = profesor_update.tip_contract
    db_profesor.tarif_orar_default = profesor_update.tarif_orar_default
    db_profesor.is_active = profesor_update.is_active
    db_profesor.data_start = profesor_update.data_start
    db_profesor.note = profesor_update.note
    
    db.commit()
    db.refresh(db_profesor)
    return db_profesor

# 4. DELETE Profesor
@app.delete("/profesori/{profesor_id}")
def delete_profesor(profesor_id: int, db: Session = Depends(get_db)):
    db_profesor = db.query(models.Profesor).filter(models.Profesor.id == profesor_id).first()
    if db_profesor is None:
        raise HTTPException(status_code=404, detail="Profesorul nu a fost gasit")
    
    db.delete(db_profesor)
    db.commit()
    return {"message": "Profesor sters cu succes"}

# ========================== RUTE ACADEMIC (CURSURI) ==========================

# 1. CREATE Curs
@app.post("/cursuri/", response_model=schemas.Curs)
def create_curs(curs: schemas.CursCreate, db: Session = Depends(get_db)):
    db_curs = models.Curs(
        nume_curs=curs.nume_curs,
        categorie=curs.categorie,
        nivel_dificultate=curs.nivel_dificultate,
        varsta_min=curs.varsta_min,
        varsta_max=curs.varsta_max,
        programa_link=curs.programa_link,
        descriere=curs.descriere
    )
    db.add(db_curs)
    db.commit()
    db.refresh(db_curs)
    return db_curs

# 2. READ ALL Cursuri
@app.get("/cursuri/", response_model=List[schemas.Curs])
def read_cursuri(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Curs).offset(skip).limit(limit).all()

# 3. UPDATE Curs
@app.put("/cursuri/{curs_id}", response_model=schemas.Curs)
def update_curs(curs_id: int, curs_update: schemas.CursCreate, db: Session = Depends(get_db)):
    db_curs = db.query(models.Curs).filter(models.Curs.id == curs_id).first()
    if db_curs is None:
        raise HTTPException(status_code=404, detail="Cursul nu a fost gasit")
    
    db_curs.nume_curs = curs_update.nume_curs
    db_curs.categorie = curs_update.categorie
    db_curs.nivel_dificultate = curs_update.nivel_dificultate
    db_curs.varsta_min = curs_update.varsta_min
    db_curs.varsta_max = curs_update.varsta_max
    db_curs.programa_link = curs_update.programa_link
    db_curs.descriere = curs_update.descriere
    
    db.commit()
    db.refresh(db_curs)
    return db_curs

# 4. DELETE Curs
@app.delete("/cursuri/{curs_id}")
def delete_curs(curs_id: int, db: Session = Depends(get_db)):
    db_curs = db.query(models.Curs).filter(models.Curs.id == curs_id).first()
    if db_curs is None:
        raise HTTPException(status_code=404, detail="Cursul nu a fost gasit")
    
    db.delete(db_curs)
    db.commit()
    return {"message": "Curs sters cu succes"}


# ========================== RUTE ELEVI ==========================

# 1. CREATE Elev
@app.post("/elevi/", response_model=schemas.Elev)
def create_elev(elev: schemas.ElevCreate, db: Session = Depends(get_db)):
    db_elev = models.Elev(
        nume_complet=elev.nume_complet,
        data_nasterii=elev.data_nasterii,
        scoala_curenta=elev.scoala_curenta,
        nume_parinte=elev.nume_parinte,
        telefon_parinte=elev.telefon_parinte,
        email_parinte=elev.email_parinte,
        gdpr_accepted=elev.gdpr_accepted,
        note=elev.note
    )
    db.add(db_elev)
    db.commit()
    db.refresh(db_elev)
    return db_elev

# 2. READ ALL Elevi
@app.get("/elevi/", response_model=List[schemas.Elev])
def read_elevi(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Elev).offset(skip).limit(limit).all()

# 3. UPDATE Elev
@app.put("/elevi/{elev_id}", response_model=schemas.Elev)
def update_elev(elev_id: int, elev_update: schemas.ElevCreate, db: Session = Depends(get_db)):
    db_elev = db.query(models.Elev).filter(models.Elev.id == elev_id).first()
    if db_elev is None:
        raise HTTPException(status_code=404, detail="Elevul nu a fost gasit")
    
    db_elev.nume_complet = elev_update.nume_complet
    db_elev.data_nasterii = elev_update.data_nasterii
    db_elev.scoala_curenta = elev_update.scoala_curenta
    db_elev.nume_parinte = elev_update.nume_parinte
    db_elev.telefon_parinte = elev_update.telefon_parinte
    db_elev.email_parinte = elev_update.email_parinte
    db_elev.gdpr_accepted = elev_update.gdpr_accepted
    db_elev.note = elev_update.note
    
    db.commit()
    db.refresh(db_elev)
    return db_elev

# 4. DELETE Elev
@app.delete("/elevi/{elev_id}")
def delete_elev(elev_id: int, db: Session = Depends(get_db)):
    db_elev = db.query(models.Elev).filter(models.Elev.id == elev_id).first()
    if db_elev is None:
        raise HTTPException(status_code=404, detail="Elevul nu a fost gasit")
    
    db.delete(db_elev)
    db.commit()
    return {"message": "Elev sters cu succes"}

# ========================== RUTE GRUPE ==========================

# 1. CREATE Grupa
@app.post("/grupe/", response_model=schemas.Grupa)
def create_grupa(grupa: schemas.GrupaCreate, db: Session = Depends(get_db)):
    db_grupa = models.Grupa(
        nume_grupa=grupa.nume_grupa,
        contract_id=grupa.contract_id,
        curs_id=grupa.curs_id,
        profesor_titular_id=grupa.profesor_titular_id,
        max_copii=grupa.max_copii,
        data_inceput=grupa.data_inceput,
        data_sfarsit=grupa.data_sfarsit,
        status_grupa=grupa.status_grupa,
        tip_plata_grupa=grupa.tip_plata_grupa,
        note=grupa.note
    )
    db.add(db_grupa)
    db.commit()
    db.refresh(db_grupa)
    return db_grupa

# 2. READ ALL Grupe
@app.get("/grupe/", response_model=List[schemas.Grupa])
def read_grupe(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Aici folosim .options(joinedload(...)) daca vrem sa aducem si numele profesorului/cursului direct, 
    # dar pentru inceput o lasam simplu si facem match in frontend.
    return db.query(models.Grupa).offset(skip).limit(limit).all()

# 3. UPDATE Grupa
@app.put("/grupe/{grupa_id}", response_model=schemas.Grupa)
def update_grupa(grupa_id: int, grupa_update: schemas.GrupaCreate, db: Session = Depends(get_db)):
    db_grupa = db.query(models.Grupa).filter(models.Grupa.id == grupa_id).first()
    if db_grupa is None:
        raise HTTPException(status_code=404, detail="Grupa nu a fost gasita")
    
    db_grupa.nume_grupa = grupa_update.nume_grupa
    db_grupa.contract_id = grupa_update.contract_id
    db_grupa.curs_id = grupa_update.curs_id
    db_grupa.profesor_titular_id = grupa_update.profesor_titular_id
    db_grupa.max_copii = grupa_update.max_copii
    db_grupa.data_inceput = grupa_update.data_inceput
    db_grupa.data_sfarsit = grupa_update.data_sfarsit
    db_grupa.status_grupa = grupa_update.status_grupa
    db_grupa.tip_plata_grupa = grupa_update.tip_plata_grupa
    db_grupa.note = grupa_update.note
    
    db.commit()
    db.refresh(db_grupa)
    return db_grupa

# 4. DELETE Grupa
@app.delete("/grupe/{grupa_id}")
def delete_grupa(grupa_id: int, db: Session = Depends(get_db)):
    db_grupa = db.query(models.Grupa).filter(models.Grupa.id == grupa_id).first()
    if db_grupa is None:
        raise HTTPException(status_code=404, detail="Grupa nu a fost gasita")
    
    db.delete(db_grupa)
    db.commit()
    return {"message": "Grupa stearsa cu succes"}

# ========================== RUTE SESIUNI ==========================

# 1. CREATE Sesiune
@app.post("/sesiuni/", response_model=schemas.Sesiune)
def create_sesiune(sesiune: schemas.SesiuneCreate, db: Session = Depends(get_db)):
    # 1. Salvare in CRM (Standard)
    db_sesiune = models.Sesiune(**sesiune.dict())
    db.add(db_sesiune)
    db.commit()
    db.refresh(db_sesiune)

    # 2. Sincronizare Automata cu Google Calendar
    try:
        service = get_google_service(db)
        if service:
            # Construim evenimentul pentru Google
            event_body = {
                'summary': f"{db_sesiune.tema_lectiei} (EduCRM)",
                'location': db_sesiune.sala,
                'description': f"Sesiune creata automat din EduCRM.\nStatus: {db_sesiune.status_sesiune}",
                'start': {
                    'dateTime': db_sesiune.data_ora_start.isoformat(),
                    'timeZone': 'Europe/Bucharest', # Sau zona ta
                },
                'end': {
                    'dateTime': db_sesiune.data_ora_end.isoformat(),
                    'timeZone': 'Europe/Bucharest',
                },
            }

            # Trimitem la Google
            event = service.events().insert(calendarId='primary', body=event_body).execute()
            
            # Salvam ID-ul primit de la Google inapoi in CRM
            db_sesiune.google_event_id = event['id']
            db.commit()
            print("✅ Sesiune sincronizata cu Google Calendar!")

    except Exception as e:
        print(f"⚠️ Eroare sync Google: {e}")
        # Nu oprim procesul daca pica Google, doar afisam eroarea in consola

    return db_sesiune

# 2. READ ALL Sesiuni
@app.get("/sesiuni/", response_model=List[schemas.Sesiune])
def read_sesiuni(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Sesiune).offset(skip).limit(limit).all()

# 3. UPDATE Sesiune
@app.put("/sesiuni/{sesiune_id}", response_model=schemas.Sesiune)
def update_sesiune(sesiune_id: int, sesiune_update: schemas.SesiuneCreate, db: Session = Depends(get_db)):
    db_sesiune = db.query(models.Sesiune).filter(models.Sesiune.id == sesiune_id).first()
    if db_sesiune is None:
        raise HTTPException(status_code=404, detail="Sesiunea nu a fost gasita")
    
    # Recalculam durata daca se schimba orele
    durata = sesiune_update.durata_ore
    if not durata and sesiune_update.data_ora_end and sesiune_update.data_ora_start:
        diff = sesiune_update.data_ora_end - sesiune_update.data_ora_start
        durata = diff.total_seconds() / 3600.0

    db_sesiune.grupa_id = sesiune_update.grupa_id
    db_sesiune.profesor_id = sesiune_update.profesor_id
    db_sesiune.data_ora_start = sesiune_update.data_ora_start
    db_sesiune.data_ora_end = sesiune_update.data_ora_end
    db_sesiune.sala = sesiune_update.sala
    db_sesiune.tema_lectiei = sesiune_update.tema_lectiei
    db_sesiune.status_sesiune = sesiune_update.status_sesiune
    db_sesiune.durata_ore = durata
    db_sesiune.note = sesiune_update.note
    
    db.commit()
    db.refresh(db_sesiune)
    return db_sesiune

# 4. DELETE Sesiune
@app.delete("/sesiuni/{sesiune_id}")
def delete_sesiune(sesiune_id: int, db: Session = Depends(get_db)):
    db_sesiune = db.query(models.Sesiune).filter(models.Sesiune.id == sesiune_id).first()
    if not db_sesiune:
        raise HTTPException(status_code=404, detail="Sesiunea nu a fost gasita")

    # 1. Stergem din Google Calendar (daca exista legatura)
    try:
        if db_sesiune.google_event_id:
            service = get_google_service(db)
            if service:
                service.events().delete(calendarId='primary', eventId=db_sesiune.google_event_id).execute()
                print("🗑️ Eveniment sters si din Google Calendar.")
    except Exception as e:
        print(f"⚠️ Eroare stergere Google: {e}")

    # 2. Stergem din CRM
    db.delete(db_sesiune)
    db.commit()
    return {"message": "Sesiune stearsa cu succes"}

# ========================== RUTE FINANCIAR ==========================

# 1. CREATE Factura
@app.post("/facturi/", response_model=schemas.Factura)
def create_factura(factura: schemas.FacturaCreate, db: Session = Depends(get_db)):
    # 1. Cautam sau cream un Client "wrapper" pentru acest nume
    # (Aceasta este o simplificare ca sa mearga Facturarea direct)
    db_client = db.query(models.Client).filter(models.Client.nume_afisare == factura.client_nume).first()
    
    if not db_client:
        db_client = models.Client(
            tip="partener", # default
            nume_afisare=factura.client_nume
        )
        db.add(db_client)
        db.commit()
        db.refresh(db_client)

    # 2. Cream Factura
    db_factura = models.Factura(
        serie_numar=factura.serie_numar,
        client_id=db_client.id,
        luna_id=1, # Default: o sa legam de luni mai tarziu
        data_emitere=factura.data_emitere,
        data_scadenta=factura.data_scadenta,
        total_plata=factura.total_plata,
        moneda=factura.moneda,
        status=factura.status
    )
    db.add(db_factura)
    db.commit()
    db.refresh(db_factura)
    
    # 3. Hack pentru a returna obiectul complet cu nume_client in schema pydantic
    factura_response = schemas.Factura(
        id=db_factura.id,
        serie_numar=db_factura.serie_numar,
        client_nume=db_client.nume_afisare,
        data_emitere=db_factura.data_emitere,
        data_scadenta=db_factura.data_scadenta,
        total_plata=db_factura.total_plata,
        moneda=db_factura.moneda,
        status=db_factura.status,
        created_at=db_factura.created_at
    )
    return factura_response

# 2. READ ALL Facturi
@app.get("/facturi/", response_model=List[schemas.Factura])
def read_facturi(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    facturi_db = db.query(models.Factura).offset(skip).limit(limit).all()
    
    # Mapam manual client_nume pentru lista
    rezultat = []
    for f in facturi_db:
        nume = "Client Necunoscut"
        if f.client_id:
            c = db.query(models.Client).filter(models.Client.id == f.client_id).first()
            if c: nume = c.nume_afisare
            
        rezultat.append(schemas.Factura(
            id=f.id,
            serie_numar=f.serie_numar,
            client_nume=nume,
            data_emitere=f.data_emitere,
            data_scadenta=f.data_scadenta,
            total_plata=f.total_plata,
            moneda=f.moneda,
            status=f.status,
            created_at=f.created_at
        ))
    return rezultat

# 3. UPDATE Factura
@app.put("/facturi/{factura_id}", response_model=schemas.Factura)
def update_factura(factura_id: int, factura_update: schemas.FacturaCreate, db: Session = Depends(get_db)):
    db_factura = db.query(models.Factura).filter(models.Factura.id == factura_id).first()
    if not db_factura:
        raise HTTPException(status_code=404, detail="Factura nu a fost gasita")

    # Update client info (cautam/cream din nou daca s-a schimbat numele)
    db_client = db.query(models.Client).filter(models.Client.nume_afisare == factura_update.client_nume).first()
    if not db_client:
        db_client = models.Client(tip="partener", nume_afisare=factura_update.client_nume)
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
    
    db_factura.client_id = db_client.id
    db_factura.serie_numar = factura_update.serie_numar
    db_factura.data_emitere = factura_update.data_emitere
    db_factura.data_scadenta = factura_update.data_scadenta
    db_factura.total_plata = factura_update.total_plata
    db_factura.status = factura_update.status
    
    db.commit()
    db.refresh(db_factura)
    
    return schemas.Factura(
        id=db_factura.id,
        serie_numar=db_factura.serie_numar,
        client_nume=db_client.nume_afisare,
        data_emitere=db_factura.data_emitere,
        data_scadenta=db_factura.data_scadenta,
        total_plata=db_factura.total_plata,
        moneda=db_factura.moneda,
        status=db_factura.status,
        created_at=db_factura.created_at
    )

# 4. DELETE Factura
@app.delete("/facturi/{factura_id}")
def delete_factura(factura_id: int, db: Session = Depends(get_db)):
    db_factura = db.query(models.Factura).filter(models.Factura.id == factura_id).first()
    if not db_factura:
        raise HTTPException(status_code=404, detail="Factura nu a fost gasita")
    
    db.delete(db_factura)
    db.commit()
    return {"message": "Factura stearsa cu succes"}

# ========================== RUTE INSCRIERI ==========================

# 1. CREATE Inscriere
@app.post("/inscrieri/", response_model=schemas.Inscriere)
def create_inscriere(inscriere: schemas.InscriereCreate, db: Session = Depends(get_db)):
    # Verificam daca elevul e deja in grupa asta
    exists = db.query(models.Inscriere).filter(
        models.Inscriere.grupa_id == inscriere.grupa_id,
        models.Inscriere.elev_id == inscriere.elev_id
    ).first()
    
    if exists:
        raise HTTPException(status_code=400, detail="Elevul este deja inscris in aceasta grupa!")

    db_inscriere = models.Inscriere(
        grupa_id=inscriere.grupa_id,
        elev_id=inscriere.elev_id,
        data_inscriere=inscriere.data_inscriere,
        status_inscriere=inscriere.status_inscriere,
        tip_plata=inscriere.tip_plata,
        reducere_percent=inscriere.reducere_percent,
        note=inscriere.note
    )
    db.add(db_inscriere)
    db.commit()
    db.refresh(db_inscriere)
    return db_inscriere

# 2. READ ALL Inscrieri
@app.get("/inscrieri/", response_model=List[schemas.Inscriere])
def read_inscrieri(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Inscriere).offset(skip).limit(limit).all()

# 3. UPDATE Inscriere (ex: schimbare status in RETRAS)
@app.put("/inscrieri/{inscriere_id}", response_model=schemas.Inscriere)
def update_inscriere(inscriere_id: int, inscriere_update: schemas.InscriereCreate, db: Session = Depends(get_db)):
    db_inscriere = db.query(models.Inscriere).filter(models.Inscriere.id == inscriere_id).first()
    if not db_inscriere:
        raise HTTPException(status_code=404, detail="Inscrierea nu a fost gasita")
    
    db_inscriere.grupa_id = inscriere_update.grupa_id
    db_inscriere.elev_id = inscriere_update.elev_id
    db_inscriere.data_inscriere = inscriere_update.data_inscriere
    db_inscriere.status_inscriere = inscriere_update.status_inscriere
    db_inscriere.tip_plata = inscriere_update.tip_plata
    db_inscriere.reducere_percent = inscriere_update.reducere_percent
    db_inscriere.note = inscriere_update.note
    
    db.commit()
    db.refresh(db_inscriere)
    return db_inscriere

# 4. DELETE Inscriere
@app.delete("/inscrieri/{inscriere_id}")
def delete_inscriere(inscriere_id: int, db: Session = Depends(get_db)):
    db_inscriere = db.query(models.Inscriere).filter(models.Inscriere.id == inscriere_id).first()
    if not db_inscriere:
        raise HTTPException(status_code=404, detail="Inscrierea nu a fost gasita")
    
    db.delete(db_inscriere)
    db.commit()
    return {"message": "Inscriere stearsa cu succes"}

# ========================== RUTE CATALOG ==========================

# 1. GET Catalog pentru o Sesiune (Combina Elevii cu Prezentele existente)
@app.get("/catalog/{sesiune_id}", response_model=List[schemas.CatalogItem])
def get_catalog_sesiune(sesiune_id: int, db: Session = Depends(get_db)):
    # 1. Gasim sesiunea
    sesiune = db.query(models.Sesiune).filter(models.Sesiune.id == sesiune_id).first()
    if not sesiune:
        raise HTTPException(status_code=404, detail="Sesiunea nu exista")
    
    # 2. Gasim toti elevii inscrisi in grupa acelei sesiuni (status ACTIV)
    inscrieri = db.query(models.Inscriere).filter(
        models.Inscriere.grupa_id == sesiune.grupa_id,
        models.Inscriere.status_inscriere == "activ"
    ).all()

    catalog = []
    
    for ins in inscrieri:
        # Cautam elevul
        elev = db.query(models.Elev).filter(models.Elev.id == ins.elev_id).first()
        if not elev: continue

        # Cautam daca exista deja o prezenta marcata pentru aceasta sesiune
        prezenta = db.query(models.Prezenta).filter(
            models.Prezenta.sesiune_id == sesiune_id,
            models.Prezenta.inscriere_id == ins.id
        ).first()

        # Construim obiectul
        item = schemas.CatalogItem(
            elev_id=elev.id,
            nume_elev=elev.nume_complet,
            inscriere_id=ins.id,
            prezenta_id=prezenta.id if prezenta else None,
            is_prezent=prezenta.is_prezent if prezenta else False, # Default Absent
            motiv_absenta=prezenta.motiv_absenta if prezenta else None,
            note=prezenta.note if prezenta else None
        )
        catalog.append(item)
    
    return catalog

# 2. MARK Prezenta (Update sau Create)
@app.post("/catalog/mark", response_model=schemas.Prezenta)
def mark_prezenta(data: schemas.PrezentaCreate, db: Session = Depends(get_db)):
    # Cautam daca exista deja
    db_prezenta = db.query(models.Prezenta).filter(
        models.Prezenta.sesiune_id == data.sesiune_id,
        models.Prezenta.inscriere_id == data.inscriere_id
    ).first()

    if db_prezenta:
        # UPDATE: Actualizam doar campurile care nu sunt None (ca sa nu stergem date accidental)
        if data.is_prezent is not None:
            db_prezenta.is_prezent = data.is_prezent
        
        # Rating (Star Player)
        if data.rating_profesor is not None:
            db_prezenta.rating_profesor = data.rating_profesor
            
        # Note
        if data.note is not None:
            db_prezenta.note = data.note
            
        # Motiv absenta (optional)
        if data.motiv_absenta is not None:
            db_prezenta.motiv_absenta = data.motiv_absenta

    else:
        # CREATE
        db_prezenta = models.Prezenta(
            sesiune_id=data.sesiune_id,
            inscriere_id=data.inscriere_id,
            is_prezent=data.is_prezent if data.is_prezent is not None else False,
            rating_profesor=data.rating_profesor if data.rating_profesor is not None else 0,
            note=data.note,
            motiv_absenta=data.motiv_absenta
        )
        db.add(db_prezenta)
    
    db.commit()
    db.refresh(db_prezenta)
    return db_prezenta


# ========================== RUTE INVENTAR ==========================

# 1. CREATE Produs
@app.post("/produse/", response_model=schemas.Produs)
def create_produs(produs: schemas.ProdusCreate, db: Session = Depends(get_db)):
    db_produs = models.Produs(
        nume_produs=produs.nume_produs,
        cod_sku=produs.cod_sku,
        categorie=produs.categorie,
        unitate_masura=produs.unitate_masura,
        cost_unitar_mediu=produs.cost_unitar_mediu,
        note=produs.note
    )
    db.add(db_produs)
    db.commit()
    db.refresh(db_produs)
    return db_produs

# 2. READ ALL Produse (Cu Calcul de Stoc!)
@app.get("/produse/", response_model=List[schemas.ProdusCuStoc])
def read_produse(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    produse = db.query(models.Produs).offset(skip).limit(limit).all()
    rezultat = []
    
    for p in produse:
        # Calculam stocul live
        miscari = db.query(models.MiscareStoc).filter(models.MiscareStoc.produs_id == p.id).all()
        stoc = 0
        for m in miscari:
            # Daca e INTRARE (achizitie, retur) adunam
            if m.tip in [models.TipMiscareStoc.ACHIZITIE_IN, models.TipMiscareStoc.RETUR_DEFECT]: 
                stoc += m.cantitate
            # Daca e IESIRE (consum, transfer) scadem
            else:
                stoc -= m.cantitate
        
        # Construim obiectul extins
        p_dict = schemas.ProdusCuStoc(
            id=p.id,
            nume_produs=p.nume_produs,
            cod_sku=p.cod_sku,
            categorie=p.categorie,
            unitate_masura=p.unitate_masura,
            cost_unitar_mediu=p.cost_unitar_mediu,
            note=p.note,
            stoc_curent=stoc # <--- Valoarea calculata
        )
        rezultat.append(p_dict)
        
    return rezultat

# 3. CREATE Miscare Stoc (Intrare/Iesire)
@app.post("/inventar/miscare", response_model=schemas.MiscareStoc)
def create_miscare(miscare: schemas.MiscareStocCreate, db: Session = Depends(get_db)):
    db_miscare = models.MiscareStoc(
        produs_id=miscare.produs_id,
        tip=miscare.tip,
        cantitate=miscare.cantitate,
        profesor_id=miscare.profesor_id,
        grupa_id=miscare.grupa_id,
        note=miscare.note
    )
    db.add(db_miscare)
    db.commit()
    db.refresh(db_miscare)
    return db_miscare

# 4. DELETE Produs
@app.delete("/produse/{produs_id}")
def delete_produs(produs_id: int, db: Session = Depends(get_db)):
    db_produs = db.query(models.Produs).filter(models.Produs.id == produs_id).first()
    if not db_produs:
        raise HTTPException(status_code=404, detail="Produsul nu a fost gasit")
    
    # Ar trebui sterse si miscarile asociate, dar SQLAlchemy face asta daca e configurat cascade
    db.delete(db_produs)
    db.commit()
    return {"message": "Produs sters"}

# ... importuri existente

# ========================== RUTA DASHBOARD ==========================

@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = datetime.now().date()
    current_month = today.month
    current_year = today.year

    # 1. Total Elevi Activi (Simplificat: total elevi in baza)
    total_elevi = db.query(models.Elev).count()

    # 2. Venituri Luna Curenta (Suma facturilor emise luna asta)
    # Folosim extract pentru a filtra dupa luna si an
    venituri = db.query(func.sum(models.Factura.total_plata)).filter(
        extract('month', models.Factura.data_emitere) == current_month,
        extract('year', models.Factura.data_emitere) == current_year
    ).scalar() or 0.0

    # 3. Grupe Active
    grupe_active = db.query(models.Grupa).filter(models.Grupa.status_grupa == "activa").count()

    # 4. Sesiunile de AZI (Orar) - Sortate dupa ora
    # Trebuie sa filtram datetime-ul doar dupa data
    sesiuni_azi_db = db.query(models.Sesiune).filter(
        func.date(models.Sesiune.data_ora_start) == today
    ).order_by(models.Sesiune.data_ora_start).all()

    # 5. Lead-uri Noi (Luna asta)
    leaduri_noi = db.query(models.Lead).filter(
        extract('month', models.Lead.created_at) == current_month,
        models.Lead.status == "nou"
    ).count()

    return {
        "total_elevi": total_elevi,
        "venituri_luna": venituri,
        "grupe_active": grupe_active,
        "leaduri_noi": leaduri_noi,
        "sesiuni_azi": sesiuni_azi_db
    }
    
    
# ========================== RUTE SETARI ==========================

# 1. GET Settings (Singleton)
@app.get("/settings/", response_model=schemas.Settings)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        # Daca nu exista, cream unul default
        settings = models.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# 2. UPDATE Settings
@app.put("/settings/", response_model=schemas.Settings)
def update_settings(payload: schemas.SettingsCreate, db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)
    
    # Update manual la campuri
    settings.nume_institutiei = payload.nume_institutiei
    settings.adresa_fizica = payload.adresa_fizica
    settings.email_contact = payload.email_contact
    settings.telefon_contact = payload.telefon_contact
    settings.an_scolar_curent = payload.an_scolar_curent
    
    settings.nume_legala_firma = payload.nume_legala_firma
    settings.cui = payload.cui
    settings.reg_com = payload.reg_com
    settings.banca = payload.banca
    settings.iban = payload.iban
    settings.serie_facturi = payload.serie_facturi
    settings.numar_curent_factura = payload.numar_curent_factura
    settings.moneda_default = payload.moneda_default
    settings.tva_percent = payload.tva_percent

    db.commit()
    db.refresh(settings)
    return settings

# 3. BACKUP DATE (Export JSON simplu)
@app.get("/system/backup")
def download_backup(db: Session = Depends(get_db)):
    # 1. Definim un buffer in memorie (nu salvam fisierul pe disk)
    output = BytesIO()

    # 2. Deschidem un Excel Writer
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        
        # --- FOAIA 1: ELEVI ---
        elevi = db.query(models.Elev).all()
        # Convertim obiectele SQLAlchemy in dictionare curate
        data_elevi = [e.__dict__ for e in elevi]
        if data_elevi:
            df_elevi = pd.DataFrame(data_elevi)
            if "_sa_instance_state" in df_elevi.columns: 
                del df_elevi["_sa_instance_state"] # Stergem metadatele interne SQLAlchemy
            df_elevi.to_excel(writer, sheet_name="Elevi", index=False)

        # --- FOAIA 2: PROFESORI ---
        profesori = db.query(models.Profesor).all()
        data_prof = [p.__dict__ for p in profesori]
        if data_prof:
            df_prof = pd.DataFrame(data_prof)
            if "_sa_instance_state" in df_prof.columns: del df_prof["_sa_instance_state"]
            df_prof.to_excel(writer, sheet_name="Profesori", index=False)

        # --- FOAIA 3: GRUPE ---
        grupe = db.query(models.Grupa).all()
        data_grupe = [g.__dict__ for g in grupe]
        if data_grupe:
            df_grupe = pd.DataFrame(data_grupe)
            if "_sa_instance_state" in df_grupe.columns: del df_grupe["_sa_instance_state"]
            df_grupe.to_excel(writer, sheet_name="Grupe", index=False)

        # --- FOAIA 4: FACTURI ---
        facturi = db.query(models.Factura).all()
        data_facturi = [f.__dict__ for f in facturi]
        if data_facturi:
            df_facturi = pd.DataFrame(data_facturi)
            if "_sa_instance_state" in df_facturi.columns: del df_facturi["_sa_instance_state"]
            df_facturi.to_excel(writer, sheet_name="Facturi", index=False)

        # --- FOAIA 5: INVENTAR ---
        produse = db.query(models.Produs).all()
        data_produse = [p.__dict__ for p in produse]
        if data_produse:
            df_produse = pd.DataFrame(data_produse)
            if "_sa_instance_state" in df_produse.columns: del df_produse["_sa_instance_state"]
            df_produse.to_excel(writer, sheet_name="Inventar", index=False)

    # 3. Pregatim raspunsul
    output.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="Backup_EduCRM_{datetime.now().strftime("%Y%m%d")}.xlsx"'
    }
    
    return StreamingResponse(
        output, 
        headers=headers, 
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    
    
# ========================== GOOGLE CALENDAR INTEGRATION ==========================

# Configurare
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' # Doar pentru development (http)
CLIENT_SECRETS_FILE = "client_secret.json"
SCOPES = ['https://www.googleapis.com/auth/calendar']
REDIRECT_URI = 'http://127.0.0.1:8000/google/callback'

# 1. LOGIN: Genereaza link-ul catre Google
@app.get("/google/login")
def google_login():
    if not os.path.exists(CLIENT_SECRETS_FILE):
        raise HTTPException(status_code=400, detail="Fisierul client_secret.json lipseste!")

    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )
    auth_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')
    return {"url": auth_url}

# 2. CALLBACK: Google ne trimite inapoi aici cu codul
@app.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )
    flow.fetch_token(code=code)
    creds = flow.credentials

    # Salvam in DB
    db_token = db.query(models.GoogleToken).first()
    if not db_token:
        db_token = models.GoogleToken()
        db.add(db_token)
    
    db_token.access_token = creds.token
    db_token.refresh_token = creds.refresh_token
    db_token.token_uri = creds.token_uri
    db_token.client_id = creds.client_id
    db_token.client_secret = creds.client_secret
    db_token.scopes = json.dumps(creds.scopes)
    
    db.commit()
    return {"message": "Google Calendar conectat cu succes! Poti inchide aceasta pagina."}

# 3. SYNC: Citeste evenimentele din Google
@app.get("/google/sync-events")
def sync_google_events(db: Session = Depends(get_db)):
    try:
        # 1. Verificari preliminare
        db_token = db.query(models.GoogleToken).first()
        if not db_token:
            return {"success": False, "message": "Nu ești conectat la Google."}

        # Luam prima grupa si primul profesor din sistem ca "default"
        grupa_default = db.query(models.Grupa).first()
        profesor_default = db.query(models.Profesor).first()

        if not grupa_default:
            return {"success": False, "message": "Nu ai nicio Grupă creată! Creează una întâi (ex: 'Diverse')."}
        
        if not profesor_default:
            return {"success": False, "message": "Nu ai niciun Profesor creat! Creează unul întâi."}

        # 2. Conectare Google
        creds = Credentials(
            token=db_token.access_token,
            refresh_token=db_token.refresh_token,
            token_uri=db_token.token_uri,
            client_id=db_token.client_id,
            client_secret=db_token.client_secret,
            scopes=json.loads(db_token.scopes)
        )
        service = build('calendar', 'v3', credentials=creds)

        # 3. Interval (Azi -> +7 zile)
        now = datetime.utcnow()
        time_min = now.isoformat() + 'Z'
        time_max = (now + timedelta(days=7)).isoformat() + 'Z'

        events_result = service.events().list(
            calendarId='primary', timeMin=time_min, timeMax=time_max,
            singleEvents=True, orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])

        if not events:
            return {"success": True, "message": "Calendarul Google este gol în următoarea săptămână."}

        sesiuni_noi = 0

        # 4. Procesare
        for event in events:
            summary = event.get('summary', 'Fără Titlu')
            # Ignoram evenimentele create tot de noi (cele care au (EduCRM) in titlu)
            if "(EduCRM)" in summary:
                continue

            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            google_id = event['id']

            # Verificam daca exista deja dupa ID-ul Google SAU dupa data+ora (anti-duplicate)
            exists = db.query(models.Sesiune).filter(
                (models.Sesiune.google_event_id == google_id) | 
                ((models.Sesiune.data_ora_start == start) & (models.Sesiune.tema_lectiei == summary))
            ).first()

            if not exists:
                noua_sesiune = models.Sesiune(
                    grupa_id=grupa_default.id,      # Folosim ID-ul real gasit
                    profesor_id=profesor_default.id, # Folosim ID-ul real gasit
                    data_ora_start=start,
                    data_ora_end=end,
                    sala="Google Calendar",
                    tema_lectiei=summary,
                    status_sesiune="planificata",
                    note="Importat din Google",
                    google_event_id=google_id
                )
                db.add(noua_sesiune)
                sesiuni_noi += 1

        db.commit()

        if sesiuni_noi == 0:
            return {"success": True, "message": "Totul este la zi! Nu s-au găsit evenimente noi."}
        else:
            return {"success": True, "message": f"Succes! S-au importat {sesiuni_noi} sesiuni noi."}

    except Exception as e:
        print(f"Eroare Sync: {str(e)}")
        return {"success": False, "message": f"Eroare server: {str(e)}"}
    
# 4. STATUS: Verificam daca suntem conectati
@app.get("/google/status")
def get_google_status(db: Session = Depends(get_db)):
    token = db.query(models.GoogleToken).first()
    return {"is_connected": token is not None}

# 5. DISCONNECT: Stergem tokenul
@app.delete("/google/disconnect")
def disconnect_google(db: Session = Depends(get_db)):
    db.query(models.GoogleToken).delete()
    db.commit()
    return {"message": "Deconectat cu succes."}