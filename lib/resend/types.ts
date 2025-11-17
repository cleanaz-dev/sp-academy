export interface DailyReadingLogEmailProps {
  userName: string;
  lastBookRead: string;
  nextBook: {
    title: string;
    author: string;
    recommendation: string;
  };
  readingStreak: number;
  encouragement: string;
}
