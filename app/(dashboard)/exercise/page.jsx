import ExerciseHandler from "@/components/lessons/exercises/ExerciseHandler";
import prisma from "@/lib/prisma"; // adjust to your actual prisma client path

export default async function Page() {
  const exercises = await prisma.exercise.findMany({
    // whatever query gets your exercise set — adjust to your schema
  });

  return (
    <div>
      <ExerciseHandler exercises={exercises} />
    </div>
  );
}