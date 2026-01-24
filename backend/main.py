import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import logging

from . import models, schemas
from .database import SessionLocal, engine

# --- 1. SETUP STORAGE ---
UPLOAD_DIR = "uploaded_files"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
    print(f"✅ Created physical storage folder: {UPLOAD_DIR} - main.py:18")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables automatically
models.Base.metadata.create_all(bind=engine)

# --- 2. INITIALIZE THE APP ---
app = FastAPI()

# --- 3. MOUNT STATIC FILES ---
# This allows students to access files via http://localhost:8000/static/filename.pdf
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PYDANTIC MODEL FOR MARKS SYNC ---
class MarkSyncRequest(BaseModel):
    student_roll_no: str
    course_code: str
    cia1_marks: float
    cia1_retest: float
    cia2_marks: float
    cia2_retest: float
    subject_attendance: float

# --- AUTHENTICATION ---
@app.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == login_data.username).first()
    if not user or user.password != login_data.password:
         raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": user.id, "token_type": "bearer", "role": user.role, "user_id": user.id}

# --- FACULTY: MARKS & ATTENDANCE MANAGEMENT ---

@app.get("/marks/section")
def get_section_marks(course_code: str, db: Session = Depends(get_db)):
    try:
        results = db.query(
            models.Student.name,
            models.AcademicData.student_roll_no.label("roll_no"),
            models.AcademicData.cia1_marks,
            models.AcademicData.cia1_retest,
            models.AcademicData.cia2_marks,
            models.AcademicData.cia2_retest,
            models.AcademicData.subject_attendance
        ).join(
            models.AcademicData, models.Student.roll_no == models.AcademicData.student_roll_no
        ).filter(models.AcademicData.course_code == course_code).all()
        
        formatted_results = []
        for row in results:
            formatted_results.append({
                "name": row.name,
                "roll_no": row.roll_no,
                "cia1_marks": row.cia1_marks or 0.0,
                "cia1_retest": row.cia1_retest or 0.0,
                "cia2_marks": row.cia2_marks or 0.0,
                "cia2_retest": row.cia2_retest or 0.0,
                "subject_attendance": row.subject_attendance or 0.0
            })
        return formatted_results
    except Exception as e:
        logger.error(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Database processing error")

@app.post("/marks/sync")
def sync_marks(data: MarkSyncRequest, db: Session = Depends(get_db)):
    try:
        record = db.query(models.AcademicData).filter(
            models.AcademicData.student_roll_no == data.student_roll_no,
            models.AcademicData.course_code == data.course_code
        ).first()

        if not record:
            raise HTTPException(status_code=404, detail="Enrollment record not found")

        record.cia1_marks = data.cia1_marks
        record.cia1_retest = data.cia1_retest
        record.cia2_marks = data.cia2_marks
        record.cia2_retest = data.cia2_retest
        record.subject_attendance = data.subject_attendance

        db.commit()
        return {"message": "Sync successful"}
    except Exception as e:
        db.rollback()
        logger.error(f"Sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- STUDENT: ACADEMIC PORTAL ---
@app.get("/marks/cia")
def get_student_marks(student_id: str, db: Session = Depends(get_db)):
    marks = db.query(models.AcademicData).filter(models.AcademicData.student_roll_no == student_id).all()
    return [
        {
            "subject": m.course_code,
            "cia1": m.cia1_marks or 0,
            "cia1_retest": m.cia1_retest or 0,
            "cia2": m.cia2_marks or 0,
            "cia2_retest": m.cia2_retest or 0,
            "subject_attendance": m.subject_attendance or 0,
            "total": (m.cia1_marks or 0) + (m.cia2_marks or 0)
        } for m in marks
    ]

# --- MATERIALS MANAGEMENT (UPLOAD & DELETE) ---

@app.post("/materials")
async def upload_material(
    course_code: str = Form(...),
    type: str = Form(...),
    title: str = Form(...),
    posted_by: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_url = f"http://localhost:8000/static/{file.filename}"

        db_material = models.Material(
            course_code=course_code,
            type=type,
            title=title,
            file_link=file_url,
            posted_by=posted_by
        )
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        return db_material
    except Exception as e:
        db.rollback()
        logger.error(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file")

@app.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    # 1. Find the material entry
    db_material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        # 2. Extract filename from URL and delete physical file
        filename = db_material.file_link.split("/")[-1]
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"🗑️ Deleted physical file: {file_path} - main.py:190")

        # 3. Remove from database
        db.delete(db_material)
        db.commit()
        return {"message": "File and database record deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/materials/{course_code}")
def get_course_materials(course_code: str, db: Session = Depends(get_db)):
    return db.query(models.Material).filter(models.Material.course_code == course_code).all()

# --- ANNOUNCEMENTS ---

@app.post("/announcements")
def create_announcement(announcement: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    try:
        db_announcement = models.Announcement(
            title=announcement.title,
            content=announcement.content,
            type=announcement.type,
            posted_by=announcement.posted_by,
            course_code=announcement.course_code
        )
        db.add(db_announcement)
        db.commit()
        db.refresh(db_announcement)
        return db_announcement
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/announcements")
def get_announcements(type: Optional[str] = None, course_code: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Announcement)
    if type:
        query = query.filter(models.Announcement.type == type)
    if course_code:
        query = query.filter(
            (models.Announcement.course_code == course_code) | 
            (models.Announcement.course_code == "Global")
        )
    return query.order_by(models.Announcement.id.desc()).all()

# --- PROFILES & COURSES ---

@app.get("/faculty/{staff_no}", response_model=schemas.Faculty)
def get_faculty(staff_no: str, db: Session = Depends(get_db)):
    faculty = db.query(models.Faculty).filter(models.Faculty.staff_no == staff_no).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return faculty

@app.get("/student/{roll_no}", response_model=schemas.Student)
def get_student(roll_no: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.get("/courses", response_model=List[schemas.Course])
def get_courses(semester: Optional[int] = None, db: Session = Depends(get_db)):
    if semester:
        return db.query(models.Course).filter(models.Course.semester == semester).all()
    return db.query(models.Course).all()