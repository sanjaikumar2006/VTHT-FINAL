from pydantic import BaseModel
from typing import Optional, List

# --- AUTH & LOGIN ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str

class LoginData(BaseModel):
    username: str
    password: str

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    id: str
    role: str

class User(UserBase):
    class Config:
        from_attributes = True

# --- FACULTY SCHEMAS ---
class FacultyBase(BaseModel):
    staff_no: str
    name: str
    designation: str
    doj: str
    # --- ADDED TO PERSIST PHOTO ---
    profile_pic: Optional[str] = None 
    # ------------------------------

class Faculty(FacultyBase):
    class Config:
        from_attributes = True

# --- STUDENT SCHEMAS ---
class StudentBase(BaseModel):
    roll_no: str
    name: str
    year: int
    semester: int
    section: str  # Core field for section-based student mapping
    cgpa: float
    attendance_percentage: float
    # --- ADDED TO PERSIST PHOTO ---
    profile_pic: Optional[str] = None 
    # ------------------------------

class Student(StudentBase):
    class Config:
        from_attributes = True

# --- COURSE SCHEMAS ---
class CourseBase(BaseModel):
    code: str
    title: str
    semester: int
    credits: int
    category: Optional[str] = None
    section: str = "A" 
    faculty_id: Optional[str] = None 

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int 
    class Config:
        from_attributes = True

# --- MARKS SYNC SCHEMAS ---
class MarkSyncRequest(BaseModel):
    student_roll_no: str
    course_code: str
    cia1_marks: float
    cia1_retest: float
    cia2_marks: float
    cia2_retest: float
    subject_attendance: float

# --- ANNOUNCEMENT & MATERIAL SCHEMAS ---
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    type: str                        # "Global", "Faculty", "Student", or "Department"
    posted_by: str                   
    course_code: Optional[str] = "Global"
    section: Optional[str] = "All"   # Allows targeting specific sections (A, B, C)

class Announcement(AnnouncementCreate):
    id: int
    class Config:
        from_attributes = True

class MaterialCreate(BaseModel):
    course_id: int
    course_code: str
    type: str                        # "Lecture Notes", "Question Bank", etc.
    title: str
    file_link: str
    posted_by: str                   

class Material(MaterialCreate):
    id: int
    class Config:
        from_attributes = True