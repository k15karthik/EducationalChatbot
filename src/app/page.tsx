import Link from "next/link";

export default function HomePage() {
  const courses = [
    { code: "CS 141", title: "Program Design II", path: "/courses/cs141" },
    { code: "Math 210", title: "Calculus III", path: "/courses/math210" },
    { code: "CS 151", title: "Mathematical Foundations of Computing", path: "/courses/cs151" },
    { code: "PHYS 131", title: "Introductory Physics for Life Sciences I", path: "/courses/phys131" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8">Edu-Chatbot</h1>
          <nav className="space-y-4">
            <a href="/" className="block font-medium hover:text-blue-600">
              Home
            </a>
            <a href="/shop" className="block font-medium hover:text-blue-600">
              Shop
            </a>
          </nav>
        </div>
        <div className="pt-6 border-t border-gray-200 mb-4">
          <a href="/profile" className="block font-medium text-black hover:text-blue-600">
            Profile
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-12 py-10">
        <h2 className="text-3xl font-bold mb-2">Course Dashboard</h2>
        <p className="text-lg font-medium text-gray-700 mb-10">Fall 2025</p>

        <div className="grid grid-cols-4 gap-8 w-full">
          {courses.map((course) => (
            <Link key={course.code} href={course.path}>
              <div className="flex flex-col justify-center items-center h-48 bg-gray-100 border rounded-xl shadow-sm hover:shadow-md hover:bg-gray-200 transition cursor-pointer">
                <span className="text-2xl font-bold">{course.code}</span>
                <span className="text-md text-gray-700 mt-2 text-center px-4">
                  {course.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
