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
    # NEW: Section field to distinguish the same subject for different groups
    section: str = "A" 
    # faculty_id allows the Admin to assign a teacher during course creation
    faculty_id: Optional[str] = None 

class CourseCreate(CourseBase):
    # Inherits all fields including faculty_id and section for POST requests
    pass

class Course(CourseBase):
    # NEW: Include ID because the code is no longer the unique primary key
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
    # UPDATED: Use course_id to link materials to the specific section's course
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