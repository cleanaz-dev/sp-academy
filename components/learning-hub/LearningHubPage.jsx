"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  BookOpen,
  Star,
  ChevronDown,
  Circle,
  CheckCircle,
} from "lucide-react";
import { EnrollmentDialog } from "./EnrollmentDialog";
import { Sparkles } from "lucide-react";
import { Search } from "lucide-react";
import { X } from "lucide-react";
import { SearchX } from "lucide-react";
import { RecommendedDetailsDialog } from "./RecommnedDetailsDialog";
import Link from "next/link";
import { Users } from "lucide-react";

// Dummy data for courses and lessons
// const courses = [
//   {
//     id: "1",
//     title: "Intro to JavaScript",
//     description: "Learn the basics of JavaScript programming.",
//     level: "Beginner",
//     lessons: [
//       {
//         id: "1",
//         title: "Lesson 1: Variables and Data Types",
//         types: ["lecture", "exercise"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz1",
//           title: "Quiz 1",
//           questions: [
//             { question: "What is a variable?", answer: "A storage location" },
//             {
//               question: "What are data types?",
//               answer: "Types of data (string, number, etc.)",
//             },
//           ],
//           passed: false,
//         },
//       },
//       {
//         id: "2",
//         title: "Lesson 2: Functions and Loops",
//         types: ["lecture", "visual", "exercise"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz2",
//           title: "Quiz 2",
//           questions: [
//             {
//               question: "What is a function?",
//               answer: "A reusable block of code",
//             },
//             { question: "What is a loop?", answer: "A way to repeat code" },
//           ],
//           passed: false,
//         },
//       },
//     ],
//   },
//   {
//     id: "2",
//     title: "Advanced React",
//     description: "Dive deeper into React with advanced concepts.",
//     level: "Advanced",
//     lessons: [
//       {
//         id: "1",
//         title: "Lesson 1: Hooks and Context API",
//         types: ["lecture", "conversation"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz1",
//           title: "Quiz 1",
//           questions: [
//             {
//               question: "What is useState?",
//               answer: "A React Hook for state management",
//             },
//             {
//               question: "What is the Context API?",
//               answer: "A way to manage global state",
//             },
//           ],
//           passed: false,
//         },
//       },
//       {
//         id: "2",
//         title: "Lesson 2: React Router and Server-side Rendering",
//         types: ["lecture", "visual"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz2",
//           title: "Quiz 2",
//           questions: [
//             {
//               question: "What is React Router?",
//               answer: "A library for routing in React",
//             },
//             { question: "What is SSR?", answer: "Server-Side Rendering" },
//           ],
//           passed: false,
//         },
//       },
//     ],
//   },
//   {
//     id: "3",
//     title: "Intro to French",
//     description: "Learn the basics of the French language and culture.",
//     level: "Beginner",
//     lessons: [
//       {
//         id: "1",
//         title: "Lesson 1: French Greetings and Introductions",
//         types: ["lecture", "exercise"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz1",
//           title: "Quiz 1",
//           questions: [
//             {
//               question: "How do you say 'Hello' in French?",
//               answer: "Bonjour",
//             },
//             {
//               question: "How do you say 'Goodbye' in French?",
//               answer: "Au revoir",
//             },
//           ],
//           passed: false,
//         },
//       },
//       {
//         id: "2",
//         title: "Lesson 2: Numbers and Basic Phrases",
//         types: ["lecture", "visual", "exercise"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz2",
//           title: "Quiz 2",
//           questions: [
//             { question: "How do you say 'One' in French?", answer: "Un" },
//             { question: "How do you say 'Two' in French?", answer: "Deux" },
//           ],
//           passed: false,
//         },
//       },
//     ],
//   },
//   {
//     id: "4",
//     title: "Intro to Black History",
//     description:
//       "Explore the rich history of Black culture and its impact on the world.",
//     level: "Beginner",
//     lessons: [
//       {
//         id: "1",
//         title: "Lesson 1: African Kingdoms and Early Civilizations",
//         types: ["lecture", "exercise"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz1",
//           title: "Quiz 1",
//           questions: [
//             {
//               question: "What was the Mali Empire known for?",
//               answer: "Wealth and culture",
//             },
//             {
//               question: "What is the significance of the Kingdom of Kush?",
//               answer:
//                 "It was a powerful kingdom in Nubia, known for its contributions to African culture.",
//             },
//           ],
//           passed: false,
//         },
//       },
//       {
//         id: "2",
//         title: "Lesson 2: The Civil Rights Movement",
//         types: ["lecture", "visual"],
//         quizRequired: true,
//         quiz: {
//           id: "quiz2",
//           title: "Quiz 2",
//           questions: [
//             {
//               question: "Who was Martin Luther King Jr.?",
//               answer: "A leader of the Civil Rights Movement",
//             },
//             {
//               question: "What was the significance of the March on Washington?",
//               answer:
//                 "It helped to bring national attention to the fight for racial equality.",
//             },
//           ],
//           passed: false,
//         },
//       },
//     ],
//   },
// ];

// New recommended content data
const recommendedContent = [
  {
    id: "rec1",
    title: "Machine Learning Fundamentals",
    type: "Course",
    difficulty: "Intermediate",
    matchScore: "98% match",
    description: "Recommended based on your JavaScript progress",
    isNew: true,
    duration: "10 weeks",
    topics: ["Python Basics", "Neural Networks", "Data Processing"],
    // Additional detailed information for the dialog
    detailedDescription:
      "This comprehensive course introduces you to the fundamentals of machine learning using Python. Perfect for developers with programming experience looking to expand into AI and data science.",
    prerequisites: [
      "Basic Python knowledge",
      "Understanding of algebra",
      "Basic statistics",
    ],
    learningOutcomes: [
      "Build and train neural networks",
      "Implement common ML algorithms",
      "Process and analyze large datasets",
      "Deploy ML models in production",
    ],
    instructor: {
      name: "Dr. Sarah Chen",
      title: "AI Research Scientist",
      image: "/instructor-sarah.jpg",
      credentials: "PhD in Computer Science, 10+ years in ML",
    },
    syllabus: [
      {
        week: 1,
        title: "Introduction to Python for ML",
        topics: ["NumPy basics", "Pandas fundamentals", "Data visualization"],
      },
      {
        week: 2,
        title: "Data Preprocessing",
        topics: ["Data cleaning", "Feature engineering", "Normalization"],
      },
      {
        week: 3,
        title: "Basic ML Algorithms",
        topics: ["Linear regression", "Logistic regression", "Decision trees"],
      },
    ],
    stats: {
      enrolledStudents: 1234,
      averageRating: 4.8,
      reviewCount: 256,
      completionRate: "87%",
    },
  },
  // ... other recommended content
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export default function LearningHubPage({ courses, userId }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");
  const [viewedRecommendations, setViewedRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to check if specific user is enrolled
  const isUserEnrolled = (course) => {
    return course.enrollments?.some(
      (enrollment) => enrollment.userId === userId
    );
  };

  const getEnrollmentStatus = (course) => {
    const enrollment = course.enrollments?.find(
      (enrollment) => enrollment.userId === userId
    );
    return enrollment?.status || null;
  };

  const handleQuizCompletion = (courseId, lessonId, quizId) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const updatedLessons = course.lessons.map((lesson) => {
          if (lesson.id === lessonId) {
            if (lesson.quiz.id === quizId) {
              lesson.quiz.passed = true;
            }
          }
          return lesson;
        });
        course.lessons = updatedLessons;
      }
      return course;
    });
    setSelectedCourse(updatedCourses);
  };

  const handleCourseClick = (course) => {
    setExpandedCourse(expandedCourse === course.id ? null : course.id);
  };

  const handleEnroll = (course) => {
    setSelectedCourse(course);
    // Navigate to course page or handle enrollment
  };

  // New handler for tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "recommended") {
      setViewedRecommendations(true);
    }
  };

  // Add this search function
  const filterContent = (content, type) => {
    const query = searchQuery.toLowerCase();
    if (!query) return content;

    if (type === "courses") {
      return content.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.level.toLowerCase().includes(query) ||
          course.lessons.some((lesson) =>
            lesson.title.toLowerCase().includes(query)
          )
      );
    }

    if (type === "recommended") {
      return content.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.difficulty.toLowerCase().includes(query) ||
          item.topics.some((topic) => topic.toLowerCase().includes(query))
      );
    }

    return content;
  };

  const unviewedRecommendations = recommendedContent.filter(
    (item) => item.isNew
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">Learning Hub</h1>
          <p className="text-xl opacity-90">
            Start your learning journey today with our AI generated courses
            🚀🚀🚀
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "courses" ? "default" : "outline"}
            onClick={() => handleTabChange("courses")}
            className="relative"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </Button>
          <Button
            variant={activeTab === "recommended" ? "default" : "outline"}
            onClick={() => handleTabChange("recommended")}
            className="relative"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Recommended
            {!viewedRecommendations && unviewedRecommendations > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unviewedRecommendations}
              </span>
            )}
          </Button>
        </div>
        {/* Search  */}
        <div className="w-full max-w-md mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses, topics, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {activeTab === "courses" && (
            <motion.div
              key="courses"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Course Catalog */}
              {/* Course Catalog */}
              <div className="grid gap-8">
  {filterContent(courses, "courses").length > 0 ? (
    filterContent(courses, "courses")
      .sort((a, b) => b.enrollments.length - a.enrollments.length) // Sort courses by number of enrollments
      .map((course) => (
        <div key={course.id}>
          <Card
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              isUserEnrolled(course) ? "border-l-4 border-l-green-500" : ""
            }`}
            onClick={() => handleCourseClick(course)}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  {isUserEnrolled(course) && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {getEnrollmentStatus(course) === "NOT_STARTED"
                        ? "Enrolled"
                        : "In Progress"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{course.level}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>2 weeks</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{course.enrollments.length} Users Enrolled</span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-6 h-6 transition-transform ${
                  expandedCourse === course.id ? "rotate-180" : ""
                }`}
              />
            </CardHeader>
          </Card>

          <AnimatePresence>
            {expandedCourse === course.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="mt-4 border-t-0">
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
                      <p className="text-gray-600 mb-6">{course.description}</p>

                      <div className="space-y-4">
                        <h4 className="font-medium">Course Content</h4>
                        {course.lessons
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((lesson, index) => (
                            <div
                              key={lesson.id}
                              className="flex items-center p-4 bg-gray-50 rounded-lg"
                            >
                              <span className="mr-4 text-gray-400">{index + 1}</span>
                              <span className="flex-1">
                                Lesson {index + 1}: {lesson.title}
                              </span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {lesson.type}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      {isUserEnrolled(course) ? (
                        <div className="flex items-center gap-2">
                          <Link href={`/courses/${course.id}`}>
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {getEnrollmentStatus(course) === "NOT_STARTED"
                                ? "View Course"
                                : "Continue Learning"}
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEnrollDialog(true);
                          }}
                        >
                          Enroll in Course
                        </Button>
                      )}

                      <EnrollmentDialog
                        course={course}
                        isOpen={showEnrollDialog}
                        onClose={() => setShowEnrollDialog(false)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))
  ) : (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
      <p className="text-gray-500">
        Try adjusting your search terms or browse all courses
      </p>
    </div>
  )}
</div>

            </motion.div>
          )}

          {activeTab === "recommended" && (
            <motion.div
              key="recommended"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4"
            >
              {filterContent(recommendedContent, "recommended").length > 0 ? (
                filterContent(recommendedContent, "recommended").map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle>{item.title}</CardTitle>
                            {item.isNew && (
                              <Badge className="bg-green-500">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {item.description}
                          </p>
                        </div>
                        <Badge variant="outline">{item.matchScore}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{item.type}</Badge>
                          <Badge variant="outline">{item.difficulty}</Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{item.duration}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.topics.map((topic) => (
                            <Badge
                              key={topic}
                              variant="outline"
                              className="text-xs"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              setSelectedRecommendation(item);
                              setShowDetailsDialog(true);
                            }}
                          >
                            View Details
                          </Button>

                          <RecommendedDetailsDialog
                            item={selectedRecommendation}
                            isOpen={showDetailsDialog}
                            onClose={() => {
                              setShowDetailsDialog(false);
                              setSelectedRecommendation(null);
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <SearchX className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recommendations found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or check back later
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
