
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  scenario: 'scenario',
  metadata: 'metadata',
  nativeLanguage: 'nativeLanguage',
  tutorLanguage: 'tutorLanguage',
  level: 'level',
  introduction: 'introduction',
  vocabulary: 'vocabulary',
  characters: 'characters',
  dialogue: 'dialogue',
  userId: 'userId',
  messages: 'messages',
  imageUrl: 'imageUrl',
  aiAvatarUrl: 'aiAvatarUrl',
  aiAvatarMaleUrl: 'aiAvatarMaleUrl',
  aiAvatarFemaleUrl: 'aiAvatarFemaleUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationRecordScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  conversationId: 'conversationId',
  messages: 'messages',
  analysis: 'analysis',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  pronunciationScores: 'pronunciationScores'
};

exports.Prisma.ConversationReviewScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  conversationId: 'conversationId',
  mistakes: 'mistakes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FreestyleSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  mode: 'mode',
  level: 'level',
  topic: 'topic',
  nativeLanguage: 'nativeLanguage',
  targetLanguage: 'targetLanguage',
  voiceGender: 'voiceGender',
  aiAvatarUrl: 'aiAvatarUrl',
  isFoundation: 'isFoundation',
  duration: 'duration',
  status: 'status',
  messages: 'messages',
  fullTranscript: 'fullTranscript',
  s3AudioKey: 's3AudioKey',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FreestyleReviewScalarFieldEnum = {
  id: 'id',
  freestyleSessionId: 'freestyleSessionId',
  mistakes: 'mistakes',
  overallFeedback: 'overallFeedback',
  grammarAnalysis: 'grammarAnalysis',
  vocabUpgrades: 'vocabUpgrades',
  metrics: 'metrics',
  lambdaStatus: 'lambdaStatus',
  hasUserReviewed: 'hasUserReviewed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LanguageProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  languageCode: 'languageCode'
};

exports.Prisma.WordStatScalarFieldEnum = {
  id: 'id',
  languageProfileId: 'languageProfileId',
  word: 'word',
  seenCount: 'seenCount',
  firstSeenAt: 'firstSeenAt',
  lastSeenAt: 'lastSeenAt',
  heardCount: 'heardCount',
  lastHeardAt: 'lastHeardAt',
  tappedCorrect: 'tappedCorrect',
  tappedWrong: 'tappedWrong',
  lastTappedAt: 'lastTappedAt',
  spokenAttempts: 'spokenAttempts',
  avgSpokenScore: 'avgSpokenScore',
  lastSpokenAt: 'lastSpokenAt',
  masteryScore: 'masteryScore',
  status: 'status',
  nextReviewDate: 'nextReviewDate'
};

exports.Prisma.FoundationCourseScalarFieldEnum = {
  id: 'id',
  cacheKey: 'cacheKey',
  title: 'title',
  outline: 'outline',
  dayCount: 'dayCount',
  createdAt: 'createdAt'
};

exports.Prisma.FoundationLessonScalarFieldEnum = {
  id: 'id',
  foundationCourseId: 'foundationCourseId',
  userId: 'userId',
  orderIndex: 'orderIndex',
  status: 'status',
  visualContent: 'visualContent',
  grammarContent: 'grammarContent',
  pronunciationData: 'pronunciationData',
  listeningContent: 'listeningContent',
  quizContent: 'quizContent',
  lessonHandoff: 'lessonHandoff',
  freestyle: 'freestyle',
  createdAt: 'createdAt'
};

exports.Prisma.FoundationProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  foundationCourseId: 'foundationCourseId',
  status: 'status',
  currentDay: 'currentDay',
  currentStage: 'currentStage',
  completedLessonIds: 'completedLessonIds',
  totalXp: 'totalXp',
  overallFluency: 'overallFluency',
  skillMastery: 'skillMastery',
  itemResults: 'itemResults',
  updatedAt: 'updatedAt'
};

exports.Prisma.FoundationFreestyleLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  lessonId: 'lessonId',
  freestyleSessionId: 'freestyleSessionId',
  attemptedChunks: 'attemptedChunks',
  landedChunks: 'landedChunks',
  passed: 'passed',
  createdAt: 'createdAt'
};

exports.Prisma.GameScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  rules: 'rules',
  imageUrl: 'imageUrl',
  difficulty: 'difficulty',
  type: 'type',
  code: 'code',
  gameDataSchema: 'gameDataSchema',
  randomString: 'randomString',
  contexts: 'contexts',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameScoreScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  gameId: 'gameId',
  score: 'score',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameSoundEffectsScalarFieldEnum = {
  id: 'id',
  gameId: 'gameId',
  correctAnswer: 'correctAnswer',
  wrongAnswer: 'wrongAnswer',
  timerBepp: 'timerBepp',
  streakStart: 'streakStart',
  streakEnd: 'streakEnd',
  gameStart: 'gameStart',
  gameEnd: 'gameEnd',
  otherSounds: 'otherSounds',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameVariationScalarFieldEnum = {
  id: 'id',
  gameId: 'gameId',
  targetLanguage: 'targetLanguage',
  nativeLanguage: 'nativeLanguage',
  variation: 'variation',
  gameData: 'gameData',
  difficulty: 'difficulty',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UselessGameModelScalarFieldEnum = {
  id: 'id',
  uselessJson: 'uselessJson',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LessonScalarFieldEnum = {
  id: 'id',
  title: 'title',
  subject: 'subject',
  description: 'description',
  duration: 'duration',
  level: 'level',
  content: 'content',
  type: 'type',
  coverUrl: 'coverUrl',
  topics: 'topics',
  teacherId: 'teacherId',
  courseId: 'courseId',
  orderIndex: 'orderIndex',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  foundationCourseId: 'foundationCourseId'
};

exports.Prisma.LectureScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  content: 'content',
  coverUrl: 'coverUrl',
  lessonId: 'lessonId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExerciseScalarFieldEnum = {
  id: 'id',
  lessonId: 'lessonId',
  title: 'title',
  type: 'type',
  question: 'question',
  correctAnswer: 'correctAnswer',
  correct_answer: 'correct_answer',
  additionalData: 'additionalData',
  objectives: 'objectives',
  order: 'order',
  completed: 'completed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuizScalarFieldEnum = {
  id: 'id',
  title: 'title',
  lessonId: 'lessonId'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  quizId: 'quizId',
  text: 'text',
  options: 'options',
  answer: 'answer'
};

exports.Prisma.QuizResultScalarFieldEnum = {
  id: 'id',
  quizId: 'quizId',
  userId: 'userId',
  score: 'score',
  attempts: 'attempts',
  completedAt: 'completedAt'
};

exports.Prisma.PronunciationSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  referenceText: 'referenceText',
  recognizedText: 'recognizedText',
  language: 'language',
  audioUrl: 'audioUrl',
  duration: 'duration',
  overallScore: 'overallScore',
  accuracyScore: 'accuracyScore',
  fluencyScore: 'fluencyScore',
  pronunciationScore: 'pronunciationScore',
  completenessScore: 'completenessScore',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PronunciationWordScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  word: 'word',
  accuracyScore: 'accuracyScore',
  errorType: 'errorType',
  duration: 'duration',
  offset: 'offset',
  syllables: 'syllables',
  createdAt: 'createdAt'
};

exports.Prisma.PronunciationProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  language: 'language',
  totalSessions: 'totalSessions',
  averageScore: 'averageScore',
  practiceStreak: 'practiceStreak',
  lastPracticeDate: 'lastPracticeDate',
  commonMistakes: 'commonMistakes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PracticeSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  storyId: 'storyId',
  status: 'status',
  language: 'language',
  progress: 'progress',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PracticeWordScalarFieldEnum = {
  id: 'id',
  practiceSessionId: 'practiceSessionId',
  originalWord: 'originalWord',
  status: 'status',
  originalContext: 'originalContext',
  difficulty: 'difficulty',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PracticeAttemptScalarFieldEnum = {
  id: 'id',
  practiceWordId: 'practiceWordId',
  audioUrl: 'audioUrl',
  accuracyScore: 'accuracyScore',
  feedback: 'feedback',
  createdAt: 'createdAt'
};

exports.Prisma.LearningProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  level: 'level',
  language: 'language',
  vocabularyMastered: 'vocabularyMastered',
  lastActivity: 'lastActivity'
};

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  teacherId: 'teacherId',
  level: 'level',
  coverUrl: 'coverUrl',
  status: 'status',
  duration: 'duration',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EnrollmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  status: 'status',
  progress: 'progress',
  lastAccessedAt: 'lastAccessedAt',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  lessonId: 'lessonId',
  status: 'status',
  score: 'score',
  enrollmentId: 'enrollmentId',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StoryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  topic: 'topic',
  difficulty: 'difficulty',
  paragraphs: 'paragraphs',
  genre: 'genre',
  grammar: 'grammar',
  frenchText: 'frenchText',
  englishText: 'englishText',
  teaser: 'teaser',
  language: 'language',
  vocabulary: 'vocabulary',
  grammarHighlights: 'grammarHighlights',
  exercises: 'exercises',
  audioUrl: 'audioUrl',
  imageUrl: 'imageUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StoryQuestionsScalarFieldEnum = {
  id: 'id',
  storyId: 'storyId',
  question: 'question',
  answer: 'answer',
  mark: 'mark',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookReportScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  bookId: 'bookId',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  progress: 'progress',
  report: 'report',
  rating: 'rating',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  author: 'author',
  genre: 'genre',
  pages: 'pages',
  language: 'language',
  isReading: 'isReading',
  currentPage: 'currentPage',
  readingProgress: 'readingProgress',
  isCompleted: 'isCompleted',
  coverUrl: 'coverUrl',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReadingLogScalarFieldEnum = {
  id: 'id',
  dateRead: 'dateRead',
  startPage: 'startPage',
  endPage: 'endPage',
  pagesRead: 'pagesRead',
  shortSummary: 'shortSummary',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  bookId: 'bookId',
  userId: 'userId'
};

exports.Prisma.EmailTemplateScalarFieldEnum = {
  id: 'id',
  templateName: 'templateName',
  subject: 'subject',
  content: 'content',
  designHtml: 'designHtml',
  handlebarsType: 'handlebarsType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailScheduleScalarFieldEnum = {
  id: 'id',
  scheduleName: 'scheduleName',
  templateId: 'templateId',
  status: 'status',
  frequency: 'frequency',
  startDate: 'startDate',
  endDate: 'endDate',
  timeOfDay: 'timeOfDay',
  daysOfWeek: 'daysOfWeek',
  timeZone: 'timeZone',
  lastRun: 'lastRun',
  nextRun: 'nextRun',
  recipients: 'recipients',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScheduleExecutionLogScalarFieldEnum = {
  id: 'id',
  scheduleId: 'scheduleId',
  runAt: 'runAt',
  status: 'status',
  details: 'details'
};

exports.Prisma.DailyJournalScalarFieldEnum = {
  id: 'id',
  transcript: 'transcript',
  s3Key: 's3Key',
  language: 'language',
  isCompleted: 'isCompleted',
  entryDate: 'entryDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.SystemTaskScalarFieldEnum = {
  id: 'id',
  type: 'type',
  status: 'status',
  payload: 'payload',
  error: 'error',
  metadata: 'metadata',
  result: 'result',
  journalId: 'journalId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JournalReviewScalarFieldEnum = {
  id: 'id',
  overallScore: 'overallScore',
  accuracyScore: 'accuracyScore',
  fluencyScore: 'fluencyScore',
  completenessScore: 'completenessScore',
  prosodyScore: 'prosodyScore',
  wordAnalysis: 'wordAnalysis',
  targetLanguage: 'targetLanguage',
  summaryFeedback: 'summaryFeedback',
  finalTranscript: 'finalTranscript',
  translation: 'translation',
  grammarMistakes: 'grammarMistakes',
  vocabularySuggestions: 'vocabularySuggestions',
  journalId: 'journalId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReadABookScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  coverImage: 'coverImage',
  topic: 'topic',
  genre: 'genre',
  targetLanguage: 'targetLanguage',
  NativeLanguage: 'NativeLanguage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReadABookPageScalarFieldEnum = {
  id: 'id',
  readABookId: 'readABookId',
  pageNumber: 'pageNumber',
  content: 'content',
  imageUrl: 'imageUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  email: 'email',
  name: 'name',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  nativeLanguage: 'nativeLanguage',
  targetLanguage: 'targetLanguage'
};

exports.Prisma.BillingInformationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  currentPlan: 'currentPlan',
  billingInterval: 'billingInterval',
  nextBillingDate: 'nextBillingDate',
  isActive: 'isActive',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  lastPaymentDate: 'lastPaymentDate',
  paymentStatus: 'paymentStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountSettingsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  language: 'language',
  displayName: 'displayName',
  avatarUrl: 'avatarUrl',
  aiVoicePreference: 'aiVoicePreference',
  level: 'level',
  dailyEmails: 'dailyEmails',
  weeklyEmails: 'weeklyEmails',
  promotionEmails: 'promotionEmails',
  shareReadingLogs: 'shareReadingLogs',
  shareConversationActivity: 'shareConversationActivity',
  shareAchievements: 'shareAchievements',
  shareLessonsAndCourses: 'shareLessonsAndCourses',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeacherScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subjects: 'subjects'
};

exports.Prisma.JournalScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  callId: 'callId',
  record: 'record',
  recordingUrl: 'recordingUrl',
  length: 'length',
  completed: 'completed',
  summary: 'summary',
  to: 'to',
  from: 'from',
  transcripts: 'transcripts',
  language: 'language',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ResourceScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  content: 'content',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AIGeneratedContentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  content: 'content',
  context: 'context',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  criteria: 'criteria',
  imageUrl: 'imageUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  categoryId: 'categoryId'
};

exports.Prisma.UserProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  achievementId: 'achievementId',
  progress: 'progress',
  unlockedAt: 'unlockedAt',
  isUnlocked: 'isUnlocked',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LikeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  activityId: 'activityId',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  userId: 'userId',
  toUserId: 'toUserId',
  fromUserId: 'fromUserId',
  activityId: 'activityId',
  activityType: 'activityType',
  activityTitle: 'activityTitle',
  isRead: 'isRead',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScheduleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  scheduleId: 'scheduleId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};
exports.Languages = exports.$Enums.Languages = {
  ENGLISH: 'ENGLISH',
  SPANISH: 'SPANISH',
  FRENCH: 'FRENCH',
  JAPANESE: 'JAPANESE'
};

exports.Level = exports.$Enums.Level = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
};

exports.FreestyleMode = exports.$Enums.FreestyleMode = {
  INTRODUCTION: 'INTRODUCTION',
  SPECIFIC: 'SPECIFIC',
  RANDOM: 'RANDOM',
  ARGUMENTATIVE: 'ARGUMENTATIVE'
};

exports.FreestyleLevel = exports.$Enums.FreestyleLevel = {
  ZERO: 'ZERO',
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  FLUENT: 'FLUENT'
};

exports.VoiceGender = exports.$Enums.VoiceGender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
};

exports.SessionStatus = exports.$Enums.SessionStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REVIEW_PENDING: 'REVIEW_PENDING',
  REVIEWED: 'REVIEWED'
};

exports.LambdaStatus = exports.$Enums.LambdaStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

exports.GameType = exports.$Enums.GameType = {
  Verbal: 'Verbal',
  Visual: 'Visual',
  Acoustic: 'Acoustic',
  Speech_Describe: 'Speech_Describe'
};

exports.GameContext = exports.$Enums.GameContext = {
  SPEAKING: 'SPEAKING',
  LISTENING: 'LISTENING',
  READING: 'READING',
  WRITING: 'WRITING',
  IMAGES: 'IMAGES',
  AUDIO: 'AUDIO',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE'
};

exports.GameDifficulty = exports.$Enums.GameDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  INSANE: 'INSANE'
};

exports.LessonType = exports.$Enums.LessonType = {
  Lesson: 'Lesson',
  Lecture: 'Lecture',
  Conversation: 'Conversation',
  Visual: 'Visual',
  Exercise: 'Exercise'
};

exports.PracticeStatus = exports.$Enums.PracticeStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

exports.WordStatus = exports.$Enums.WordStatus = {
  NEEDS_PRACTICE: 'NEEDS_PRACTICE',
  IMPROVING: 'IMPROVING',
  MASTERED: 'MASTERED'
};

exports.CourseStatus = exports.$Enums.CourseStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

exports.EnrollmentStatus = exports.$Enums.EnrollmentStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED'
};

exports.Status = exports.$Enums.Status = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

exports.ReportStatus = exports.$Enums.ReportStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

exports.HandlebarsType = exports.$Enums.HandlebarsType = {
  Lesson: 'Lesson',
  Course: 'Course',
  Book: 'Book',
  Exercise: 'Exercise'
};

exports.ScheduleStatus = exports.$Enums.ScheduleStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED'
};

exports.SystemTaskType = exports.$Enums.SystemTaskType = {
  SPEECH_PRONUNCIATION_ANALYSIS: 'SPEECH_PRONUNCIATION_ANALYSIS',
  COURSE_GENERTATION: 'COURSE_GENERTATION',
  BOOK_GENERATION: 'BOOK_GENERATION',
  CONVERSATION_GENERATION: 'CONVERSATION_GENERATION',
  GAME_VARIATION_GENERATION: 'GAME_VARIATION_GENERATION',
  GAME_SCHEMA_GENERATION: 'GAME_SCHEMA_GENERATION',
  CONVERSATION_IMAGE_GENERATION: 'CONVERSATION_IMAGE_GENERATION',
  FREESTYLE_REVIEW: 'FREESTYLE_REVIEW'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.Role = exports.$Enums.Role = {
  USER: 'USER',
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN'
};

exports.Billing = exports.$Enums.Billing = {
  FREE: 'FREE',
  BASIC_MONTHLY: 'BASIC_MONTHLY',
  BASIC_ANNUALLY: 'BASIC_ANNUALLY',
  PREMIUM_MONTHLY: 'PREMIUM_MONTHLY',
  PREMIUM_ANNUALLY: 'PREMIUM_ANNUALLY'
};

exports.BillingInterval = exports.$Enums.BillingInterval = {
  MONTHLY: 'MONTHLY',
  ANNUALLY: 'ANNUALLY'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED'
};

exports.VoicePreference = exports.$Enums.VoicePreference = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
};

exports.Prisma.ModelName = {
  Conversation: 'Conversation',
  ConversationRecord: 'ConversationRecord',
  ConversationReview: 'ConversationReview',
  FreestyleSession: 'FreestyleSession',
  FreestyleReview: 'FreestyleReview',
  LanguageProfile: 'LanguageProfile',
  WordStat: 'WordStat',
  FoundationCourse: 'FoundationCourse',
  FoundationLesson: 'FoundationLesson',
  FoundationProgress: 'FoundationProgress',
  FoundationFreestyleLog: 'FoundationFreestyleLog',
  Game: 'Game',
  GameScore: 'GameScore',
  GameSoundEffects: 'GameSoundEffects',
  GameVariation: 'GameVariation',
  UselessGameModel: 'UselessGameModel',
  Lesson: 'Lesson',
  Lecture: 'Lecture',
  Exercise: 'Exercise',
  Quiz: 'Quiz',
  Question: 'Question',
  QuizResult: 'QuizResult',
  PronunciationSession: 'PronunciationSession',
  PronunciationWord: 'PronunciationWord',
  PronunciationProgress: 'PronunciationProgress',
  PracticeSession: 'PracticeSession',
  PracticeWord: 'PracticeWord',
  PracticeAttempt: 'PracticeAttempt',
  LearningProgress: 'LearningProgress',
  Course: 'Course',
  Enrollment: 'Enrollment',
  Progress: 'Progress',
  Story: 'Story',
  StoryQuestions: 'StoryQuestions',
  BookReport: 'BookReport',
  Book: 'Book',
  ReadingLog: 'ReadingLog',
  EmailTemplate: 'EmailTemplate',
  EmailSchedule: 'EmailSchedule',
  ScheduleExecutionLog: 'ScheduleExecutionLog',
  DailyJournal: 'DailyJournal',
  SystemTask: 'SystemTask',
  JournalReview: 'JournalReview',
  ReadABook: 'ReadABook',
  ReadABookPage: 'ReadABookPage',
  User: 'User',
  BillingInformation: 'BillingInformation',
  AccountSettings: 'AccountSettings',
  Teacher: 'Teacher',
  Journal: 'Journal',
  Resource: 'Resource',
  AIGeneratedContent: 'AIGeneratedContent',
  Achievement: 'Achievement',
  UserProgress: 'UserProgress',
  Category: 'Category',
  Like: 'Like',
  Notification: 'Notification',
  UserSchedule: 'UserSchedule'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
