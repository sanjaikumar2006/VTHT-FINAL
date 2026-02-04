import { NextResponse } from 'next/server';

// This acts as a temporary "Live" database in your server's memory
// Note: In a real app, this would be a MongoDB or SQL database.
let liveMarks: any = {
    "21AD001": [{ subject: "CS3401 - Artificial Intelligence", cia1: 18, cia2: 17, total: 35 }],
    "21AD002": [{ subject: "CS3401 - Artificial Intelligence", cia1: 20, cia2: 19, total: 39 }],
    "21AD003": [{ subject: "CS3401 - Artificial Intelligence", cia1: 12, cia2: 14, total: 26 }],
    "21AD004": [{ subject: "CS3401 - Artificial Intelligence", cia1: 19, cia2: 18, total: 37 }],
    "21AD005": [{ subject: "CS3401 - Artificial Intelligence", cia1: 14, cia2: 16, total: 30 }],
    "21AD006": [{ subject: "CS3401 - Artificial Intelligence", cia1: 17, cia2: 15, total: 32 }],
    "21AD007": [{ subject: "CS3401 - Artificial Intelligence", cia1: 20, cia2: 20, total: 40 }],
    "21AD008": [{ subject: "CS3401 - Artificial Intelligence", cia1: 11, cia2: 13, total: 24 }],
    "21AD009": [{ subject: "CS3401 - Artificial Intelligence", cia1: 16, cia2: 17, total: 33 }],
    "21AD010": [{ subject: "CS3401 - Artificial Intelligence", cia1: 13, cia2: 12, total: 25 }],
};

// GET: Student Dashboard calls this to see their marks
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    return NextResponse.json(liveMarks[studentId || ""] || []);
}

// POST: Faculty Dashboard calls this to update marks
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, cia1, cia2, subject } = body;

        if (!liveMarks[studentId]) {
            liveMarks[studentId] = [];
        }

        // Update the marks for that specific student
        liveMarks[studentId] = [{
            subject: subject || "CS3401 - Artificial Intelligence",
            cia1: Number(cia1),
            cia2: Number(cia2),
            total: Number(cia1) + Number(cia2)
        }];

        return NextResponse.json({ message: "Marks updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update marks" }, { status: 500 });
    }
}