import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function StudentDashboard({ user, onLogout }) {
const [activeModule, setActiveModule] = useState("");

const [attendance, setAttendance] = useState([]);
const [fees, setFees] = useState([]);
const [materials, setMaterials] = useState([]);
const [exams, setExams] = useState([]);
const [marks, setMarks] = useState([]);
const [notices, setNotices] = useState([]);

const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

const modules = [
{
id: "attendance",
title: "My Attendance",
description: "View your attendance records.",
icon: "📋",
color: "text-blue-700",
},
{
id: "fees",
title: "My Fees",
description: "View your fee and payment details.",
icon: "💰",
color: "text-green-700",
},
{
id: "materials",
title: "Study Materials",
description: "Access your study materials.",
icon: "📚",
color: "text-purple-700",
},
{
id: "exams",
title: "Exams & Marks",
description: "View examinations and marks.",
icon: "📝",
color: "text-orange-700",
},
{
id: "notices",
title: "Notices",
description: "Read important notices.",
icon: "📢",
color: "text-indigo-700",
},
];

const selectedModule = modules.find(
(module) => module.id === activeModule
);

async function fetchData(endpoint, protectedRoute = false) {
const token = localStorage.getItem("token");

if (protectedRoute && !token) {
  throw new Error("Login session expired. Please login again.");
}

const headers = {};

if (protectedRoute) {
  headers.Authorization = `Bearer ${token}`;
}

const response = await fetch(`${API}${endpoint}`, {
  method: "GET",
  headers,
});

const data = await response.json().catch(() => null);

if (!response.ok) {
  throw new Error(
    data?.message || `API Error: ${response.status}`
  );
}

return data;

}

useEffect(() => {
if (!activeModule) return;

let cancelled = false;

async function loadModule() {
  setLoading(true);
  setErrorMessage("");

  try {
    let data;

    switch (activeModule) {
      case "attendance": {
        data = await fetchData("/attendance/my", true);

        if (!Array.isArray(data)) {
          throw new Error("Invalid attendance response.");
        }

        if (!cancelled) {
          setAttendance(data);
        }

        break;
      }

      case "fees": {
        data = await fetchData("/fees", true);

        if (!Array.isArray(data)) {
          throw new Error("Invalid fees response.");
        }

        if (!cancelled) {
          setFees(data);
        }

        break;
      }

      case "materials": {
        data = await fetchData("/study-materials", true);

        if (!Array.isArray(data)) {
          throw new Error("Invalid study materials response.");
        }

        if (!cancelled) {
          setMaterials(data);
        }

        break;
      }

      case "exams": {
        const results = await Promise.all([
          fetchData("/exams", true),
          fetchData("/marks/parent", true),
        ]);

        const examsData = Array.isArray(results[0])
          ? results[0]
          : Array.isArray(results[0]?.exams)
            ? results[0].exams
            : null;

        const marksData = results[1];

        const studentMarks = Array.isArray(marksData)
          ? marksData
          : Array.isArray(marksData?.marks)
            ? marksData.marks
            : null;

        if (!examsData) {
          throw new Error(
            "Exams API returned an unexpected response. Please check the backend."
          );
        }

        if (!studentMarks) {
          throw new Error(
            "Marks API returned an unexpected response. Please check the backend."
          );
        }

        if (!cancelled) {
          setExams(examsData);
          setMarks(studentMarks);
        }

        break;
      }

      case "notices": {
        data = await fetchData("/notices", true);

        if (!Array.isArray(data)) {
          throw new Error("Invalid notices response.");
        }

        if (!cancelled) {
          setNotices(data);
        }

        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`${activeModule} error:`, error);

    if (!cancelled) {
      setErrorMessage(
        error.message || "Unable to load data."
      );
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

loadModule();

return () => {
  cancelled = true;
};

}, [activeModule]);

function goBack() {
setErrorMessage("");
setActiveModule("");
}

function formatDate(date) {
if (!date) return "-";

const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) return "-";

return parsedDate.toLocaleDateString("en-IN");

}

function renderEmpty(message) {
return (
<p className="rounded-lg bg-gray-50 p-4 text-gray-600">
{message}
</p>
);
}

if (selectedModule) {
return (
<div className="min-h-screen bg-gray-100 p-4 sm:p-6">
<div className="mx-auto max-w-6xl">
<button
type="button"
onClick={goBack}
className="mb-5 rounded-lg bg-gray-800 px-4 py-3 text-white hover:bg-gray-700"
>
← Back to Dashboard
</button>

      <div className="rounded-xl bg-white p-5 shadow sm:p-8">
        <div className="mb-3 text-4xl">
          {selectedModule.icon}
        </div>

        <h1
          className={`mb-2 text-2xl font-bold ${selectedModule.color}`}
        >
          {selectedModule.title}
        </h1>

        <p className="mb-6 text-gray-600">
          {selectedModule.description}
        </p>

        {loading && (
          <p className="mb-4 rounded-lg bg-blue-50 p-3">
            Loading data...
          </p>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p className="font-semibold">Unable to load data</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* ATTENDANCE */}
        {activeModule === "attendance" &&
          !loading &&
          !errorMessage &&
          (attendance.length === 0 ? (
            renderEmpty("No attendance records found.")
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="border p-3">Date</th>
                    <th className="border p-3">Student</th>
                    <th className="border p-3">Status</th>
                    <th className="border p-3">Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td className="border p-3">
                        {formatDate(record.date)}
                      </td>
                      <td className="border p-3">
                        {record.studentName || "-"}
                      </td>
                      <td className="border p-3">
                        <span
                          className={
                            record.status === "Present"
                              ? "font-semibold text-green-700"
                              : "font-semibold text-red-700"
                          }
                        >
                          {record.status || "-"}
                        </span>
                      </td>
                      <td className="border p-3">
                        {record.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {/* FEES */}
        {activeModule === "fees" &&
          !loading &&
          !errorMessage &&
          (fees.length === 0 ? (
            renderEmpty("No fee records found.")
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-green-50">
                  <tr>
                    <th className="border p-3">Course</th>
                    <th className="border p-3">Total</th>
                    <th className="border p-3">Paid</th>
                    <th className="border p-3">Due</th>
                    <th className="border p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee._id}>
                      <td className="border p-3">
                        {fee.course || "-"}
                      </td>
                      <td className="border p-3">
                        ₹{fee.totalAmount ?? 0}
                      </td>
                      <td className="border p-3">
                        ₹{fee.paidAmount ?? 0}
                      </td>
                      <td className="border p-3">
                        ₹{fee.dueAmount ?? 0}
                      </td>
                      <td className="border p-3">
                        {fee.status || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {/* STUDY MATERIALS */}
        {activeModule === "materials" &&
          !loading &&
          !errorMessage &&
          (() => {
            const activeMaterials = materials.filter(
              (item) => item.status === "Active"
            );

            if (activeMaterials.length === 0) {
              return renderEmpty(
                "No active study materials available."
              );
            }

            return (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeMaterials.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-lg border p-5"
                  >
                    <h2 className="text-lg font-bold">
                      {item.title || "Study Material"}
                    </h2>

                    <p>Subject: {item.subject || "-"}</p>
                    <p>Course: {item.course || "-"}</p>
                    <p>Type: {item.materialType || "-"}</p>

                    {item.description && (
                      <p className="mt-2 text-gray-600">
                        {item.description}
                      </p>
                    )}

                    {item.materialLink && (
                      <a
                        href={item.materialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Open Material
                      </a>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

        {/* EXAMS AND MARKS */}
        {activeModule === "exams" &&
          !loading &&
          !errorMessage && (
            <div className="space-y-8">
              <section>
                <h2 className="mb-4 text-xl font-bold">
                  Examinations
                </h2>

                {exams.length === 0 ? (
                  renderEmpty("No examinations available.")
                ) : (
                  <div className="space-y-3">
                    {exams.map((exam) => (
                      <div
                        key={exam._id}
                        className="rounded-lg border p-4"
                      >
                        <h3 className="font-semibold">
                          {exam.examName ||
                            exam.title ||
                            exam.name ||
                            "Examination"}
                        </h3>

                        <p>Subject: {exam.subject || "-"}</p>

                        {exam.date && (
                          <p>Date: {formatDate(exam.date)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-4 text-xl font-bold">
                  My Marks
                </h2>

                {marks.length === 0 ? (
                  renderEmpty("No marks records found.")
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-orange-50">
                        <tr>
                          <th className="border p-3">Exam</th>
                          <th className="border p-3">Subject</th>
                          <th className="border p-3">Obtained</th>
                          <th className="border p-3">Total</th>
                          <th className="border p-3">Percentage</th>
                          <th className="border p-3">Grade</th>
                        </tr>
                      </thead>

                      <tbody>
                        {marks.map((mark) => (
                          <tr key={mark._id}>
                            <td className="border p-3">
                              {mark.examName || "-"}
                            </td>
                            <td className="border p-3">
                              {mark.subject || "-"}
                            </td>
                            <td className="border p-3">
                              {mark.obtainedMarks ?? "-"}
                            </td>
                            <td className="border p-3">
                              {mark.totalMarks ?? "-"}
                            </td>
                            <td className="border p-3">
                              {mark.percentage != null
                                ? `${mark.percentage}%`
                                : "-"}
                            </td>
                            <td className="border p-3">
                              {mark.grade || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

        {/* NOTICES */}
        {activeModule === "notices" &&
          !loading &&
          !errorMessage &&
          (notices.length === 0 ? (
            renderEmpty("No notices available.")
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  className="rounded-lg border p-4"
                >
                  <h2 className="text-lg font-bold">
                    {notice.title || notice.subject || "Notice"}
                  </h2>

                  <p className="mt-2 whitespace-pre-wrap text-gray-700">
                    {notice.message ||
                      notice.description ||
                      notice.content ||
                      "No notice details available."}
                  </p>

                  {notice.date && (
                    <p className="mt-2 text-sm text-gray-500">
                      Date: {formatDate(notice.date)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  </div>
);

}

// MAIN DASHBOARD
return (
<div className="min-h-screen bg-gray-100 p-5 sm:p-8">
<div className="mx-auto max-w-6xl">
<header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow">
<div>
<h1 className="text-2xl font-bold text-gray-800">
Student Dashboard
</h1>

        <p className="mt-2 text-gray-600">
          Welcome, {user?.name || "Student"}!
        </p>

        <p className="text-sm text-gray-500">
          {user?.email || ""}
        </p>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
      >
        Logout
      </button>
    </header>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <button
          type="button"
          key={module.id}
          onClick={() => {
            setErrorMessage("");
            setActiveModule(module.id);
          }}
          className="rounded-xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-4 text-4xl">{module.icon}</div>

          <h2 className={`text-xl font-bold ${module.color}`}>
            {module.title}
          </h2>

          <p className="mt-2 text-gray-600">
            {module.description}
          </p>

          <span className="mt-5 inline-block font-semibold text-blue-600">
            Open Module →
          </span>
        </button>
      ))}
    </div>
  </div>
</div>

);
}

export default StudentDashboard;