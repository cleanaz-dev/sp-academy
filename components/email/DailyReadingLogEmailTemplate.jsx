export default function DailyReadingLogEmailTemplate({
  userName,
  lastBookRead,
  nextBook,
  readingStreak,
  encouragement,
}) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        lineHeight: "1.6",
      }}
    >
      <h1>Hi {userName}! 📚</h1>

      <p>
        <strong>Reading Streak:</strong> {readingStreak} days 🔥
        <br />
        {encouragement}
      </p>

      <div
        style={{
          backgroundColor: "#f4f4f4",
          padding: "15px",
          borderRadius: "5px",
          marginTop: "20px",
        }}
      >
        <h2>Your Next Book</h2>
        <p>
          <strong>{nextBook.title}</strong>
          <br />
          By {nextBook.author}
        </p>
        <p>
          <em>{nextBook.recommendation}</em>
        </p>
      </div>

      <p style={{ marginTop: "20px", fontStyle: "italic" }}>
        Recently finished: {lastBookRead}
      </p>
    </div>
  );
}
