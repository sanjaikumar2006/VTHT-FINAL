'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, BookOpen, Bell, CheckCircle, Download, ArrowLeft, ClipboardList } from 'lucide-react'; 

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = typeof params?.id === 'string' ? decodeURIComponent(params.id) : 'Unknown Course';

    const [activeTab, setActiveTab] = useState('notes');
    const [materials, setMaterials] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [studentProfile, setStudentProfile] = useState<any>(null);
    const [marks, setMarks] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        
        const fetchCourseContent = async () => {
            try {
                // 1. Fetch Student Profile
                const stuRes = await axios.get(`${API_URL}/student/${userId}`);
                setStudentProfile(stuRes.data);

                // 2. Fetch Materials - Filtered for Theory content ONLY
                const matRes = await axios.get(`${API_URL}/materials/${courseId}`);
                // Exclude 'Lab Manual' from this view
                setMaterials(matRes.data.filter((m: any) => m.type !== 'Lab Manual'));

                // 3. Fetch Subject-Specific Announcements (Filtering out Global/Dept notices)
                const annRes = await axios.get(`${API_URL}/announcements?course_code=${courseId}`);
                const theoryNotices = annRes.data.filter((a: any) => a.course_code !== "Global");
                setAnnouncements(theoryNotices);

                // 4. Fetch Attendance for this course
                const marksRes = await axios.get(`${API_URL}/marks/cia?student_id=${userId}`);
                const specificMark = marksRes.data.find((m: any) => m.subject === courseId);
                setMarks(specificMark);

            } catch (error) {
                console.error("Connection failed:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && userId) fetchCourseContent();
    }, [courseId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-900">Loading Course Resources...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            
            <div className="bg-blue-900 text-white py-10 shadow-lg border-b-4 border-orange-500">
                <div className="container mx-auto px-4">
                    <button onClick={() => router.push('/student')} className="flex items-center gap-2 text-sm hover:text-orange-400 mb-3 opacity-80 transition font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-black tracking-tight uppercase">{courseId}</h1>
                    <p className="opacity-80 font-medium tracking-wide uppercase text-xs mt-1">Theory Subject Portal</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[550px] border border-gray-100">
                    
                    {/* TABS SECTION */}
                    <div className="flex overflow-x-auto border-b bg-gray-50/50 sticky top-0 z-10 no-scrollbar">
                        {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'qb', label: 'Question Bank', icon: BookOpen },
                            { id: 'assignments', label: 'Assignments', icon: ClipboardList },
                            { id: 'announcements', label: 'Announcements', icon: Bell },
                            { id: 'attendance', label: 'Attendance', icon: CheckCircle },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-8 py-5 font-bold transition whitespace-nowrap border-b-4 uppercase text-[10px] tracking-widest ${
                                    activeTab === tab.id 
                                    ? 'bg-white text-blue-900 border-b-blue-900 border-t-4 border-t-orange-500 shadow-sm' 
                                    : 'text-gray-400 hover:text-blue-900 hover:bg-white/80'
                                }`}
                            >
                                <tab.icon size={18} className="mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* LECTURE NOTES TAB - REAL DOWNLOADS */}
                        {activeTab === 'notes' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                                    <FileText className="text-blue-900" /> Unit Wise Notes
                                </h2>
                                {materials.filter(m => m.type === 'Lecture Notes').length > 0 ? (
                                    materials.filter(m => m.type === 'Lecture Notes').map((note, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 border-b hover:bg-blue-50/50 transition group rounded-lg">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <p className="font-bold text-gray-800">{note.title}</p>
                                            </div>
                                            {/* REAL LINK ATTACHED HERE */}
                                            <a href={note.file_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-900 text-[10px] font-black border-2 border-blue-900 px-4 py-2 rounded-lg hover:bg-blue-900 hover:text-white transition uppercase tracking-widest">
                                                <Download size={14} /> View PDF
                                            </a>
                                        </div>
                                    ))
                                ) : <p className="text-center py-20 text-gray-400 italic">No notes uploaded by faculty.</p>}
                            </div>
                        )}

                        {/* QUESTION BANK TAB - REAL DOWNLOADS */}
                        {activeTab === 'qb' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                                    <BookOpen className="text-teal-600" /> Exam Question Bank
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {materials.filter(m => m.type === 'Question Bank').length > 0 ? (
                                        materials.filter(m => m.type === 'Question Bank').map((q, i) => (
                                            <div key={i} className="p-5 border rounded-xl hover:shadow-lg flex justify-between items-center bg-gray-50 border-gray-100 transition-all group">
                                                <span className="font-bold text-gray-800 text-sm uppercase tracking-tighter">{q.title}</span>
                                                <a href={q.file_link} target="_blank" rel="noopener noreferrer" className="text-white bg-teal-600 px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-teal-700 shadow-md transition uppercase tracking-widest">
                                                    Download QB
                                                </a>
                                            </div>
                                        ))
                                    ) : <p className="text-center py-20 text-gray-400 italic col-span-2">Question bank files are not yet available.</p>}
                                </div>
                            </div>
                        )}

                        {/* ASSIGNMENTS TAB - REAL DOWNLOADS */}
                        {activeTab === 'assignments' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                                    <ClipboardList className="text-orange-500" /> Pending Assignments
                                </h2>
                                {materials.filter(m => m.type === 'Assignment').length > 0 ? (
                                    materials.filter(m => m.type === 'Assignment').map((assn, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 border-l-8 border-orange-500 bg-white shadow-sm rounded-r-lg mb-4 hover:shadow-md transition border border-gray-100">
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg uppercase tracking-tighter">{assn.title}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Source: Academic Department</p>
                                            </div>
                                            <a href={assn.file_link} target="_blank" rel="noopener noreferrer" className="bg-orange-500 text-white px-5 py-2 rounded-lg text-[10px] font-bold hover:bg-orange-600 uppercase tracking-widest transition shadow-sm">
                                                Get Assignment
                                            </a>
                                        </div>
                                    ))
                                ) : <p className="text-center py-20 text-gray-400 italic">No assignments posted for this course.</p>}
                            </div>
                        )}

                        {/* ANNOUNCEMENT TAB - STRICTLY FILTERED */}
                        {activeTab === 'announcements' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                                    <Bell className="text-yellow-500" /> Subject Notifications
                                </h2>
                                {announcements.length > 0 ? announcements.map((ann, i) => (
                                    <div key={i} className="bg-yellow-50/50 border-l-8 border-yellow-500 p-6 rounded-r-xl mb-4 relative overflow-hidden shadow-sm border border-yellow-100">
                                        <p className="font-bold text-blue-900 text-lg uppercase tracking-tighter">{ann.title}</p>
                                        <p className="text-sm text-gray-700 mt-2 font-medium leading-relaxed">{ann.content}</p>
                                    </div>
                                )) : <p className="text-center py-20 text-gray-400 italic">No recent announcements for this subject.</p>}
                            </div>
                        )}

                        {/* ATTENDANCE TAB */}
                        {activeTab === 'attendance' && (
                            <div className="text-center py-12 animate-in zoom-in duration-300">
                                <h2 className="text-xl font-black mb-10 text-gray-800 uppercase tracking-widest">
                                    Academic Attendance Summary
                                </h2>
                                <div className="relative inline-flex items-center justify-center mb-8">
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle cx="96" cy="96" r="80" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                                        <circle 
                                            cx="96" cy="96" r="80" stroke={(marks?.subject_attendance || 0) < 75 ? '#ef4444' : '#1e3a8a'} 
                                            strokeWidth="12" fill="transparent" 
                                            strokeDasharray={502} 
                                            strokeDashoffset={502 - ((marks?.subject_attendance || 0) / 100) * 502} 
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-5xl font-black text-blue-900">{(marks?.subject_attendance || 0)}%</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Present</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 font-medium italic text-sm">*Subject-wise attendance updated by course faculty.</p>
                                
                                {(marks?.subject_attendance || 0) < 75 && (
                                    <div className="mt-8 p-4 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm inline-block">
                                        ⚠️ Shortage of Attendance Warning ⚠️
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}