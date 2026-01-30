'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('announcements');

    // State for Announcements
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');

    // State for User Creation
    const [userData, setUserData] = useState({
        id: '', name: '', role: 'Student', password: '', 
        year: 1, semester: 1, designation: '', doj: ''
    });

    // State for Course Management
    const [courseData, setCourseData] = useState({ code: '', title: '', semester: 1, credits: 3 });
    const [courses, setCourses] = useState([]);

    // State for Enrollment
    const [enrollment, setEnrollment] = useState({ student_roll_no: '', course_code: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'Admin') {
            router.push('/login');
        }
        fetchCourses();
    }, [router]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/courses`);
            setCourses(res.data);
        } catch (err) { console.error(err); }
    };

    // --- Handlers ---

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/announcements`, {
                title: announcementTitle,
                content: announcementContent,
                type: 'Global',
                posted_by: 'Admin'
            });
            alert('Global Announcement posted!');
            setAnnouncementTitle(''); setAnnouncementContent('');
        } catch (err) { alert('Failed to post announcement'); }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/create-user`, userData);
            alert(`${userData.role} created successfully!`);
            setUserData({ id: '', name: '', role: 'Student', password: '', year: 1, semester: 1, designation: '', doj: '' });
        } catch (err) { alert('Error creating user'); }
    };

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/courses`, courseData);
            alert('Course added!');
            fetchCourses();
        } catch (err) { alert('Error adding course'); }
    };

    const handleDeleteCourse = async (code: string) => {
        if (!confirm('Are you sure? This will remove all academic data for this course.')) return;
        try {
            await axios.delete(`${API_URL}/admin/courses/${code}`);
            fetchCourses();
        } catch (err) { alert('Error deleting course'); }
    };

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/enroll`, enrollment);
            alert('Student enrolled!');
        } catch (err) { alert('Enrollment failed. Check Roll No and Course Code.'); }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <h1 className="text-3xl font-bold mb-8 text-blue-900">Admin Command Center</h1>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-8 border-b">
                    {['announcements', 'users', 'courses', 'enrollment'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 px-4 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {/* Tab 1: Announcements */}
                    {activeTab === 'announcements' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Post Global Announcement</h2>
                            <form onSubmit={handlePostAnnouncement} className="space-y-4 max-w-lg">
                                <input type="text" placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} className="w-full p-2 border rounded" required />
                                <textarea placeholder="Content" value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} className="w-full p-2 border rounded" rows={4} required />
                                <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Broadcast to All</button>
                            </form>
                        </div>
                    )}

                    {/* Tab 2: User Management */}
                    {activeTab === 'users' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Create New User Profile</h2>
                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                                <input type="text" placeholder="ID (Roll No / Staff No)" value={userData.id} onChange={(e) => setUserData({...userData, id: e.target.value})} className="p-2 border rounded" required />
                                <input type="text" placeholder="Full Name" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="p-2 border rounded" required />
                                <input type="password" placeholder="Password" value={userData.password} onChange={(e) => setUserData({...userData, password: e.target.value})} className="p-2 border rounded" required />
                                <select value={userData.role} onChange={(e) => setUserData({...userData, role: e.target.value})} className="p-2 border rounded">
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                                
                                {userData.role === 'Student' ? (
                                    <>
                                        <input type="number" placeholder="Year" onChange={(e) => setUserData({...userData, year: parseInt(e.target.value)})} className="p-2 border rounded" />
                                        <input type="number" placeholder="Semester" onChange={(e) => setUserData({...userData, semester: parseInt(e.target.value)})} className="p-2 border rounded" />
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Designation" onChange={(e) => setUserData({...userData, designation: e.target.value})} className="p-2 border rounded" />
                                        <input type="text" placeholder="DOJ (DD.MM.YYYY)" onChange={(e) => setUserData({...userData, doj: e.target.value})} className="p-2 border rounded" />
                                    </>
                                )}
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 md:col-span-2">Create User</button>
                            </form>
                        </div>
                    )}

                    {/* Tab 3: Course Management */}
                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-xl font-bold mb-4">Add New Course</h2>
                                <form onSubmit={handleAddCourse} className="space-y-4">
                                    <input type="text" placeholder="Course Code (e.g. CS3401)" onChange={(e) => setCourseData({...courseData, code: e.target.value})} className="w-full p-2 border rounded" required />
                                    <input type="text" placeholder="Course Title" onChange={(e) => setCourseData({...courseData, title: e.target.value})} className="w-full p-2 border rounded" required />
                                    <div className="flex space-x-2">
                                        <input type="number" placeholder="Sem" onChange={(e) => setCourseData({...courseData, semester: parseInt(e.target.value)})} className="w-1/2 p-2 border rounded" />
                                        <input type="number" placeholder="Credits" onChange={(e) => setCourseData({...courseData, credits: parseInt(e.target.value)})} className="w-1/2 p-2 border rounded" />
                                    </div>
                                    <button type="submit" className="bg-green-600 text-white p-2 rounded w-full">Add Course</button>
                                </form>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-4">Active Courses</h2>
                                <div className="max-h-64 overflow-y-auto border rounded p-2">
                                    {courses.map((c: any) => (
                                        <div key={c.code} className="flex justify-between items-center p-2 border-b hover:bg-gray-50">
                                            <span><strong>{c.code}</strong>: {c.title}</span>
                                            <button onClick={() => handleDeleteCourse(c.code)} className="text-red-500 text-sm">Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Enrollment Management */}
                    {activeTab === 'enrollment' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Enroll Student in Course</h2>
                            <p className="text-sm text-gray-500 mb-4 italic">This creates the link between a student and a subject for marks tracking.</p>
                            <form onSubmit={handleEnroll} className="space-y-4 max-w-sm">
                                <input type="text" placeholder="Student Roll No" value={enrollment.student_roll_no} onChange={(e) => setEnrollment({...enrollment, student_roll_no: e.target.value})} className="w-full p-2 border rounded" required />
                                <select 
                                    value={enrollment.course_code} 
                                    onChange={(e) => setEnrollment({...enrollment, course_code: e.target.value})} 
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {courses.map((c: any) => <option key={c.code} value={c.code}>{c.code} - {c.title}</option>)}
                                </select>
                                <button type="submit" className="bg-purple-600 text-white p-2 rounded w-full">Finalize Enrollment</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}