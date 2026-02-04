'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Courses() {
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${API_URL}/courses`);
                setCourses(res.data);
            } catch (error) {
                console.error("Error fetching courses", error);
            }
        };
        fetchCourses();
    }, []);

    // Group by semester
    const coursesBySem = courses.reduce((acc: any, course: any) => {
        const sem = course.semester;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(course);
        return acc;
    }, {});

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <h1 className="text-3xl font-bold mb-8 text-blue-900 text-center">AI & DS Curriculum</h1>

                {Object.keys(coursesBySem).sort().map((sem) => (
                    <div key={sem} className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2 inline-block">Semester {sem}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coursesBySem[sem].map((course: any) => (
                                <Link href={`/courses/${course.code}`} key={course.code}>
                                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-t-4 border-blue-900 h-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{course.code}</span>
                                            <span className="text-gray-500 text-sm">{course.credits} Credits</span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 text-gray-800">{course.title}</h3>
                                        {course.category && <p className="text-sm text-gray-500">Category: {course.category}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
}
