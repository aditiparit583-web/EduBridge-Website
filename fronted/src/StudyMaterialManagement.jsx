import { useEffect, useState } from "react";

function StudyMaterialManagement({onBack})
{
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    course: "",
    materialType: "Notes",
    description: "",
    materialLink: "",
    status: "Active",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

 const fetchMaterials = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "https://edubridge-backend-new.onrender.com/api/study-materials",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Study materials load झाले नाहीत");
      return;
    }

    setMaterials(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Fetch materials error:", error);
    setMessage("Server connection error");
  }
};
  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `https://edubridge-backend-new.onrender.com/api/study-materials/${editingId}`
        : "https://edubridge-backend-new.onrender.com/api/study-materials";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      setMessage(
        editingId
          ? "Study material updated successfully!"
          : "Study material added successfully!"
      );

      setFormData({
        title: "",
        subject: "",
        course: "",
        materialType: "Notes",
        description: "",
        materialLink: "",
        status: "Active",
      });

      setEditingId(null);
      fetchMaterials();
    } catch (error) {
      console.error("Save material error:", error);
      setMessage("Server connection error");
    }
  };

  const handleEdit = (material) => {
    setEditingId(material._id);

    setFormData({
      title: material.title || "",
      subject: material.subject || "",
      course: material.course || "",
      materialType: material.materialType || "Notes",
      description: material.description || "",
      materialLink: material.materialLink || "",
      status: material.status || "Active",
    });

    setMessage("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this study material?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://edubridge-backend-new.onrender.com/api/study-materials/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setMessage("Study material deleted successfully!");
      fetchMaterials();
    } catch (error) {
      console.error("Delete material error:", error);
      setMessage("Server connection error");
    }
  };

  const handleCancel = () => {
    setEditingId(null);

    setFormData({
      title: "",
      subject: "",
      course: "",
      materialType: "Notes",
      description: "",
      materialLink: "",
      status: "Active",
    });

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
  <button
    type="button"
    onClick={onBack}
    className="rounded-lg bg-gray-700 px-5 py-2 font-semibold text-white hover:bg-gray-800"
  >
    ← Back to Dashboard
  </button>
</div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Study Material Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage notes, assignments and study resources
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-white border border-gray-300 px-4 py-3 text-gray-700">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-5">
            {editingId ? "Edit Study Material" : "Add Study Material"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="title"
              placeholder="Material Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="course"
              placeholder="Course"
              value={formData.course}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-2"
            />

            <select
              name="materialType"
              value={formData.materialType}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
            >
              <option value="Notes">Notes</option>
              <option value="Assignment">Assignment</option>
              <option value="Video">Video</option>
              <option value="PDF">PDF</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 md:col-span-2"
              rows="3"
            />

            <input
              type="text"
              name="materialLink"
              placeholder="Material Link"
              value={formData.materialLink}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                {editingId ? "Update Material" : "Add Material"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-400 px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">
            Study Material Records
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-3 text-left">Title</th>
                  <th className="border px-3 py-3 text-left">Subject</th>
                  <th className="border px-3 py-3 text-left">Course</th>
                  <th className="border px-3 py-3 text-left">Type</th>
                  <th className="border px-3 py-3 text-left">Status</th>
                  <th className="border px-3 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="border px-3 py-6 text-center text-gray-500"
                    >
                      No study material records found.
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material._id}>
                      <td className="border px-3 py-3">
                        {material.title}
                      </td>

                      <td className="border px-3 py-3">
                        {material.subject}
                      </td>

                      <td className="border px-3 py-3">
                        {material.course}
                      </td>

                      <td className="border px-3 py-3">
                        {material.materialType}
                      </td>

                      <td className="border px-3 py-3">
                        {material.status}
                      </td>

                      <td className="border px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(material)}
                            className="border border-gray-500 px-3 py-1 rounded"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(material._id)}
                            className="bg-black text-white px-3 py-1 rounded"
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
      </div>
    </div>
  );
}

export default StudyMaterialManagement;