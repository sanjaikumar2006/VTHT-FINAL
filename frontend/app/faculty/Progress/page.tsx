'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/config';

export default function ProgressPage() {
  const [faculty, setFaculty] = useState<any>(null);

  // Manual course details
  const [courseDetails, setCourseDetails] = useState({
    semester: '',
    academicYear: '',
    courseCode: '',
    courseTitle: ''
  });

  // Selected sections
  const [sections, setSections] = useState<string[]>([]);
  const [hodRemarks, setHodRemarks] = useState('');


  useEffect(() => {
    const userId = localStorage.getItem('user_id');

    const loadFaculty = async () => {
      const res = await axios.get(`${API_URL}/faculty/${userId}`);
      setFaculty(res.data);
    };

    loadFaculty();
  }, []);

  // Auto-create section tables
  const handleSectionSelect = (section: string) => {
    if (section && !sections.includes(section)) {
      setSections([...sections, section]);
    }
  };

  // ✅ DELETE ONLY ONE SECTION
  const handleDeleteSection = (sectionToDelete: string) => {
    setSections(sections.filter((sec) => sec !== sectionToDelete));
  };

  // ✅ SAVE BUTTON HANDLER
const handleSave = () => {
  const payload = {
    faculty: {
      name: faculty.name || 'Nil',
      staffNo: faculty.staff_no || 'Nil',
      designation: faculty.designation || 'Nil'
    },

    courseDetails: {
      semester: courseDetails.semester || 'Nil',
      academicYear: courseDetails.academicYear || 'Nil',
      courseCode: courseDetails.courseCode || 'Nil',
      courseTitle: courseDetails.courseTitle || 'Nil'
    },

    sections: sections.length > 0 ? sections : ['Nil'],

    hodRemarks: hodRemarks || 'Nil'
  };

  console.log('SAVED FACULTY PROGRESS DATA:', payload);
  alert('Progress saved successfully (check console)');
};


  if (!faculty) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 print:bg-white">

      {/* PRINT BUTTON */}
      <div className="mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-900 text-white px-4 py-2 rounded font-semibold"
        >
          Print Faculty Progress Report
        </button>
      </div>

      {/* REPORT PAGE */}
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-md print:shadow-none">

        {/* HEADER */}
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-xl font-bold uppercase">
            Vel Tech High Tech Dr.Rangarajan Dr.Sakunthala Engineering College
          </h1>
          <p className="text-sm font-semibold mt-1">
            Department of Artificial Intelligence and Data Science
          </p>
          <p className="text-xs font-medium mt-1">
            Faculty Academic Progress Report (HOD Review)
          </p>
        </div>

        {/* FACULTY DETAILS */}
        <div className="border p-4 mb-6 text-sm">
          <h2 className="font-bold underline mb-3">Faculty Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <p><b>Name:</b> {faculty.name}</p>
            <p><b>Staff No:</b> {faculty.staff_no}</p>
            <p><b>Designation:</b> {faculty.designation}</p>
            <p><b>Date of Joining:</b> {faculty.doj}</p>
          </div>
        </div>

        {/* COURSE DETAILS */}
        <div className="border p-4 mb-6 text-sm">
          <h2 className="font-bold underline mb-3">Course Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2"
              placeholder="Semester"
              value={courseDetails.semester}
              onChange={(e) =>
                setCourseDetails({ ...courseDetails, semester: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Academic Year"
              value={courseDetails.academicYear}
              onChange={(e) =>
                setCourseDetails({ ...courseDetails, academicYear: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Course Code"
              value={courseDetails.courseCode}
              onChange={(e) =>
                setCourseDetails({ ...courseDetails, courseCode: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Course Title"
              value={courseDetails.courseTitle}
              onChange={(e) =>
                setCourseDetails({ ...courseDetails, courseTitle: e.target.value })
              }
            />
          </div>
        </div>

        {/* SECTION SELECT */}
        <div className="border p-4 mb-6 text-sm print:hidden">
          <h2 className="font-bold underline mb-3">Select Section</h2>
          <select
            className="border p-2"
            defaultValue=""
            onChange={(e) => handleSectionSelect(e.target.value)}
          >
            <option value="">-- Select Section --</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        {/* SECTION-WISE CONTENT */}
        {sections.map((section) => (
          <div key={section} className="mb-12 border p-4">

            {/* SECTION HEADER + DELETE */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm uppercase">
                Section {section}
              </h3>
              <button
                onClick={() => handleDeleteSection(section)}
                className="text-red-600 text-xs font-bold print:hidden"
              >
                Delete Section
              </button>
            </div>

            {/* TABLE 1 */}
            <h3 className="font-bold text-sm mb-2 uppercase">
              Unit-wise Progress
            </h3>

            <table className="w-full border-collapse border text-sm mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Units</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Start Date</th>
                  <th className="border p-2">Completed Date</th>
                </tr>
              </thead>
              <tbody>
                {['Unit-1','Unit-2','Unit-3','Unit-4','Unit-5'].map((unit) => (
                  <tr key={unit}>
                    <td className="border p-2 font-semibold">{unit}</td>
                    <td className="border p-2">
                      <input className="w-full border-none outline-none" />
                    </td>
                    <td className="border p-2">
                      <input type="date" className="w-full border-none outline-none" />
                    </td>
                    <td className="border p-2">
                      <input type="date" className="w-full border-none outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TABLE 2 */}
            <h3 className="font-bold text-sm mb-2 uppercase">
              Progress Coverage Checklist
            </h3>

            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Progress Type</th>
                  <th className="border p-2">Unit-1</th>
                  <th className="border p-2">Unit-2</th>
                  <th className="border p-2">Unit-3</th>
                  <th className="border p-2">Unit-4</th>
                  <th className="border p-2">Unit-5</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'Notes',
                  'Question Bank',
                  'Assignment',
                  'Videos',
                  'YouTube Link'
                ].map((type) => (
                  <tr key={type}>
                    <td className="border p-2 font-semibold">{type}</td>
                    {[1,2,3,4,5].map((u) => (
                      <td key={u} className="border p-2 text-center">
                        <input type="checkbox" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        ))}

        {/* HOD REMARKS */}
        <div className="border p-4 mb-10">
          <p className="font-bold mb-2">
            Overall Faculty Performance Remarks (HOD):
          </p>

          <textarea
            className="w-full h-24 border p-2 outline-none resize-none"
            placeholder="Enter overall remarks here..."
            value={hodRemarks}
            onChange={(e) => setHodRemarks(e.target.value)}
          />
        </div>


        {/* SIGNATURES */}
        <div className="grid grid-cols-2 gap-6 text-sm mt-12">
          <div className="text-center">
            <div className="border-t pt-2">Faculty Signature</div>
          </div>
          <div className="text-center">
            <div className="border-t pt-2">HOD Signature</div>
          </div>
        </div>

        {/* ✅ SAVE BUTTON AT VERY BOTTOM */}
        <div className="text-center mt-10 print:hidden">
          <button
            onClick={handleSave}
            className="bg-green-700 text-white px-6 py-3 rounded font-bold"
          >
            Save Faculty Progress
          </button>
        </div>

      </div>
    </div>
  );
}
