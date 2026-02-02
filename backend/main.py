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
    year: Optional[int] = 1
    semester: Optional[int] = 1
    section: Optional[str] = "A"
    designation: Optional[str] = None
    doj: Optional[str] = None

class AdminEnrollmentRequest(BaseModel):
    student_roll_no: str
    course_code: str
    section: Optional[str] = "A"

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
        if db.query(models.User).filter(models.User.id == data.id).first():
            raise HTTPException(status_code=400, detail="User ID already exists")

        # 1. Create Login Credential
        new_user = models.User(id=data.id, role=data.role, password=data.password)
        db.add(new_user)
        db.flush() 

        # 2. Create Profile
        if data.role == "Student":
            profile = models.Student(
                roll_no=data.id, 
                name=data.name, 
                year=data.year, 
                semester=data.semester,
                section=data.section,
                cgpa=0.0,
                attendance_percentage=0.0
            )
            db.add(profile)
            db.flush()

            # AUTO-ENROLLMENT: Filter by Semester AND Section
            # This ensures students only get courses assigned to their specific section
            courses = db.query(models.Course).filter(
                models.Course.semester == data.semester,
                models.Course.section == data.section
            ).all()
            
            for course in courses:
                enrollment = models.AcademicData(
                    student_roll_no=data.id, 
                    course_id=course.id, # Link to the specific ID since codes can repeat across sections
                    course_code=course.code, 
                    section=data.section,
                    status="Pursuing",
                    cia1_marks=0.0, cia1_retest=0.0,
                    cia2_marks=0.0, cia2_retest=0.0,
                    subject_attendance=0.0
                )
                db.add(enrollment)

        elif data.role == "Faculty":
            profile = models.Faculty(
                staff_no=data.id, 
                name=data.name, 
                designation=data.designation or "Assistant Professor", 
                doj=data.doj or "01.01.2024"
            )
            db.add(profile)
        
        db.commit()
        return {"message": f"{data.role} created and auto-enrolled in Section {data.section if data.role == 'Student' else 'N/A'}"}
    except Exception as e:
        db.rollback()
        logger.error(f"Creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/courses")
def add_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    # Check if this course code already exists WITHIN this specific section
    existing = db.query(models.Course).filter(
        models.Course.code == course.code,
        models.Course.section == course.section
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Subject {course.code} already exists for Section {course.section}")
    
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    return db_course

@app.delete("/admin/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course removed"}

# --- FACULTY: MARKS & ATTENDANCE ---

@app.get("/faculty/my-courses")
def get_faculty_courses(staff_no: str, db: Session = Depends(get_db)):
    """ Returns courses assigned to faculty, filtered by their staff ID """
    return db.query(models.Course).filter(models.Course.faculty_id == staff_no).all()

@app.get("/marks/section")
def get_section_marks(course_code: str, section: Optional[str] = "A", db: Session = Depends(get_db)):
    """ Returns students for a specific course AND section """
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
    ).filter(
        models.AcademicData.course_code == course_code,
        models.AcademicData.section == section
    ).all()
    
    return results

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
        "total": max(m.cia1_marks or 0, m.cia1_retest or 0) + max(m.cia2_marks or 0, m.cia2_retest or 0)
    } for m in marks]

# --- MATERIALS & ANNOUNCEMENTS ---

@app.post("/materials")
async def upload_material(course_id: int = Form(...), type: str = Form(...), title: str = Form(...), posted_by: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Fetch course info to keep course_code available
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    
    db_material = models.Material(
        course_id=course_id, 
        course_code=course.code,
        type=type, 
        title=title, 
        file_link=f"http://localhost:8000/static/{file.filename}", 
        posted_by=posted_by
    )
    db.add(db_material)
    db.commit()
    return db_material

@app.get("/materials/{course_id}")
def get_course_materials(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.Material).filter(models.Material.course_id == course_id).all()

@app.post("/announcements")
def create_announcement(announcement: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    db_announcement = models.Announcement(
        title=announcement.title,
        content=announcement.content,
        type=announcement.type,
        posted_by=announcement.posted_by,
        course_code=announcement.course_code or "Global",
        section=getattr(announcement, 'section', 'All')
    )
    db.add(db_announcement)
    db.commit()
    return db_announcement

@app.get("/announcements")
def get_announcements(type: Optional[str] = None, section: Optional[str] = None, student_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Announcement)
    
    if student_id:
        student = db.query(models.Student).filter(models.Student.roll_no == student_id).first()
        if student:
            section = student.section

    if type: 
        query = query.filter(models.Announcement.type == type)
    
    if section:
        query = query.filter((models.Announcement.section == section) | (models.Announcement.section == "All"))
    
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
def get_courses(semester: Optional[int] = None, section: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Course)
    if semester:
        query = query.filter(models.Course.semester == semester)
    if section:
        query = query.filter(models.Course.section == section)
    return query.all()

@app.get("/admin/faculties")
def get_all_faculties(db: Session = Depends(get_db)):
    return db.query(models.Faculty).all()