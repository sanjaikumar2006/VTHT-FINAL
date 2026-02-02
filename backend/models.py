from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True) # Staff_No or Roll_No or 'admin'
    role = Column(String) # Student, Faculty, HOD, Admin
    password = Column(String) 

    faculty = relationship("Faculty", back_populates="user", uselist=False)
    student = relationship("Student", back_populates="user", uselist=False)

class Faculty(Base):
    __tablename__ = "faculty"
    staff_no = Column(String, ForeignKey("users.id"), primary_key=True)
    name = Column(String)
    designation = Column(String)
    doj = Column(String) 

    user = relationship("User", back_populates="faculty")
    # Link to section-specific courses assigned to this faculty
    courses = relationship("Course", back_populates="assigned_faculty")

class Student(Base):
    __tablename__ = "students"
    roll_no = Column(String, ForeignKey("users.id"), primary_key=True)
    name = Column(String)
    year = Column(Integer)
    semester = Column(Integer)
    section = Column(String, default="A") 
    cgpa = Column(Float, default=0.0)
    attendance_percentage = Column(Float, default=0.0) 

    user = relationship("User", back_populates="student")
    academic_data = relationship("AcademicData", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    # UPDATED: id is now the primary key so 'code' can repeat for different sections
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, index=True) 
    title = Column(String)
    semester = Column(Integer)
    credits = Column(Integer)
    category = Column(String, nullable=True)
    
    # NEW: Section assignment for the course itself
    section = Column(String, default="A") 
    
    # Faculty ID assigned to THIS specific section of the course
    faculty_id = Column(String, ForeignKey("faculty.staff_no"), nullable=True) 

    assigned_faculty = relationship("Faculty", back_populates="courses")
    academic_data = relationship("AcademicData", back_populates="course")
    materials = relationship("Material", back_populates="course")

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    type = Column(String) # "Global", "Faculty", or "Student"
    course_code = Column(String, nullable=True) 
    section = Column(String, default="All") 
    posted_by = Column(String) 

class AcademicData(Base):
    """
    Handles CIA marks, Retests, Subject Attendance, and Section mapping.
    Links to Course ID to ensure specific section-faculty assignment.
    """
    __tablename__ = "academic_data"

    id = Column(Integer, primary_key=True, index=True)
    student_roll_no = Column(String, ForeignKey("students.roll_no"))
    
    # UPDATED: Link to Course.id (unique per section/faculty) instead of Course.code
    course_id = Column(Integer, ForeignKey("courses.id")) 
    course_code = Column(String) # Redundant but useful for simple queries
    section = Column(String, default="A") 
    
    cia1_marks = Column(Float, default=0.0)
    cia1_retest = Column(Float, default=0.0) 

    cia2_marks = Column(Float, default=0.0)
    cia2_retest = Column(Float, default=0.0)

    subject_attendance = Column(Float, default=0.0)
    innovative_assignment_marks = Column(Float, default=0.0) 
    status = Column(String, default="Pursuing") 

    student = relationship("Student", back_populates="academic_data")
    course = relationship("Course", back_populates="academic_data")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    # Link to the specific Course ID
    course_id = Column(Integer, ForeignKey("courses.id"))
    course_code = Column(String) 
    type = Column(String) 
    title = Column(String)
    file_link = Column(String)
    posted_by = Column(String) 

    course = relationship("Course", back_populates="materials")