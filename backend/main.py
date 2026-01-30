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

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables automatically
models.Base.metadata.create_all(bind=engine)

# --- 2. INITIALIZE THE APP ---
app = FastAPI()

# --- 3. MOUNT STATIC FILES ---
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

# --- PYDANTIC MODELS FOR REQUESTS ---
class MarkSyncRequest(BaseModel):
    student_roll_no: str
    course_code: str
    cia1_marks: float
    cia1_retest: float
    cia2_marks: float
    cia2_retest: float
    subject_attendance: float

class AdminUserCreateRequest(BaseModel):
    id: str
    name: str
    role: str  # 'Student' or 'Faculty'
    password: str
    year: Optional[int] = None
    semester: Optional[int] = None
    designation: Optional[str] = None
    doj: Optional[str] = None

class AdminEnrollmentRequest(BaseModel):
    student_roll_no: str
    course_code: str

# --- AUTHENTICATION ---
@app.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == login_data.username).first()
    if not user or user.password != login_data.password:
         raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": user.id, "token_type": "bearer", "role": user.role, "user_id": user.id}

# --- ADMIN: USER & COURSE MANAGEMENT ---

@app.post("/admin/create-user")
def admin_create_user(data: AdminUserCreateRequest, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        if db.query(models.User).filter(models.User.id == data.id).first():
            raise HTTPException(status_code=400, detail="User ID already exists")

        # 1. Create Login Credential (The Parent record)
        new_user = models.User(id=data.id, role=data.role, password=data.password)
        db.add(new_user)
        
        # Flush sends the user to the DB so the profile can link to the ID
        db.flush() 

        # 2. Create specific Profile (The Child record)
        if data.role == "Student":
            profile = models.Student(
                roll_no=data.id, 
                name=data.name, 
                # Use value from request, explicitly ensuring it's an integer
                year=int(data.year) if data.year is not None else 1, 
                semester=int(data.semester) if data.semester is not None else 1,
                cgpa=0.0,
                attendance_percentage=0.0
            )
            db.add(profile)
        elif data.role == "Faculty":
            profile = models.Faculty(
                staff_no=data.id, 
                name=data.name, 
                designation=data.designation or "Assistant Professor", 
                doj=data.doj or "01.01.2024"
            )
            db.add(profile)
        
        # 3. Final commit saves both entries together
        db.commit()
        return {"message": f"{data.role} created successfully"}
    except Exception as e:
        db.rollback() # Undo changes if any part fails
        logger.error(f"Creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/courses")
def add_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    if db.query(models.Course).filter(models.Course.code == course.code).first():
        raise HTTPException(status_code=400, detail="Course code already exists")
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    return db_course

@app.delete("/admin/courses/{course_code}")
def delete_course(course_code: str, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.code == course_code).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course removed"}

@app.post("/admin/enroll")
def enroll_student(data: AdminEnrollmentRequest, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.roll_no == data.student_roll_no).first()
    course = db.query(models.Course).filter(models.Course.code == data.course_code).first()
    
    if not student or not course:
        raise HTTPException(status_code=404, detail="Student or Course not found")

    # Check for existing enrollment to prevent duplicates
    existing = db.query(models.AcademicData).filter(
        models.AcademicData.student_roll_no == data.student_roll_no,
        models.AcademicData.course_code == data.course_code
    ).first()
    
    if existing:
        return {"message": "Student already enrolled in this course"}

    # Initialize with default values so it appears correctly in dashboards immediately
    enrollment = models.AcademicData(
        student_roll_no=data.student_roll_no, 
        course_code=data.course_code, 
        status="Pursuing",
        cia1_marks=0.0,
        cia1_retest=0.0,
        cia2_marks=0.0,
        cia2_retest=0.0,
        subject_attendance=0.0
    )
    db.add(enrollment)
    db.commit()
    return {"message": "Student enrolled successfully"}

# --- FACULTY: MARKS & ATTENDANCE ---

@app.get("/marks/section")
def get_section_marks(course_code: str, db: Session = Depends(get_db)):
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
    
    return [{
        "name": r.name, "roll_no": r.roll_no, 
        "cia1_marks": r.cia1_marks or 0.0, "cia1_retest": r.cia1_retest or 0.0,
        "cia2_marks": r.cia2_marks or 0.0, "cia2_retest": r.cia2_retest or 0.0,
        "subject_attendance": r.subject_attendance or 0.0
    } for r in results]

@app.post("/marks/sync")
def sync_marks(data: MarkSyncRequest, db: Session = Depends(get_db)):
    record = db.query(models.AcademicData).filter(
        models.AcademicData.student_roll_no == data.student_roll_no,
        models.AcademicData.course_code == data.course_code
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    record.cia1_marks = data.cia1_marks
    record.cia1_retest = data.cia1_retest
    record.cia2_marks = data.cia2_marks
    record.cia2_retest = data.cia2_retest
    record.subject_attendance = data.subject_attendance
    db.commit()
    return {"message": "Sync successful"}

# --- STUDENT: ACADEMIC PORTAL ---
@app.get("/marks/cia")
def get_student_marks(student_id: str, db: Session = Depends(get_db)):
    marks = db.query(models.AcademicData).filter(models.AcademicData.student_roll_no == student_id).all()
    return [{
        "subject": m.course_code, "cia1": m.cia1_marks or 0,
        "cia1_retest": m.cia1_retest or 0, "cia2": m.cia2_marks or 0,
        "cia2_retest": m.cia2_retest or 0, "subject_attendance": m.subject_attendance or 0,
        "total": (m.cia1_marks or 0) + (m.cia2_marks or 0)
    } for m in marks]

# --- MATERIALS & ANNOUNCEMENTS ---

@app.post("/materials")
async def upload_material(course_code: str = Form(...), type: str = Form(...), title: str = Form(...), posted_by: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    db_material = models.Material(course_code=course_code, type=type, title=title, file_link=f"http://localhost:8000/static/{file.filename}", posted_by=posted_by)
    db.add(db_material)
    db.commit()
    return db_material

@app.get("/materials/{course_code}")
def get_course_materials(course_code: str, db: Session = Depends(get_db)):
    return db.query(models.Material).filter(models.Material.course_code == course_code).all()

@app.post("/announcements")
def create_announcement(announcement: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    db_announcement = models.Announcement(**announcement.dict())
    db.add(db_announcement)
    db.commit()
    return db_announcement

@app.get("/announcements")
def get_announcements(type: Optional[str] = None, course_code: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Announcement)
    if type: query = query.filter(models.Announcement.type == type)
    if course_code: query = query.filter((models.Announcement.course_code == course_code) | (models.Announcement.course_code == "Global"))
    return query.order_by(models.Announcement.id.desc()).all()

# --- PROFILES ---

@app.get("/faculty/{staff_no}", response_model=schemas.Faculty)
def get_faculty(staff_no: str, db: Session = Depends(get_db)):
    faculty = db.query(models.Faculty).filter(models.Faculty.staff_no == staff_no).first()
    if not faculty: raise HTTPException(status_code=404, detail="Faculty not found")
    return faculty

@app.get("/student/{roll_no}", response_model=schemas.Student)
def get_student(roll_no: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.roll_no == roll_no).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.get("/courses", response_model=List[schemas.Course])
def get_courses(semester: Optional[int] = None, db: Session = Depends(get_db)):
    if semester: return db.query(models.Course).filter(models.Course.semester == semester).all()
    return db.query(models.Course).all()