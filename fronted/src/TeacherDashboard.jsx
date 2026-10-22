function TeacherDashboard({ user, onLogout, onOpenModule }) {
  const modules = [
    {
      id: "students",
      title: "Student Management",
      description: "View and manage student information.",
      color: "text-blue-700",
      icon: "👨‍🎓",
    },
    {
      id: "attendance",
      title: "Attendance",
      description: "Manage student attendance.",
      color: "text-green-700",
      icon: "📋",
    },
    {
      id: "marks",
      title: "Exams & Marks",
      description: "Manage examinations and student marks.",
      color: "text-purple-700",
      icon: "📝",
    },
    {
      id: "materials",
      title: "Study Materials",
      description: "Share notes and learning resources.",
      color: "text-orange-700",
      icon: "📚",
    },
    {
      id: "notices",
      title: "Notices",
      description: "View important notices.",
      color: "text-indigo-700",
      icon: "📢",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              EduBridge
            </h1>
            <p className="mt-1 text-gray-600">
              Teacher Dashboard
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">
            Welcome, {user?.name || "Teacher"}!
          </h2>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Role: Teacher</p>
        </section>

        <h2 className="mb-4 text-xl font-bold">
          Teacher Modules
        </h2>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => onOpenModule(module.id)}
              className="rounded-xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">{module.icon}</div>

              <h3 className={`mb-2 font-semibold ${module.color}`}>
                {module.title}
              </h3>

              <p className="text-sm text-gray-600">
                {module.description}
              </p>

              <p className="mt-4 text-sm font-semibold text-blue-600">
                Open Module →
              </p>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}

export default TeacherDashboard;