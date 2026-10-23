import { useEffect, useState } from "react";

function ExamManagement({ onBack }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    examName: "",
    subject: "",
    course: "",
    examDate: "",
    totalMarks: "",
    passingMarks: "",
    description: "",
    status: "Scheduled",
  });

  const fetchExams = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://edubridge-backend-new.onrender.com/api/exams");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch exams");
      }

      setExams(data);
    } catch (error) {
      console.error("Fetch exams error:", error);
      setMessage("Unable to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      examName: "",
      subject: "",
      course: "",
      examDate: "",
      totalMarks: "",
      passingMarks: "",
      description: "",
      status: "Scheduled",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = editingId
        ? `https://edubridge-backend-new.onrender.com/api/exams/${editingId}`
        : "https://edubridge-backend-new.onrender.com/api/exams";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          totalMarks: Number(form.totalMarks),
          passingMarks: Number(form.passingMarks),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Operation failed");
        return;
      }

      setMessage(
        editingId
          ? "Exam updated successfully"
          : "Exam added successfully"
      );

      resetForm();
      fetchExams();
    } catch (error) {
      console.error("Exam save error:", error);
      setMessage("Unable to connect to server");
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);

    setForm({
      examName: exam.examName || "",
      subject: exam.subject || "",
      course: exam.course || "",
      examDate: exam.examDate
        ? exam.examDate.substring(0, 10)
        : "",
      totalMarks: exam.totalMarks || "",
      passingMarks: exam.passingMarks || "",
      description: exam.description || "",
      status: exam.status || "Scheduled",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `https://edubridge-backend-new.onrender.com/api/exams/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setMessage("Exam deleted successfully");
      fetchExams();
    } catch (error) {
      console.error("Delete exam error:", error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Exam Management</h1>
            <p className="text-blue-100">Manage exams and marks</p>
          </div>

          <button
            onClick={onBack}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            {editingId ? "Edit Exam" : "Add New Exam"}
          </h2>

          {message && (
            <div className="mb-5 rounded-lg bg-blue-100 p-3 font-semibold text-blue-700">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <input
              name="examName"
              value={form.examName}
              onChange={handleChange}
              placeholder="Exam Name"
              className="rounded-lg border p-3"
              required
            />

            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject"
              className="rounded-lg border p-3"
              required
            />

            <input
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Course / Class"
              className="rounded-lg border p-3"
              required
            />

            <input
              type="date"
              name="examDate"
              value={form.examDate}
              onChange={handleChange}
              className="rounded-lg border p-3"
              required
            />

            <input
              type="number"
              name="totalMarks"
              value={form.totalMarks}
              onChange={handleChange}
              placeholder="Total Marks"
              className="rounded-lg border p-3"
              min="1"
              required
            />

            <input
              type="number"
              name="passingMarks"
              value={form.passingMarks}
              onChange={handleChange}
              placeholder="Passing Marks"
              className="rounded-lg border p-3"
              min="0"
              required
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="rounded-lg border p-3 md:col-span-2"
              rows="3"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-lg border p-3"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
              >
                {editingId ? "Update Exam" : "Add Exam"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-gray-500 px-5 py-3 font-bold text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Exam Records
            </h2>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {exams.length} Exams
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading exams...</p>
          ) : exams.length === 0 ? (
            <p className="text-gray-500">
              No exam records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="p-3">Exam</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Marks</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((exam) => (
                    <tr
                      key={exam._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3 font-semibold">
                        {exam.examName}
                      </td>

                      <td className="p-3">
                        {exam.subject}
                      </td>

                      <td className="p-3">
                        {exam.course}
                      </td>

                      <td className="p-3">
                        {new Date(
                          exam.examDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="p-3">
                        {exam.passingMarks} / {exam.totalMarks}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            exam.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : exam.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(exam)}
                            className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(exam._id)
                            }
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
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
      </main>
    </div>
  );
}

export default ExamManagement;