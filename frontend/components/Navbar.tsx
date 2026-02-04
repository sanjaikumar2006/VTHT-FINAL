'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User, Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (token) {
      setIsLoggedIn(true);
      setRole(userRole || '');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-950 via-blue-700 to-blue-950 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* LEFT SIDE: LOGO + COLLEGE NAME */}
        <Link href="/" className="flex items-center gap-3 min-w-0 pr-2">
          <Image
            src="/logo.png"
            alt="Vel Tech Logo"
            width={40}
            height={40}
            className="rounded shrink-0"
          />
          <div className="flex flex-col justify-center leading-tight overflow-hidden">
            <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">
              Vel Tech High Tech
            </span>

            <span className="text-[9px] sm:text-[10px] md:text-[12px] font-medium text-blue-200 line-clamp-1 sm:line-clamp-none">
              Dr. Rangarajan Dr. Sakunthala Engineering College
            </span>

            {/* ✅ Newly Added Line */}
            <span className="text-[8px] sm:text-[9px] md:text-[11px] text-yellow-300 font-medium">
                        ㅤㅤㅤAn Autonomous Institution
            </span>
          </div>
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center">
          {/* DESKTOP MENU */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/" className="hover:text-orange-400 transition text-sm font-medium">
              Home
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  href={role === 'Student' ? '/student' : role === 'Faculty' ? '/faculty' : '/admin'}
                  className="hover:text-orange-400 font-medium transition text-sm"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-xs font-bold transition"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-full text-sm font-bold transition shadow-lg">
                  <User size={16} /> Login
                </button>
              </Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="sm:hidden text-white focus:outline-none p-2 hover:bg-blue-800 rounded-md transition ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-full right-0 w-64 bg-white text-gray-800 shadow-2xl rounded-bl-xl border-l border-b border-gray-200 z-[999] sm:hidden overflow-hidden">
          <div className="flex flex-col divide-y divide-gray-100">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-6 py-4 text-right hover:bg-gray-50 font-medium transition-colors"
            >
              Home
            </Link>

            {isLoggedIn && (
              <Link
                href={role === 'Student' ? '/student' : role === 'Faculty' ? '/faculty' : '/admin'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-right hover:bg-gray-50 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full text-right px-6 py-4 text-red-600 hover:bg-red-50 font-bold transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-right text-orange-600 hover:bg-orange-50 font-bold transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}