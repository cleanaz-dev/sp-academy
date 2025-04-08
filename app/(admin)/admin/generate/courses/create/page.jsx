// app/(admin)/generate/courses/create/page.jsx
"use client";

import CreateCoursesPage from "@/components/courses/CreateCoursesPage";

export default function CreateCourse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Course
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Design your course structure and add up to 4 lessons
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <CreateCoursesPage />
      </main>
    </div>
  );
}
