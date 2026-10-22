import { useEffect, useState } from "react";

function StudentManagement({ onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";

      const payload = token.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(normalized));

      return decoded.role || "";
    } catch {
      return "";
    }
  };

  const isAdmin = getUserRole() === "Admin";

  const initialFormData = {
    name: "",
    email: "",
    password: "",
    phone: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    course: "",
    batch: "",
    admissionDate: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(initialFormData);

  const getHeaders = (json = false) => {
    const token = localStorage.getItem("token");

    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const parseResponse = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const resetForm = () => {
    setFormData({ ...initialFormData });
    setEditingStudentId(null);
    setShowPassword(false);
    setShowForm(false);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!localStorage.getItem("token")) {
        throw new Error("Login session not found. Please log in again.");
      }

      const response = await fetch("http://localhost:5000/api/students", {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load students.");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.students)
        ? data.students
        : [];

      setStudents(list);
    } catch (error) {
      console.error("Fetch students error:", error);
      setStudents([]);
      setMessage(error.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Student name is required.");
      return;
    }

    if (isAdmin) {
      if (!formData.email.trim()) {
        setMessage("Student email is required.");
        return;
      }

      if (!formData.password) {
        setMessage("Please enter a password for the student.");
        return;
      }

      if (formData.password.length < 8) {
        setMessage("Password must be at least 8 characters.");
        return;
      }
    }

    if (!localStorage.getItem("token")) {
      setMessage("Login session not found. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        parentEmail: formData.parentEmail.trim().toLowerCase(),
      };

      if (!isAdmin) {
        delete payload.password;
      }

      const response = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add student.");
      }

      resetForm();
      setMessage(data.message || "Student added successfully.");
      await fetchStudents();
    } catch (error) {
      console.error("Add student error:", error);
      setMessage(error.message || "Unable to add student.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudentId(student._id);

    setFormData({
      name: student.name || "",
      email: student.email || "",
      password: "",
      phone: student.phone || "",
      parentName: student.parentName || "",
      parentEmail: student.parentEmail || "",
      parentPhone: student.parentPhone || "",
      dateOfBirth: student.dateOfBirth
        ? String(student.dateOfBirth).slice(0, 10)
        : "",
      gender: student.gender || "Male",
      address: student.address || "",
      course: student.course || "",
      batch: student.batch || "",
      admissionDate: student.admissionDate
        ? String(student.admissionDate).slice(0, 10)
        : "",
      status: student.status || "Active",
    });

    setShowPassword(false);
    setShowForm(true);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateStudent = async (event) => {
  event.preventDefault();

  if (!formData.name.trim()) {
    setMessage("Student name is required.");
    return;
  }

  if (!editingStudentId) {
    setMessage("Student ID is missing.");
    return;
  }

  if (!localStorage.getItem("token")) {
    setMessage("Login session not found. Please log in again.");
    return;
  }

  try {
    setSaving(true);
    setMessage("");

    const updateData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth || undefined,
      admissionDate: formData.admissionDate || undefined,
    };

    // Keep the old password if the field is empty.
    // Send the new password only when one is entered.
    if (!updateData.password || !updateData.password.trim()) {
      delete updateData.password;
    }

    const response = await fetch(
      `http://localhost:5000/api/students/${editingStudentId}`,
      {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(updateData),
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to update student.");
    }

    resetForm();
    setMessage(data.message || "Student updated successfully.");
    await fetchStudents();
  } catch (error) {
    console.error("Update student error:", error);
    setMessage(error.message || "Unable to update student.");
  } finally {
    setSaving(false);
  }
};
  const handleDeleteStudent = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    if (!localStorage.getItem("token")) {
      setMessage("Login session not found. Please log in again.");
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/students/${studentId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete student.");
      }

      if (editingStudentId === studentId) resetForm();

      setMessage(data.message || "Student deleted successfully.");
      await fetchStudents();
    } catch (error) {
      console.error("Delete student error:", error);
      setMessage(error.message || "Unable to delete student.");
    }
  };

  const handleOpenForm = () => {
    if (showForm) {
      resetForm();
      return;
    }

    setFormData({ ...initialFormData });
    setEditingStudentId(null);
    setShowPassword(false);
    setShowForm(true);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">
                Student Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage student records
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onBack}
                className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold"
              >
                ← Back to Dashboard
              </button>

              <button
                type="button"
                onClick={fetchStudents}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={handleOpenForm}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
              >
                {showForm ? "Close Form" : "+ Add Student"}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`rounded-lg p-4 mb-6 border ${
              /successfully|created successfully/i.test(message)
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingStudentId ? "Edit Student" : "Add New Student"}
            </h2>

            <form
              onSubmit={
                editingStudentId
                  ? handleUpdateStudent
                  : handleAddStudent
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Email {isAdmin && !editingStudentId ? "*" : ""}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required={isAdmin && !editingStudentId}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                {isAdmin && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Student Login Password *
                    </label>

                    <div className="flex">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        minLength={8}
                        autoComplete="new-password"
                        required
                        className="w-full border border-gray-300 rounded-l-lg px-4 py-3"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="border border-gray-300 border-l-0 rounded-r-lg px-4 py-3 bg-gray-100 hover:bg-gray-200 font-semibold"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      Give this password to the student for login.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Enter parent name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    placeholder="Enter parent's registered email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Enter parent phone"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Example: Science"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Batch
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    placeholder="Example: Morning Batch"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="block font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter student address"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {saving
                    ? "Saving..."
                    : editingStudentId
                    ? "Update Student"
                    : "Add Student"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Student List
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No students found</p>
              <p className="text-gray-400 mt-2">
                Click "+ Add Student" to add a student.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Phone",
                      "Course",
                      "Batch",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="text-left px-6 py-4 text-sm font-semibold text-gray-600"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {student.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.course || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.batch || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            student.status === "Inactive"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {student.status || "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditStudent(student)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
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
  );
}

export default StudentManagement;