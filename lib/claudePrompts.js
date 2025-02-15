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
    `}

export function conversationDialogPrompt({
  targetLanguage, 
  nativeLanguage, 
  title, 
  dialogue, 
  vocabulary, 
  history, 
  message
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
      - **Do not add extra text or explanations. Only return the two lines following the correct format.** `
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
  return `# Custom Styling Test

  [EXPLICIT STRICT FORMATTING RULES]
   1. NEVER END A LINE WITH A COLON (:)
   2. CREATE A TEST FOR EVERY LINE IN ORDER AS THEY ARE SHOW BELOW
   3. FOR THE AUDIO COMPONENT TEST USE A HEADER AUDIO COMPONENT TEST

 ## Basic Colors
:::blue:::This text should be blue:::blue:::
:::red:::This text should be red:::red:::
:::green:::This text should be green:::green:::

## Combined Styles
::border::This should have a border
::highlight::This text should be highlighted
::bg-blue::This should have blue background

## Components
:::component::alert:::This is an important message
:::component::info:::This is an informational message
:::component::tip:::Here's a helpful tip
:::component::note:::This is a custom note component

# Component Test

:::component::alert:::This is an important message

:::component::info:::This is an informational message

:::component::audio:::{ "src": "/audio/lesson1.mp3" }

:::component::flashcard:::{ "front": "Bonjour", "back": "Hello" }

## Table Test
| Header 1     | Header 2     |
|--------------|--------------|
| Row 1 Col 1  | Row 1 Col 2  |
| Row 2 Col 1  | Row 2 Col 2  |
  `;
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


export function createLanguageExercisePrompt( level, randomScene2, randomScene1 ) {
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
  
  IMPORTANT: Your entire response must be exactly in the above JSON format without any additional text.`
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
