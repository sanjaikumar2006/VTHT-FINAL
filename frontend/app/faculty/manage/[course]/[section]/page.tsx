'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
    Save, FileUp, UserCheck, ArrowLeft, Search, Loader2, 
    Megaphone, BookOpen, FileText, ClipboardList, Beaker, Trash2 
} from 'lucide-react';

export default function SectionManagement() {
    const params = useParams();
    const router = useRouter();
    const courseCode = params.course as string;
    const sectionName = params.section || "A";

    const isLabCourse = courseCode.toLowerCase().includes('lab') || courseCode.startsWith('CS3402') || courseCode.startsWith('CS3403');

    // States
    const [students, setStudents] = useState<any[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [uploadedMaterials, setUploadedMaterials] = useState<any[]>([]); // To track current files
    const [searchQuery, setSearchQuery] = useState('');
    const [activeAction, setActiveAction] = useState('marks');
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form States
    const [subAnn, setSubAnn] = useState({ title: '', content: '' });

    // --- 1. INITIAL FETCH ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/marks/section?course_code=${courseCode}`);
                setStudents(res.data);
                setFilteredStudents(res.data);
            } catch (error) {
                console.error("Error fetching students", error);
            }
        };
        fetchData();
        fetchMaterials(); // Load existing files on startup
    }, [courseCode]);

    // --- 2. MATERIALS FETCH LOGIC ---
    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`${API_URL}/materials/${courseCode}`);
            setUploadedMaterials(res.data);
        } catch (e) {
            console.error("Error loading files");
        }
    };

    // Auto-refresh when switching to the uploads tab
    useEffect(() => {
        if (activeAction === 'uploads') fetchMaterials();
    }, [activeAction]);

    // --- 3. DELETE LOGIC (NEW) ---
    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ Are you sure? This will permanently erase the file from the server and the student portal.")) return;
        try {
            await axios.delete(`${API_URL}/materials/${id}`);
            alert("🗑️ File erased successfully!");
            fetchMaterials(); // Refresh the list
        } catch (error) {
            alert("Delete failed. Ensure backend is running.");
        }
    };

    // --- 4. SEARCH LOGIC ---
    useEffect(() => {
        const filtered = students.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roll_no.includes(searchQuery)
        );
        setFilteredStudents(filtered);
    }, [searchQuery, students]);

    const handleMarkChange = (roll_no: string, field: string, value: string) => {
        const updated = students.map(s => s.roll_no === roll_no ? { ...s, [field]: value } : s);
        setStudents(updated);
    };

    // --- 5. SAVE MARKS DATA ---
    const handleSaveMarks = async () => {
        setIsSaving(true);
        try {
            const savePromises = students.map(student =>
                axios.post(`${API_URL}/marks/sync`, {
                    student_roll_no: student.roll_no,
                    course_code: courseCode,
                    cia1_marks: isLabCourse ? 0 : Number(student.cia1_marks),
                    cia1_retest: isLabCourse ? 0 : Number(student.cia1_retest),
                    cia2_marks: isLabCourse ? 0 : Number(student.cia2_marks),
                    cia2_retest: isLabCourse ? 0 : Number(student.cia2_retest),
                    subject_attendance: Number(student.subject_attendance)
                })
            );
            await Promise.all(savePromises);
            alert(`✅ Success! Marks and Attendance synced.`);
        } catch (error) {
            alert("Failed to sync data.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- 6. REAL FILE UPLOAD LOGIC ---
    const handleFileUpload = async (type: string, titleId: string, fileInputId: string) => {
        const titleInput = document.getElementById(titleId) as HTMLInputElement;
        const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
        const userId = localStorage.getItem('user_id');

        if (!titleInput?.value || !fileInput?.files?.[0]) { alert("Title and File selection are required!"); return; }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]); 
        formData.append('course_code', courseCode);
        formData.append('type', type);
        formData.append('title', titleInput.value);
        formData.append('posted_by', userId!);

        setUploading(true);
        try {
            await axios.post(`${API_URL}/materials`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`📁 ${type} uploaded!`);
            titleInput.value = "";
            fileInput.value = "";
            fetchMaterials(); // Update the table instantly
        } catch (error) {
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    // --- 7. ANNOUNCEMENT LOGIC ---
    const handlePostSubAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/announcements`, {
                title: subAnn.title,
                content: subAnn.content,
                type: "Subject", 
                course_code: courseCode,
                posted_by: localStorage.getItem('user_id') 
            });
            alert(`📢 Notice broadcasted!`);
            setSubAnn({ title: '', content: '' });
        } catch (error) {
            alert("Failed to post.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-900 font-bold hover:underline mb-2">
                            <ArrowLeft size={18} /> Back
                        </button>
                        <h1 className={`text-3xl font-black uppercase ${isLabCourse ? 'text-purple-700' : 'text-blue-900'}`}>
                            {courseCode} Management
                        </h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Section {sectionName}</p>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setActiveAction('marks')} className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${activeAction === 'marks' ? 'bg-blue-900 text-white shadow-lg' : 'bg-white border text-gray-600'}`}>
                            <UserCheck size={18} /> Attendance & Marks
                        </button>
                        <button onClick={() => setActiveAction('uploads')} className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${activeAction === 'uploads' ? 'bg-blue-900 text-white shadow-lg' : 'bg-white border text-gray-600'}`}>
                            <FileUp size={18} /> Uploads & Notices
                        </button>
                    </div>
                </div>

                {/* TAB 1: MARKS TABLE */}
                {activeAction === 'marks' && (
                    <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between gap-4">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input type="text" placeholder="Search Roll No..." className="pl-10 pr-4 py-2 w-full border rounded-lg outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <button onClick={handleSaveMarks} disabled={isSaving} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Sync Data
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className={`text-white text-[10px] uppercase tracking-wider font-bold ${isLabCourse ? 'bg-purple-700' : 'bg-blue-900'}`}>
                                    <tr>
                                        <th className="p-4">Roll No</th>
                                        <th className="p-4">Name</th>
                                        {!isLabCourse && (
                                            <>
                                                <th className="p-4 text-center">CIA 1</th><th className="p-4 text-center bg-blue-800">C1 Retest</th>
                                                <th className="p-4 text-center">CIA 2</th><th className="p-4 text-center bg-blue-800">C2 Retest</th>
                                            </>
                                        )}
                                        <th className="p-4 text-center">Att %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((stu) => (
                                        <tr key={stu.roll_no} className="hover:bg-blue-50 border-b transition text-sm">
                                            <td className="p-4 font-bold text-gray-700">{stu.roll_no}</td>
                                            <td className="p-4 text-gray-800 font-medium">{stu.name}</td>
                                            {!isLabCourse && (
                                                <>
                                                    <td className="p-4 text-center">
                                                        <input type="number" value={stu.cia1_marks} onChange={(e) => handleMarkChange(stu.roll_no, 'cia1_marks', e.target.value)} 
                                                        className={`w-14 border rounded p-1 text-center font-bold ${Number(stu.cia1_marks) < 30 && stu.cia1_marks !== '' ? 'bg-red-100 text-red-700 border-red-400' : 'bg-white'}`} />
                                                    </td>
                                                    <td className="p-4 text-center bg-gray-50/50">
                                                        <input type="number" value={stu.cia1_retest} onChange={(e) => handleMarkChange(stu.roll_no, 'cia1_retest', e.target.value)} 
                                                        className={`w-14 border rounded p-1 text-center font-bold ${Number(stu.cia1_retest) < 30 && stu.cia1_retest !== '' ? 'bg-red-100 text-red-700 border-red-400' : 'bg-white'}`} />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input type="number" value={stu.cia2_marks} onChange={(e) => handleMarkChange(stu.roll_no, 'cia2_marks', e.target.value)} 
                                                        className={`w-14 border rounded p-1 text-center font-bold ${Number(stu.cia2_marks) < 30 && stu.cia2_marks !== '' ? 'bg-red-100 text-red-700 border-red-400' : 'bg-white'}`} />
                                                    </td>
                                                    <td className="p-4 text-center bg-gray-50/50">
                                                        <input type="number" value={stu.cia2_retest} onChange={(e) => handleMarkChange(stu.roll_no, 'cia2_retest', e.target.value)} 
                                                        className={`w-14 border rounded p-1 text-center font-bold ${Number(stu.cia2_retest) < 30 && stu.cia2_retest !== '' ? 'bg-red-100 text-red-700 border-red-400' : 'bg-white'}`} />
                                                    </td>
                                                </>
                                            )}
                                            <td className="p-4 text-center">
                                                <input type="number" value={stu.subject_attendance} onChange={(e) => handleMarkChange(stu.roll_no, 'subject_attendance', e.target.value)} 
                                                className="w-14 border rounded p-1 text-center font-bold" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: UPLOADS & DELETE */}
                {activeAction === 'uploads' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLabCourse ? (
                                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-600 col-span-full md:col-span-1">
                                    <div className="flex items-center gap-2 mb-4"><Beaker className="text-purple-600" size={20} /><h3 className="font-bold">Lab Manuals</h3></div>
                                    <input type="text" id="lab-title" placeholder="Manual Name..." className="w-full border p-2 rounded mb-3 text-sm" />
                                    <input type="file" id="lab-file" className="text-xs mb-4 w-full" />
                                    <button disabled={uploading} onClick={() => handleFileUpload('Lab Manual', 'lab-title', 'lab-file')} className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">
                                        {uploading ? "Uploading..." : "Upload Manual"}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-900">
                                        <div className="flex items-center gap-2 mb-4"><BookOpen className="text-blue-900" size={20} /><h3 className="font-bold">Lecture Notes</h3></div>
                                        <input type="text" id="notes-title" placeholder="Topic..." className="w-full border p-2 rounded mb-3 text-sm" />
                                        <input type="file" id="notes-file" className="text-xs mb-4 w-full" />
                                        <button disabled={uploading} onClick={() => handleFileUpload('Lecture Notes', 'notes-title', 'notes-file')} className="w-full bg-blue-900 text-white py-2 rounded font-bold">Upload Notes</button>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-teal-600">
                                        <div className="flex items-center gap-2 mb-4"><FileText className="text-teal-600" size={20} /><h3 className="font-bold">Question Bank</h3></div>
                                        <input type="text" id="qb-title" placeholder="Title..." className="w-full border p-2 rounded mb-3 text-sm" />
                                        <input type="file" id="qb-file" className="text-xs mb-4 w-full" />
                                        <button disabled={uploading} onClick={() => handleFileUpload('Question Bank', 'qb-title', 'qb-file')} className="w-full bg-teal-600 text-white py-2 rounded font-bold">Upload QB</button>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500">
                                        <div className="flex items-center gap-2 mb-4"><ClipboardList className="text-orange-500" size={20} /><h3 className="font-bold">Assignments</h3></div>
                                        <input type="text" id="assign-title" placeholder="Title..." className="w-full border p-2 rounded mb-3 text-sm" />
                                        <input type="file" id="assign-file" className="text-xs mb-4 w-full" />
                                        <button disabled={uploading} onClick={() => handleFileUpload('Assignment', 'assign-title', 'assign-file')} className="w-full bg-orange-500 text-white py-2 rounded font-bold">Post Assignment</button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* MANAGE MATERIALS TABLE (DELETE BUTTON HERE) */}
                        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
                            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                                <Trash2 size={18} className="text-red-600" />
                                <h3 className="font-bold text-red-800 uppercase text-xs tracking-[0.2em]">Manage Current Uploads</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 border-b">
                                        <tr><th className="p-4">Title</th><th className="p-4">Type</th><th className="p-4 text-center">Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {uploadedMaterials.length > 0 ? uploadedMaterials.map((m) => (
                                            <tr key={m.id} className="border-b last:border-0 hover:bg-red-50/30 transition">
                                                <td className="p-4 font-bold text-gray-700 text-sm">{m.title}</td>
                                                <td className="p-4"><span className="text-[10px] bg-gray-200 px-2 py-1 rounded font-bold uppercase">{m.type}</span></td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => handleDelete(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition shadow-sm"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="p-10 text-center text-gray-400 italic">No files uploaded yet for this course.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notice Form */}
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-900">
                            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><Megaphone className="text-orange-500" /> Post Notice</h2>
                            <form onSubmit={handlePostSubAnnouncement} className="space-y-4">
                                <input className="w-full p-3 border rounded outline-none" placeholder="Title..." value={subAnn.title} onChange={(e) => setSubAnn({ ...subAnn, title: e.target.value })} required />
                                <textarea className="w-full p-3 border rounded outline-none h-28" placeholder="Message details..." value={subAnn.content} onChange={(e) => setSubAnn({ ...subAnn, content: e.target.value })} required />
                                <button type="submit" className="bg-blue-900 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-800 transition">Broadcast</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}