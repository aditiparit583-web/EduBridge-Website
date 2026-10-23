import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = "https://edubridge-backend-new.onrender.com/api";

function BatchManagement({ onBack }) {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    course: "",
    subject: "",
    teacherName: "",
    timetable: "",
    capacity: "",
    status: "Active",
  });

  const [editingId, setEditingId] = useState(null);

  const getAuthHeaders = (includeJson = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  const readResponse = async (response) => {
    const text = await response.text();

    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("The server returned an invalid response.");
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your session is invalid or expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error("You are not authorized to perform this action.");
      }

      throw new Error(
        data.message || `Request failed with status ${response.status}.`
      );
    }

    return data;
  };

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/batches`, {
        headers: getAuthHeaders(),
      });

      const data = await readResponse(response);

      setBatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch batches error:", error);
      setBatches([]);
      setError(error.message || "Unable to load batches.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/teachers`, {
        headers: getAuthHeaders(),
      });

      const data = await readResponse(response);

      const teacherList = Array.isArray(data)
        ? data
        : Array.isArray(data.teachers)
        ? data.teachers
        : [];

      setTeachers(
        teacherList.filter(
          (teacher) =>
            teacher &&
            teacher._id &&
            typeof teacher.name === "string" &&
            teacher.name.trim() &&
            teacher.status !== "Inactive"
        )
      );
    } catch (error) {
      console.error("Fetch teachers error:", error);
      setTeachers([]);
      setError((previous) =>
        previous
          ? `${previous} Teacher list: ${error.message}`
          : `Teacher list: ${error.message}`
      );
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
    fetchTeachers();
  }, [fetchBatches, fetchTeachers]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      course: "",
      subject: "",
      teacherName: "",
      timetable: "",
      capacity: "",
      status: "Active",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.course.trim() ||
      !formData.subject.trim() ||
      !formData.teacherName.trim() ||
      !formData.timetable.trim() ||
      formData.capacity === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const capacity = Number(formData.capacity);

    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    if (
      teachers.length > 0 &&
      !teachers.some(
        (teacher) => teacher.name === formData.teacherName
      )
    ) {
      setError("Please select a teacher from the available teacher list.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${API_BASE_URL}/batches/${editingId}`
        : `${API_BASE_URL}/batches`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name: formData.name.trim(),
          course: formData.course.trim(),
          subject: formData.subject.trim(),
          teacherName: formData.teacherName.trim(),
          timetable: formData.timetable.trim(),
          capacity,
          status: formData.status,
        }),
      });

      await readResponse(response);

      resetForm();
      await fetchBatches();

      window.alert(
        editingId
          ? "Batch updated successfully."
          : "Batch added successfully."
      );
    } catch (error) {
      console.error("Save batch error:", error);
      setError(error.message || "Unable to save the batch.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (batch) => {
    setError("");
    setEditingId(batch._id);

    setFormData({
      name: batch.name || "",
      course: batch.course || "",
      subject: batch.subject || "",
      teacherName: batch.teacherName || "",
      timetable: batch.timetable || "",
      capacity: batch.capacity ?? "",
      status: batch.status || "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this batch?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      await readResponse(response);

      if (editingId === id) {
        resetForm();
      }

      await fetchBatches();

      window.alert("Batch deleted successfully.");
    } catch (error) {
      console.error("Delete batch error:", error);
      setError(error.message || "Unable to delete the batch.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 rounded-lg bg-gray-700 px-5 py-2 font-semibold text-white hover:bg-gray-800"
          >
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            Batch Management
          </h1>

          <p className="mt-1 text-gray-600">
            Manage coaching batches, teachers, timetables, and capacity.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? "Update Batch" : "Add New Batch"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Batch Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Science Batch A"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Course *
                </label>

                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="Example: Class 10"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Subject *
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Example: Mathematics"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Teacher Name *
                </label>

                <select
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleChange}
                  required
                  disabled={teachersLoading || teachers.length === 0}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {teachersLoading
                      ? "Loading teachers..."
                      : teachers.length === 0
                      ? "No teachers available"
                      : "Select Teacher"}
                  </option>

                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher.name}>
                      {teacher.name}
                    </option>
                  ))}

                  {formData.teacherName &&
                    !teachers.some(
                      (teacher) =>
                        teacher.name === formData.teacherName
                    ) && (
                      <option value={formData.teacherName}>
                        {formData.teacherName} (Existing)
                      </option>
                    )}
                </select>

                {!teachersLoading && teachers.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    No active teachers were returned by the API. Check the
                    teacher endpoint and backend logs.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Timetable *
                </label>

                <input
                  type="text"
                  name="timetable"
                  value={formData.timetable}
                  onChange={handleChange}
                  placeholder="Example: Mon-Wed-Fri 5:00 PM"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Capacity *
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  placeholder="Example: 30"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || teachersLoading || teachers.length === 0}
                className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Batch"
                  : "Add Batch"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-gray-500 px-6 py-2.5 font-medium text-white hover:bg-gray-600"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  fetchBatches();
                  fetchTeachers();
                }}
                className="rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
              >
                Refresh Data
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Batch List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Total Batches: {batches.length}
            </p>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Loading batches...
            </p>
          ) : batches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center">
              <p className="text-gray-500">
                No batches found. Add your first batch above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {[
                      "Batch Name",
                      "Course",
                      "Subject",
                      "Teacher",
                      "Timetable",
                      "Capacity",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="border-b px-4 py-3 text-sm font-semibold text-gray-700"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch._id} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3 font-medium text-gray-800">
                        {batch.name}
                      </td>

                      <td className="border-b px-4 py-3 text-gray-600">
                        {batch.course}
                      </td>

                      <td className="border-b px-4 py-3 text-gray-600">
                        {batch.subject}
                      </td>

                      <td className="border-b px-4 py-3 text-gray-600">
                        {batch.teacherName}
                      </td>

                      <td className="border-b px-4 py-3 text-gray-600">
                        {batch.timetable}
                      </td>

                      <td className="border-b px-4 py-3 text-gray-600">
                        {batch.capacity}
                      </td>

                      <td className="border-b px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            batch.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>

                      <td className="border-b px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(batch)}
                            className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(batch._id)}
                            disabled={deletingId === batch._id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === batch._id
                              ? "Deleting..."
                              : "Delete"}
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
  );
}

export default BatchManagement;