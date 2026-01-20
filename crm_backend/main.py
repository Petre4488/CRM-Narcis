from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from datetime import datetime


import models
import schemas

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
    # Calculam automat durata daca nu e data
    durata = sesiune.durata_ore
    if not durata and sesiune.data_ora_end and sesiune.data_ora_start:
        diff = sesiune.data_ora_end - sesiune.data_ora_start
        durata = diff.total_seconds() / 3600.0

    db_sesiune = models.Sesiune(
        grupa_id=sesiune.grupa_id,
        profesor_id=sesiune.profesor_id,
        data_ora_start=sesiune.data_ora_start,
        data_ora_end=sesiune.data_ora_end,
        sala=sesiune.sala,
        tema_lectiei=sesiune.tema_lectiei,
        status_sesiune=sesiune.status_sesiune,
        durata_ore=durata,
        note=sesiune.note
    )
    db.add(db_sesiune)
    db.commit()
    db.refresh(db_sesiune)
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
    if db_sesiune is None:
        raise HTTPException(status_code=404, detail="Sesiunea nu a fost gasita")
    
    db.delete(db_sesiune)
    db.commit()
    return {"message": "Sesiune stersa cu succes"}

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