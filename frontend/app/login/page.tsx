'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/login`, { username, password });
            const { access_token, role, user_id } = res.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('user_id', user_id);

            if (role === 'Admin') router.push('/admin');
            else if (role === 'Student') router.push('/student');
            else if (role === 'Faculty' || role === 'HOD') router.push('/faculty');
            else router.push('/');
        } catch {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">

            {/* 🔹 Button Breathing Animation */}
            <style jsx>{`
        @keyframes breatheBtn {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
        .breathing-btn {
          animation: breatheBtn 3s ease-in-out infinite;
        }
      `}</style>

            <Navbar />

            <main
                className="flex-grow flex items-center justify-center bg-cover bg-center relative"
                style={{ backgroundImage: "url('/login-bg.jpg')" }}
            >
                {/* White overlay */}
                <div className="absolute inset-0 bg-white/70"></div>

                {/* 🔹 Glassmorphism Login Card */}
                <div className="relative backdrop-blur-xl bg-white/30 border border-white/40 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
                        Login to Portal
                    </h2>

                    {error && (
                        <p className="text-red-500 text-center mb-4">{error}</p>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* USERNAME */}
                        <div>
                            <label className="block text-gray-800 font-medium mb-2">
                                User ID / Roll No
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white/70 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter ID"
                                required
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-gray-800 font-medium mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white/70 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                    placeholder="DOB (DDMMYYYY) or Admin Pass"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* 🔹 Breathing Login Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition breathing-btn"
                        >
                            Login
                        </button>

                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}