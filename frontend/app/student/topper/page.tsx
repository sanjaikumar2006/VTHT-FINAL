'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Trophy, Users, Star, Medal } from 'lucide-react';

export default function StudentTopperPage() {
    const router = useRouter();
    const [view, setView] = useState<'none' | 'overall' | 'classwise'>('none');
    const [toppers, setToppers] = useState<any[]>([]);

    // States for dropdowns
    const [overallYear, setOverallYear] = useState(''); // Empty means 'All Years'
    const [filter, setFilter] = useState({ year: '1', semester: '1', section: 'A' });

    const fetchToppers = async () => {
        try {
            let url = `${API_URL}/admin/toppers/overall`;
            
            if (view === 'overall') {
                if (overallYear) url += `?year=${overallYear}`;
            } else if (view === 'classwise') {
                url = `${API_URL}/admin/toppers/classwise?year=${filter.year}&semester=${filter.semester}&section=${filter.section}`;
            }

            const res = await axios.get(url);
            
            // For Overall, we only show top 3 as per your requirement
            if (view === 'overall') {
                setToppers(res.data.slice(0, 3));
            } else {
                setToppers(res.data);
            }
        } catch (err) {
            console.error("Error fetching toppers", err);
        }
    };

    useEffect(() => {
        if (view !== 'none') fetchToppers();
    }, [view, filter, overallYear]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                {/* Navigation Back */}
                <button 
                    onClick={() => view === 'none' ? router.push('/student') : setView('none')} 
                    className="flex items-center gap-2 text-blue-900 font-bold hover:underline mb-6"
                >
                    <ArrowLeft size={18} /> Back to {view === 'none' ? 'Dashboard' : 'Selection'}
                </button>

                <h1 className="text-3xl font-black text-blue-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                    <Trophy className="text-orange-500" size={36} /> Academic Hall of Fame
                </h1>

                {view === 'none' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
                        {/* Overall Card */}
                        <div onClick={() => setView('overall')} 
                             className="group cursor-pointer bg-white p-10 rounded-2xl border-2 border-transparent hover:border-orange-500 hover:shadow-2xl transition-all text-center shadow-md">
                            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <Star size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-blue-900 mb-2 uppercase tracking-tighter">Overall Department</h3>
                            <p className="text-gray-500 font-medium">Top 3 performers across the institution</p>
                        </div>

                        {/* Classwise Card */}
                        <div onClick={() => setView('classwise')} 
                             className="group cursor-pointer bg-white p-10 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all text-center shadow-md">
                            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <Users size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-blue-900 mb-2 uppercase tracking-tighter">Classwise Ranking</h3>
                            <p className="text-gray-500 font-medium">Find toppers for specific years and sections</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Filters Header */}
                        <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                                {view === 'overall' ? '🏆 Top 3 Rankers' : 'Classwise Ranking'}
                            </h2>
                            
                            <div className="flex gap-3">
                                {view === 'overall' ? (
                                    <select 
                                        value={overallYear} 
                                        onChange={(e) => setOverallYear(e.target.value)} 
                                        className="p-2 border-2 border-orange-200 rounded-lg font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">Institution (All)</option>
                                        <option value="1">1st Year Only</option>
                                        <option value="2">2nd Year Only</option>
                                        <option value="3">3rd Year Only</option>
                                        <option value="4">4th Year Only</option>
                                    </select>
                                ) : (
                                    <>
                                        <select 
                                            className="p-2 border-2 border-blue-100 rounded-lg font-bold text-sm" 
                                            value={filter.year} 
                                            onChange={(e) => setFilter({...filter, year: e.target.value})}
                                        >
                                            <option value="1">1st Year</option><option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option><option value="4">4th Year</option>
                                        </select>
                                        <select 
                                            className="p-2 border-2 border-blue-100 rounded-lg font-bold text-sm" 
                                            value={filter.section} 
                                            onChange={(e) => setFilter({...filter, section: e.target.value})}
                                        >
                                            <option value="A">Sec A</option><option value="B">Sec B</option><option value="C">Sec C</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-4 md:p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black uppercase text-gray-400 border-b">
                                        <tr>
                                            <th className="p-4">Rank</th>
                                            <th className="p-4">Student Name</th>
                                            <th className="p-4">Roll Number</th>
                                            <th className="p-4 text-right">CGPA</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {toppers.length > 0 ? toppers.map((stu, index) => (
                                            <tr key={stu.roll_no} className="hover:bg-orange-50/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-md transition-transform group-hover:scale-110 ${
                                                        index === 0 ? 'bg-yellow-500' : 
                                                        index === 1 ? 'bg-slate-400' : 
                                                        index === 2 ? 'bg-orange-400' : 'bg-blue-900'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                                                    {stu.name} {index === 0 && <Medal size={20} className="text-yellow-500 animate-pulse" />}
                                                </td>
                                                <td className="p-4 font-mono text-blue-600 font-bold">{stu.roll_no}</td>
                                                <td className="p-4 text-right font-black text-2xl text-blue-900">
                                                    {stu.cgpa?.toFixed(2)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="p-20 text-center text-gray-400 italic font-medium">
                                                    No rankings available for this selection.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}