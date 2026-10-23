import { useEffect, useState } from "react";

function AttendanceManagement({ onBack }) {
  const [attendance, setAttendance] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    studentName: "",
    date: "",
    status: "Present",
    remarks: "",
  });

  const getToken = () => localStorage.getItem("token");

  const getHeaders = (includeJson = false) => {
    const token = getToken();

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        "https://edubridge-backend-new.onrender.com/api/attendance",
        { headers: getHeaders() }
      );

      const data = await response.json();

      if (response.ok) {
        setAttendance(Array.isArray(data) ? data : []);
      } else {
        setMessage(data.message || "Failed to load attendance");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      studentName: "",
      date: "",
      status: "Present",
      remarks: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!getToken()) {
      setMessage("Please login again. Login token not found.");
      return;
    }

    try {
      const url = editingId
        ? `https://edubridge-backend-new.onrender.com/api/attendance/${editingId}`
        : "https://edubridge-backend-new.onrender.com/api/attendance";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Operation failed");
        return;
      }

      setMessage(
        editingId
          ? "Attendance updated successfully"
          : "Attendance added successfully"
      );

      resetForm();
      await fetchAttendance();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);

    setForm({
      studentName: record.studentName || "",
      date: record.date ? record.date.substring(0, 10) : "",
      status: record.status || "Present",
      remarks: record.remarks || "",
    });

    setMessage("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) return;

    if (!getToken()) {
      setMessage("Please login again. Login token not found.");
      return;
    }

    try {
      const response = await fetch(
        `https://edubridge-backend-new.onrender.com/api/attendance/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setMessage("Attendance deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await fetchAttendance();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Attendance Management
            </h1>
            <p className="text-slate-500">
              Manage student attendance records
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white"
            >
              Back to Dashboard
            </button>
          )}
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-blue-100 p-3 font-semibold text-blue-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-slate-800">
              {editingId ? "Edit Attendance" : "Mark Attendance"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="studentName"
                placeholder="Student Name *"
                value={form.studentName}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded border p-2"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>

              <textarea
                name="remarks"
                placeholder="Remarks"
                value={form.remarks}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  {editingId ? "Update Attendance" : "Mark Attendance"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-slate-800">
              Attendance List
            </h2>

            {attendance.length === 0 ? (
              <p className="text-slate-500">
                No attendance records found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="p-3">Student</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Remarks</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record._id} className="border-b">
                        <td className="p-3 font-semibold">
                          {record.studentName}
                        </td>

                        <td className="p-3">
                          {record.date
                            ? new Date(record.date).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-3">
                          <span
                            className={
                              record.status === "Present"
                                ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                                : record.status === "Absent"
                                ? "rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                                : "rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700"
                            }
                          >
                            {record.status}
                          </span>
                        </td>

                        <td className="p-3">{record.remarks || "-"}</td>

                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="rounded bg-yellow-500 px-3 py-1 text-white"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(record._id)}
                              className="rounded bg-red-600 px-3 py-1 text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceManagement;