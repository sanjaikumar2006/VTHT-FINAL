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
    # --- FIXED: Added profile_pic here to allow persistence ---
    profile_pic = Column(String, nullable=True) 

    user = relationship("User", back_populates="faculty")
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
    # Persists profile photo link
    profile_pic = Column(String, nullable=True) 

    user = relationship("User", back_populates="student")
    academic_data = relationship("AcademicData", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, index=True) 
    title = Column(String)
    semester = Column(Integer)
    credits = Column(Integer)
    category = Column(String, nullable=True)
    section = Column(String, default="A") 
    faculty_id = Column(String, ForeignKey("faculty.staff_no"), nullable=True) 

    assigned_faculty = relationship("Faculty", back_populates="courses")
    academic_data = relationship("AcademicData", back_populates="course")
    materials = relationship("Material", back_populates="course")

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    type = Column(String) 
    course_code = Column(String, nullable=True) 
    section = Column(String, default="All") 
    posted_by = Column(String) 

class AcademicData(Base):
    __tablename__ = "academic_data"
    id = Column(Integer, primary_key=True, index=True)
    student_roll_no = Column(String, ForeignKey("students.roll_no"))
    course_id = Column(Integer, ForeignKey("courses.id")) 
    course_code = Column(String) 
    # --- FIXED: subject column ensures titles appear on the student UI ---
    subject = Column(String) 
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
    course_id = Column(Integer, ForeignKey("courses.id"))
    course_code = Column(String) 
    type = Column(String) 
    title = Column(String)
    file_link = Column(String)
    posted_by = Column(String) 

    course = relationship("Course", back_populates="materials")