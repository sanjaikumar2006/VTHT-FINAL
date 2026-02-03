'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
    Users, GraduationCap, UserCog, ArrowLeft, 
    Search, Trash2, BookOpen, PlusCircle, Bell, Trophy 
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('announcements');
    const [listSubView, setListSubView] = useState<'none' | 'students' | 'faculties'>('none');

    // --- Filter States for Student List ---
    const [filterYear, setFilterYear] = useState('');
    const [filterSem, setFilterSem] = useState('');
    const [filterSec, setFilterSec] = useState('');

    // --- Filter States for Faculty List ---
    const [filterDesignation, setFilterDesignation] = useState('');
    const [filterFacSec, setFilterFacSec] = useState('');

    // --- FIX: Search State ---
    const [searchQuery, setSearchQuery] = useState('');

    // State for Announcements
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [announcementType, setAnnouncementType] = useState('Global');

    // State for User Creation
    const [userData, setUserData] = useState({
        id: '', name: '', role: 'Student', password: '', 
        year: 1, semester: 1, section: 'A', designation: '', doj: ''
    });

    // State for Course Management
    const [courseData, setCourseData] = useState({ 
        code: '', title: '', semester: 1, credits: 3, section: 'A', faculty_id: '' 
    });

    const [labData, setLabData] = useState({ 
        code: '', title: '', semester: 1, credits: 2, section: 'A', faculty_id: '' 
    });

    const [courses, setCourses] = useState([]);
    const [faculties, setFaculties] = useState([]); 
    const [studentsList, setStudentsList] = useState([]); 

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'Admin') {
            router.push('/login');
            return;
        }
        fetchCourses();
        fetchFaculties(); 
    }, [router]);

    // Trigger fetch for Students whenever filters change
    useEffect(() => {
        if (listSubView === 'students') {
            fetchStudents();
        }
    }, [filterYear, filterSem, filterSec, listSubView]);

    // Trigger fetch for Faculties whenever filters change
    useEffect(() => {
        if (listSubView === 'faculties') {
            fetchFaculties();
        }
    }, [filterDesignation, filterFacSec, listSubView]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/courses`);
            setCourses(res.data);
        } catch (err) { console.error("Fetch Courses Error:", err); }
    };

    const fetchFaculties = async () => {
        try {
            const params = new URLSearchParams();
            if (filterDesignation) params.append('designation', filterDesignation);
            const res = await axios.get(`${API_URL}/admin/faculties?${params.toString()}`);
            setFaculties(res.data);
        } catch (err) { console.error("Fetch Faculty Error:", err); }
    };

    const fetchStudents = async () => {
        try {
            const params = new URLSearchParams();
            if (filterYear) params.append('year', filterYear);
            if (filterSem) params.append('semester', filterSem);
            if (filterSec) params.append('section', filterSec);

            const res = await axios.get(`${API_URL}/admin/students?${params.toString()}`);
            setStudentsList(res.data);
        } catch (err) { console.error("Fetch Student Error:", err); }
    };

    // --- FIX: Client-side Search Logic ---
    const filteredResults = (listSubView === 'students' ? studentsList : faculties).filter((user: any) => {
        const query = searchQuery.toLowerCase();
        const nameMatch = user.name?.toLowerCase().includes(query);
        const idMatch = (user.roll_no || user.staff_no)?.toLowerCase().includes(query);
        return nameMatch || idMatch;
    });

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/announcements`, {
                title: announcementTitle, content: announcementContent,
                type: announcementType, posted_by: 'Admin', course_code: 'Global'
            });
            alert("Announcement posted!");
            setAnnouncementTitle(''); setAnnouncementContent('');
        } catch (err) { alert('Failed to post announcement'); }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...userData,
                year: Number(userData.year),
                semester: Number(userData.semester),
                section: userData.role === 'Student' ? userData.section : 'N/A'
            };
            await axios.post(`${API_URL}/admin/create-user`, payload);
            alert(`${userData.role} created successfully!`);
            setUserData({ id: '', name: '', role: 'Student', password: '', year: 1, semester: 1, section: 'A', designation: '', doj: '' });
            fetchFaculties(); fetchStudents();
        } catch (err: any) { alert("Error creating user"); }
    };

    const handleAddSubject = async (e: React.FormEvent, data: any, isLab: boolean) => {
        e.preventDefault();
        try {
            const payload = {
                ...data,
                title: isLab && !data.title.includes('(Lab)') ? `${data.title} (Lab)` : data.title,
                semester: Number(data.semester),
                credits: Number(data.credits)
            };
            await axios.post(`${API_URL}/admin/courses`, payload);
            alert("Subject added!");
            fetchCourses();
        } catch (err: any) { alert("Failed to add subject"); }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm(`Delete subject?`)) return;
        try {
            await axios.delete(`${API_URL}/admin/courses/${id}`);
            fetchCourses();
        } catch (err) { alert('Error deleting course'); }
    };

    // Helper for Tab Clicks to handle routing for 'Topper'
    const onTabClick = (tab: string) => {
        if (tab === 'topper') {
            router.push('/admin/topper');
        } else {
            setActiveTab(tab);
            setListSubView('none');
            setSearchQuery('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <h1 className="text-3xl font-bold mb-8 text-blue-900 tracking-tight flex items-center gap-3">
                    <UserCog size={32} /> Admin Control Panel
                </h1>

                <div className="flex space-x-6 mb-8 border-b overflow-x-auto no-scrollbar">
                    {/* Added 'topper' after labs */}
                    {['announcements', 'create user', 'list student/faculty', 'courses', 'labs', 'topper'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onTabClick(tab)}
                            className={`pb-3 px-2 capitalize transition-all duration-200 whitespace-nowrap font-bold ${
                                activeTab === tab 
                                ? 'border-b-2 border-blue-600 text-blue-600' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    
                    {activeTab === 'announcements' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell className="text-blue-600" /> Publish Announcement</h2>
                            <form onSubmit={handlePostAnnouncement} className="space-y-4 max-w-lg">
                                <select value={announcementType} onChange={(e) => setAnnouncementType(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50">
                                    <option value="Global">Global (All Users)</option>
                                    <option value="Faculty">Faculties Only</option>
                                    <option value="Student">Students Only</option>
                                </select>
                                <input type="text" placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                <textarea placeholder="Message Content..." value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
                                <button type="submit" className="bg-blue-900 text-white px-8 py-2.5 rounded-lg hover:bg-blue-800 transition-colors font-semibold shadow-md">Broadcast</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'list student/faculty' && (
                        <div className="animate-in fade-in duration-300">
                            {listSubView === 'none' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
                                    <div onClick={() => setListSubView('students')} className="group cursor-pointer bg-blue-50 p-10 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all text-center">
                                        <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                            <GraduationCap size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-blue-900 mb-2">Student Database</h3>
                                        <p className="text-gray-600 mb-6">View and manage all enrolled students</p>
                                    </div>

                                    <div onClick={() => setListSubView('faculties')} className="group cursor-pointer bg-purple-50 p-10 rounded-2xl border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition-all text-center">
                                        <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                            <Users size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-purple-900 mb-2">Faculty Registry</h3>
                                        <p className="text-gray-600 mb-6">Manage teaching staff and departments</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <button onClick={() => {setListSubView('none'); setSearchQuery('');}} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors">
                                        <ArrowLeft size={20} /> Back to Selection
                                    </button>

                                    {/* --- Student Filters --- */}
                                    {listSubView === 'students' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border">
                                            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-2 border rounded-lg font-bold text-sm bg-white">
                                                <option value="">All Years</option>
                                                <option value="1">1st Year</option><option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option><option value="4">4th Year</option>
                                            </select>
                                            <select value={filterSem} onChange={(e) => setFilterSem(e.target.value)} className="p-2 border rounded-lg font-bold text-sm bg-white">
                                                <option value="">All Semesters</option>
                                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <select value={filterSec} onChange={(e) => setFilterSec(e.target.value)} className="p-2 border rounded-lg font-bold text-sm bg-white">
                                                <option value="">All Sections</option>
                                                <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* --- Faculty Filters --- */}
                                    {listSubView === 'faculties' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border">
                                            <select value={filterDesignation} onChange={(e) => setFilterDesignation(e.target.value)} className="p-2 border rounded-lg font-bold text-sm bg-white">
                                                <option value="">All Designations</option>
                                                <option value="Professor">Professor</option>
                                                <option value="Associate Professor">Associate Professor</option>
                                                <option value="Assistant Professor">Assistant Professor</option>
                                                <option value="Lecturer">Lecturer</option>
                                                <option value="Lab Instructor">Lab Instructor</option>
                                            </select>
                                            <select value={filterFacSec} onChange={(e) => setFilterFacSec(e.target.value)} className="p-2 border rounded-lg font-bold text-sm bg-white">
                                                <option value="">All Sections</option>
                                                <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                        <h2 className="text-2xl font-black uppercase text-gray-800 tracking-tight">
                                            {listSubView === 'students' ? 'Student List' : 'Faculty List'}
                                        </h2>
                                        <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 border w-full md:w-auto">
                                            <Search size={18} className="text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Search by ID or Name..." 
                                                className="bg-transparent outline-none text-sm w-full md:w-64"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto border rounded-xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                                                <tr>
                                                    <th className="p-4">ID/Roll No</th>
                                                    <th className="p-4">Name</th>
                                                    <th className="p-4">{listSubView === 'students' ? 'Section' : 'Designation'}</th>
                                                    <th className="p-4">{listSubView === 'students' ? 'Semester' : 'Joining Date'}</th>
                                                    {listSubView === 'students' && <th className="p-4">Year</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {filteredResults.map((user: any) => (
                                                    <tr key={user.roll_no || user.staff_no} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 font-mono font-bold text-blue-600">{user.roll_no || user.staff_no}</td>
                                                        <td className="p-4 font-bold text-gray-800">{user.name}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${listSubView === 'students' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                                {user.section || user.designation}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-gray-500 text-sm">{user.semester || user.doj}</td>
                                                        {listSubView === 'students' && <td className="p-4 text-gray-500 text-sm">{user.year}</td>}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'create user' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold mb-8 text-gray-800 flex items-center gap-2"><PlusCircle className="text-blue-600" /> Register New Member</h2>
                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                                <input type="text" placeholder="User ID" value={userData.id} onChange={(e) => setUserData({...userData, id: e.target.value})} className="w-full p-2.5 border rounded-lg" required />
                                <input type="text" placeholder="Full Name" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-2.5 border rounded-lg" required />
                                <select value={userData.role} onChange={(e) => setUserData({...userData, role: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                                <input type="password" placeholder="Initial Password" value={userData.password} onChange={(e) => setUserData({...userData, password: e.target.value})} className="w-full p-2.5 border rounded-lg" required />
                                {userData.role === 'Student' ? (
                                    <>
                                        <input type="number" placeholder="Year" value={userData.year} onChange={(e) => setUserData({...userData, year: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                                        <input type="number" placeholder="Semester" value={userData.semester} onChange={(e) => setUserData({...userData, semester: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                                        <select value={userData.section} onChange={(e) => setUserData({...userData, section: e.target.value})} className="md:col-span-2 w-full p-2.5 border rounded-lg bg-orange-50 font-bold text-orange-700">
                                            <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Designation" value={userData.designation} onChange={(e) => setUserData({...userData, designation: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                                        <input type="text" placeholder="DOJ (DD.MM.YYYY)" value={userData.doj} onChange={(e) => setUserData({...userData, doj: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                                    </>
                                )}
                                <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg md:col-span-2 font-bold shadow-lg hover:bg-blue-700">Complete Registration</button>
                            </form>
                        </div>
                    )}

                    {(activeTab === 'courses' || activeTab === 'labs') && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold mb-6 text-gray-800">Add New {activeTab === 'courses' ? 'Theory Subject' : 'Laboratory'}</h2>
                                <form onSubmit={(e) => handleAddSubject(e, activeTab === 'courses' ? courseData : labData, activeTab === 'labs')} className="space-y-4">
                                    <input type="text" placeholder="Code" value={activeTab === 'courses' ? courseData.code : labData.code} onChange={(e) => activeTab === 'courses' ? setCourseData({...courseData, code: e.target.value}) : setLabData({...labData, code: e.target.value})} className="w-full p-2.5 border rounded-lg" required />
                                    <input type="text" placeholder="Subject Name" value={activeTab === 'courses' ? courseData.title : labData.title} onChange={(e) => activeTab === 'courses' ? setCourseData({...courseData, title: e.target.value}) : setLabData({...labData, title: e.target.value})} className="w-full p-2.5 border rounded-lg" required />
                                    <div className="flex space-x-4">
                                        <input type="number" placeholder="Sem" value={activeTab === 'courses' ? courseData.semester : labData.semester} onChange={(e) => activeTab === 'courses' ? setCourseData({...courseData, semester: Number(e.target.value)}) : setLabData({...labData, semester: Number(e.target.value)})} className="w-1/2 p-2.5 border rounded-lg" />
                                        <input type="number" placeholder="Credits" value={activeTab === 'courses' ? courseData.credits : labData.credits} onChange={(e) => activeTab === 'courses' ? setCourseData({...courseData, credits: Number(e.target.value)}) : setLabData({...labData, credits: Number(e.target.value)})} className="w-1/2 p-2.5 border rounded-lg" />
                                    </div>
                                    <select value={activeTab === 'courses' ? courseData.section : labData.section} onChange={(e) => activeTab === 'courses' ? setCourseData({...courseData, section: e.target.value}) : setLabData({...labData, section: e.target.value})} className="w-full p-2.5 border rounded-lg bg-orange-50 font-bold">
                                        <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                    </select>
                                    <select value={activeTab === 'courses' ? courseData.faculty_id : labData.faculty_id} onChange={(e) => activeTab === 'courses' ? setCourseData({...courseData, faculty_id: e.target.value}) : setLabData({...labData, faculty_id: e.target.value})} className="w-full p-2.5 border rounded-lg bg-gray-50" required>
                                        <option value="">-- Assign Faculty --</option>
                                        {faculties.map((f: any) => <option key={f.staff_no} value={f.staff_no}>{f.name} ({f.staff_no})</option>)}
                                    </select>
                                    <button type="submit" className={`p-2.5 rounded-lg w-full font-bold text-white ${activeTab === 'courses' ? 'bg-green-600' : 'bg-purple-600'}`}>Create Subject</button>
                                </form>
                            </div>
                            <SyllabusList courses={courses.filter((c:any) => activeTab === 'labs' ? c.title.includes('(Lab)') : !c.title.includes('(Lab)'))} onDelete={handleDeleteCourse} title={activeTab === 'courses' ? "Active Syllabus" : "Active Laboratories"} />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

function SyllabusList({ courses, onDelete, title }: any) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-6 text-gray-800">{title}</h2>
            <div className="max-h-[450px] overflow-y-auto border rounded-xl divide-y">
                {courses.length > 0 ? courses.map((c: any) => (
                    <div key={c.id || c.code} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-blue-900">{c.code} - Sec {c.section}</p>
                            <p className="text-sm text-gray-600">{c.title} (Sem {c.semester})</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Faculty: {c.faculty_id}</p>
                        </div>
                        <button onClick={() => onDelete(c.id || c.code)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-colors">Delete</button>
                    </div>
                )) : <p className="p-8 text-center text-gray-400 italic">No records found.</p>}
            </div>
        </div>
    );
}