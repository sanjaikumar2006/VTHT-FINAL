import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const studentsList = [
            { id: "student1", name: "Original Student", pass: "01012000", roll: "21AD001" },
            { id: "21AD002", name: "Bhavani S", pass: "pass002", roll: "21AD002" },
            { id: "21AD003", name: "Sankar P", pass: "pass003", roll: "21AD003" },
            { id: "21AD004", name: "Deepak R", pass: "pass004", roll: "21AD004" },
            { id: "21AD005", name: "Ishwarya M", pass: "pass005", roll: "21AD005" },
            { id: "21AD006", name: "Karthik G", pass: "pass006", roll: "21AD006" },
            { id: "21AD007", name: "Meena R", pass: "pass007", roll: "21AD007" },
            { id: "21AD008", name: "Naveen J", pass: "pass008", roll: "21AD008" },
            { id: "21AD009", name: "Priyanka V", pass: "pass009", roll: "21AD009" },
            { id: "21AD010", name: "Rahul T", pass: "pass010", roll: "21AD010" },
        ];

        const facultyList = [
            { id: "HTS 1794", name: "Dr. Sankar", pass: "20.01.2025", role: "Faculty", desig: "Professor" },
            { id: "HTS 1856", name: "Dr. S. Zulaikha Beevi", pass: "16.06.2025", role: "Faculty", desig: "Professor" },
            { id: "HTS 1766", name: "Dr. G. Mahalakshmi", pass: "02.07.2024", role: "Faculty", desig: "Associate Professor" },
            { id: "HTS 1821", name: "Dr. S. Sathish Kumar", pass: "04.06.2025", role: "Faculty", desig: "Associate Professor" },
            { id: "HTS 1488", name: "Mrs. Veerasundari R", pass: "02-Mar-2020", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1527", name: "Mrs. Vasanthapriya M J T", pass: "26-Nov-2020", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1602", name: "Mrs. Elavarasi J", pass: "20-Apr-2022", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1603", name: "Ms. Gowthami K", pass: "19-Apr-2022", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1655", name: "Mrs. Geetha L", pass: "13-Feb-2023", role: "HOD", desig: "HOD of AI&DS" },
            { id: "HTS 1664", name: "Mrs. Priya R V", pass: "13-Jun-2023", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1711", name: "Mr. Balaji M", pass: "23-Dec-2023", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1745", name: "Mrs. Ranjani R", pass: "18-May-2024", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1767", name: "Ms. Preethi M", pass: "04.07.2024", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1774", name: "Ms. Nivetha P", pass: "22.07.2024", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1717", name: "Mr. Ramajayam A", pass: "24-Jan-2024", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1725", name: "Ms. Tamil Selvi B", pass: "15-Feb-2024", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1775", name: "Ms. Harini P", pass: "25.07.2024", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1791", name: "Mr. Umanath", pass: "08.01.2025", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1792", name: "Mr. Balaarunesh G", pass: "13.01.2025", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1801", name: "Ms. Suganya Devi S", pass: "22.01.2025", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1802", name: "Mr. Samuel Dinesh Hynes N", pass: "23.01.2025", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1819", name: "Ms. Kuppu Lakshmi", pass: "15.02.2025", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1857", name: "Mr. Vishnu Vamsi Nunna", pass: "16.06.2025", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1865", name: "Mr. Ahamed Haris", pass: "26.06.2025", role: "Faculty", desig: "Assistant Professor" },
            { id: "HTS 1900", name: "Ms. Pavithra M", pass: "08.09.2025", role: "Faculty", desig: "Assistant Professor" },
        ];

        const student = studentsList.find(s => s.id === username && s.pass === password);
        if (student) {
            return NextResponse.json({
                user_id: student.roll,
                name: student.name,
                role: "Student",
                access_token: "token-" + student.roll
            }, { status: 200 });
        }

        const faculty = facultyList.find(f => f.id === username && f.pass === password);
        if (faculty) {
            return NextResponse.json({
                user_id: faculty.id,
                name: faculty.name,
                role: faculty.role,
                designation: faculty.desig,
                access_token: "token-" + faculty.id
            }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}