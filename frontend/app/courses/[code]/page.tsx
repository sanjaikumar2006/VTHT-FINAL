'use client';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CourseDetails() {
    const params = useParams();
    const { code } = params;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <h1 className="text-3xl font-bold mb-8 text-blue-900">Course Details: {code}</h1>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex border-b overflow-x-auto">
                        <button className="px-6 py-3 text-blue-900 font-bold border-b-2 border-blue-900 whitespace-nowrap">Syllabus</button>
                        <button className="px-6 py-3 text-gray-600 hover:text-blue-900 whitespace-nowrap">Lecture Notes</button>
                        <button className="px-6 py-3 text-gray-600 hover:text-blue-900 whitespace-nowrap">Assignments</button>
                        <button className="px-6 py-3 text-gray-600 hover:text-blue-900 whitespace-nowrap">Question Bank</button>
                    </div>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Syllabus Content</h2>
                        <p className="text-gray-700">
                            This is a placeholder for the syllabus content of course {code}.
                            In a real application, this would be fetched from the database or a file storage.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
