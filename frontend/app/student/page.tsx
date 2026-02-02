'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Camera, Beaker, Clock, ChevronRight, Book, Bell } from 'lucide-react';

export default function StudentDashboard() {
    const [student, setStudent] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [labs, setLabs] = useState<any[]>([]);
    const [ciaMarks, setCiaMarks] = useState<any[]>([]);
    const [semResults, setSemResults] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('courses');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('user_id');

        if (!token || role !== 'Student') {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Fetch Profile
                const studentRes = await axios.get(`${API_URL}/student/${userId}`);
                setStudent(studentRes.data);
                setProfilePic(studentRes.data.profile_pic || `https://ui-avatars.com/api/?name=${studentRes.data.name}&background=random`);

                // 2. Fetch Targeted Announcements
                const annRes = await axios.get(`${API_URL}/announcements?student_id=${userId}`);
                setAnnouncements(annRes.data);

                // 3. Fetch CIA Marks
                const ciaRes = await axios.get(`${API_URL}/marks/cia?student_id=${userId}`);
                setCiaMarks(ciaRes.data);
                
                // 4. Derive Theory Course list (Filtering out subjects with "(Lab)")
                const theoryList = ciaRes.data
                    .filter((m: any) => !m.subject.includes('(Lab)'))
                    .map((m: any) => ({ code: m.subject, title: "Course Content", credits: 3 }));
                setCourses(theoryList);

                // 5. Derive Lab list (Filtering for subjects with "(Lab)")
                const labList = ciaRes.data
                    .filter((m: any) => m.subject.includes('(Lab)'))
                    .map((l: any) => ({ code: l.subject, title: "Practical Session", next_session: "Refer Timetable" }));
                setLabs(labList);

            } catch (error) {
                console.error("Error fetching student portal data:", error);
            }
        };
        fetchData();
    }, [router]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePic(URL.createObjectURL(e.target.files[0]));
        }
    };

    if (!student) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-900">Syncing Student Portal...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Student Dashboard</h1>
                    <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-xs border border-orange-200 uppercase">
                            Section {student.section}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: PROFILE */}
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1 h-fit border-t-4 border-orange-500">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group w-32 h-32">
                                <img src={profilePic || ""} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-sm" />
                                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                                    <Camera size={24} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center text-blue-900 uppercase tracking-tighter">Profile Info</h2>
                        <div className="space-y-4 text-gray-700 font-medium text-sm">
                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-400">Name:</span><span>{student.name}</span></p>
                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-400">Roll No:</span><span className="font-mono">{student.roll_no}</span></p>
                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-400">Section:</span><span className="font-bold text-orange-600">{student.section}</span></p>
                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-400">Semester:</span><span>{student.semester}</span></p>
                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-400">CGPA:</span><span className="text-green-600 font-bold">{student.cgpa || '0.0'}</span></p>
                            <div className="pt-2">
                                <p className="font-semibold text-gray-500 mb-1 text-xs uppercase tracking-widest">Attendance</p>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border">
                                    <div className={`h-3 rounded-full transition-all duration-1000 ${student.attendance_percentage < 75 ? 'bg-red-500' : 'bg-green-600'}`} style={{ width: `${student.attendance_percentage}%` }}></div>
                                </div>
                                <p className="text-right text-xs mt-1 font-bold">{student.attendance_percentage}%</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: MAIN CONTENT */}
                    <div className="md:col-span-2 space-y-8">
                        {/* 1. SECTION-SPECIFIC ANNOUNCEMENTS */}
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-900">
                            <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2">
                                <Bell className="text-orange-500" /> Section {student.section} Notifications
                            </h2>
                            {announcements.length > 0 ? (
                                <ul className="space-y-3">
                                    {announcements.map((ann: any) => (
                                        <li key={ann.id} className="bg-blue-50/50 p-4 rounded border-l-2 border-blue-200">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-blue-900 text-sm">{ann.title}</h3>
                                                <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase tracking-tighter">New</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{ann.content}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-400 italic text-sm">No specific notices for your section yet.</p>}
                        </div>

                        {/* 2. TABBED CONTENT */}
                        <div className="bg-white p-6 rounded-lg shadow-md min-h-[500px]">
                            <div className="flex border-b mb-6 overflow-x-auto pb-1 no-scrollbar gap-2">
                                {['courses', 'labs', 'cia', 'results'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-3 font-bold whitespace-nowrap transition border-b-4 uppercase text-[10px] tracking-widest ${activeTab === tab
                                                ? 'text-orange-600 border-orange-500 bg-orange-50/30'
                                                : 'text-gray-400 border-transparent hover:text-blue-900'
                                            }`}
                                    >
                                        {tab === 'cia' ? 'CIA Progress' : tab === 'results' ? 'Sem Results' : tab}
                                    </button>
                                ))}
                            </div>

                            {/* TAB 1: Theory Courses */}
                            {activeTab === 'courses' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    {courses.length > 0 ? courses.map((course: any) => (
                                        <div key={course.code} onClick={() => router.push(`/student/course/${course.code}`)} className="bg-white border border-gray-100 p-5 rounded-xl hover:shadow-lg transition border-t-4 border-t-blue-500 cursor-pointer group">
                                            <h4 className="font-bold text-gray-800 flex justify-between items-center text-md">{course.code} <ChevronRight size={16} className="text-blue-500" /></h4>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">{course.title}</p>
                                            <div className="mt-4 text-[9px] text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded font-bold uppercase tracking-widest">Section Linked</div>
                                        </div>
                                    )) : <p className="text-center py-10 text-gray-400 italic text-sm col-span-2">No theory subjects found.</p>}
                                </div>
                            )}

                            {/* TAB 2: Labs */}
                            {activeTab === 'labs' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    {labs.length > 0 ? labs.map((lab: any) => (
                                        <div key={lab.code} onClick={() => router.push(`/student/lab/${lab.code}`)} className="p-5 border rounded-xl bg-teal-50/30 border-teal-100 cursor-pointer flex justify-between items-center group border-t-4 border-t-teal-500 hover:shadow-lg transition">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-teal-100 p-3 rounded-lg text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                                    <Beaker size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-teal-900 text-sm uppercase">{lab.code.replace(' (Lab)', '')}</h4>
                                                    <p className="text-[10px] text-teal-700 uppercase font-bold tracking-tight">Practical Session</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-teal-400" />
                                        </div>
                                    )) : <p className="text-center py-10 text-gray-400 italic text-sm col-span-2">No practical subjects found.</p>}
                                </div>
                            )}

                            {/* TAB 3: CIA Marks */}
                            {activeTab === 'cia' && (
                                <div className="overflow-x-auto border rounded-xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-blue-900 text-white text-[9px] uppercase tracking-widest">
                                            <tr>
                                                <th className="p-4">Subject</th>
                                                <th className="p-4 text-center">CIA 1</th>
                                                <th className="p-4 text-center bg-blue-800">C1 Retest</th>
                                                <th className="p-4 text-center">CIA 2</th>
                                                <th className="p-4 text-center bg-blue-800">C2 Retest</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {ciaMarks.map((m, i) => (
                                                <tr key={i} className="border-b hover:bg-gray-50">
                                                    <td className="p-4 font-bold text-blue-900">{m.subject}</td>
                                                    <td className="p-4 text-center font-medium">{m.cia1}</td>
                                                    <td className="p-4 text-center font-black text-blue-600 bg-blue-50/50">{m.cia1_retest}</td>
                                                    <td className="p-4 text-center font-medium">{m.cia2}</td>
                                                    <td className="p-4 text-center font-black text-blue-600 bg-blue-50/50">{m.cia2_retest}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* TAB 4: Semester Results */}
                            {activeTab === 'results' && (
                                <div className="text-center py-20 animate-in fade-in">
                                    <Clock className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-400 font-bold italic uppercase text-xs tracking-widest">End Sem results are not yet declared.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}