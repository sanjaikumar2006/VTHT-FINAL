import { NextResponse } from 'next/server';

export async function GET() {
    const allCourses = [
        { code: "CS3401", title: "Artificial Intelligence", credits: 4, type: "core" },
        { code: "CS3402", title: "Data Science Lab", credits: 2, type: "lab" },
        { code: "MA3151", title: "Matrices & Calculus", credits: 4, type: "core" },
        { code: "GE3151", title: "Problem Solving & Python", credits: 3, type: "core" },
        { code: "CS3301", title: "Data Structures", credits: 3, type: "arrear" }
    ];
    return NextResponse.json(allCourses);
}