import { useEffect, useState } from "react";

const API = "https://edubridge-backend-new.onrender.com/api/marks";

const initialForm = {
  studentName: "",
  examName: "",
  subject: "",
  totalMarks: "",
  obtainedMarks: "",
  remarks: "",
};

function getHeaders(json = false) {
  const token = localStorage.getItem("token");

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readResponse(response) {
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server response is not valid JSON");
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function getUniqueMarks(items) {
  const unique = new Map();

  items.forEach((mark) => {
    if (mark?._id) {
      unique.set(String(mark._id), mark);
    }
  });

  return Array.from(unique.values());
}

  export default function MarkManagement({ onBack }) {
  const [marks, setMarks] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 async function fetchMarks() {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(API, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await readResponse(response);

    console.log("GET /api/marks response:", data);

    const fetchedMarks = Array.isArray(data)
      ? data
      : Array.isArray(data.marks)
      ? data.marks
      : [];

    console.log("Number of marks received:", fetchedMarks.length);

    const uniqueMarks = Array.from(
      new Map(
        fetchedMarks
          .filter((mark) => mark && mark._id)
          .map((mark) => [String(mark._id), mark])
      ).values()
    );

    setMarks(uniqueMarks);

    if (uniqueMarks.length === 0) {
      setMessage("API connected, but no marks were returned.");
    }
  } catch (err) {
    console.error("Fetch marks error:", err);
    setError(err.message || "Failed to load marks.");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchMarks();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.studentName.trim() ||
      !formData.examName.trim() ||
      !formData.subject.trim() ||
      formData.totalMarks === "" ||
      formData.obtainedMarks === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const total = Number(formData.totalMarks);
    const obtained = Number(formData.obtainedMarks);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(obtained) ||
      total <= 0 ||
      obtained < 0 ||
      obtained > total
    ) {
      setError("Enter valid marks. Obtained marks cannot exceed total marks.");
      return;
    }

    const payload = {
      ...formData,
      studentName: formData.studentName.trim(),
      examName: formData.examName.trim(),
      subject: formData.subject.trim(),
      totalMarks: total,
      obtainedMarks: obtained,
      remarks: formData.remarks.trim(),
    };

    try {
      setLoading(true);

      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: getHeaders(true),
          body: JSON.stringify(payload),
        }
      );

      const data = await readResponse(response);

      setMessage(data.message || "Mark saved successfully.");

      // पुन्हा त्याच mark ला manually list मध्ये add करू नका.
      // Backend मधून यादी पुन्हा आणा.
      resetForm();
      await fetchMarks();
    } catch (err) {
      setError(err.message || "Failed to save marks.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(mark) {
    setEditingId(mark._id);

    setFormData({
      studentName: mark.studentName || "",
      examName: mark.examName || "",
      subject: mark.subject || "",
      totalMarks: String(mark.totalMarks ?? ""),
      obtainedMarks: String(mark.obtainedMarks ?? ""),
      remarks: mark.remarks || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete these marks?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      setMessage(data.message || "Mark deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchMarks();
    } catch (err) {
      setError(err.message || "Failed to delete mark.");
    } finally {
      setLoading(false);
    }
  }

  return (
   <div className="p-6">
  <div className="mb-6 flex flex-wrap items-center gap-4">
    <button
      type="button"
      onClick={onBack}
      className="rounded-lg bg-gray-700 px-5 py-2 font-semibold text-white hover:bg-gray-800"
    >
      ← Back to Dashboard
    </button>

    <h1 className="text-2xl font-bold">Mark Management</h1>
  </div>

      {message && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 gap-4 rounded-lg bg-white p-5 shadow md:grid-cols-2"
      >
        <div>
          <label className="mb-1 block font-medium">Student Name *</label>
          <input
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className="w-full rounded border p-2"
            placeholder="Enter exact student name"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Exam Name *</label>
          <input
            name="examName"
            value={formData.examName}
            onChange={handleChange}
            className="w-full rounded border p-2"
            placeholder="e.g. Unit Test 1"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Subject *</label>
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full rounded border p-2"
            placeholder="Enter subject"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Total Marks *</label>
          <input
            type="number"
            name="totalMarks"
            value={formData.totalMarks}
            onChange={handleChange}
            className="w-full rounded border p-2"
            min="1"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Obtained Marks *</label>
          <input
            type="number"
            name="obtainedMarks"
            value={formData.obtainedMarks}
            onChange={handleChange}
            className="w-full rounded border p-2"
            min="0"
            max={formData.totalMarks || undefined}
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Remarks</label>
          <input
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full rounded border p-2"
            placeholder="Optional remarks"
          />
        </div>

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : editingId
              ? "Update Mark"
              : "Add Mark"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded bg-gray-500 px-5 py-2 text-white"
            >
              Cancel Edit
            </button>
          )}

          <button
            type="button"
            onClick={fetchMarks}
            disabled={loading}
            className="rounded bg-gray-700 px-5 py-2 text-white disabled:opacity-50"
          >
            Refresh List
          </button>
        </div>
      </form>

      <h2 className="mb-4 text-xl font-semibold">Marks List</h2>

      {loading && <p className="mb-3">Loading marks...</p>}

      {!loading && marks.length === 0 && !error && (
        <p className="rounded bg-gray-100 p-4">
          No marks found. Add marks using the form above.
        </p>
      )}

      {marks.length > 0 && (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3">Student</th>
                <th className="border p-3">Exam</th>
                <th className="border p-3">Subject</th>
                <th className="border p-3">Marks</th>
                <th className="border p-3">Percentage</th>
                <th className="border p-3">Grade</th>
                <th className="border p-3">Remarks</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {marks.map((mark, index) => (
                <tr key={mark._id || `mark-row-${index}`}>
                  <td className="border p-3">{mark.studentName || "-"}</td>
                  <td className="border p-3">{mark.examName || "-"}</td>
                  <td className="border p-3">{mark.subject || "-"}</td>
                  <td className="border p-3">
                    {mark.obtainedMarks ?? 0} / {mark.totalMarks ?? 0}
                  </td>
                  <td className="border p-3">{mark.percentage ?? 0}%</td>
                  <td className="border p-3">{mark.grade || "-"}</td>
                  <td className="border p-3">{mark.remarks || "-"}</td>

                  <td className="border p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(mark)}
                        className="rounded bg-yellow-500 px-3 py-1 text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(mark._id)}
                        disabled={!mark._id || loading}
                        className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
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
  );
}