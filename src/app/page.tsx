import Link from "next/link";
import { CheckCircle, Shield, Clock, BarChart3, Users, QrCode } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AttendX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 font-medium">
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Smart Classroom<br />
          <span className="text-blue-600">Presence System</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Eliminate proxy attendance, reduce marking time to under 30 seconds, and get real-time insights with AttendX.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
          >
            Start Free
          </Link>
          <Link
            href="/auth/login"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold text-lg"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <QrCode className="w-8 h-8 text-blue-600" />,
              title: "QR Code Attendance",
              desc: "Generate unique QR codes for each session. Students scan to mark attendance instantly.",
            },
            {
              icon: <Shield className="w-8 h-8 text-green-600" />,
              title: "Anti-Proxy System",
              desc: "Multi-layer verification with device binding and network checks to eliminate proxies.",
            },
            {
              icon: <Clock className="w-8 h-8 text-orange-600" />,
              title: "Under 30 Seconds",
              desc: "Complete attendance marking for entire class in less than 30 seconds.",
            },
            {
              icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
              title: "Real-time Analytics",
              desc: "Live attendance tracking with detailed reports and trend analysis.",
            },
            {
              icon: <Users className="w-8 h-8 text-red-600" />,
              title: "Multi-Role Support",
              desc: "Separate dashboards for teachers, students, and administrators.",
            },
            {
              icon: <CheckCircle className="w-8 h-8 text-teal-600" />,
              title: "95%+ Accuracy",
              desc: "Industry-leading accuracy with session-based and time-bound verification.",
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center mt-16">
        <p>© 2024 AttendX. Smart Classroom Presence System.</p>
      </footer>
    </main>
  );
}
