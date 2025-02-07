import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../ui/card";

export default function AchievementCard({ achievements }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold">Achievements</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`
                    p-3 rounded-lg
                    ${achievement.isUnlocked ? "bg-green-100" : "bg-gray-100"}
                  `}
                >
                  <img
                    src={achievement.imageUrl}
                    alt={achievement.name}
                    className={`
                      w-10 h-10 object-cover
                      ${!achievement.isUnlocked && "opacity-50 grayscale"}
                      transition-all duration-300
                    `}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {achievement.name}
                    </h3>
                    {achievement.isUnlocked && (
                      <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {achievement.description}
                  </p>

                  {!achievement.isUnlocked && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs font-medium text-gray-600">
                          {achievement.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}