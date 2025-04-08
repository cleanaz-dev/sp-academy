import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function createLecturePrompt() {
  return `You are an enthusiastic expert teacher. Create an engaging lesson with clear image prompts.

⏱️ Estimated Reading Time: [Calculate based on 200 words per minute]

# 🌟 [Engaging Title(create an engaging title)]

[IMAGE-1]
Image Prompt: "[main topic]"

## 🎯 Quick Preview
Three exciting things you'll learn today (use emojis)

## 🎬 Opening Hook
An engaging paragraph that captures attention and sets up the topic (3-4 sentences)

## 📚 Core Focus
Brief introduction to what we'll be studying today (person, place, event, or concept)

## 🔍 [First Main Subject Name]
[IMAGE-2]
Image Prompt: "[subject name]"

[Full paragraph about this subject - minimum 200 words, including specific examples and detailed explanations]

### Key Features/Contributions
- Major characteristics or achievements
- Historical or cultural impact
- Specific dates and data (if applicable)

### Historical Significance/Legacy
[Paragraph about lasting influence or importance]

⭐ Fun Fact: [Related interesting fact]

## 🔍 [Second Main Subject Name]
[IMAGE-3]
Image Prompt: "[subject name]"

[Full paragraph about this subject - minimum 200 words, including specific examples and detailed explanations]

### Key Features/Contributions
- Major characteristics or achievements
- Historical or cultural impact
- Specific dates and data (if applicable)

### Historical Significance/Legacy
[Paragraph about lasting influence or importance]

⭐ Fun Fact: [Related interesting fact]

## 🔍 [Third Main Subject Name]
[IMAGE-4]
Image Prompt: "[subject name]"

[Full paragraph about this subject - minimum 200 words, including specific examples and detailed explanations]

### Key Features/Contributions
- Major characteristics or achievements
- Historical or cultural impact
- Specific dates and data (if applicable)

### Historical Significance/Legacy
[Paragraph about lasting influence or importance]

⭐ Fun Fact: [Related interesting fact]

## 💡 Historical Context
[Paragraph about the time period and significance]

## 📖 Key Innovations & Patents (if applicable. if none do not include this section)
[List of specific innovations with dates and patent numbers, or skip if not relevant]

## 🎯 Impact & Influence
[Concluding paragraph about collective impact]

[End of the lesson] (do not include the [End of the lesson] if not relevant)

ENSURE CONTENT: (do not include the Ensure content in output)
- Uses [IMAGE-X] markers for easy extraction
- Provides detailed image prompts for AI generation
- Makes subject names the main headers
- Includes specific dates and data (where applicable)
- Balances descriptive info with achievements or significance
- Keeps focus on the main subjects throughout

IMPORTANT RULES FOR IMAGE PROMPTS:
- For [IMAGE-1]:  [main topic] Use Only the main topic, nothing else
- For [IMAGE-2], [IMAGE-3], [IMAGE-4]: Use ONLY the subject's name, nothing else
- JUST the name
    `;
}

export function conversationDialogPrompt({
  targetLanguage,
  nativeLanguage,
  title,
  dialogue,
  vocabulary,
  history,
  message,
}) {
  return `
      You are a ${targetLanguage} language conversation partner for ABSOLUTE BEGINNERS.
      
      Key rules for beginner-level responses:
      - Use only basic present tense
      - Maximum 5-6 words per sentence
      - Use only common, basic vocabulary
      - ALWAYS end with a simple question
      - Keep the conversation flowing

      Response format MUST be:
      ➤ [Your response in ${targetLanguage}]
      ⟿ [Translation in ${nativeLanguage}]

      Example:
      ➤ Bonjour, comment ça va ?
      ⟿ Hello, how are you?

      Topic: "${title}"

      Original Dialogue Scenario:
      ${dialogue
        .map((d) => `${d.speaker}: ${d.targetLanguage} (${d.nativeLanguage})`)
        .join("\n")}

      Relevant Vocabulary:
      ${vocabulary
        .map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`)
        .join("\n")}

      Previous conversation:
      ${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

      User's latest message: "${message}"

      **Important Rules:**
      - Use VERY simple language suitable for beginners
      - Keep sentences extremely short and basic
      - Use only present tense
      - ALWAYS include a simple question
      - Prefer yes/no questions
      - Use mostly words from the vocabulary list
      - Response pattern: Short statement + Simple question
      - **Do not add extra text or explanations. Only return the two lines following the correct format.** `;
}

export function getUserScorePrompt({
  targetLanguage,
  recentHistory,
  title,
  vocabulary,
  userMessage,
}) {
  return `
     You are a language tutor grading a student's response in ${targetLanguage}.
      
      First, review the chat history to understand the context of the conversation based on the title: "${title}".
      
      Student is at a Beginner level, first message is usally a greeting, so score should reflect.

      Then, grade the student's response (1-10) based on:
      - Whether it is an appropriate response to the conversation (CRITICAL)
      - Grammar and vocabulary usage
      - Use of suggested vocabulary  
      
      ### Scoring Guidelines:  
      - Scores 1-2 (Poor): Off-topic or irrelevant to the conversation context  
      - Scores 3-4 (Fair): Somewhat relevant but with major issues  
      - Scores 5-6 (Good): Relevant with some minor issues  
      - Scores 7-8 (Very Good): Relevant and mostly correct  
      - Scores 9-10 (Excellent): Perfectly relevant and correct  
      
      ### Important Notes:  
      - If the response is off-topic or doesn't fit the conversation context, score MUST be 1 or 2, even if grammar is correct.  
      - Consider that the student is a beginner.  
      - Context relevance is the top priority.  
      
      ---
      
      ### Format your response exactly like this:  
      Score : [number]  
      Explanation: [brief reason]  
      Improved Response (only one improved response): [better version if needed, otherwise say "No improvement needed"]  
     Corrections (Separate each concept with):
       Gender Agreement: Original phrase → Corrected phrase  (if needed, other wise say "No correction needed")
       Why: Short reason for the correction  
       Vocabulary: Original phrase → Corrected phrase (if needed, other wise say "No correction needed")
       Why: Short reason for the correction  
       Article: Original phrase → Corrected phrase  (if needed, other wise say "No correction needed")
       Why: Short reason for the correction
      
      ---
      
      ### Recent Chat History (last 4 messages for context)  
      ${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}  
      
      ### Student's Response:  
      "${userMessage}"  
      
      ### Suggested Vocabulary:  
      ${vocabulary
        .map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`)
        .join("\n")}  
      `;
}

export function createLanguageLecturePrompt2() {
  return `You are an experienced French language teacher. Create TWO DISTINCT PAGES of lesson content following this exact format:

[IMPORTANT FORMATTING RULES:]
1. For all dialogues, use this exact format with two spaces at the end of each line for line breaks:
Person 1: French text  
    English translation  

Person 2: French text  
    English translation  

2. For vocabulary items:
French word/phrase  
    English translation  

3. For all translations:
French text  
    English translation  

[Example of correct dialogue formatting:
Marie: Bonjour, comment allez-vous?  
    Hello, how are you?  

Pierre: Je vais très bien, merci!  
    I'm doing very well, thank you!  ]


[Page-1]
⏱️ Estimated Reading Time: [Calculate based on 200 words per minute]

# 🌟 [Title in French]

[IMAGE-1]
Image Prompt: "[Title], no text"

## 🎯 Objectifs d'Aujourd'hui / Today's Goals
Trois compétences linguistiques que vous apprendrez (use emojis):
- Point de grammaire / Grammar point
- Vocabulaire / Vocabulary focus
- Objectif de communication / Communication goal
[Limit to 80-100 words]

## 👋 Dialogue d'Introduction / Opening Dialogue
**FORMAT FOR DIALOGUES:**
Person: French text
    English translation

[Example format:
Marie: Bonjour, comment allez-vous?
    Hello, how are you?

Pierre: Je vais très bien, merci!
    I'm doing very well, thank you!]
[Limit to 150-200 words]


**Verb Conjugation:**  
#### Conjugaison du Verbe "Parler" (To Speak)

| Pronom       | Conjugaison |
|--------------|-------------|
| Je           | parle       |
| Tu           | parles      |
| Il/Elle/On   | parle       |
| Nous         | parlons     |
| Vous         | parlez      |
| Ils/Elles    | parlent     |

## 📚 Introduction du Vocabulaire / Vocabulary Introduction
[IMAGE-2]
Image Prompt: "[person learning something new], no text"

### Mots et Phrases Essentiels / Essential Words and Phrases
**FORMAT FOR VOCABULARY:**
French word/phrase
    English translation

[Example format:
définir
    to define

faire les courses
    to go shopping]
[Include 6-8 key vocabulary items]
[Limit to 100-120 words]

### Pratique de Prononciation / Pronunciation Practice
🗣️ Sons clés et conseils de prononciation
French explanation <br/>
English translation
[Limit to 80-100 words]

## 🔍 Point de Grammaire / Grammar Focus
[IMAGE-3]
Image Prompt: "[Scenario of where the grammar would be used. eg. office, home, store, school, restaurant], no text"

### Introduction des Structures / Pattern Introduction
French explanation <br/>
English translation

Examples:
French sentence
    English translation
[Limit to 150-200 words]

### Utilisation Courante / Common Usage
Situation 1: French example
    English translation

Situation 2: French example
    English translation

Situation 3: French example
    English translation
[Limit to 120-150 words]

⭐ Conseil Utile / Pro Tip:
French tip
    English translation
[Limit to 30-50 words]

## 💬 Applications Pratiques / Practical Applications
[IMAGE-4]
Image Prompt: "[name of action, just the action name only. eg. eating or thinking or going ], no text"

### Scénarios de la Vie Quotidienne / Real-Life Scenarios
**FORMAT FOR DIALOGUES:**
Person: French text
    English translation

[Must include double line breaks between speakers]
[Limit to 150-200 words]

### Contexte Culturel / Cultural Context
French explanation
    English translation
[Limit to 100-150 words]

## 🌟 Révision Rapide / Quick Review
- Points clés appris / Key points learned
- Erreurs courantes à éviter / Common mistakes to avoid
- Aperçu de la prochaine leçon / Next lesson preview
[Limit to 80-100 words]

## 📝 Récapitulatif de la Leçon Actuelle / Current Lesson Summary
- **Main things covered**:
  - [Main grammar point covered]
  - [Vocabulary introduced]
  - [Key communication objective]

[Page-2]
[Continue with same page 1 template...]

[CONTINUE WITH ALL SECTIONS:
- Same section structure as Page 1
- New examples/scenarios
- Different vocabulary sets
- Alternative grammar applications
- Unique cultural context]

ENSURE CONTENT:
- PRIMARY language is French
- ALWAYS include English translations indented below French text
- Keep sentences simple and clear
- Focus on practical usage
- Build complexity gradually
- Add double line breaks between dialogue speakers
- Use consistent indentation for translations

IMPORTANT RULES FOR IMAGE PROMPTS:
- [IMAGE-1]: Learning environment visualization (no text)
- [IMAGE-2]: Person learning something new (no text)
- [IMAGE-3]: Scenario people doing subject (no text)
- [IMAGE-4]: Fun Image (no text)
- PAGE 2 [IMAGE-5] [IMAGE-6] [IMAGE-7] [IMAGE-8] (no text)
- Keep images simple and focused on language learning
- BAD PROMPT EXAMPLE: "Common IR verbs in action, no text"

ONLY OUTPUT LESSON TEXT NOTHING ELSE.`;
}

export function createLanguageLecturePrompt() {
  return `
  You're a lesson generator for a french e-learning platform. Creating interactive components in Markdown format for language learning.
  Use the following components to create engaging language learning content:

Audio component
:::component::audio:::{"text": "Bonjour, comment vas-tu?", "language": "fr-FR"}

Header with audio
# Audio Header Example
:::component::audio:::{"text": "Header Audio Test: Bonjour", "language": "en-US"}

Flashcard component
:::component::flashcard:::{"front": "Bonjour", "back": "Hello"}

Pronunciation component
:::component::pronunciation:::{ "targetText": "Hello how are you"}

Conjugation table (output all infinitives for er vebrs) MUST OUTPUT 2 SEPARATE COMPONETNS FOR 2 VERBS
:::component::conjugationTable:::{ "verbs": "enter verbs here", "tense": "present", "conjugation": "enter conjugation here", "englishTranslations for each  conjugation": "enter english translation here"}

eg.
:::component::conjugationTable:::{
    "verbs": ["parler"],
    "tense": "present",
    "conjugation": [
        "je parle",
        "tu parles",
        "il/elle/on parle",
        "nous parlons",
        "vous parlez",
        "ils/elles parlent"
    ],
    "englishTranslations": [
        "I speak",
        "You speak (singular informal)",
        "He/She/One speaks",
        "We speak",
        "You speak (plural/formal)",
        "They speak"
    ]
}

ONLY OUTPUT COMPONENTS ONLY.
`;
}

export function createLanguageLecturePrompt4() {
  return `You are an experienced French language teacher. As an experienced French language teacher, create a lesson that engages learners through clear explanations, relevant examples, and practical applications. Your lesson should feel like a live lecture, with a teacher's voice guiding the learners. Use a friendly, encouraging tone, addressing learners directly (e.g., "you" or "your"), and include questions or prompts for reflection and practice to simulate classroom interaction.

[IMPORTANT FORMATTING RULES:]
1. For all dialogues, use this exact format with two spaces at the end of each line for line breaks:
Person 1: French text  
    English translation  

Person 2: French text  
    English translation  

2. For vocabulary items:
French word/phrase  
    English translation  

3. For all translations:
French text  
    English translation  

[Example of correct dialogue formatting:
Marie: Bonjour, comment allez-vous?  
    Hello, how are you?  

Pierre: Je vais très bien, merci!  
    I'm doing very well, thank you!  ]

[Component Usage:]
- Use :::component::audio::: for audio playback (e.g., {"text": "French text", "language": "fr-FR"})
- Use :::component::flashcard::: for vocabulary (e.g., {"front": "French word", "back": "English translation"})
- Use :::component::pronunciation::: for pronunciation practice (e.g., {"targetText": "French phrase"})
- Conjugation table (output all infinitives for ER verbs) MUST OUTPUT 2 SEPARATE COMPONENTS FOR 2 VERBS:
:::component::conjugationTable:::{ "verbs": "enter verbs here", "tense": "present", "conjugation": "enter conjugation here", "englishTranslations for each conjugation": "enter english translation here"}
eg.
:::component::conjugationTable:::{
    "verbs": ["parler"],
    "tense": "present",
    "conjugation": [
        "je parle",
        "tu parles",
        "il/elle/on parle",
        "nous parlons",
        "vous parlez",
        "ils/elles parlent"
    ],
    "englishTranslations": [
        "I speak",
        "You speak (singular informal)",
        "He/She/One speaks",
        "We speak",
        "You speak (plural/formal)",
        "They speak"
    ]
}
- MUST LEAVE A NEWLINE AFTER EACH COMPONENT OR THEY WILL NOT RENDER CORRECTLY.

IMPORTANT RULES FOR IMAGE PROMPTS:
- MUST OUTPUT IMAGE PROMPTS AS NOTED.
- Follow the exact structure: [IMAGE-X] followed by a newline, then Image Prompt: "your prompt here".
- Ensure the content of each prompt aligns with the specified themes:
  - [IMAGE-1]: People learning in a specific context.
  - [IMAGE-2]: Based on one of the flashcards.
  - [IMAGE-3]: Based on one of the verb actions.
  - [IMAGE-4]: Based on a real-life scenario.

[Page-1]
⏱️ Estimated Reading Time: [Calculate based on 200 words per minute]

# 🌟 [Title in French]
[Create a catchy, thematic title related to the lesson content]

[IMAGE-1]
Image Prompt: "People learning in a classroom or casual setting"

## 🎯 Objectifs d'Aujourd'hui / Today's Goals
Trois compétences linguistiques que vous apprendrez (use emojis):
- 📝 Point de grammaire / Grammar point: [Specify the grammar focus]
- 🗣️ Vocabulaire / Vocabulary focus: [Specify the vocabulary theme]
- 💬 Objectif de communication / Communication goal: [Specify the communication skill]
[Explain briefly why these objectives matter to learners and how they connect to their language journey, e.g., "Mastering this grammar will help you form sentences confidently!" Limit to 80-100 words]

## 👋 Dialogue d'Introduction / Opening Dialogue
**FORMAT FOR DIALOGUES:**
Person: French text  
    English translation  
[Create a short, relatable dialogue introducing the lesson theme, e.g., greetings or ordering food. Limit to 150-200 words]
[After the dialogue, add a brief analysis: "Notice how [key vocab/grammar] is used here. Can you spot it? This sets the tone for today’s lesson!"]
:::component::audio:::{"text": "Full dialogue text", "language": "fr-FR"}

## 📚 Introduction du Vocabulaire / Vocabulary Introduction
[IMAGE-2]
Image Prompt: "Scene related to one vocabulary flashcard, e.g., 'le café' as a cozy café"

### Mots et Phrases Essentiels / Essential Words and Phrases
**FORMAT FOR VOCABULARY AS FLASHCARDS:**
:::component::flashcard:::{"front": "French word/phrase", "back": "English translation"}
[Include 6-8 key items tied to the lesson theme. Provide a short paragraph or sample sentences showing them in context, e.g., "Imagine ordering 'un café' at a French café!" Limit to 100-120 words]

### Pratique de Prononciation / Pronunciation Practice
🗣️ Sons clés et conseils de prononciation  
:::component::pronunciation:::{"targetText": "Key phrase from vocab or dialogue"}  
French explanation: [Focus on a challenging sound or word, e.g., nasal vowels, with a tip like "Round your lips for 'un'!"]. <br/>  
English translation: [Translate the tip].  
[Encourage practice: "Try saying it aloud—does it feel natural?" Limit to 80-100 words]

## 🔍 Point de Grammaire / Grammar Focus
[IMAGE-3]
Image Prompt: "Action related to one verb, e.g., 'parler' as people chatting"

### Introduction des Structures / Pattern Introduction
French explanation: [Break down the grammar point step-by-step, e.g., "Les verbes en -ER suivent un modèle simple."] <br/>  
English translation: [Translate, e.g., "ER verbs follow a simple pattern."]  
Examples:  
French sentence  
    English translation  
[Use 2-3 clear examples. Compare to English if helpful, e.g., "Like adding -s in English!" Limit to 150-200 words]

### Utilisation Courante / Common Usage
Situation 1: French example  
    English translation  

Situation 2: French example  
    English translation  

Situation 3: French example  
    English translation  
[Show the grammar in realistic contexts, e.g., "You’ll use this when ordering food!" Include common mistakes to avoid, e.g., "Don’t mix up 'je' and 'tu' forms." Limit to 120-150 words]

⭐ Conseil Utile / Pro Tip:  
French tip: [e.g., "Ajoutez 's’il vous plaît' pour être poli!"]  
    English translation: [e.g., "Add 'please' to be polite!"]  
[Keep it practical and concise, limit to 30-50 words]

#### Conjugaison du Verbe
:::component::conjugationTable:::[JSON object for first ER verb, e.g., "parler"]
:::component::conjugationTable:::[JSON object for second ER verb, e.g., "manger"]

## 💬 Applications Pratiques / Practical Applications
[IMAGE-4]
Image Prompt: "Real-life scene, e.g., ordering at a café or greeting friends"

### Scénarios de la Vie Quotidienne / Real-Life Scenarios
**FORMAT FOR DIALOGUES:**
Person: French text  
    English translation  
[Create an engaging scenario using lesson vocab and grammar, e.g., ordering food. Add a prompt: "How would you respond here?" Limit to 150-200 words]  
:::component::audio:::{"text": "Full scenario text", "language": "fr-FR"}

### Contexte Culturel / Cultural Context
French explanation: [Share a fun fact or custom, e.g., "Les Français adorent discuter autour d’un café!"]  
    English translation: [e.g., "The French love chatting over coffee!"]  
[Explain its language impact, e.g., "That’s why 'prendre un café' is so common!" Limit to 100-150 words]

## 🌟 Révision Rapide / Quick Review
- Points clés appris / Key points learned: [Summarize grammar, vocab, and communication goal]  
- Erreurs courantes à éviter / Common mistakes to avoid: [e.g., "Don’t forget the -e for feminine adjectives!"]  
- Aperçu de la prochaine leçon / Next lesson preview: [e.g., "Next, we’ll tackle questions!"]  
[Add a self-check: "Can you make a sentence with today’s vocab?" Limit to 80-100 words]

## 📝 Récapitulatif de la Leçon Actuelle / Current Lesson Summary
- **Main things covered**:  
  - [Main grammar point covered]  
  - [Vocabulary introduced]  
  - [Key communication objective]  

ENSURE CONTENT:
- PRIMARY language is French  
- ALWAYS include English translations indented below French text  
- Keep sentences simple and clear  
- Focus on practical usage  
- Build complexity gradually  
- Add double line breaks between dialogue speakers  
- Use consistent indentation for translations  
ONLY OUTPUT LESSON TEXT, NOTHING ELSE.`;
}

export function createLanguageLecturePrompt13() {
  return `You are an experienced French language teacher. Create a lesson that engages learners through clear explanations, relevant examples, and practical applications, feeling like a live lecture with a teacher's voice guiding them. Use a friendly, encouraging tone, addressing learners directly (e.g., "you" or "your"), and include questions or prompts for reflection and practice to simulate classroom interaction. For each section, generate an 80-120 word introductory paragraph in French (followed by an English translation indented below) to preview the section’s purpose, connect it to language learning, and engage learners with a simple question or call-to-action. Wrap each intro in a :::component::topic::: with "french" and "english" fields.

[IMPORTANT FORMATTING RULES:]
1. For intros, use :::component::topic:::{"french": "French intro text", "english": "English intro text"} before each section’s component(s).
2. For other components, use explicit French and English fields in JSON (e.g., "french": "...", "english": "...") for translations.
3. **PRESERVE ALL [IMAGE-X] PLACEHOLDERS AND THEIR PROMPTS EXACTLY AS SHOWN IN THE TEMPLATE.** Do not remove, modify, or replace them—they are critical for an image generator. Output them on their own lines with the exact text (e.g., [IMAGE-1] followed by Image Prompt: "People learning in a classroom or casual setting").

[Component Usage for Topic:]
- :::component::topic:::{"french": "French introductory paragraph", "english": "English translation"}
[Generate 80-120 words in French explaining the section’s role, using simple, clear language for new learners, followed by an English translation.]

[Component Usage for Goals:]
- :::component::goals:::{"title": {"french": "French title", "english": "English title"}, "hook": {"french": "French hook", "english": "English translation"}, "objectives": {"grammar": {"french": "French point", "english": "English"}, "vocab": {"french": "French theme", "english": "English"}, "communication": {"french": "French goal", "english": "English"}}, "explanation": {"french": "French explanation with teaser", "english": "English translation with teaser"}}
[Before this, generate a Topic intro explaining why goals matter for starting a French journey, how they set the stage for daily communication, and a question like "What do you want to say today?" Keep component content 80-100 words.]

[Component Usage for Dialogue:]
- :::component::dialogue:::{"title": {"french": "French title", "english": "English title"}, "lines": [{"speaker": "Female Name (e.g., Marie)", "french": "French text", "english": "English translation"}, {"speaker": "Male Name (e.g., Pierre)", "french": "French text", "english": "English translation"}], "analysis": {"french": "French analysis", "english": "English translation"}}
[Before this, generate a Topic intro explaining how dialogues show real French, their role in listening skills, and a question like "What do you hear in their words?" Keep component content 150-200 words, including analysis with a question.]

[Component Usage for Vocab:]
- :::component::vocab:::{"title": {"french": "French title", "english": "English title"}, "items": [{"french": "French word/phrase", "english": "English translation", "example": {"french": "French example sentence", "english": "English translation"}}], "context": {"french": "French context explanation", "english": "English translation"}}
[Before this, generate a Topic intro explaining vocabulary’s role as building blocks, how these words fit the theme, and a prompt like "How will you use these today?" Keep component context 100-120 words.]

[Component Usage for ConjugationTable:]
- :::component::conjugationTable:::{"verbs": ["French infinitive"], "tense": "Tense name", "conjugation": ["French conjugation 1", "French conjugation 2", ...], "englishTranslations": ["English translation 1", "English translation 2", ...]}
[Before the two components, generate a unique Topic intro explaining why conjugation powers verbs, how ER verbs follow a pattern, and a question like "Can you spot the rule?" Tailor each intro to the specific verb.]

[Component Usage for Pronunciation:]
- :::component::pronunciation:::{"title": {"french": "French title", "english": "English title"}, "items": [{"targetText": "French simple sentence"}]}
[Before this, generate a Topic intro explaining pronunciation’s importance for clear French, how these sentences practice key sounds, and a prompt like "Can you say it smoothly?" Keep component content 60-80 words.]

- MUST LEAVE A NEWLINE AFTER EACH COMPONENT OR THEY WILL NOT RENDER CORRECTLY.
- Ensure all accents (e.g., é, à) are preserved in JSON strings.
- FOR IMAGE PROMPTS FOLLOW INSTRUCTIONS CLOSELY TO GENERATE CORRECTLY-FORMATTED IMAGE PROMPTS.

[Page-1]
⏱️ Estimated Reading Time: [Calculate based on 200 words per minute]

# 🌟 [Catchy French title tied to lesson theme]

[IMAGE-1]
Image Prompt: "People learning in a classroom or casual setting"

## 🎯 Objectifs d'Aujourd'hui / Today's Goals
:::component::topic:::
:::component::goals:::

## 👋 Dialogue d'Introduction / Opening Dialogue

[IMAGE-2]
Image Prompt: "simple image prompt based on the following dialogue"

:::component::topic:::
:::component::dialogue:::

## 📚 Introduction du Vocabulaire / Vocabulary Introduction

[IMAGE-3]
Image Prompt: "simple image prompt based on the following vocab"

:::component::topic:::
:::component::vocab:::

## 🔠 Conjugaison des Verbes / Verb Conjugation

:::component::topic:::
:::component::conjugationTable:::
:::component::conjugationTable:::

## 🗣️ Pratique de Prononciation / Pronunciation Practice

[IMAGE-4]
Image Prompt: "simple image prompt based one the following pronunciation"

:::component::topic:::
:::component::pronunciation:::

ENSURE CONTENT:
- PRIMARY language is French
- Use explicit "french" and "english" fields in JSON where applicable, except for "targetText" in pronunciation which is French-only
- Keep sentences simple, clear, practical for new language learners
- Build complexity gradually, connecting each section to the previous one for a cohesive lesson
ONLY OUTPUT LESSON TEXT, NOTHING ELSE.`;
}

export function createLanguageLecturePrompt5() {
  return `
  Create a simple, beginner-friendly lesson for *Intro to French Vol. 1: Lesson 1 - Greetings* to teach basic French greetings and politeness phrases. Use Markdown for the main structure, with a friendly, encouraging tone addressing learners directly (e.g., "you" or "your"). Integrate custom components within the Markdown using :::component::: syntax, adhering to the specified formats below. Keep it short (3-5 minutes reading/practice time) and practical for daily use.
  
  [IMPORTANT FORMATTING RULES:]
  1. For intros, use :::component::topic:::{"french": "French intro text", "english": "English intro text"} before each section’s component(s), with 80-120 words in French and an English translation.
  2. For other components, use explicit "french" and "english" fields in JSON (e.g., "french": "...", "english": "...") for translations.
  3. **PRESERVE ALL [IMAGE-X] PLACEHOLDERS AND THEIR PROMPTS EXACTLY AS SHOWN.** Output them on their own lines with exact text (e.g., [IMAGE-1] followed by Image Prompt: "People learning in a classroom or casual setting").
  
  [Component Usage:]
  - :::component::topic:::{"french": "French introductory paragraph", "english": "English translation"} (80-120 words explaining the section’s role).
  - :::component::vocab:::{"title": {"french": "French title", "english": "English title"}, "items": [{"french": "French word/phrase", "english": "English translation", "example": {"french": "French example sentence", "english": "English translation"}}], "context": {"french": "French context explanation", "english": "English translation"}} (context 100-120 words).
  - :::component::dialogue:::{"title": {"french": "French title", "english": "English title"}, "lines": [{"speaker": "Female Name", "french": "French text", "english": "English translation"}, {"speaker": "Male Name", "french": "French text", "english": "English translation"}], "analysis": {"french": "French analysis", "english": "English translation"}} (content 150-200 words including analysis).
  - :::component::pronunciation:::{"title": {"french": "French title", "english": "English title"}, "items": [{"targetText": "French simple sentence"}]} (content 60-80 words).
  
  [LESSON STRUCTURE:]
  - Start with ⏱️ Estimated Reading Time and # header: "# 🌟 Bonjour! Votre Début en Français / Hello! Your Start in French".
  - Add [IMAGE-1] with prompt: "People learning in a classroom or casual setting".
  - Use ## subheaders: "Mots de Base / Basic Words", "Un Petit Dialogue / A Short Dialogue", "Parlez Maintenant / Speak Now".
  - Before "Mots de Base", add :::component::topic::: explaining vocabulary’s role in greetings.
  - In "Mots de Base", use :::component::vocab::: for 3 greetings (e.g., bonjour, salut, merci).
  - Before "Un Petit Dialogue", add :::component::topic::: about dialogues and listening.
  - In "Un Petit Dialogue", use :::component::dialogue::: for a short greeting exchange.
  - Before "Parlez Maintenant", add :::component::topic::: about pronunciation’s importance.
  - In "Parlez Maintenant", use :::component::pronunciation::: for 2 practice phrases.
  - End with a reflection question in plain Markdown.
  
  [CONTENT GUIDELINES:]
  - Focus on greetings: hello, hi, thank you.
  - Keep French simple, clear, and repetitive for beginners.
  - Limit to 3-5 minutes (150-200 words total, excluding component internals).
  - Output only the lesson text.
    `;
}
export function createLanguageLecturePrompt6() {
  return `You are an experienced French language teacher. Create a lesson that engages learners through clear explanations, relevant examples, and practical applications, feeling like a live lecture with a teacher's voice guiding them. Use a friendly, encouraging tone, addressing learners directly (e.g., "you" or "your"), and include questions or prompts for reflection and practice to simulate classroom interaction. For each section, generate an 80-120 word introductory paragraph in French (followed by an English translation indented below) to preview the section’s purpose, connect it to language learning, and engage learners with a simple question or call-to-action. Wrap each intro in a :::component::topic::: with "french" and "english" fields.

[IMPORTANT FORMATTING RULES:]
1. For intros, use :::component::topic:::{"french": "French intro text", "english": "English intro text"} before each section’s component(s).
2. For other components, use explicit French and English fields in JSON (e.g., "french": "...", "english": "...") for translations.

[Component Usage for Topic:]
- :::component::topic:::{"french": "French introductory paragraph", "english": "English translation"}
[Generate 80-120 words in French explaining the section’s role, using simple, clear language for new learners, followed by an English translation.]

[Component Usage for Goals:]
- :::component::goals:::{"title": {"french": "French title", "english": "English title"}, "hook": {"french": "French hook", "english": "English translation"}, "objectives": {"grammar": {"french": "French point", "english": "English"}, "vocab": {"french": "French theme", "english": "English"}, "communication": {"french": "French goal", "english": "English"}}, "explanation": {"french": "French explanation with teaser", "english": "English translation with teaser"}}
[Before this, generate a Topict intro explaining why goals matter for starting a French journey, how they set the stage for daily communication, and a question like "What do you want to say today?" Keep component content 80-100 words.]

[Component Usage for Dialogue:]
- :::component::dialogue:::{"title": {"french": "French title", "english": "English title"}, "lines": [{"speaker": "Female Name (e.g., Marie)", "french": "French text", "english": "English translation"}, {"speaker": "Male Name (e.g., Pierre)", "french": "French text", "english": "English translation"}], "analysis": {"french": "French analysis", "english": "English translation"}}
[Before this, generate a Topic intro explaining how dialogues show real French, their role in listening skills, and a question like "What do you hear in their words?" Keep component content 150-200 words, including analysis with a question.]

[Component Usage for Vocab:]
- :::component::vocab:::{"title": {"french": "French title", "english": "English title"}, "items": [{"french": "French word/phrase", "english": "English translation", "example": {"french": "French example sentence", "english": "English translation"}}], "context": {"french": "French context explanation", "english": "English translation"}}
[Before this, generate a Topic intro explaining vocabulary’s role as building blocks, how these words fit the theme, and a prompt like "How will you use these today?" Keep component context 100-120 words.]

[Component Usage for ConjugationTable:]
- :::component::conjugationTable:::{"verbs": ["French infinitive"], "tense": "Tense name", "conjugation": ["French conjugation 1", "French conjugation 2", ...], "englishTranslations": ["English translation 1", "English translation 2", ...]}
[Before each of these two components, generate a unique Topic intro explaining why conjugation powers verbs, how ER verbs follow a pattern, and a question like "Can you spot the rule?" Tailor each intro to the specific verb.]

[Component Usage for Pronunciation:]
- :::component::pronunciation:::{"title": {"french": "French title", "english": "English title"}, "items": [{"targetText": "French simple sentence"}]}
[Before this, generate a Topic intro explaining pronunciation’s importance for clear French, how these sentences practice key sounds, and a prompt like "Can you say it smoothly?" Keep component content 60-80 words.]

- MUST LEAVE A NEWLINE AFTER EACH COMPONENT OR THEY WILL NOT RENDER CORRECTLY.
- Ensure all accents (e.g., é, à) are preserved in JSON strings.

[Page-1]
⏱️ Estimated Reading Time: [Calculate based on 200 words per minute]

# 🌟 [Catchy French title tied to lesson theme]

## 🎯 Objectifs d'Aujourd'hui / Today's Goals
:::component::topic:::
:::component::goals:::

## 👋 Dialogue d'Introduction / Opening Dialogue
:::component::topic:::
:::component::dialogue:::

## 📚 Introduction du Vocabulaire / Vocabulary Introduction
:::component::topic:::
:::component::vocab:::

## 🔠 Conjugaison des Verbes / Verb Conjugation
:::component::topic:::
:::component::conjugationTable:::
:::component::topic:::
:::component::conjugationTable:::

## 🗣️ Pratique de Prononciation / Pronunciation Practice
:::component::topic:::
:::component::pronunciation:::

ENSURE CONTENT:
- PRIMARY language is French
- Use explicit "french" and "english" fields in JSON where applicable, except for "targetText" in pronunciation which is French-only
- Keep sentences simple, clear, practical for new language learners
- Build complexity gradually, connecting each section to the previous one for a cohesive lesson
ONLY OUTPUT LESSON TEXT, NOTHING ELSE.`;
}

export function createLanguageLecturePrompt3() {
  return `You are an expert French language educator. Create lecture-style content in Markdown format following this exact structure:

# [Part Title in French] - [English Translation]
## Focus: [Brief focus description in English]

---

### [Lesson Title in French] / [English Translation]
[IMAGE_PROMPT: description for illustrator]

**Key Concepts:**  
- [Concept 1 in French]  
  ↳ [English translation]  
- [Concept 2 in French]  
  ↳ [English translation]  

**Examples:**  
- [Example 1 in French]  
  ↳ [English translation]  
- [Example 2 in French]  
  ↳ [English translation]  

**Verb Conjugation:**  
[Markdown table for verb conjugation]  

**Cultural Context:**  
- [Cultural note in French]  
  ↳ [English translation]  

---

STRUCTURE RULES:
1. Maintain exact heading hierarchy shown
2. Use ↳ arrow for translations (no bold/italic)
3. Keep French/English text separated
4. Include 3-5 examples per lesson
5. Use simple vocabulary (A1 CEFR level)
6. Add cultural context for each lesson
7. Highlight cognates in (parentheses)
8. Include image prompts every 2 lessons
9. Add line breaks between semantic units
10. Never merge French/English text

TECHNICAL REQUIREMENTS:
- Word count per lesson: 200-250 words
- Character limit for examples: 50-75 chars
- 100% parallel text structure
- UTF-8 special characters: é, à, è, û
- No markdown tables/complex formatting
- Use --- for section breaks only
- Image prompt format: [IMAGE_PROMPT: clean vector art of...]

EXAMPLE SNIPPET:

### Les Verbes Réguliers / Regular Verbs
[IMAGE_PROMPT: clean vector art of a chalkboard with verb conjugations]

**Key Concepts:**  
- Les verbes en -er (ay)  
  ↳ -er verbs  
- Les verbes en -ir (eer)  
  ↳ -ir verbs  

**Examples:**  
- Je parle français.  
  ↳ I speak French.  
- Nous finissons le travail.  
  ↳ We finish the work.  

**Verb Conjugation:**  
#### Conjugaison du Verbe "Parler" (To Speak)

| Pronom       | Conjugaison |
|--------------|-------------|
| Je           | parle       |
| Tu           | parles      |
| Il/Elle/On   | parle       |
| Nous         | parlons     |
| Vous         | parlez      |
| Ils/Elles    | parlent     |

**Cultural Context:**  
- En France, on utilise souvent les verbes réfléchis.  
  ↳ In France, reflexive verbs are often used.  

OUTPUT ONLY: Clean Markdown following this exact pattern with NO commentary.`;
}

export function createLanguageExercisePrompt(
  level,
  randomScene2,
  randomScene1,
) {
  return `You are an educational exercise generator for a language learning platform. Your task is to create age-appropriate exercises for grade level ${level} that adhere EXACTLY to the following data type structures and format. DO NOT include any additional keys, commentary, or text outside the JSON response.

  EXERCISE TYPES & DATA STRUCTURES:
  
  1. **Drag-and-Drop Word Exercise**
     - **Data Structure:**
     {
       "title": "string",
       "header": "string",
       "type": "drag_and_drop",
       "question": "string",
       "scrambled_words": ["string", "string", ...],
       "correct_answer": "string",
       "feedback": "string"
     }
     - **Requirements:**
       - Use an image scenario if needed (e.g., "${randomScene2}").
       - Provide 5-8 words in scrambled order that form a grammatically correct sentence.
       - Include proper punctuation.
  
  2. **Fill-in-the-Blank Exercise**
     - **Data Structure:**
     {
       "title": "string",
       "header": "string",
       "type": "fill_in_blank",
       "question": "string",
       "sentences": ["string with blank(s)", "another sentence with blank(s)"],
       "correct_answer": ["string", "string"],
       "feedback": "string"
     }
     - **Requirements:**
       - Provide two contextually related sentences, each with one missing key word.
       - Ensure the blanks are clearly indicated (e.g., using [___]).
       - The answers must be grade-level appropriate.
  
  3. **Audio-Based Exercise**
     - **Data Structure:**
     {
       "title": "string",
       "header": "string",
       "type": "audio_based",
       "question": "string",
       "audio_script": "string",
       "multiple_choice": ["string", "string", "string", "string"],
       "correct_answer": number,  // Index of the correct option
       "feedback": {
         "correct": "string",
         "incorrect": "string"
       }
     }
     - **Requirements:**
       - Use a single speaker format.
       - The audio_script must be clear and connected.
       - Options should be in French and appropriate for the grade level.
  
  4. **Matching Pairs Exercise**
     - **Data Structure:**
     {
       "title": "string",
       "header": "string",
       "type": "matching_pairs",
       "question": "string",
       "pairs": [
         { "word": "string", "match": "string" },
         { "word": "string", "match": "string" }
         // ... (4-6 total pairs)
       ],
       "feedback": "string",
       "additional_data": {
         "category": "string",
         "difficulty": "string"
       }
     }
     - **Requirements:**
       - Provide clear relationships between matched items (e.g., French greetings and their usages).
       - Use varied vocabulary categories that are grade-level appropriate.
  
  5. **Image-Based Word Input Exercise**
     - **Data Structure:**
     {
       "title": "string",
       "header": "string",
       "type": "image_word_input",
       "question": "string",
       "image_prompt": "string",
       "imageUrl": "string",
       "correct_answer": "string",
       "feedback": "string",
       "additional_data": {
         "vocabulary_focus": "string",
         "difficulty": "string"
       }
     }
     - **Requirements:**
       - Use this image scenario: "${randomScene1}".
       - The question should encourage detailed observation.
       - The correct answer must be a complete, grammatically correct sentence.
  
  ADDITIONAL GUIDELINES:
  - All instructions and content must be age-appropriate for grade level ${level}.
  - Provide clear instructions and feedback for each exercise.
  - The FINAL RESPONSE must be valid JSON with a top-level key "exercises" containing an array of exercise objects.
  - DO NOT include any extra commentary, markdown formatting, or additional keys outside the specified structure.
  
  EXAMPLE JSON OUTPUT:
  {
    "exercises": [
      {
        "title": "Déplacement des mots dans une phrase",
        "header": "#",
        "type": "drag_and_drop",
        "question": "Déplacez les mots dans la phrase suivante pour former une phrase correcte.",
        "scrambled_words": ["vous", "allez", "Comment", "-", "?" ],
        "correct_answer": "Comment allez - vous ?",
        "feedback": "This is a formal way to ask 'How are you?'"
      }
      // ... Additional exercises following the structures above.
    ]
  }
  
  IMPORTANT: Your entire response must be exactly in the above JSON format without any additional text.`;
}

// export function createLanguageLecturePrompt() {
//   return `You are an expert French curriculum designer creating CEFR-aligned lessons. Develop lessons IN FRENCH with English translations using this explicit progression:

// # 🌍 [Theme-Based Title in French] / [English Translation]
// **Explicit Learning Goal:** "[Specific Can-Do Statement] ex: Order food in a Parisian café"
// [IMAGE-1]
// Image Prompt: "[student learning French]"

// ## 🗺️ Leçon Roadmap (4-Course Progression)
// **Current Focus:**
// - Skill Type: [Receptive/Productive]
// - Language Mode: [Interpersonal/Interpretive/Presentational]
// - Cognitive Load: [New: 70% | Review: 30%]
// **Next Lesson Preview:**
// - "Next week we'll connect [current grammar] to [future concept] through [activity type]"

// ## 🎯 Objectifs Hiérarchisés / Tiered Objectives
// **Three-Layer Mastery System:**
// 1. 🧱 Fondation: Grammar Structure
//    - Focus: [Specific form] ex: "Partitive articles (du/de la/des)"
//    - Success Criteria: "Recognize correct form in written texts"
// 2. 📦 Application: Vocabulary Cluster
//    - Theme: [Semantic Field] ex: "Food Quantities"
//    - Success Criteria: "Combine with verbs acheter/préparer"
// 3. 🎭 Maîtrise: Cultural Communication
//    - Scenario: [Real-World Task] ex: "Market negotiations"
//    - Success Criteria: "Use appropriate register with vendors"

// ## 🌟 Contexte d'Immersion / Immersion Context
// [IMAGE-2]
// Image Prompt: "[French context for the lesson]"
// **Contextualized Story:**
// [French text highlighting 5x target grammar & 8x vocabulary]
// **Glossed Translation:**
// - Cultural Notes: "[Why baguettes are priced by weight]"
// - Language Notes: "[How 'je voudrais' softens requests]"

// ## 🧠 Boîte à Outils Linguistiques / Language Toolkit

// ### 🔍 Grammar Deep Dive
// **Concept:** [Name with French Example]
// ex: "Les Articles Partitifs: Je mange **du** pain"
// - English Contrast: "No direct equivalent - expresses 'some'"
// - Formation Rules: [Flowchart-style steps]
// - **Error Radar:**
//   "EN→FR Mistake: Using 'de' instead of 'du' after negatives"
//   "Pronunciation Trap: Liaison in 'des haricots'"

// ### 📦 Vocabulary Architecture
// **Semantic Web:**
// - Core Nouns: [8 items with gender markers]
// - Verb Collocations: [3 pairing patterns] ex: "acheter + quantity"
// - **Cognate Alerts:**
//   "True Friend: 'limonade' = lemonade"
//   "False Friend: 'librairie' = bookstore"

// ### 🎧 Phonetic Fitness
// **Sound Clinic:**
// - IPA Breakdown: /y/ vs /u/ (ex: 'tu' vs 'tout')
// - **Connected Speech:**
//   "Enchaînement: 'Je ai' → 'J'ai' [ʒe] → [ʒɛ]"
// - Rhythm Practice: Clapping syllable patterns

// ## 💬 Scénarios Dynamiques / Dynamic Scenarios
// [IMAGE-3]
// Image Prompt: "[French real-life scenario]"
// [Three-Level Dialogues]:
// 1. Scripted (Formal)
// 2. Semi-Scripted (Neutral)
// 3. Improv Framework (Informal)
// [All with translations and sociolinguistic notes]

// ## 🛠️ Atelier Pratique / Workshop
// [IMAGE-4]
// Image Prompt: "[French activity]"
// [Triple-Phase Activities]:
// 1. Drill: Pattern recognition exercises
// 2. Création: Guided writing/speaking prompts
// 3. Jeu de Rôle: Open-ended simulations

// ## 📈 Auto-Évaluation / Self-Check
// [Can-Do Statements]:
// - "Je peux..." (Novice Benchmark)
// - "J'ai compris..." (Progress Tracker)
// - "Je veux approfondir..." (Goal Setting)

// IMAGE RULES REMAIN AS ORIGINAL BUT:
// - Add alt-text language learning captions
// - Include diagram annotation markers
// - Sequence images show skill progression`;
// }

// export function createGrammarLanguageData() {
//   return `Generate grammar rules for a French lesson:

// # Grammar Rules
// - Structure: [Name + Example]
// - Formation: [Step-by-Step Rules]
// - Exceptions: [Common Edge Cases]

// Output as JSON:
// {
//   "key": "grammar_rules",
//   "value": {
//     "structure": "",
//     "formation": [],
//     "exceptions": []
//   }
// }`;
// }

// export function createVocabularyLanguageData() {
//   return `Generate a vocabulary set for a French lesson:

// # Vocabulary Set
// - Theme: [Semantic Field]
// - Words: [8-10 Items with Gender]
// - Collocations: [Verb + Noun Patterns]

// Output as JSON:
// {
//   "key": "vocabulary_set",
//   "value": {
//     "theme": "",
//     "words": [
//       {"french": "", "english": "", "gender": ""}
//     ],
//     "collocations": []
//   }
// }`;
// }

// export function createImmersionContext() {
//   return `Create an immersive context for a French lesson:

// # Immersion Context
// - Setting: [Specific Location/Scenario]
//   Example: "A bustling Parisian café during lunch hour"
// - Cultural Hook: [Unique Aspect to Engage Learners]
//   Example: "Why the French take their time with meals"
// - Language Focus: [Grammar + Vocabulary Integration]
//   Example: "Partitive articles (du, de la, des) + food vocabulary"

// ## Story Requirements
// - Length: 150-200 words
// - Highlight:
//   * 5x Target Grammar Structures
//   * 8x Thematic Vocabulary Items
// - Include:
//   * Cultural Notes: [Explain cultural significance]
//   * Language Nuances: [Highlight idiomatic expressions or pronunciation tips]

// ## Output Format
// {
//   "setting": "[Detailed setting description]",
//   "cultural_hook": "[Engaging cultural fact or story]",
//   "story": {
//     "french": "[150-200 word story in French]",
//     "english": "[Parallel English translation]",
//     "glossary": [
//       {
//         "french": "[Target word/phrase]",
//         "english": "[Translation]",
//         "notes": "[Grammar/cultural/pronunciation notes]"
//       }
//     ]
//   }
// }

// ## Example Output
// {
//   "setting": "A traditional boulangerie in Lyon, France",
//   "cultural_hook": "In France, bread is a staple of every meal, and the baguette is protected by law to ensure its quality.",
//   "story": {
//     "french": "C'est une belle matinée à Lyon. Marie entre dans sa boulangerie préférée et dit: 'Bonjour, je voudrais une baguette tradition, s'il vous plaît.' Le boulanger lui répond: 'Bien sûr, madame. Vous voulez autre chose?' Marie hésite puis ajoute: 'Oui, je prends aussi deux croissants et une tarte aux pommes.'",
//     "english": "It's a beautiful morning in Lyon. Marie enters her favorite bakery and says: 'Hello, I would like a traditional baguette, please.' The baker replies: 'Of course, madam. Would you like anything else?' Marie hesitates and then adds: 'Yes, I'll also take two croissants and an apple tart.'",
//     "glossary": [
//       {
//         "french": "boulangerie",
//         "english": "bakery",
//         "notes": "Feminine noun. Often specializes in bread and pastries."
//       },
//       {
//         "french": "je voudrais",
//         "english": "I would like",
//         "notes": "Polite form of 'je veux'. Commonly used in shops."
//       }
//     ]
//   }
// }`;
// }

export function createVisualGamePrompt(data) {
  return `You are a game-generating assistant. The game is an image guessing game in this language ${data.language} LANGUAGE OUTPUT MUST BE IN LANGUAGE ${data.language}. Here is the theme: ${data.theme}. Your task is to generate image prompts (IN ENGLISH) along with four corresponding answers in : ${data.language}, where one answer is correct. You will create 5 of these.

    ONLY OUTPUT JSON array like this:
    
    [
      {
        "image-0": "correct answer in one word(english)",        
        "answer": "correct answer",
        "choices": ["choice1", "choice2", "choice3", "choice4"],
        "correctAnswerIndex": 0
      },
      {
        "image-1": "correct answer in one word(english)", 
        "answer": "correct answer",
        "choices": ["choice1", "choice2", "choice3", "choice4"],
        "correctAnswerIndex": 2
      }
      //... up to 5 items
    ]`;
}

export async function claudeEmailCheck(emailData) {
  console.log("emailData", emailData);

  const systemPrompt = `Your job is to validate if an email should be sent based on the scheduling data provided. Respond with a boolean value true or false.
Data: ${JSON.stringify(emailData)}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: systemPrompt }],
    });

    const responseData = response.content[0].text;
    console.log("responseData", responseData);

    const trimmedResponse = responseData.trim().toLowerCase();
    if (trimmedResponse === "true") {
      return true;
    } else if (trimmedResponse === "false") {
      return false;
    } else {
      console.warn("Unexpected response from Claude:", responseData);
      return false;
    }
  } catch (error) {
    console.error("Error in claudeEmailCheck:", error);
    return false;
  }
}
