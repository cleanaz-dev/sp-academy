//api/progress/route.js
export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, courseId, status } = await request.json();
    if (!lessonId || !courseId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const progressUpdate = await updateLessonAndCourseProgress({
      userId: user.id,
      lessonId,
      courseId,
      status
    });

    if (!progressUpdate.success) {
      return NextResponse.json(
        { message: "Failed to update progress" }, 
        { status: 500 }
      );
    }

    return NextResponse.json(progressUpdate);

  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    );
  }
}