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
    const [announcementType, setAnnouncementType] = useState('Global');

    // State for User Creation
    const [userData, setUserData] = useState({
        id: '', 
        name: '', 
        role: 'Student', 
        password: '', 
        year: 1, 
        semester: 1, 
        section: 'A', 
        designation: '', 
        doj: ''
    });

    // State for Course Management (Theory)
    const [courseData, setCourseData] = useState({ 
        code: '', 
        title: '', 
        semester: 1, 
        credits: 3,
        section: 'A', 
        faculty_id: '' 
    });

    // State for Lab Management
    const [labData, setLabData] = useState({ 
        code: '', 
        title: '', 
        semester: 1, 
        credits: 2,
        section: 'A', 
        faculty_id: '' 
    });

    const [courses, setCourses] = useState([]);
    const [faculties, setFaculties] = useState([]); 

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'Admin') {
            router.push('/login');
        }
        fetchCourses();
        fetchFaculties(); 
    }, [router]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/courses`);
            setCourses(res.data);
        } catch (err) { console.error("Fetch Courses Error:", err); }
    };

    const fetchFaculties = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/faculties`);
            setFaculties(res.data);
        } catch (err) { console.error("Fetch Faculty Error:", err); }
    };

    // --- Handlers ---

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/announcements`, {
                title: announcementTitle,
                content: announcementContent,
                type: announcementType,
                posted_by: 'Admin',
                course_code: 'Global'
            });
            alert(`${announcementType} Announcement posted!`);
            setAnnouncementTitle(''); 
            setAnnouncementContent('');
        } catch (err) { 
            alert('Failed to post announcement'); 
        }
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
            
            setUserData({ 
                id: '', name: '', role: 'Student', password: '', 
                year: 1, semester: 1, section: 'A', designation: '', doj: '' 
            });
            fetchFaculties(); 
        } catch (err: any) { 
            console.error("User Creation Error:", err.response?.data);
            alert(`Error: ${err.response?.data?.detail || 'Failed to create user'}`); 
        }
    };

    // Unified Handler for adding Theory or Lab
    const handleAddSubject = async (e: React.FormEvent, data: any, isLab: boolean) => {
        e.preventDefault();
        
        if(!data.faculty_id) {
            alert("Please assign a faculty member.");
            return;
        }

        try {
            // Construct the payload exactly matching the backend schema
            const payload = {
                code: data.code,
                // Append (Lab) only if it's a lab and not already there
                title: isLab && !data.title.includes('(Lab)') ? `${data.title} (Lab)` : data.title,
                semester: Number(data.semester),
                credits: Number(data.credits),
                section: data.section,
                faculty_id: data.faculty_id
            };
            
            console.log("Sending payload:", payload); // Debug log

            await axios.post(`${API_URL}/admin/courses`, payload);
            alert(`${isLab ? 'Lab' : 'Course'} added for Section ${data.section} successfully!`);
            fetchCourses();
            
            // Reset the form state
            const resetState = { code: '', title: '', semester: 1, credits: isLab ? 2 : 3, section: 'A', faculty_id: '' };
            if(isLab) setLabData(resetState);
            else setCourseData(resetState);

        } catch (err: any) { 
            console.error("Add Subject Error:", err.response?.data);
            alert(`Error: ${err.response?.data?.detail || 'Failed to add subject'}`); 
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm(`Are you sure you want to delete this subject?`)) return;
        try {
            await axios.delete(`${API_URL}/admin/courses/${id}`);
            fetchCourses();
        } catch (err) { 
            alert('Error deleting course'); 
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <h1 className="text-3xl font-bold mb-8 text-blue-900 tracking-tight">Admin Control Panel</h1>

                <div className="flex space-x-6 mb-8 border-b">
                    {['announcements', 'create user', 'courses', 'labs'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-2 capitalize transition-all duration-200 ${
                                activeTab === tab 
                                ? 'border-b-2 border-blue-600 font-bold text-blue-600' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    
                    {/* Tab 1: Announcements */}
                    {activeTab === 'announcements' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Publish Announcement</h2>
                            <form onSubmit={handlePostAnnouncement} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Target Audience</label>
                                    <select 
                                        value={announcementType} 
                                        onChange={(e) => setAnnouncementType(e.target.value)}
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Global">Global (All Users)</option>
                                        <option value="Faculty">Faculties Only</option>
                                        <option value="Student">Students Only</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="Announcement Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                <textarea placeholder="Message Content..." value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
                                <button type="submit" className="bg-blue-900 text-white px-8 py-2.5 rounded-lg hover:bg-blue-800 transition-colors font-semibold shadow-md">Broadcast</button>
                            </form>
                        </div>
                    )}

                    {/* Tab 2: Create User */}
                    {activeTab === 'create user' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-bold mb-2 text-gray-800">Register New Member</h2>
                            <p className="text-sm text-gray-500 mb-8 italic bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                Info: Adding a student automatically creates their academic records for the selected semester and section.
                            </p>
                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">User ID / Roll No</label>
                                    <input type="text" placeholder="e.g. 2024CS01" value={userData.id} onChange={(e) => setUserData({...userData, id: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                    <input type="text" placeholder="e.g. John Doe" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">System Role</label>
                                    <select value={userData.role} onChange={(e) => setUserData({...userData, role: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Initial Password</label>
                                    <input type="password" placeholder="••••••••" value={userData.password} onChange={(e) => setUserData({...userData, password: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                {userData.role === 'Student' ? (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Academic Year</label>
                                            <input type="number" value={userData.year} onChange={(e) => setUserData({...userData, year: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Current Semester</label>
                                            <input type="number" value={userData.semester} onChange={(e) => setUserData({...userData, semester: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Assigned Section</label>
                                            <select value={userData.section} onChange={(e) => setUserData({...userData, section: e.target.value})} className="w-full p-2.5 border rounded-lg bg-orange-50 border-orange-200 outline-none focus:ring-2 focus:ring-orange-500">
                                                <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Designation</label>
                                            <input type="text" placeholder="e.g. Professor" value={userData.designation} onChange={(e) => setUserData({...userData, designation: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">DOJ (DD.MM.YYYY)</label>
                                            <input type="text" placeholder="01.01.2024" value={userData.doj} onChange={(e) => setUserData({...userData, doj: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </>
                                )}
                                <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 md:col-span-2 font-bold shadow-lg transition-all active:scale-95">Complete Registration</button>
                            </form>
                        </div>
                    )}

                    {/* Tab 3: Theory Courses */}
                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Theory Subject</h2>
                                <form onSubmit={(e) => handleAddSubject(e, courseData, false)} className="space-y-4">
                                    <input type="text" placeholder="Code (e.g. CS3401)" value={courseData.code} onChange={(e) => setCourseData({...courseData, code: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                    <input type="text" placeholder="Subject Name" value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                                    <div className="flex space-x-4">
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold text-gray-400">Semester</label>
                                            <input type="number" value={courseData.semester} onChange={(e) => setCourseData({...courseData, semester: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold text-gray-400">Credits</label>
                                            <input type="number" value={courseData.credits} onChange={(e) => setCourseData({...courseData, credits: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Target Section</label>
                                        <select value={courseData.section} onChange={(e) => setCourseData({...courseData, section: e.target.value})} className="w-full p-2.5 border rounded-lg bg-orange-50 border-orange-200 outline-none focus:ring-2 focus:ring-orange-500 font-bold" required>
                                            <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Assign Faculty</label>
                                        <select value={courseData.faculty_id} onChange={(e) => setCourseData({...courseData, faculty_id: e.target.value})} className="w-full p-2.5 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" required>
                                            <option value="">-- Select Faculty --</option>
                                            {faculties.map((f: any) => <option key={f.staff_no} value={f.staff_no}>{f.name} ({f.staff_no})</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="bg-green-600 text-white p-2.5 rounded-lg w-full font-bold hover:bg-green-700 shadow-md">Create Theory Subject</button>
                                </form>
                            </div>
                            <SyllabusList courses={courses.filter((c:any) => !c.title.includes('(Lab)'))} onDelete={handleDeleteCourse} />
                        </div>
                    )}

                    {/* Tab 4: Lab Management */}
                    {activeTab === 'labs' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold mb-6 text-purple-800">Add New Laboratory</h2>
                                <form onSubmit={(e) => handleAddSubject(e, labData, true)} className="space-y-4">
                                    <input type="text" placeholder="Lab Code (e.g. CS3411)" value={labData.code} onChange={(e) => setLabData({...labData, code: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border-purple-100" required />
                                    <input type="text" placeholder="Lab Name" value={labData.title} onChange={(e) => setLabData({...labData, title: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border-purple-100" required />
                                    <div className="flex space-x-4">
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold text-gray-400">Semester</label>
                                            <input type="number" value={labData.semester} onChange={(e) => setLabData({...labData, semester: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold text-gray-400">Credits</label>
                                            <input type="number" value={labData.credits} onChange={(e) => setLabData({...labData, credits: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Target Section</label>
                                        <select value={labData.section} onChange={(e) => setLabData({...labData, section: e.target.value})} className="w-full p-2.5 border rounded-lg bg-purple-50 border-purple-200 outline-none focus:ring-2 focus:ring-purple-500 font-bold" required>
                                            <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Assign Lab In-Charge</label>
                                        <select value={labData.faculty_id} onChange={(e) => setLabData({...labData, faculty_id: e.target.value})} className="w-full p-2.5 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" required>
                                            <option value="">-- Select Lab Faculty --</option>
                                            {faculties.map((f: any) => <option key={f.staff_no} value={f.staff_no}>{f.name} ({f.staff_no})</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="bg-purple-600 text-white p-2.5 rounded-lg w-full font-bold hover:bg-purple-700 shadow-md">Create Laboratory</button>
                                </form>
                            </div>
                            <SyllabusList courses={courses.filter((c:any) => c.title.includes('(Lab)'))} onDelete={handleDeleteCourse} title="Active Laboratories" />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

// Internal Syllabus List Component for better organization
function SyllabusList({ courses, onDelete, title = "Active Syllabus" }: any) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-6 text-gray-800">{title}</h2>
            <div className="max-h-[450px] overflow-y-auto border rounded-xl divide-y">
                {courses.length > 0 ? courses.map((c: any) => (
                    <div key={c.id || c.code} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-blue-900">{c.code} - Sec {c.section}</p>
                            <p className="text-sm text-gray-600">{c.title} (Sem {c.semester})</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Faculty: {c.faculty_id || 'Unassigned'}</p>
                        </div>
                        <button onClick={() => onDelete(c.id || c.code)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-colors">Delete</button>
                    </div>
                )) : (
                    <p className="p-8 text-center text-gray-400 italic">No records found in database.</p>
                )}
            </div>
        </div>
    );
}