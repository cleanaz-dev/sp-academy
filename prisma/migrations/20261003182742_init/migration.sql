-- CreateEnum
CREATE TYPE "FreestyleLevel" AS ENUM ('ZERO', 'EASY', 'MEDIUM', 'FLUENT');

-- CreateEnum
CREATE TYPE "FreestyleMode" AS ENUM ('INTRODUCTION', 'SPECIFIC', 'RANDOM', 'ARGUMENTATIVE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'REVIEW_PENDING', 'REVIEWED');

-- CreateEnum
CREATE TYPE "VoiceGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "LambdaStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('Verbal', 'Visual', 'Acoustic', 'Speech_Describe');

-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('ENGLISH', 'SPANISH', 'FRENCH', 'JAPANESE');

-- CreateEnum
CREATE TYPE "PracticeStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WordStatus" AS ENUM ('NEEDS_PRACTICE', 'IMPROVING', 'MASTERED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VoicePreference" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "Billing" AS ENUM ('FREE', 'BASIC_MONTHLY', 'BASIC_ANNUALLY', 'PREMIUM_MONTHLY', 'PREMIUM_ANNUALLY');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('Lesson', 'Lecture', 'Conversation', 'Visual', 'Exercise');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "GameContext" AS ENUM ('SPEAKING', 'LISTENING', 'READING', 'WRITING', 'IMAGES', 'AUDIO', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "GameDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'INSANE');

-- CreateEnum
CREATE TYPE "HandlebarsType" AS ENUM ('Lesson', 'Course', 'Book', 'Exercise');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SystemTaskType" AS ENUM ('SPEECH_PRONUNCIATION_ANALYSIS', 'COURSE_GENERTATION', 'BOOK_GENERATION', 'CONVERSATION_GENERATION', 'GAME_VARIATION_GENERATION', 'GAME_SCHEMA_GENERATION', 'CONVERSATION_IMAGE_GENERATION', 'FREESTYLE_REVIEW');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scenario" TEXT,
    "metadata" JSONB,
    "nativeLanguage" "Languages",
    "tutorLanguage" "Languages",
    "level" "Level",
    "introduction" JSONB NOT NULL,
    "vocabulary" JSONB[],
    "characters" JSONB[],
    "dialogue" JSONB[],
    "userId" TEXT NOT NULL,
    "messages" JSONB,
    "imageUrl" TEXT,
    "aiAvatarUrl" TEXT,
    "aiAvatarMaleUrl" TEXT,
    "aiAvatarFemaleUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messages" JSONB,
    "analysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pronunciationScores" JSONB,

    CONSTRAINT "ConversationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "mistakes" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreestyleSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "FreestyleMode" NOT NULL,
    "level" "FreestyleLevel" NOT NULL DEFAULT 'EASY',
    "topic" TEXT,
    "nativeLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "voiceGender" "VoiceGender" NOT NULL DEFAULT 'FEMALE',
    "aiAvatarUrl" TEXT,
    "isFoundation" BOOLEAN DEFAULT false,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "messages" JSONB[],
    "fullTranscript" TEXT,
    "s3AudioKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreestyleSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreestyleReview" (
    "id" TEXT NOT NULL,
    "freestyleSessionId" TEXT NOT NULL,
    "mistakes" JSONB[],
    "overallFeedback" JSONB,
    "grammarAnalysis" JSONB,
    "vocabUpgrades" JSONB,
    "metrics" JSONB,
    "lambdaStatus" "LambdaStatus" DEFAULT 'PENDING',
    "hasUserReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreestyleReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,

    CONSTRAINT "LanguageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordStat" (
    "id" TEXT NOT NULL,
    "languageProfileId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "seenCount" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "heardCount" INTEGER NOT NULL DEFAULT 0,
    "lastHeardAt" TIMESTAMP(3),
    "tappedCorrect" INTEGER NOT NULL DEFAULT 0,
    "tappedWrong" INTEGER NOT NULL DEFAULT 0,
    "lastTappedAt" TIMESTAMP(3),
    "spokenAttempts" INTEGER NOT NULL DEFAULT 0,
    "avgSpokenScore" DOUBLE PRECISION,
    "lastSpokenAt" TIMESTAMP(3),
    "masteryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "nextReviewDate" TIMESTAMP(3),

    CONSTRAINT "WordStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundationCourse" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "outline" JSONB NOT NULL,
    "dayCount" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoundationCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundationLesson" (
    "id" TEXT NOT NULL,
    "foundationCourseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'building',
    "visualContent" JSONB,
    "grammarContent" JSONB,
    "pronunciationData" JSONB,
    "listeningContent" JSONB,
    "quizContent" JSONB,
    "lessonHandoff" JSONB,
    "freestyle" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoundationLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundationProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foundationCourseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "currentStage" TEXT NOT NULL DEFAULT 'lesson_ready',
    "completedLessonIds" TEXT[],
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "overallFluency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skillMastery" JSONB,
    "itemResults" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoundationProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundationFreestyleLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "freestyleSessionId" TEXT NOT NULL,
    "attemptedChunks" JSONB,
    "landedChunks" JSONB,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoundationFreestyleLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rules" TEXT NOT NULL,
    "imageUrl" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "type" "GameType" NOT NULL,
    "code" TEXT,
    "gameDataSchema" JSONB,
    "randomString" TEXT,
    "contexts" "GameContext"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSoundEffects" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "wrongAnswer" TEXT,
    "timerBepp" TEXT,
    "streakStart" TEXT,
    "streakEnd" TEXT,
    "gameStart" TEXT,
    "gameEnd" TEXT,
    "otherSounds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSoundEffects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameVariation" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "targetLanguage" "Languages" NOT NULL DEFAULT 'ENGLISH',
    "nativeLanguage" "Languages" NOT NULL DEFAULT 'FRENCH',
    "variation" TEXT NOT NULL DEFAULT 'default',
    "gameData" JSONB,
    "difficulty" "GameDifficulty" NOT NULL DEFAULT 'EASY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UselessGameModel" (
    "id" TEXT NOT NULL,
    "uselessJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UselessGameModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "description" TEXT,
    "duration" TEXT,
    "level" INTEGER,
    "content" TEXT NOT NULL,
    "type" "LessonType",
    "coverUrl" TEXT,
    "topics" JSONB,
    "teacherId" TEXT,
    "courseId" TEXT,
    "orderIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "foundationCourseId" TEXT,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lecture" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "coverUrl" TEXT,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "correctAnswer" TEXT,
    "correct_answer" TEXT,
    "additionalData" JSONB,
    "objectives" JSONB,
    "order" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT[],
    "answer" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceText" TEXT NOT NULL,
    "recognizedText" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "audioUrl" TEXT,
    "duration" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "accuracyScore" DOUBLE PRECISION NOT NULL,
    "fluencyScore" DOUBLE PRECISION NOT NULL,
    "pronunciationScore" DOUBLE PRECISION NOT NULL,
    "completenessScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationWord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "accuracyScore" DOUBLE PRECISION NOT NULL,
    "errorType" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "offset" DOUBLE PRECISION,
    "syllables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PronunciationWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "practiceStreak" INTEGER NOT NULL DEFAULT 0,
    "lastPracticeDate" TIMESTAMP(3),
    "commonMistakes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "status" "PracticeStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "language" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeWord" (
    "id" TEXT NOT NULL,
    "practiceSessionId" TEXT NOT NULL,
    "originalWord" TEXT NOT NULL,
    "status" "WordStatus" NOT NULL DEFAULT 'NEEDS_PRACTICE',
    "originalContext" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeAttempt" (
    "id" TEXT NOT NULL,
    "practiceWordId" TEXT NOT NULL,
    "audioUrl" TEXT,
    "accuracyScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "language" "Languages" NOT NULL DEFAULT 'ENGLISH',
    "vocabularyMastered" TEXT[],
    "lastActivity" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "teacherId" TEXT,
    "level" "Level" NOT NULL,
    "coverUrl" TEXT,
    "status" "CourseStatus" NOT NULL,
    "duration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "lastAccessedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "score" INTEGER,
    "enrollmentId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "paragraphs" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "grammar" TEXT NOT NULL,
    "frenchText" TEXT NOT NULL,
    "englishText" TEXT NOT NULL,
    "teaser" TEXT,
    "language" TEXT,
    "vocabulary" JSONB NOT NULL,
    "grammarHighlights" JSONB NOT NULL,
    "exercises" JSONB,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryQuestions" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "question" TEXT[],
    "answer" TEXT[],
    "mark" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "ReportStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "report" TEXT,
    "rating" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "pages" INTEGER NOT NULL,
    "language" TEXT,
    "isReading" BOOLEAN NOT NULL DEFAULT false,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "readingProgress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "coverUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingLog" (
    "id" TEXT NOT NULL,
    "dateRead" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startPage" INTEGER NOT NULL,
    "endPage" INTEGER NOT NULL,
    "pagesRead" INTEGER NOT NULL,
    "shortSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT,
    "userId" TEXT,

    CONSTRAINT "ReadingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "designHtml" TEXT NOT NULL,
    "handlebarsType" "HandlebarsType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSchedule" (
    "id" TEXT NOT NULL,
    "scheduleName" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "timeOfDay" TEXT NOT NULL,
    "daysOfWeek" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "recipients" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleExecutionLog" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "ScheduleExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyJournal" (
    "id" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "s3Key" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "DailyJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemTask" (
    "id" TEXT NOT NULL,
    "type" "SystemTaskType" NOT NULL DEFAULT 'SPEECH_PRONUNCIATION_ANALYSIS',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "error" TEXT,
    "metadata" JSONB,
    "result" TEXT,
    "journalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalReview" (
    "id" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "accuracyScore" DOUBLE PRECISION,
    "fluencyScore" DOUBLE PRECISION,
    "completenessScore" DOUBLE PRECISION,
    "prosodyScore" DOUBLE PRECISION,
    "wordAnalysis" JSONB,
    "targetLanguage" TEXT,
    "summaryFeedback" TEXT,
    "finalTranscript" TEXT,
    "translation" TEXT,
    "grammarMistakes" JSONB,
    "vocabularySuggestions" JSONB,
    "journalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadABook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "topic" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "NativeLanguage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadABook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadABookPage" (
    "id" TEXT NOT NULL,
    "readABookId" TEXT,
    "pageNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadABookPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nativeLanguage" "Languages" DEFAULT 'ENGLISH',
    "targetLanguage" "Languages" DEFAULT 'FRENCH',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInformation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPlan" "Billing" NOT NULL DEFAULT 'FREE',
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "nextBillingDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "lastPaymentDate" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" "Languages" NOT NULL DEFAULT 'ENGLISH',
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "aiVoicePreference" "VoicePreference" NOT NULL DEFAULT 'MALE',
    "level" "Level" DEFAULT 'BEGINNER',
    "dailyEmails" BOOLEAN DEFAULT true,
    "weeklyEmails" BOOLEAN DEFAULT true,
    "promotionEmails" BOOLEAN DEFAULT true,
    "shareReadingLogs" BOOLEAN NOT NULL DEFAULT false,
    "shareConversationActivity" BOOLEAN NOT NULL DEFAULT false,
    "shareAchievements" BOOLEAN NOT NULL DEFAULT false,
    "shareLessonsAndCourses" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjects" TEXT[],

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "record" BOOLEAN,
    "recordingUrl" TEXT,
    "length" TEXT,
    "completed" BOOLEAN NOT NULL,
    "summary" TEXT,
    "to" TEXT,
    "from" TEXT,
    "transcripts" TEXT,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGeneratedContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "context" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIGeneratedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" JSONB,
    "unlockedAt" TIMESTAMP(3),
    "isUnlocked" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "activityTitle" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userId_key" ON "Conversation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationRecord_userId_key" ON "ConversationRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationRecord_conversationId_key" ON "ConversationRecord"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationReview_userId_key" ON "ConversationReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationReview_conversationId_key" ON "ConversationReview"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "FreestyleSession_userId_key" ON "FreestyleSession"("userId");

-- CreateIndex
CREATE INDEX "FreestyleSession_userId_idx" ON "FreestyleSession"("userId");

-- CreateIndex
CREATE INDEX "FreestyleSession_status_idx" ON "FreestyleSession"("status");

-- CreateIndex
CREATE INDEX "FreestyleSession_createdAt_idx" ON "FreestyleSession"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreestyleReview_freestyleSessionId_key" ON "FreestyleReview"("freestyleSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "LanguageProfile_userId_key" ON "LanguageProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LanguageProfile_userId_languageCode_key" ON "LanguageProfile"("userId", "languageCode");

-- CreateIndex
CREATE INDEX "WordStat_nextReviewDate_idx" ON "WordStat"("nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "WordStat_languageProfileId_word_key" ON "WordStat"("languageProfileId", "word");

-- CreateIndex
CREATE UNIQUE INDEX "FoundationCourse_cacheKey_key" ON "FoundationCourse"("cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "FoundationLesson_userId_key" ON "FoundationLesson"("userId");

-- CreateIndex
CREATE INDEX "FoundationLesson_userId_foundationCourseId_idx" ON "FoundationLesson"("userId", "foundationCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "FoundationLesson_foundationCourseId_orderIndex_key" ON "FoundationLesson"("foundationCourseId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "FoundationProgress_userId_key" ON "FoundationProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FoundationFreestyleLog_userId_key" ON "FoundationFreestyleLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FoundationFreestyleLog_lessonId_key" ON "FoundationFreestyleLog"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "GameScore_userId_key" ON "GameScore"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameScore_gameId_key" ON "GameScore"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameScore_userId_gameId_key" ON "GameScore"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSoundEffects_gameId_key" ON "GameSoundEffects"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameVariation_gameId_key" ON "GameVariation"("gameId");

-- CreateIndex
CREATE INDEX "Exercise_lessonId_order_idx" ON "Exercise"("lessonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_lessonId_key" ON "Quiz"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationSession_userId_key" ON "PronunciationSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationWord_sessionId_key" ON "PronunciationWord"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationProgress_userId_key" ON "PronunciationProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationProgress_userId_language_key" ON "PronunciationProgress"("userId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSession_userId_key" ON "PracticeSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSession_storyId_key" ON "PracticeSession"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeAttempt_practiceWordId_key" ON "PracticeAttempt"("practiceWordId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_userId_key" ON "LearningProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_teacherId_key" ON "Course"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_key" ON "Enrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_courseId_key" ON "Enrollment"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_key" ON "Progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_lessonId_key" ON "Progress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_enrollmentId_key" ON "Progress"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_lessonId_key" ON "Progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryQuestions_storyId_key" ON "StoryQuestions"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryQuestions_userId_key" ON "StoryQuestions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BookReport_userId_key" ON "BookReport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BookReport_bookId_key" ON "BookReport"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_userId_key" ON "Book"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingLog_userId_key" ON "ReadingLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSchedule_templateId_key" ON "EmailSchedule"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleExecutionLog_scheduleId_key" ON "ScheduleExecutionLog"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyJournal_userId_key" ON "DailyJournal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyJournal_userId_entryDate_key" ON "DailyJournal"("userId", "entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "JournalReview_journalId_key" ON "JournalReview"("journalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInformation_userId_key" ON "BillingInformation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountSettings_userId_key" ON "AccountSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_userId_key" ON "Journal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_callId_key" ON "Journal"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_userId_key" ON "Resource"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AIGeneratedContent_userId_key" ON "AIGeneratedContent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_key" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_activityId_key" ON "Like"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_activityId_key" ON "Like"("userId", "activityId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_activityId_type_idx" ON "Notification"("activityId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_activityId_fromUserId_key" ON "Notification"("userId", "activityId", "fromUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSchedule_userId_scheduleId_key" ON "UserSchedule"("userId", "scheduleId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRecord" ADD CONSTRAINT "ConversationRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRecord" ADD CONSTRAINT "ConversationRecord_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationReview" ADD CONSTRAINT "ConversationReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationReview" ADD CONSTRAINT "ConversationReview_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreestyleSession" ADD CONSTRAINT "FreestyleSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreestyleReview" ADD CONSTRAINT "FreestyleReview_freestyleSessionId_fkey" FOREIGN KEY ("freestyleSessionId") REFERENCES "FreestyleSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageProfile" ADD CONSTRAINT "LanguageProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordStat" ADD CONSTRAINT "WordStat_languageProfileId_fkey" FOREIGN KEY ("languageProfileId") REFERENCES "LanguageProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundationLesson" ADD CONSTRAINT "FoundationLesson_foundationCourseId_fkey" FOREIGN KEY ("foundationCourseId") REFERENCES "FoundationCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundationLesson" ADD CONSTRAINT "FoundationLesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundationProgress" ADD CONSTRAINT "FoundationProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundationFreestyleLog" ADD CONSTRAINT "FoundationFreestyleLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundationFreestyleLog" ADD CONSTRAINT "FoundationFreestyleLog_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "FoundationLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundationFreestyleLog" ADD CONSTRAINT "FoundationFreestyleLog_freestyleSessionId_fkey" FOREIGN KEY ("freestyleSessionId") REFERENCES "FreestyleSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameScore" ADD CONSTRAINT "GameScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameScore" ADD CONSTRAINT "GameScore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSoundEffects" ADD CONSTRAINT "GameSoundEffects_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameVariation" ADD CONSTRAINT "GameVariation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_foundationCourseId_fkey" FOREIGN KEY ("foundationCourseId") REFERENCES "FoundationCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PronunciationSession" ADD CONSTRAINT "PronunciationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PronunciationWord" ADD CONSTRAINT "PronunciationWord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PronunciationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PronunciationProgress" ADD CONSTRAINT "PronunciationProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeWord" ADD CONSTRAINT "PracticeWord_practiceSessionId_fkey" FOREIGN KEY ("practiceSessionId") REFERENCES "PracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_practiceWordId_fkey" FOREIGN KEY ("practiceWordId") REFERENCES "PracticeWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryQuestions" ADD CONSTRAINT "StoryQuestions_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryQuestions" ADD CONSTRAINT "StoryQuestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReport" ADD CONSTRAINT "BookReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReport" ADD CONSTRAINT "BookReport_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingLog" ADD CONSTRAINT "ReadingLog_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingLog" ADD CONSTRAINT "ReadingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSchedule" ADD CONSTRAINT "EmailSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleExecutionLog" ADD CONSTRAINT "ScheduleExecutionLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "EmailSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyJournal" ADD CONSTRAINT "DailyJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemTask" ADD CONSTRAINT "SystemTask_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "DailyJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalReview" ADD CONSTRAINT "JournalReview_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "DailyJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadABookPage" ADD CONSTRAINT "ReadABookPage_readABookId_fkey" FOREIGN KEY ("readABookId") REFERENCES "ReadABook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInformation" ADD CONSTRAINT "BillingInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSettings" ADD CONSTRAINT "AccountSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journal" ADD CONSTRAINT "Journal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGeneratedContent" ADD CONSTRAINT "AIGeneratedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSchedule" ADD CONSTRAINT "UserSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSchedule" ADD CONSTRAINT "UserSchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "EmailSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
