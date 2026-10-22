import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

const modules = [
  { key: "attendance", title: "Child's Attendance", endpoint: "/attendance/my" },
  { key: "fees", title: "Fee Details", endpoint: "/fees" },
  { key: "marks", title: "Exams & Marks", endpoint: "/marks/parent" },
  { key: "materials", title: "Study Materials", endpoint: "/study-materials" },
  { key: "notices", title: "Notices", endpoint: "/notices" }
];

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString();
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function getRecords(result, key) {
  if (Array.isArray(result)) return result;

  if (key === "marks" && Array.isArray(result?.marks)) {
    return result.marks;
  }

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.records)) return result.records;

  return [];
}

export default function ParentDashboard({ user, onLogout }) {
  const [data, setData] = useState({
    attendance: [],
    fees: [],
    marks: [],
    materials: [],
    notices: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("attendance");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setErrors({
            general: "Session expired. Please log in again."
          });
          setLoading(false);
        }

        return;
      }

      const nextData = {};
      const nextErrors = {};

      await Promise.all(
        modules.map(async module => {
          try {
            const response = await fetch(
              `${API_BASE}${module.endpoint}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json"
                }
              }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(
                result.message || `Request failed (${response.status})`
              );
            }

            nextData[module.key] = getRecords(result, module.key);
          } catch (error) {
            nextData[module.key] = [];
            nextErrors[module.key] =
              error.message || "Failed to load data";
          }
        })
      );

      if (!cancelled) {
        setData(previous => ({ ...previous, ...nextData }));
        setErrors(nextErrors);
        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentModule = modules.find(
    module => module.key === activeModule
  );

  const records = data[activeModule] || [];

  function renderRecord(record, index) {
    const key = record._id || index;

    if (activeModule === "attendance") {
      return (
        <article key={key} className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">
            {displayValue(record.studentName)}
          </h3>
          <p>Date: {formatDate(record.date)}</p>
          <p>Status: {displayValue(record.status)}</p>
          <p>Remarks: {displayValue(record.remarks)}</p>
        </article>
      );
    }

    if (activeModule === "fees") {
      return (
        <article key={key} className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">
            {displayValue(record.studentName)}
          </h3>
          <p>Course: {displayValue(record.course)}</p>
          <p>Total Amount: ₹{displayValue(record.totalAmount)}</p>
          <p>Paid Amount: ₹{displayValue(record.paidAmount)}</p>
          <p>Due Amount: ₹{displayValue(record.dueAmount)}</p>
          <p>Status: {displayValue(record.status)}</p>
          <p>Payment Date: {formatDate(record.paymentDate)}</p>
          <p>Payment Mode: {displayValue(record.paymentMode)}</p>
          <p>Remarks: {displayValue(record.remarks)}</p>
        </article>
      );
    }

    if (activeModule === "marks") {
      return (
        <article key={key} className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">
            {displayValue(record.studentName)}
          </h3>
          <p>Exam: {displayValue(record.examName)}</p>
          <p>Subject: {displayValue(record.subject)}</p>
          <p>Total Marks: {displayValue(record.totalMarks)}</p>
          <p>Obtained Marks: {displayValue(record.obtainedMarks)}</p>
          <p>Percentage: {displayValue(record.percentage)}%</p>
          <p>Grade: {displayValue(record.grade)}</p>
          <p>Remarks: {displayValue(record.remarks)}</p>
        </article>
      );
    }

    if (activeModule === "materials") {
      return (
        <article key={key} className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">
            {displayValue(record.title)}
          </h3>
          <p>Subject: {displayValue(record.subject)}</p>
          <p>Course: {displayValue(record.course)}</p>
          <p>Batch: {displayValue(record.batch)}</p>
          <p>Type: {displayValue(record.materialType)}</p>
          <p>Description: {displayValue(record.description)}</p>

          {record.materialLink && (
            <a
              href={record.materialLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-blue-600 underline"
            >
              Open Material
            </a>
          )}
        </article>
      );
    }

    if (activeModule === "notices") {
      return (
        <article key={key} className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">
            {displayValue(record.title)}
          </h3>
          <p>Date: {formatDate(record.noticeDate)}</p>
          <p className="mt-2 whitespace-pre-wrap">
            {displayValue(record.message)}
          </p>
        </article>
      );
    }

    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              EduBridge
            </h1>
            <p className="text-gray-600">Parent Dashboard</p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Welcome, {user?.name || "Parent"}
          </h2>
          <p className="text-gray-600">
            Email: {user?.email || "-"}
          </p>
          <p className="text-gray-600">Role: Parent</p>

          {errors.general && (
            <p className="mt-3 text-red-600">{errors.general}</p>
          )}
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map(module => (
            <button
              type="button"
              key={module.key}
              onClick={() => setActiveModule(module.key)}
              className={`rounded-xl p-4 text-left shadow ${
                activeModule === module.key
                  ? "bg-blue-700 text-white"
                  : "bg-white text-gray-800 hover:bg-blue-50"
              }`}
            >
              <h3 className="font-semibold">{module.title}</h3>
              <p className="mt-2 text-sm">
                {data[module.key].length} record(s)
              </p>
            </button>
          ))}
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              {currentModule?.title}
            </h2>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600">
              Loading dashboard data...
            </p>
          ) : errors[activeModule] ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <p className="font-semibold">
                Unable to load this section.
              </p>
              <p>{errors[activeModule]}</p>
            </div>
          ) : records.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-gray-600">
              No records found. Check the linked student and database records.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {records.map(renderRecord)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}