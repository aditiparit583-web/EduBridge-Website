import { useState } from "react";

import Home from "./Home";
import Register from "./Register";

import StudentManagement from "./StudentManagement";
import BatchManagement from "./BatchManagement";
import TeacherManagement from "./TeacherManagement";
import AttendanceManagement from "./AttendanceManagement";
import FeeManagement from "./FeeManagement";
import ExamManagement from "./ExamManagement";
import MarkManagement from "./MarkManagement";
import StudyMaterialManagement from "./StudyMaterialManagement";
import NoticeManagement from "./NoticeManagement";

import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";

function App() {
  const [showHome, setShowHome] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Admin");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const [activeModule, setActiveModule] = useState("");
  const [dashboardModule, setDashboardModule] = useState(false);

  const modules = [
    {
      id: "students",
      title: "Student Management",
      icon: "👨‍🎓",
      component: StudentManagement,
    },
    {
      id: "teachers",
      title: "Teacher Management",
      icon: "👩‍🏫",
      component: TeacherManagement,
    },
    {
      id: "batches",
      title: "Batch Management",
      icon: "🏫",
      component: BatchManagement,
    },
    {
      id: "attendance",
      title: "Attendance",
      icon: "📋",
      component: AttendanceManagement,
    },
    {
      id: "fees",
      title: "Fees & Payments",
      icon: "💰",
      component: FeeManagement,
    },
    {
      id: "exams",
      title: "Exams",
      icon: "📝",
      component: ExamManagement,
    },
    {
      id: "marks",
      title: "Marks",
      icon: "📊",
      component: MarkManagement,
    },
    {
      id: "materials",
      title: "Study Materials",
      icon: "📖",
      component: StudyMaterialManagement,
    },
    {
      id: "notices",
      title: "Notices",
      icon: "📢",
      component: NoticeManagement,
    },
  ];

  const openModule = (moduleId) => {
    setActiveModule(moduleId);
  };

  const closeAllModules = () => {
    setActiveModule("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://edubridge-website.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      if (!data.token || !data.user) {
        setMessage("Invalid response from server.");
        return;
      }

      const actualRole = String(data.user.role || "");
      const selectedRole = role.toLowerCase();

      if (actualRole.toLowerCase() !== selectedRole) {
        setMessage(
          `This account belongs to ${actualRole}. Please select the correct role.`
        );
        return;
      }

      localStorage.setItem("token", data.token);

      setUser({
        ...data.user,
        name: data.user.name || "User",
        email: data.user.email || email.trim(),
        role: actualRole,
      });

      setShowHome(false);
      setShowRegister(false);
      setActiveModule("");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Unable to connect to server. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);
    setActiveModule("");
    setDashboardModule(false);
    setEmail("");
    setPassword("");
    setRole("Admin");
    setMessage("");
    setActiveModule("");
    setShowRegister(false);
    setShowHome(true);
  };

  // HOME PAGE
  if (showHome && !user) {
    return (
      <Home
        onLogin={() => {
          setShowHome(false);
          setShowRegister(false);
          setMessage("");
        }}
        onCreateAccount={() => {
          setShowHome(false);
          setShowRegister(true);
          setMessage("");
        }}
      />
    );
  }

  // REGISTER PAGE
  if (showRegister && !user) {
    return (
      <Register
        onBackToLogin={(destination) => {
          setShowRegister(false);
          setShowHome(destination === "home");
          setMessage("");
        }}
      />
    );
  }

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mb-3 text-5xl">🎓</div>

            <h1 className="text-3xl font-bold text-slate-800">
              EduBridge
            </h1>

            <p className="mt-2 text-slate-500">
              Login to continue
            </p>
          </div>

          {message && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block font-semibold">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full rounded-lg border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg border p-3 pr-20"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                Login As
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setShowHome(true);
              setShowRegister(false);
              setMessage("");
            }}
            className="mt-4 w-full rounded-lg border border-blue-600 px-4 py-2 text-blue-600"
          >
            ← Back to Home
          </button>

          <button
            type="button"
            onClick={() => {
              setShowHome(false);
              setShowRegister(true);
              setMessage("");
            }}
            className="mt-3 w-full text-gray-600 hover:underline"
          >
            Create New Account
          </button>
        </div>
      </div>
    );
  }

  const userRole = String(user.role || "").toLowerCase();

  // STUDENT DASHBOARD
  if (userRole === "student") {
  return (
    <StudentDashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}
 if (userRole === "teacher" && dashboardModule && activeModule) {
  const selectedModule = modules.find(
    (module) => module.id === activeModule
  );

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;

    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6">
        <button
          type="button"
          onClick={() => {
            setActiveModule("");
            setDashboardModule(false);
          }}
          className="mb-5 rounded-lg bg-slate-800 px-4 py-3 text-white"
        >
          ← Back to Dashboard
        </button>

        <ModuleComponent
          onBack={() => {
            setActiveModule("");
            setDashboardModule(false);
          }}
        />
      </div>
    );
  }
}

if (userRole === "teacher") {
  return (
    <TeacherDashboard
      user={user}
      onLogout={handleLogout}
      onOpenModule={(moduleId) => {
        setActiveModule(moduleId);
        setDashboardModule(true);
      }}
    />
  );
}

  // TEACHER DASHBOARD
  if (userRole === "teacher") {
    return (
      <TeacherDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // PARENT DASHBOARD
 if (userRole === "parent" && dashboardModule && activeModule) {
  const selectedModule = modules.find(
    (module) => module.id === activeModule
  );

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;

    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6">
        <button
          type="button"
          onClick={() => {
            setActiveModule("");
            setDashboardModule(false);
          }}
          className="mb-5 rounded-lg bg-slate-800 px-4 py-3 text-white"
        >
          ← Back to Dashboard
        </button>

        <ModuleComponent
          onBack={() => {
            setActiveModule("");
            setDashboardModule(false);
          }}
        />
      </div>
    );
  }
}

if (userRole === "parent") {
  return (
    <ParentDashboard
      user={user}
      onLogout={handleLogout}
      onOpenModule={(moduleId) => {
        setActiveModule(moduleId);
        setDashboardModule(true);
      }}
    />
  );
}

  // ADMIN MODULE PAGES
if (userRole === "admin" && activeModule) {
  const selectedModule = modules.find(
    (module) => module.id === activeModule
  );

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;

    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6">
        <ModuleComponent onBack={closeAllModules} />
      </div>
    );
  }
}
  // ADMIN DASHBOARD
  if (userRole === "admin") {
    return (
      <div className="min-h-screen bg-blue-100 md:flex">
       <aside className="flex w-full shrink-0 flex-col bg-[#222831] p-5 text-white md:min-h-screen md:w-72">
  <h2 className="mb-4 text-2xl font-bold">
    📚 EduBridge
  </h2>

  {/* Admin Profile */}
  <div className="mb-5 rounded-xl bg-[#393E46] p-3">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
        {user.name?.charAt(0)?.toUpperCase() || "A"}
      </div>

      <div className="min-w-0">
        <p className="truncate font-semibold">{user.name}</p>
        <p className="text-sm text-gray-300">{user.role}</p>
      </div>
    </div>
  </div>

  {/* Logout Button at Top */}
  <button
    type="button"
    onClick={handleLogout}
    className="mb-6 w-full rounded-xl bg-red-600 px-4 py-3 text-left font-semibold hover:bg-red-700"
  >
    🚪 Logout
  </button>

  {/* Dashboard Modules */}
  <nav className="flex-1 space-y-2">
    <button
      type="button"
      onClick={closeAllModules}
      className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left"
    >
      🏠 Dashboard
    </button>

    {modules.map((module) => (
      <button
        key={module.id}
        type="button"
        onClick={() => openModule(module.id)}
        className="w-full rounded-lg px-4 py-3 text-left hover:bg-slate-700"
      >
        {module.icon} {module.title}
      </button>
    ))}
  </nav>
        </aside>

        <main className="min-w-0 flex-1 p-5 md:p-8">
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              Welcome, {user.name}! 👋
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your coaching and tuition activities from this dashboard.
            </p>
          </div>

          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "👨‍🎓", title: "Students", value: "2" },
              { icon: "👩‍🏫", title: "Teachers", value: "3" },
              { icon: "🏫", title: "Batches", value: "0" },
              { icon: "📋", title: "Attendance", value: "0%" },
              { icon: "💰", title: "Fees", value: "₹0" },
              { icon: "📝", title: "Exams & Marks", value: "0" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="text-3xl">{item.icon}</div>
                <p className="mt-3 text-gray-500">{item.title}</p>
                <p className="text-3xl font-bold text-gray-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mb-4 mt-10 text-xl font-bold text-gray-800">
            Main Modules
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <button
                key={module.id}
                type="button"
                onClick={() => openModule(module.id)}
                className="rounded-xl border border-blue-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg"
              >
                <div className="mb-2 text-2xl">
                  {module.icon}
                </div>

                <h3 className="font-bold text-gray-800">
                  {module.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Click to open this module.
                </p>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <h2 className="mb-4 text-xl font-bold">
          Unsupported Account Role
        </h2>

        <p className="mb-5 text-gray-600">
          This account does not have a supported dashboard.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default App;