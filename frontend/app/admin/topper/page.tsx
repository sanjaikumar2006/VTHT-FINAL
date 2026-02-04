'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Trophy, Users, Star, Medal } from 'lucide-react';

export default function TopperPage() {
    const router = useRouter();
    const [view, setView] = useState<'none' | 'overall' | 'classwise'>('none');
    const [toppers, setToppers] = useState<any[]>([]);

    // --- State for Filters ---
    const [overallYear, setOverallYear] = useState(''); // State for Overall Year Dropdown
    const [filter, setFilter] = useState({ year: '3', semester: '5', section: 'A' });

    const fetchToppers = async (type: string) => {
        try {
            let url = `${API_URL}/admin/toppers/${type}`;
            if (type === 'overall') {
                // If a specific year is selected, pass it as a parameter
                if (overallYear) url += `?year=${overallYear}`;
            } else if (type === 'classwise') {
                url += `?year=${filter.year}&semester=${filter.semester}&section=${filter.section}`;
            }
            const res = await axios.get(url);
            
            // For Overall Department, we only show the top 3
            if (type === 'overall') {
                setToppers(res.data.slice(0, 3));
            } else {
                setToppers(res.data);
            }
        } catch (err) {
            console.error("Error fetching toppers", err);
        }
    };

    useEffect(() => {
        if (view !== 'none') fetchToppers(view);
    }, [view, filter, overallYear]); // Added overallYear to dependencies

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <button onClick={() => view === 'none' ? router.push('/admin') : setView('none')} 
                        className="flex items-center gap-2 text-blue-900 font-bold hover:underline mb-6">
                    <ArrowLeft size={18} /> Back to {view === 'none' ? 'Admin' : 'Selection'}
                </button>

                <h1 className="text-3xl font-black text-blue-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                    <Trophy className="text-yellow-500" size={36} /> Academic Toppers
                </h1>

                {view === 'none' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
                        {/* Overall Department Card */}
                        <div onClick={() => setView('overall')} 
                             className="group cursor-pointer bg-white p-10 rounded-2xl border-2 border-transparent hover:border-yellow-500 hover:shadow-2xl transition-all text-center shadow-md">
                            <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Star size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-blue-900 mb-2">Overall Department</h3>
                            <p className="text-gray-500 font-medium">Top 3 students across the institution</p>
                        </div>

                        {/* Classwise Card */}
                        <div onClick={() => setView('classwise')} 
                             className="group cursor-pointer bg-white p-10 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all text-center shadow-md">
                            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Users size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-blue-900 mb-2">Classwise</h3>
                            <p className="text-gray-500 font-medium">Rankings by Year, Semester, and Section</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Filters Header */}
                        <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {view === 'overall' ? 'Top 3 Performers' : 'Class Rankings'}
                            </h2>
                            <div className="flex gap-4">
                                {/* Overall View Dropdown */}
                                {view === 'overall' && (
                                    <select className="p-2 border rounded-lg font-bold bg-white outline-none focus:ring-2 focus:ring-yellow-500" value={overallYear} onChange={(e) => setOverallYear(e.target.value)}>
                                        <option value="">All Years</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                )}
                                {/* Classwise View Dropdowns */}
                                {view === 'classwise' && (
                                    <>
                                        <select className="p-2 border rounded-lg font-bold" value={filter.year} onChange={(e) => setFilter({...filter, year: e.target.value})}>
                                            <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                                        </select>
                                        <select className="p-2 border rounded-lg font-bold" value={filter.section} onChange={(e) => setFilter({...filter, section: e.target.value})}>
                                            <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-8">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase text-gray-400 border-b">
                                    <tr>
                                        <th className="p-4">Rank</th>
                                        <th className="p-4">Student Name</th>
                                        <th className="p-4">Roll No</th>
                                        <th className="p-4">CGPA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {toppers.length > 0 ? toppers.map((stu, index) => (
                                        <tr key={stu.roll_no} className="border-b last:border-0 hover:bg-yellow-50 transition-colors">
                                            <td className="p-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                                                {stu.name} {index === 0 && <Medal size={20} className="text-yellow-500" />}
                                            </td>
                                            <td className="p-4 font-mono text-blue-600 font-bold">{stu.roll_no}</td>
                                            <td className="p-4 font-black text-2xl text-blue-900">{stu.cgpa.toFixed(2)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-10 text-center text-gray-400 italic">No data available for this selection.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}