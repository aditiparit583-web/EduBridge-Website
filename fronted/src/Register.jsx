import React, { useState } from "react";

const API_URL = "http://localhost:5000/api/auth";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!form.name.trim()) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setMessageType("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create your account."
        );
      }

      setMessage(
        "Your Parent account has been created successfully. Please contact the administrator to link your student."
      );
      setMessageType("success");

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      if (error instanceof TypeError) {
        setMessage(
          "Unable to connect to the server. Please check your connection and try again."
        );
      } else {
        setMessage(error.message || "Something went wrong.");
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-4 py-8 sm:py-12">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

          <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-10 text-white md:flex lg:p-12">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-white/10" />

            <div className="relative z-10">
              <div className="mb-12 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-blue-700 shadow-lg">
                  E
                </div>
                <span className="text-2xl font-bold tracking-wide">
                  EduBridge
                </span>
              </div>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
                Parent Portal
              </p>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight lg:text-5xl">
                Your child's
                <br />
                learning journey
                <br />
                starts here.
              </h1>

              <p className="max-w-md text-base leading-7 text-blue-100">
                Create your account to stay connected with your child's
                attendance, academic progress, fees, and learning updates.
              </p>
            </div>

            <div className="relative z-10 mt-12 border-t border-white/20 pt-6">
              <p className="text-sm text-blue-100">
                Learn better. Stay connected. Grow together.
              </p>
            </div>
          </section>

          <section className="px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 md:hidden">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">
                    E
                  </div>
                  <span className="text-2xl font-extrabold text-slate-900">
                    EduBridge
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  Stay connected with your child's education.
                </p>
              </div>

              <div className="mb-8">
                <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                  Parent Registration
                </span>

                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                  Create Account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your details to create your parent account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-3 my-auto h-10 rounded-lg px-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute inset-y-0 right-3 my-auto h-10 rounded-lg px-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {message && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-xl border p-4 text-sm leading-6 ${
                      messageType === "success"
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="mt-7 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-bold text-blue-700 hover:text-indigo-700 hover:underline"
                >
                  Sign In
                </a>
              </div>

              <div className="mt-5 text-center">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-700"
                >
                  <span aria-hidden="true">←</span>
                  Back to Home
                </a>
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Your account is protected by secure password verification.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}