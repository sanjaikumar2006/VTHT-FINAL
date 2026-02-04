'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { API_URL } from '@/config';
import axios from 'axios';
import peekImage from "@/public/peek.jpg";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
}

const heroImages = [
  '/college-bg-1.jpg',
  '/college-bg-2.jpg',
  '/college-bg-3.jpg',
];

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentBg, setCurrentBg] = useState(0);

  // 🔹 Background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length);
    }, 5000); // change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // 🔹 Shiny wave for hero section
  useEffect(() => {
    const glass = document.getElementById("hero-glass");
    const light = document.getElementById("hero-light");
    if (!glass || !light) return;

    const move = (e: MouseEvent) => {
      const rect = glass.getBoundingClientRect();
      light.style.setProperty("--x", `${e.clientX - rect.left}px`);
      light.style.setProperty("--y", `${e.clientY - rect.top}px`);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // 🔹 Shiny wave for about card
  useEffect(() => {
    const card = document.getElementById('about-card');
    const light = document.getElementById('about-light');
    
    if (!card || !light) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      light.style.setProperty('--x', `${x}px`);
      light.style.setProperty('--y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 🔹 Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/announcements?type=Global`);
        setAnnouncements(res.data);
      } catch (error) {
        console.error("Failed to fetch announcements", error);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">

        {/* 🔹 HERO SECTION WITH SLIDESHOW */}
        <section className="relative text-white py-24 overflow-hidden">

          {/* Background images */}
          {heroImages.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentBg ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}

          {/* ORANGE GRADIENT BORDER AT TOP */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent z-10"></div>
          
          {/* ORANGE OVERLAY AT TOP - Fades down with higher opacity */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-orange-400/60 via-orange-400/40 to-transparent"></div>

          {/* BLUE OVERLAY - Original opacity */}
          {/* BLUE GLASS BASE */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-700/30" />
          {/* BLUE OVERLAY WITH STRONGER AUTOMATIC SHINE */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-700/30 overflow-hidden">
            {/* Moving shine */}
            <div className="absolute top-0 left-[-50%] w-[250%] h-full bg-white/40 blur-2xl transform rotate-[25deg] animate-shine"></div>
          </div>

          {/* SHINY WAVE LAYER */}
          <div id="hero-glass" className="absolute inset-0 pointer-events-none">
            <div id="hero-light" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Vel Tech High Tech
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light drop-shadow-md">
              Dr. Rangarajan Dr. Sakunthala Engineering College
            </p>

            <Link href="/login">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Department of Artificial Intelligence & Data Science
              </button>
            </Link>
          </div>
        </section>

        {/* ANNOUNCEMENTS */}
        <section className="py-20 bg-gray-50 relative">
          {/* Orange gradient decorative border */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-14 text-blue-900 relative">
              Announcements
              {/* Decorative orange accent under title */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 rounded-full"></div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="group relative bg-gray-200 p-8 rounded-3xl border-2 border-transparent
                               shadow-md transition-all duration-500 hover:scale-110 hover:-translate-y-4 hover:shadow-2xl
                               hover:border-orange-400 bg-gradient-to-br from-white via-gray-50 to-gray-100"
                  >
                    {/* Orange gradient accent on hover */}
                    <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 
                                    opacity-0 group-hover:opacity-100 transition duration-500 blur-sm -z-10" />
                    
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/70 via-white/20 to-transparent
                                    opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

                    {/* Small orange accent line */}
                    <div className="absolute top-0 left-8 w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full
                                    transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-500" />

                    <h3 className="relative font-bold text-xl mb-3 text-gray-900">
                      {ann.title}
                    </h3>

                    <p className="relative text-gray-700 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500">
                  No announcements at the moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Glassy Card */}
            <div
              id="about-card"
              className="relative bg-gray-200/70 backdrop-blur-xl p-10 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl"
            >
              {/* Shiny light layer */}
              <div
                id="about-light"
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(139, 139, 139, 0.92) 0%, transparent 80%)`,
                  mixBlendMode: "overlay",
                }}
              />

              <h2 className="text-3xl font-bold text-center mb-8 text-blue-900 relative z-10">
                About Our College
              </h2>
              <p className="text-gray-700 max-w-4xl mx-auto text-center leading-relaxed relative z-10">
                Vel Tech High Tech Dr.RangarajanDr.Sakunthala Engineering College
                established in the year 2002...
              </p>

              <div className="flex justify-center mt-8 relative z-10">
                <img
                  src={peekImage.src}
                  alt="Vel Tech High Tech College View"
                  className="rounded-lg shadow-lg max-w-full h-auto transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}