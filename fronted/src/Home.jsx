import educationImage from "./assets/education.png";

function Home({ onLogin, onCreateAccount }) {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 text-gray-800">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/90 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <h1 className="text-xl font-extrabold text-blue-700 sm:text-2xl">
              🎓 Coaching Tuition App
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Learn Today • Build Tomorrow
            </p>
          </div>

          <div className="flex shrink-0 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onLogin}
              className="rounded-xl border border-blue-600 px-3 py-2 font-semibold text-blue-700 transition hover:bg-blue-50 sm:px-5"
            >
              Login
            </button>

            <button
              type="button"
              onClick={onCreateAccount}
              className="rounded-xl bg-blue-600 px-3 py-2 font-semibold text-white shadow-md transition hover:bg-blue-700 sm:px-5"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-8 pt-8 md:grid-cols-2 md:gap-10 md:pb-10 md:pt-10">
          {/* Left Content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              <span>✨</span>
              Coaching Management System
            </div>

            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Manage Your Coaching & Tuition
              <span className="mt-2 block text-blue-600">
                Activities Easily
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              A complete web application for managing students, teachers,
              batches, attendance, fees, examinations and academic activities
              in one place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onCreateAccount}
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Create Account →
              </button>

              <button
                type="button"
                onClick={onLogin}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Login
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
              <span>✓ Easy Management</span>
              <span>✓ Organized Learning</span>
              <span>✓ Better Progress</span>
            </div>
          </div>

          {/* Right Education Photo */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-200 via-sky-100 to-indigo-200 opacity-70 blur-xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-2 shadow-xl">
              <img
                src={educationImage}
                alt="Students studying in a classroom"
                className="h-64 w-full rounded-2xl object-cover sm:h-80 md:h-[350px]"
              />

              <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  🎓
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Your Future Starts Here
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Learn, grow and achieve your goals with us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose EduBridge */}
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-4 sm:pt-6">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full border border-blue-100 bg-blue-100/70 px-4 py-2 text-xs font-bold tracking-wide text-blue-700 sm:text-sm">
              WHY CHOOSE EDUBRIDGE?
            </span>

            <h2 className="mt-4 text-3xl font-extrabold text-slate-800 sm:text-4xl">
              Everything You Need to{" "}
              <span className="text-blue-600">Succeed</span>
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage your coaching classes, support students, and track
              academic progress — all from one simple platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl transition group-hover:bg-blue-600">
                👨‍🏫
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Expert Teachers
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Organize teacher information and make classroom management
                easier.
              </p>

              <div className="mt-4 font-semibold text-blue-600">
                Learn Better →
              </div>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl transition group-hover:bg-purple-100">
                📚
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Smart Learning
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep study materials and important learning resources
                organized.
              </p>

              <div className="mt-4 font-semibold text-purple-600">
                Study Smarter →
              </div>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                📈
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Track Progress
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep track of attendance, examination marks, and student
                progress.
              </p>

              <div className="mt-4 font-semibold text-emerald-600">
                Track Growth →
              </div>
            </div>

            {/* Card 4 */}
            <div className="group rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                🏆
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Better Results
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage academic activities in one place and support better
                outcomes.
              </p>

              <div className="mt-4 font-semibold text-amber-600">
                Aim Higher →
              </div>
            </div>
          </div>

          {/* Bottom Highlight */}
          <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-5 py-8 text-center text-white shadow-lg sm:px-10 sm:py-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              🚀
            </div>

            <h3 className="text-2xl font-extrabold sm:text-3xl">
              Make Learning Management Simple!
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Spend less time managing tasks and more time helping students
              learn, grow, and achieve their goals.
            </p>

            <button
              type="button"
              onClick={onCreateAccount}
              className="mt-5 rounded-xl bg-white px-7 py-3 font-bold text-blue-700 shadow transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Get Started Today →
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-white px-5 py-5 text-center text-sm text-slate-500">
        © Coaching Tuition App | Coaching Management System
        <p className="mt-1 text-xs text-slate-400">
          Learn Today • Build Tomorrow
        </p>
      </footer>
    </div>
  );
}

export default Home;