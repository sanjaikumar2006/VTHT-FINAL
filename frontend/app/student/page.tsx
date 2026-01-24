'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import axios from 'axios';

import { API_URL } from '@/config';

import Navbar from '@/components/Navbar';

import Footer from '@/components/Footer';

import { Camera, Beaker, Download, Clock, ChevronRight } from 'lucide-react';



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



                // 2. Fetch Courses

                const coursesRes = await axios.get(`${API_URL}/courses?semester=${studentRes.data.semester}`);

                setCourses(coursesRes.data);



                // 3. Fetch Announcements

                const annRes = await axios.get(`${API_URL}/announcements?type=Department`);

                setAnnouncements(annRes.data);



                // 4. Set Labs (Update these codes to match your database Lab codes)

                setLabs([

                    { code: "CS3402", title: "Data Science Lab", next_session: "Monday 2:00 PM" },

                    { code: "CS3403", title: "Python Programming Lab", next_session: "Wednesday 10:00 AM" }

                ]);



                // 5. Fetch Marks

                try {

                    const ciaRes = await axios.get(`${API_URL}/marks/cia?student_id=${userId}`);

                    setCiaMarks(ciaRes.data);

                } catch (e) { console.log("CIA data pending..."); }



                try {

                    const resRes = await axios.get(`${API_URL}/marks/semester?student_id=${userId}`);

                    setSemResults(resRes.data);

                } catch (e) { console.log("Results data pending..."); }



            } catch (error) {

                console.error("Error fetching data", error);

            }

        };

        fetchData();

    }, [router]);



    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files[0]) {

            setProfilePic(URL.createObjectURL(e.target.files[0]));

        }

    };



    if (!student) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-900">Loading Portal...</div>;



    return (

        <div className="min-h-screen flex flex-col bg-gray-50">

            <Navbar />

            <div className="container mx-auto px-4 py-8 flex-grow">

                <h1 className="text-3xl font-bold mb-8 text-blue-900 tracking-tight">Student Dashboard</h1>



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

                            <p className="text-xs text-gray-500 mt-2">Click to change photo</p>

                        </div>



                        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center text-blue-900 uppercase">Student Details</h2>

                        <div className="space-y-4 text-gray-700 font-medium">

                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-900">Name:</span><span>{student.name}</span></p>

                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-900">Roll No:</span><span>{student.roll_no}</span></p>

                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-900">Year:</span><span>{student.year}</span></p>

                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-900">Sem:</span><span>{student.semester}</span></p>

                            <p className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-900">CGPA:</span><span className="text-green-600 font-bold">{student.cgpa}</span></p>

                            <div className="pt-2">

                                <p className="font-semibold text-gray-900 mb-1 tracking-tight">Overall Attendance:</p>

                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border">

                                    <div className={`h-4 rounded-full transition-all duration-1000 ${student.attendance_percentage < 75 ? 'bg-red-500' : 'bg-green-600'}`} style={{ width: `${student.attendance_percentage}%` }}></div>

                                </div>

                                <p className="text-right text-xs mt-1 font-bold">{student.attendance_percentage}%</p>

                            </div>

                        </div>

                    </div>



                    {/* RIGHT COLUMN: MAIN CONTENT */}

                    <div className="md:col-span-2 space-y-8">

                        {/* 1. ANNOUNCEMENTS */}

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-900">

                            <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2">📢 Department Announcements</h2>

                            {announcements.length > 0 ? (

                                <ul className="space-y-3">

                                    {announcements.map((ann: any) => (

                                        <li key={ann.id} className="bg-blue-50/50 p-3 rounded border flex justify-between items-start">

                                            <div>

                                                <h3 className="font-bold text-blue-900">{ann.title}</h3>

                                                <p className="text-sm text-gray-700 mt-1">{ann.content}</p>

                                            </div>

                                            <div className="text-[10px] text-gray-400 flex items-center gap-1 min-w-fit ml-2 font-bold uppercase tracking-wider">

                                                <Clock size={12} />

                                                <span>Today</span>

                                            </div>

                                        </li>

                                    ))}

                                </ul>

                            ) : <p className="text-gray-500 italic">No new announcements.</p>}

                        </div>



                        {/* 2. TABBED SECTION */}

                        <div className="bg-white p-6 rounded-lg shadow-md min-h-[500px]">

                            <div className="flex border-b mb-6 overflow-x-auto pb-1 no-scrollbar">

                                {[

                                    { id: 'courses', label: 'My Courses' },

                                    { id: 'labs', label: 'Laboratory' },

                                    { id: 'cia', label: 'CIA Marks' },

                                    { id: 'results', label: 'Sem Results' }

                                ].map((tab) => (

                                    <button

                                        key={tab.id}

                                        onClick={() => setActiveTab(tab.id)}

                                        className={`px-6 py-3 font-bold whitespace-nowrap transition border-b-4 uppercase text-xs tracking-widest ${activeTab === tab.id

                                                ? 'text-orange-600 border-orange-500 bg-orange-50/50'

                                                : 'text-gray-400 border-transparent hover:text-blue-900'

                                            }`}

                                    >

                                        {tab.label}

                                    </button>

                                ))}

                            </div>



                            {/* TAB 1: My Courses */}

                            {activeTab === 'courses' && (

                                <div className="animate-in fade-in duration-500 space-y-8">

                                    <h3 className="text-lg font-bold text-blue-900 mb-3 pl-2 border-l-4 border-blue-500 uppercase tracking-tight">Current Semester</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {courses.map((course: any) => (

                                            <div key={course.code} onClick={() => router.push(`/student/course/${course.code}`)} className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-xl transition border-t-4 border-t-blue-500 cursor-pointer transform hover:-translate-y-1 group">

                                                <h4 className="font-bold text-gray-800 flex justify-between items-center text-lg">{course.code} <ChevronRight size={18} className="text-blue-500 group-hover:translate-x-1 transition-transform" /></h4>

                                                <p className="font-semibold text-sm text-gray-500 mt-1">{course.title}</p>

                                                <div className="mt-4 text-[10px] text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full font-bold uppercase tracking-widest">Credits: {course.credits}</div>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            )}



                            {/* TAB 2: Laboratory (UPDATED TO BE CLICKABLE) */}

                            {activeTab === 'labs' && (

                                <div className="animate-in fade-in duration-500">

                                    <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase border-l-4 border-teal-500 pl-3 tracking-tight">Laboratory Courses</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {labs.map((lab: any) => (

                                            <div

                                                key={lab.code}

                                                onClick={() => router.push(`/student/lab/${lab.code}`)}

                                                className="p-5 border rounded-xl shadow-sm hover:shadow-lg transition bg-teal-50/50 border-teal-100 cursor-pointer transform hover:-translate-y-1 group"

                                            >

                                                <div className="flex items-center gap-3 mb-4">

                                                    <div className="bg-teal-100 p-3 rounded-full text-teal-600 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">

                                                        <Beaker size={20} />

                                                    </div>

                                                    <div>

                                                        <h4 className="font-bold text-teal-900 text-lg">{lab.code}</h4>

                                                        <p className="text-xs text-teal-700 font-semibold uppercase">{lab.title}</p>

                                                    </div>

                                                </div>

                                                <div className="border-t border-teal-100 my-4"></div>

                                                <div className="flex justify-between items-center">

                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Next Session: <b className="text-teal-900 tracking-tighter">{lab.next_session}</b></span>

                                                    <span className="text-teal-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">Open Portal <ChevronRight size={14} /></span>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            )}



                            {/* TAB 3: CIA Marks */}

                            {activeTab === 'cia' && (

                                <div className="overflow-x-auto animate-in fade-in duration-500 border rounded-xl">

                                    <table className="w-full text-left border-collapse">

                                        <thead className="bg-blue-900 text-white text-[10px] uppercase tracking-widest font-bold">

                                            <tr>

                                                <th className="p-4 border-b">Subject</th>

                                                <th className="p-4 border-b text-center">CIA 1 (60)</th>

                                                <th className="p-4 border-b text-center bg-blue-800">C1 Retest</th>

                                                <th className="p-4 border-b text-center">CIA 2 (60)</th>

                                                <th className="p-4 border-b text-center bg-blue-800">C2 Retest</th>

                                                <th className="p-4 border-b text-center">Final Total (120)</th>

                                            </tr>

                                        </thead>

                                        <tbody className="text-sm font-medium">

                                            {ciaMarks.map((m: any, i: number) => {

                                                const bestCIA1 = Math.max(Number(m.cia1) || 0, Number(m.cia1_retest) || 0);

                                                const bestCIA2 = Math.max(Number(m.cia2) || 0, Number(m.cia2_retest) || 0);

                                                return (

                                                    <tr key={i} className="hover:bg-blue-50/50 transition border-b">

                                                        <td className="p-4 text-gray-800 font-bold">{m.subject}</td>

                                                        <td className="p-4 text-center text-gray-600">{m.cia1}</td>

                                                        <td className="p-4 text-center text-blue-700 font-black bg-blue-50/50">{m.cia1_retest || 0}</td>

                                                        <td className="p-4 text-center text-gray-600">{m.cia2}</td>

                                                        <td className="p-4 text-center text-blue-700 font-black bg-blue-50/50">{m.cia2_retest || 0}</td>

                                                        <td className="p-4 text-center"><span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black text-lg shadow-sm">{bestCIA1 + bestCIA2}</span></td>

                                                    </tr>

                                                );

                                            })}

                                        </tbody>

                                    </table>

                                </div>

                            )}



                            {/* TAB 4: Sem Results */}

                            {activeTab === 'results' && (

                                <div className="overflow-x-auto animate-in fade-in duration-500 border rounded-xl">

                                    <table className="w-full text-left border-collapse">

                                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b">

                                            <tr>

                                                <th className="p-4">Code</th>

                                                <th className="p-4">Subject</th>

                                                <th className="p-4 text-center">Grade</th>

                                                <th className="p-4 text-center">Result</th>

                                            </tr>

                                        </thead>

                                        <tbody className="text-sm font-medium">

                                            {semResults.length > 0 ? semResults.map((r: any, i) => (

                                                <tr key={i} className="hover:bg-gray-50 transition border-b">

                                                    <td className="p-4 text-gray-500">{r.code}</td>

                                                    <td className="p-4 text-gray-800 font-bold">{r.subject}</td>

                                                    <td className="p-4 text-center font-black text-blue-900">{r.grade}</td>

                                                    <td className="p-4 text-center">

                                                        <span className={`px-4 py-1.5 rounded-full text-white text-[10px] font-black tracking-widest uppercase shadow-sm ${r.status === 'PASS' ? 'bg-green-600' : 'bg-red-500'}`}>

                                                            {r.status}

                                                        </span>

                                                    </td>

                                                </tr>

                                            )) : <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic font-medium">Semester results not declared yet.</td></tr>}

                                        </tbody>

                                    </table>

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

