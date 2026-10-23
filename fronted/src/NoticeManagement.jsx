import { useEffect, useState } from "react";

const API = "https://edubridge-backend-new.onrender.com/api/notices";

function NoticeManagement({ onBack }) {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [audience, setAudience] = useState("All");
  const [status, setStatus] = useState("Active");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // प्रत्येक request सोबत login token पाठवा
  const getHeaders = (json = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Login session expired. Please login again.");
    }

    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  const readResponse = async (response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message || `Request failed (${response.status})`
      );
    }

    return data;
  };

  // Notices मिळवा
  const fetchNotices = async () => {
    setLoading(true);

    try {
      const response = await fetch(API, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      if (!Array.isArray(data)) {
        throw new Error("Invalid notices response from server.");
      }

      setNotices(data);
      setError("");
    } catch (err) {
      console.error("Fetch notices error:", err);
      setError(err.message || "Unable to load notices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setNoticeDate("");
    setAudience("All");
    setStatus("Active");
    setEditingId(null);
    setError("");
  };

  // नवीन Notice तयार करा किंवा Update करा
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const noticeData = {
      title: title.trim(),
      message: message.trim(),
      noticeDate,
      audience,
      status,
    };

    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify(noticeData),
      });

      await readResponse(response);

      await fetchNotices();
      resetForm();
    } catch (err) {
      console.error("Save notice error:", err);
      setError(err.message || "Unable to save notice.");
    }
  };

  // Edit साठी फॉर्ममध्ये माहिती भरा
  const handleEdit = (notice) => {
    setTitle(notice.title || "");
    setMessage(notice.message || "");
    setNoticeDate(notice.noticeDate?.slice(0, 10) || "");
    setAudience(notice.audience || "All");
    setStatus(notice.status || "Active");
    setEditingId(notice._id);
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Notice Delete करा
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      await readResponse(response);

      if (editingId === id) {
        resetForm();
      }

      await fetchNotices();
    } catch (err) {
      console.error("Delete notice error:", err);
      setError(err.message || "Unable to delete notice.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notice Management</h1>
            <p className="text-blue-100">
              Manage notices and communication
            </p>
          </div>

          <button
            onClick={onBack}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700 hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            {editingId ? "Edit Notice" : "Add Notice"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block font-semibold text-gray-700">
                Notice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notice title"
                className="w-full rounded-lg border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-gray-700">
                Notice Date
              </label>
              <input
                type="date"
                value={noticeDate}
                onChange={(e) => setNoticeDate(e.target.value)}
                className="w-full rounded-lg border p-3"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block font-semibold text-gray-700">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notice message"
                rows={4}
                className="w-full rounded-lg border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-gray-700">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option value="All">All</option>
                <option value="Students">Students</option>
                <option value="Teachers">Teachers</option>
                <option value="Parents">Parents</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {editingId ? "Update Notice" : "Add Notice"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-gray-500 px-5 py-3 font-semibold text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Notice Records
            </h2>

            <button
              onClick={fetchNotices}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Title</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Audience</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && notices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      Loading notices...
                    </td>
                  </tr>
                ) : notices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No notices found.
                    </td>
                  </tr>
                ) : (
                  notices.map((notice) => (
                    <tr key={notice._id} className="border-b">
                      <td className="p-3 font-semibold text-gray-800">
                        {notice.title}
                      </td>

                      <td className="max-w-sm whitespace-normal break-words p-3 text-gray-600">
                        {notice.message}
                      </td>

                      <td className="whitespace-nowrap p-3 text-gray-600">
                        {notice.noticeDate?.slice(0, 10)}
                      </td>

                      <td className="p-3 text-gray-600">
                        {notice.audience}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            notice.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {notice.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="rounded-lg bg-yellow-500 px-3 py-2 font-semibold text-white hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(notice._id)}
                            className="rounded-lg bg-red-500 px-3 py-2 font-semibold text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NoticeManagement;