import { useEffect, useState } from "react";

function TeacherManagement({ onBack }) {
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    qualification: "",
    experience: "",
    address: "",
    joiningDate: "",
    status: "Active",
  });

  const fetchTeachers = async () => {
    try {
      const response = await fetch(
        "https://edubridge-backend-new.onrender.com/api/teachers"
      );

      const data = await response.json();

      if (response.ok) {
        setTeachers(data);
      } else {
        setMessage(data.message || "Failed to load teachers");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      qualification: "",
      experience: "",
      address: "",
      joiningDate: "",
      status: "Active",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `https://edubridge-backend-new.onrender.com/api/teachers/${editingId}`
        : "https://edubridge-backend-new.onrender.com/api/teachers";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          experience: form.experience
            ? Number(form.experience)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Operation failed");
        return;
      }

      setMessage(
        editingId
          ? "Teacher updated successfully"
          : "Teacher added successfully"
      );

      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  const handleEdit = (teacher) => {
setEditingId(teacher._id);

setForm({
name: teacher.name || "",
email: teacher.email || "",
password: "",
phone: teacher.phone || "",
subject: teacher.subject || "",
qualification: teacher.qualification || "",
experience: teacher.experience ?? "",
address: teacher.address || "",
joiningDate: teacher.joiningDate
? teacher.joiningDate.substring(0, 10)
: "",
status: teacher.status || "Active",
});

setMessage("");
};

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `https://edubridge-backend-new.onrender.com/api/teachers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setMessage("Teacher deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchTeachers();
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
              Teacher Management
            </h1>

            <p className="text-slate-500">
              Manage teacher records
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
              {editingId ? "Edit Teacher" : "Add Teacher"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                type="text"
                name="name"
                placeholder="Teacher Name *"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder={
      editingId
        ? "New Password (leave blank to keep current)"
        : "Password (minimum 8 characters) *"
    }
    value={form.password || ""}
    onChange={handleChange}
    minLength={form.password ? 8 : undefined}
    required={!editingId}
    autoComplete="new-password"
    className="w-full rounded border p-2 pr-20"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600"
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject *"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <input
                type="text"
                name="qualification"
                placeholder="Qualification"
                value={form.qualification}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <input
                type="number"
                name="experience"
                placeholder="Experience (Years)"
                min="0"
                value={form.experience}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <textarea
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded border p-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  {editingId ? "Update Teacher" : "Add Teacher"}
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
              Teacher List
            </h2>

            {teachers.length === 0 ? (
              <p className="text-slate-500">
                No teachers found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="p-3">Name</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Experience</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {teachers.map((teacher) => (
                      <tr
                        key={teacher._id}
                        className="border-b"
                      >
                        <td className="p-3 font-semibold">
                          {teacher.name}
                        </td>

                        <td className="p-3">
                          {teacher.subject}
                        </td>

                        <td className="p-3">
                          {teacher.phone || "-"}
                        </td>

                        <td className="p-3">
                          {teacher.experience !== undefined &&
                          teacher.experience !== null
                            ? `${teacher.experience} years`
                            : "-"}
                        </td>

                        <td className="p-3">
                          <span
                            className={
                              teacher.status === "Active"
                                ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                                : "rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                            }
                          >
                            {teacher.status}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                handleEdit(teacher)
                              }
                              className="rounded bg-yellow-500 px-3 py-1 text-white"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(teacher._id)
                              }
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

export default TeacherManagement;