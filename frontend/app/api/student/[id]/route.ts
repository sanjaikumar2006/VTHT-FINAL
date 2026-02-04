import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    // Awaiting params is required in newer Next.js versions
    const userId = params.id; 

    const allStudents: any = {
        "21AD001": { name: "Original Student", roll_no: "21AD001", semester: "6th", year: "3rd Year", cgpa: "8.5", attendance_percentage: 85 },
        "21AD002": { name: "Bhavani S", roll_no: "21AD002", semester: "6th", year: "3rd Year", cgpa: "9.1", attendance_percentage: 92 },
        "21AD003": { name: "Sankar P", roll_no: "21AD003", semester: "6th", year: "3rd Year", cgpa: "7.8", attendance_percentage: 74 },
        "21AD004": { name: "Deepak R", roll_no: "21AD004", semester: "6th", year: "3rd Year", cgpa: "8.2", attendance_percentage: 88 },
        "21AD005": { name: "Ishwarya M", roll_no: "21AD005", semester: "6th", year: "3rd Year", cgpa: "8.9", attendance_percentage: 95 },
        "21AD006": { name: "Karthik G", roll_no: "21AD006", semester: "6th", year: "3rd Year", cgpa: "7.5", attendance_percentage: 70 },
        "21AD007": { name: "Meena R", roll_no: "21AD007", semester: "6th", year: "3rd Year", cgpa: "9.5", attendance_percentage: 98 },
        "21AD008": { name: "Naveen J", roll_no: "21AD008", semester: "6th", year: "3rd Year", cgpa: "6.8", attendance_percentage: 65 },
        "21AD009": { name: "Priyanka V", roll_no: "21AD009", semester: "6th", year: "3rd Year", cgpa: "8.7", attendance_percentage: 89 },
        "21AD010": { name: "Rahul T", roll_no: "21AD010", semester: "6th", year: "3rd Year", cgpa: "7.2", attendance_percentage: 78 },
    };

    const student = allStudents[userId];

    if (student) {
        return NextResponse.json(student);
    } else {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
}