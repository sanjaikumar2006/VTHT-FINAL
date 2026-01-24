'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Book, Megaphone, CheckCircle, ArrowLeft, Download, Clock, FileText } from 'lucide-react';

export default function LabDetails() {
    const params = useParams();
    const router = useRouter();
    const labId = params.id;

    const [manuals, setManuals] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [attendance, setAttendance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabData = async () => {
            const userId = localStorage.getItem('user_id');
            if (!userId || !labId) return;

            try {
                // 1. Fetch Real Materials (Filtered by type "Lab Manual")
                const matRes = await axios.get(`${API_URL}/materials/${labId}`);
                setManuals(matRes.data.filter((m: any) => m.type === "Lab Manual"));

                // 2. Fetch Lab-Specific Announcements (Filtered to hide Global/General notices)
                const annRes = await axios.get(`${API_URL}/announcements?course_code=${labId}`);
                const labOnlyNotices = annRes.data.filter((a: any) => a.course_code !== "Global");
                setAnnouncements(labOnlyNotices);

                // 3. Fetch Lab Attendance from the CIA/Academic table
                const attRes = await axios.get(`${API_URL}/marks/cia?student_id=${userId}`);
                const currentLab = attRes.data.find((l: any) => l.subject === labId);
                setAttendance(currentLab?.subject_attendance || 0);

            } catch (err) { 
                console.error("Error loading lab data:", err); 
            } finally {
                setLoading(false);
            }
        };
        fetchLabData();
    }, [labId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-teal-800 uppercase tracking-widest text-xs">Accessing Lab Portal...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                {/* Header with Navigation */}
                <div className="mb-8">
                    <button 
                        onClick={() => router.push('/student')} 
                        className="flex items-center gap-2 text-teal-700 font-bold mb-4 hover:underline transition-all uppercase text-[10px] tracking-[0.2em]"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-blue-900 border-l-8 border-teal-500 pl-4 uppercase tracking-tighter">
                        {labId} <span className="text-gray-400 font-light">Laboratory</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Section 1: REAL LAB MANUALS */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-teal-500">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 uppercase tracking-widest text-sm">
                            <Book className="text-teal-500" size={20} /> Lab Manuals
                        </h2>
                        <div className="space-y-3">
                            {manuals.length > 0 ? manuals.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-4 bg-teal-50/50 rounded-xl border border-teal-100 shadow-sm group hover:bg-teal-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-teal-600" />
                                        <span className="font-bold text-gray-700 text-xs uppercase">{m.title}</span>
                                    </div>
                                    
                                    {/* REAL FILE ACCESS LINK */}
                                    <a 
                                        href={m.file_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white rounded-full text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                    >
                                        <Download size={16} />
                                    </a>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 text-xs italic">No lab manuals uploaded by faculty yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: LAB SPECIFIC NOTICES */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-orange-500">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 uppercase tracking-widest text-sm">
                            <Megaphone className="text-orange-500" size={20} /> Internal Notices
                        </h2>
                        <div className="space-y-4">
                            {announcements.length > 0 ? announcements.map(a => (
                                <div key={a.id} className="bg-orange-50/30 p-4 rounded-xl border border-orange-100 relative shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={12} className="text-orange-400" />
                                        <h4 className="font-black text-blue-900 text-[10px] uppercase tracking-wider">{a.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{a.content}</p>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 text-xs italic">No active notices for this laboratory.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: ATTENDANCE ANALYSIS */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-blue-900 text-center">
                        <h2 className="text-xl font-bold mb-8 flex items-center justify-center gap-2 text-gray-800 uppercase tracking-widest text-sm">
                            <CheckCircle className="text-blue-600" size={20} /> Progress
                        </h2>
                        
                        <div className="inline-flex items-center justify-center relative mb-6">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                                <circle 
                                    cx="80" cy="80" r="70" 
                                    stroke="currentColor" 
                                    strokeWidth="12" 
                                    fill="transparent" 
                                    strokeDasharray={440} 
                                    strokeDashoffset={440 - (attendance / 100) * 440} 
                                    strokeLinecap="round" 
                                    className={`${attendance < 75 ? 'text-red-500' : 'text-teal-500'} transition-all duration-1000 shadow-xl`} 
                                />
                            </svg>
                            <span className="absolute text-4xl font-black text-blue-900 tracking-tighter">{attendance}%</span>
                        </div>

                        <div className="space-y-2">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full inline-block ${attendance < 75 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-900'}`}>
                                {attendance < 75 ? 'Low Attendance Warning' : 'Stable Attendance'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold italic block mt-2">Syncing live with Staff Records</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}