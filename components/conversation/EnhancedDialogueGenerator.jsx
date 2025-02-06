// components/conversation/EnhancedDialogueGenerator.jsx
"use client";
import { useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import NewGeneratedDialogue from "./NewGeneratedDialogue";
import { BookOpen, MessageSquare, Info, CheckCircle } from "lucide-react";

const AVAILABLE_LANGUAGES = {
  en: { code: "en", label: "English" },
  fr: { code: "fr", label: "French" },
  es: { code: "es", label: "Spanish" },
};

const LEARNING_CONTENT = {
  scenarios: [
    {
      id: "doctor_visit",
      category: "Health",
      context: {
        label: "Doctor Visit",
        location: "medical_clinic",
        roles: ["patient", "doctor"],
        situation:
          "A patient visits the doctor for a check-up and discusses symptoms",
        culturalNotes: [
          "In many countries, it's common to address doctors formally",
          "Medical appointments often require prior scheduling",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "I don't feel well", usage: "Expressing discomfort" },
            { phrase: "Where does it hurt?", usage: "Asking about pain" },
            { phrase: "I have a headache", usage: "Describing specific pain" },
          ],
          intermediate: [
            {
              phrase: "I've been experiencing symptoms for...",
              usage: "Describing duration of symptoms",
            },
            {
              phrase: "The pain comes and goes",
              usage: "Describing intermittent symptoms",
            },
            {
              phrase: "Could you prescribe something for...",
              usage: "Requesting medication",
            },
          ],
          advanced: [
            {
              phrase: "I'm concerned about potential side effects",
              usage: "Discussing medication concerns",
            },
            {
              phrase: "My symptoms have gradually worsened",
              usage: "Detailed symptom description",
            },
            {
              phrase: "I have a history of...",
              usage: "Discussing medical history",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "doctor", context: "medical professional" },
            { word: "sick", context: "feeling unwell" },
            { word: "pain", context: "physical discomfort" },
          ],
          intermediate: [
            { word: "prescription", context: "medical document" },
            { word: "symptoms", context: "signs of illness" },
            { word: "treatment", context: "medical care" },
          ],
          advanced: [
            { word: "diagnosis", context: "identification of condition" },
            { word: "prognosis", context: "likely course of condition" },
            { word: "chronic", context: "long-lasting condition" },
          ],
        },
      },
    },
    {
      id: "fast_food_order",
      category: "Food",
      context: {
        label: "Fast Food Order",
        location: "fast_food_restaurant",
        roles: ["customer", "cashier"],
        situation: "A customer orders food at a fast food restaurant",
        culturalNotes: [
          "In many countries, tipping is not expected at fast food restaurants.",
          "Menus often include combos or meal deals, which can be more affordable.",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "I'd like a burger, please", usage: "Placing a simple order" },
            { phrase: "Can I get fries with that?", usage: "Requesting additional items" },
            { phrase: "What do you recommend?", usage: "Asking for suggestions" },
          ],
          intermediate: [
            {
              phrase: "Do you have any vegetarian options?",
              usage: "Asking about dietary preferences",
            },
            {
              phrase: "Can I have that without onions?",
              usage: "Making a modification to the order",
            },
            {
              phrase: "I'd like to upgrade to a larger size",
              usage: "Changing the portion size",
            },
          ],
          advanced: [
            {
              phrase: "Could I have extra condiments on the side?",
              usage: "Requesting additional items",
            },
            {
              phrase: "I'd like to substitute the drink with a milkshake",
              usage: "Customizing the order with a substitution",
            },
            {
              phrase: "Do you have any gluten-free options?",
              usage: "Inquiring about specific dietary needs",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "burger", context: "a type of sandwich with a meat patty" },
            { word: "fries", context: "fried potato slices, often served as a side" },
            { word: "combo", context: "a meal that includes a main item and side" },
          ],
          intermediate: [
            { word: "vegetarian", context: "a person who does not eat meat" },
            { word: "onion", context: "a common vegetable often used in fast food" },
            { word: "upgrade", context: "to increase the size or quality of something" },
          ],
          advanced: [
            { word: "condiments", context: "sauces or seasonings used with food" },
            { word: "milkshake", context: "a sweet, cold beverage made with milk and ice cream" },
            { word: "gluten-free", context: "food that does not contain gluten, suitable for people with celiac disease" },
          ],
        },
      },
    },
    {
      id: "dentist_visit",
      category: "Health",
      context: {
        label: "Dentist Visit",
        location: "dental_clinic",
        roles: ["patient", "dentist"],
        situation:
          "A patient visits the dentist for a check-up or specific dental concern",
        culturalNotes: [
          "Regular dental check-ups are common preventive practice",
          "Dental insurance and payment systems vary by country",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "I have a toothache", usage: "Expressing dental pain" },
            {
              phrase: "When is my next appointment?",
              usage: "Scheduling follow-up",
            },
            { phrase: "My tooth hurts", usage: "Indicating specific pain" },
          ],
          intermediate: [
            {
              phrase: "I need a cleaning",
              usage: "Requesting routine service",
            },
            {
              phrase: "I have sensitivity to cold/hot",
              usage: "Describing symptoms",
            },
            { phrase: "Do I need a filling?", usage: "Asking about treatment" },
          ],
          advanced: [
            {
              phrase: "I'm concerned about gum recession",
              usage: "Discussing specific conditions",
            },
            {
              phrase: "What are my treatment options?",
              usage: "Exploring alternatives",
            },
            {
              phrase: "Is this covered by insurance?",
              usage: "Discussing payment",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "dentist", context: "dental professional" },
            { word: "tooth/teeth", context: "part of mouth" },
            { word: "toothbrush", context: "dental hygiene tool" },
          ],
          intermediate: [
            { word: "cavity", context: "tooth decay" },
            { word: "filling", context: "dental repair" },
            { word: "cleaning", context: "dental hygiene procedure" },
          ],
          advanced: [
            { word: "orthodontics", context: "dental alignment specialty" },
            { word: "prosthesis", context: "artificial replacement" },
            { word: "periodontitis", context: "gum disease" },
          ],
        },
      },
    },

    {
      id: "weekend_planning",
      category: "Leisure",
      context: {
        label: "Planning a Weekend Outing",
        location: "casual_meeting",
        roles: ["friend1", "friend2"],
        situation:
          "Friends discussing and planning weekend activities together",
        culturalNotes: [
          "Weekend activities often differ by culture and location",
          "Social planning styles vary between formal and informal",
        ],
        keyPhrases: {
          beginner: [
            {
              phrase: "What do you want to do this weekend?",
              usage: "Initiating plans",
            },
            {
              phrase: "Let's go to the park or cinema!",
              usage: "Making suggestions",
            },
            {
              phrase: "Would you like to have lunch together?",
              usage: "Extending invitation",
            },
          ],
          intermediate: [
            {
              phrase: "I was thinking we could...",
              usage: "Proposing activities",
            },
            { phrase: "What's your preference?", usage: "Asking for input" },
            {
              phrase: "How about we meet at...?",
              usage: "Suggesting specifics",
            },
          ],
          advanced: [
            {
              phrase: "We should take into account...",
              usage: "Considering factors",
            },
            {
              phrase: "Let's coordinate our schedules",
              usage: "Detailed planning",
            },
            {
              phrase: "I'd like to propose an alternative",
              usage: "Offering options",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "weekend", context: "Saturday and Sunday" },
            { word: "park", context: "outdoor recreation area" },
            { word: "cinema", context: "movie theater" },
          ],
          intermediate: [
            { word: "activity", context: "planned event or action" },
            { word: "suggestion", context: "proposed idea" },
            { word: "preference", context: "personal choice" },
          ],
          advanced: [
            { word: "itinerary", context: "planned schedule" },
            { word: "organize", context: "arrange or plan" },
            { word: "improvise", context: "make plans spontaneously" },
          ],
        },
      },
    },
    {
      id: "restaurant_dining",
      category: "Food",
      context: {
        label: "Restaurant Dining",
        location: "restaurant",
        roles: ["customer", "waiter"],
        situation: "Ordering food and interacting in a restaurant setting",
        culturalNotes: [
          "Dining customs and etiquette vary by culture",
          "Tipping practices differ by country",
          "Meal times and courses may vary culturally",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "I would like to order", usage: "Starting order" },
            { phrase: "The bill, please", usage: "Requesting check" },
            {
              phrase: "What do you recommend?",
              usage: "Asking for suggestions",
            },
          ],
          intermediate: [
            {
              phrase: "I'd like to make a reservation",
              usage: "Booking table",
            },
            {
              phrase: "What are today's specials?",
              usage: "Asking about menu",
            },
            {
              phrase: "How is this dish prepared?",
              usage: "Inquiring about food",
            },
          ],
          advanced: [
            {
              phrase: "Could you recommend a wine pairing?",
              usage: "Wine selection",
            },
            {
              phrase: "I have dietary restrictions",
              usage: "Special requirements",
            },
            {
              phrase: "What's the chef's specialty?",
              usage: "Seeking recommendations",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "menu", context: "list of food items" },
            { word: "table", context: "dining furniture" },
            { word: "eat", context: "consume food" },
          ],
          intermediate: [
            { word: "reservation", context: "table booking" },
            { word: "order", context: "food selection" },
            { word: "main course", context: "primary dish" },
          ],
          advanced: [
            { word: "chef's suggestion", context: "recommended dish" },
            { word: "wine pairing", context: "matching wine with food" },
            { word: "specialties", context: "signature dishes" },
          ],
        },
      },
    },
    {
      id: "clothes_shopping",
      category: "Leisure",
      context: {
        label: "Shopping for Clothes",
        location: "clothing_store",
        roles: ["customer", "sales_assistant"],
        situation:
          "Shopping for clothing items and interacting with store staff",
        culturalNotes: [
          "Sizing systems vary by country",
          "Return and exchange policies differ by region",
          "Some cultures have specific dress codes and customs",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "I'm looking for...", usage: "Starting search" },
            { phrase: "What size are you?", usage: "Asking about size" },
            { phrase: "How much is this?", usage: "Asking price" },
          ],
          intermediate: [
            { phrase: "Can I try this on?", usage: "Requesting fitting" },
            {
              phrase: "Do you have this in another color?",
              usage: "Asking options",
            },
            { phrase: "Is this on sale?", usage: "Asking about discounts" },
          ],
          advanced: [
            {
              phrase: "I'm interested in custom tailoring",
              usage: "Specialized service",
            },
            {
              phrase: "What's trending this season?",
              usage: "Fashion inquiry",
            },
            {
              phrase: "Does this need dry cleaning?",
              usage: "Care instructions",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "clothes", context: "clothing items" },
            { word: "size", context: "clothing measurement" },
            { word: "price", context: "cost of item" },
          ],
          intermediate: [
            { word: "try on", context: "test fit" },
            { word: "refund", context: "money return" },
            { word: "sale", context: "price reduction" },
          ],
          advanced: [
            { word: "custom-made", context: "specially made" },
            { word: "collection", context: "clothing line" },
            { word: "trend", context: "current fashion" },
          ],
        },
      },
    },
    {
      id: "electronics_shopping",
      category: "Leisure",
      context: {
        label: "Shopping for Electronics",
        location: "electronics_store",
        roles: ["customer", "sales_assistant"],
        situation: "Shopping for electronic gadgets and interacting with store staff",
        culturalNotes: [
          "Warranty policies vary by product and region",
          "Some countries may have restrictions on the sale of certain electronics",
          "Customer support practices differ by region",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "I'm looking for...", usage: "Starting search" },
            { phrase: "What features does this have?", usage: "Asking about product features" },
            { phrase: "How much is this?", usage: "Asking price" },
          ],
          intermediate: [
            { phrase: "Can I see the specs?", usage: "Requesting product details" },
            { phrase: "Do you have this in stock?", usage: "Inquiring about availability" },
            { phrase: "Is this on sale?", usage: "Asking about discounts" },
          ],
          advanced: [
            { phrase: "Does this come with an extended warranty?", usage: "Warranty inquiry" },
            { phrase: "What are the return policies for this?", usage: "Asking about returns" },
            { phrase: "How does this compare with other models?", usage: "Comparison request" },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "electronics", context: "devices or gadgets" },
            { word: "price", context: "cost of item" },
            { word: "warranty", context: "product protection" },
          ],
          intermediate: [
            { word: "specs", context: "technical details of a product" },
            { word: "stock", context: "availability of product" },
            { word: "sale", context: "discounted price" },
          ],
          advanced: [
            { word: "extended warranty", context: "additional product coverage" },
            { word: "return policy", context: "guidelines for returning products" },
            { word: "comparison", context: "evaluating different models" },
          ],
        },
      },
    },

    {
      id: "classroom_interaction",
      category: "School",
      context: {
        label: "In the Classroom",
        location: "classroom",
        roles: ["student", "teacher"],
        situation: "Learning environment interactions and academic discussions",
        culturalNotes: [
          "Educational systems vary by country",
          "Classroom etiquette differs culturally",
          "Student-teacher relationships vary by culture",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "May I ask a question?", usage: "Requesting permission" },
            {
              phrase: "What's the homework for tomorrow?",
              usage: "Asking about assignments",
            },
            { phrase: "I don't understand", usage: "Expressing confusion" },
          ],
          intermediate: [
            {
              phrase: "Could you explain that again?",
              usage: "Requesting clarification",
            },
            { phrase: "I'd like to participate", usage: "Class participation" },
            { phrase: "When is the deadline?", usage: "Time management" },
          ],
          advanced: [
            {
              phrase: "I'd like to discuss the methodology",
              usage: "Academic discussion",
            },
            {
              phrase: "How does this relate to...?",
              usage: "Making connections",
            },
            { phrase: "Could you elaborate on...?", usage: "Seeking depth" },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "class", context: "learning session" },
            { word: "notebook", context: "writing book" },
            { word: "homework", context: "take-home work" },
          ],
          intermediate: [
            { word: "lesson", context: "teaching unit" },
            { word: "exam", context: "test of knowledge" },
            { word: "grade", context: "performance measure" },
          ],
          advanced: [
            { word: "curriculum", context: "course content" },
            { word: "pedagogy", context: "teaching method" },
            { word: "evaluation", context: "assessment process" },
          ],
        },
      },
    },

    {
      id: "morning_routine",
      category: "Leisure",
      context: {
        label: "Morning Routine",
        location: "home",
        roles: ["person1", "person2"],
        situation: "Daily morning activities and interactions",
        culturalNotes: [
          "Breakfast customs vary by culture",
          "Morning greeting customs differ",
          "Work/school preparation routines vary",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "Are you awake?", usage: "Morning check" },
            { phrase: "Have you had breakfast?", usage: "Meal inquiry" },
            {
              phrase: "Are you ready for the day?",
              usage: "Preparation check",
            },
          ],
          intermediate: [
            { phrase: "What's your schedule today?", usage: "Day planning" },
            { phrase: "Don't forget your appointment", usage: "Reminders" },
            { phrase: "Did you sleep well?", usage: "Wellness check" },
          ],
          advanced: [
            {
              phrase: "Let's coordinate our schedules",
              usage: "Day coordination",
            },
            {
              phrase: "I need to prepare for my presentation",
              usage: "Specific planning",
            },
            {
              phrase: "We should optimize our routine",
              usage: "Efficiency discussion",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "morning", context: "start of day" },
            { word: "alarm", context: "wake-up device" },
            { word: "breakfast", context: "morning meal" },
          ],
          intermediate: [
            { word: "prepare", context: "get ready" },
            { word: "routine", context: "regular pattern" },
            { word: "brush", context: "cleaning action" },
          ],
          advanced: [
            { word: "organization", context: "systematic arrangement" },
            { word: "efficiency", context: "productive use of time" },
            { word: "habit", context: "regular practice" },
          ],
        },
      },
    },

    {
      id: "pharmacy_visit",
      category: "Health",
      context: {
        label: "At the Pharmacy",
        location: "pharmacy",
        roles: ["customer", "pharmacist"],
        situation: "Obtaining medication and health advice at a pharmacy",
        culturalNotes: [
          "Medication availability varies by country",
          "Prescription requirements differ",
          "Over-the-counter medicine policies vary",
        ],
        keyPhrases: {
          beginner: [
            {
              phrase: "Do you have something for a headache?",
              usage: "Requesting medicine",
            },
            {
              phrase: "How many times per day should I take this?",
              usage: "Dosage inquiry",
            },
            {
              phrase: "I need this prescription filled",
              usage: "Basic request",
            },
          ],
          intermediate: [
            { phrase: "Are there any side effects?", usage: "Safety inquiry" },
            {
              phrase: "Is there a generic version?",
              usage: "Alternative options",
            },
            { phrase: "How should this be stored?", usage: "Medicine care" },
          ],
          advanced: [
            {
              phrase: "Could this interact with my other medications?",
              usage: "Drug interaction",
            },
            {
              phrase: "What are the contraindications?",
              usage: "Medical precautions",
            },
            {
              phrase: "I'm experiencing adverse effects",
              usage: "Problem reporting",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "pharmacy", context: "drug store" },
            { word: "medicine", context: "medication" },
            { word: "prescription", context: "doctor's order" },
          ],
          intermediate: [
            { word: "dosage", context: "amount to take" },
            { word: "side effect", context: "unwanted reaction" },
            { word: "prescribe", context: "recommend medicine" },
          ],
          advanced: [
            { word: "drug interaction", context: "medicine combinations" },
            { word: "pharmacology", context: "study of drugs" },
            { word: "consultation", context: "professional advice" },
          ],
        },
      },
    },
    {
      id: "playground_fun",
      category: "School",
      context: {
        label: "At the Playground",
        location: "playground",
        roles: ["child1", "child2"],
        situation: "Children playing and interacting at a playground",
        culturalNotes: [
          "Playground games vary by culture",
          "Social interaction styles differ among children globally",
          "Safety rules and supervision expectations vary by country",
        ],
        keyPhrases: {
          beginner: [
            {
              phrase: "Do you want to play with me?",
              usage: "Invitation to play",
            },
            { phrase: "Look what I can do!", usage: "Showing skills" },
            {
              phrase: "Let's play together!",
              usage: "Group activity suggestion",
            },
          ],
          intermediate: [
            { phrase: "Should we take turns?", usage: "Sharing equipment" },
            {
              phrase: "That looks fun, can I join?",
              usage: "Joining activities",
            },
            { phrase: "Be careful on the slide!", usage: "Safety warnings" },
          ],
          advanced: [
            { phrase: "Let's make up a new game", usage: "Creative play" },
            { phrase: "We could pretend to be...", usage: "Imaginative play" },
            {
              phrase: "How about we organize a group game?",
              usage: "Group organization",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "play", context: "recreational activity" },
            { word: "swing", context: "playground equipment" },
            { word: "slide", context: "playground structure" },
          ],
          intermediate: [
            { word: "friends", context: "playmates" },
            { word: "game", context: "organized play" },
            { word: "run", context: "physical activity" },
          ],
          advanced: [
            { word: "adventure", context: "exciting experience" },
            { word: "imagination", context: "creative thinking" },
            { word: "share", context: "cooperative action" },
          ],
        },
      },
    },

    {
      id: "library_visit",
      category: "School",
      context: {
        label: "In the School Library",
        location: "library",
        roles: ["student", "librarian"],
        situation: "Academic research and book borrowing in a school library",
        culturalNotes: [
          "Library systems vary by country",
          "Reading and study customs differ culturally",
          "Library etiquette expectations vary",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "Can I borrow this book?", usage: "Borrowing request" },
            {
              phrase: "Where can I find information about this topic?",
              usage: "Research help",
            },
            { phrase: "When is the due date?", usage: "Return inquiry" },
          ],
          intermediate: [
            {
              phrase: "I'm looking for resources on...",
              usage: "Research specification",
            },
            {
              phrase: "How does the catalog system work?",
              usage: "System inquiry",
            },
            {
              phrase: "Can I renew my books online?",
              usage: "Service inquiry",
            },
          ],
          advanced: [
            {
              phrase: "I need to access academic journals",
              usage: "Advanced research",
            },
            {
              phrase: "What databases do you recommend?",
              usage: "Resource inquiry",
            },
            {
              phrase: "Is interlibrary loan available?",
              usage: "Special services",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "book", context: "reading material" },
            { word: "library", context: "book repository" },
            { word: "shelf", context: "storage furniture" },
          ],
          intermediate: [
            { word: "borrow", context: "temporary use" },
            { word: "research", context: "information gathering" },
            { word: "catalog", context: "resource index" },
          ],
          advanced: [
            { word: "reference", context: "source material" },
            { word: "index", context: "content guide" },
            { word: "documentation", context: "written records" },
          ],
        },
      },
    },

    {
      id: "vacation_meetup",
      category: "Leisure",
      context: {
        label: "Meeting Friends on Vacation",
        location: "beach_resort",
        roles: ["traveler1", "traveler2"],
        situation:
          "Meeting and socializing with other travelers during vacation",
        culturalNotes: [
          "Social customs vary by country",
          "Vacation activities differ culturally",
          "Making plans and commitments varies by culture",
        ],
        keyPhrases: {
          beginner: [
            { phrase: "Where are you from?", usage: "Origin inquiry" },
            {
              phrase: "Is this your first time here?",
              usage: "Experience check",
            },
            {
              phrase: "Do you have plans for tonight?",
              usage: "Social planning",
            },
          ],
          intermediate: [
            {
              phrase: "Would you like to join us for an activity?",
              usage: "Group invitation",
            },
            {
              phrase: "How long are you staying here?",
              usage: "Duration inquiry",
            },
            {
              phrase: "What places have you visited so far?",
              usage: "Experience sharing",
            },
          ],
          advanced: [
            {
              phrase: "Let's explore the local culture together",
              usage: "Cultural activity",
            },
            {
              phrase: "I can recommend some hidden gems",
              usage: "Local knowledge sharing",
            },
            {
              phrase: "We should coordinate our travel plans",
              usage: "Trip planning",
            },
          ],
        },
        vocabulary: {
          beginner: [
            { word: "travel", context: "journey" },
            { word: "beach", context: "coastal area" },
            { word: "hotel", context: "accommodation" },
            { word: "restaurant", context: "dining establishment" },
            { word: "country", context: "nation" },
          ],
          intermediate: [
            { word: "recommendation", context: "suggested activity" },
            { word: "excursion", context: "planned trip" },
            { word: "outing", context: "recreational activity" },
            { word: "discovery", context: "new experience" },
            { word: "stay", context: "duration of visit" },
          ],
          advanced: [
            { word: "experience", context: "lived event" },
            { word: "local culture", context: "regional customs" },
            { word: "adventure", context: "exciting activity" },
            { word: "itinerary", context: "travel plan" },
            { word: "destination", context: "travel location" },
          ],
        },
      },
    },
  ],
  levels: [
    {
      id: "beginner",
      label: "Beginner (A1)",
      requirements: {
        grammarTopics: ["present tense", "basic questions"],
        expectedFluency: "basic phrases",
        conversationGoals: [
          "simple greetings",
          "basic needs",
          "short responses",
        ],
      },
    },
    {
      id: "intermediate",
      label: "Intermediate (B1)",
      requirements: {
        grammarTopics: ["past tense", "future tense", "conditionals"],
        expectedFluency: "fluid conversation",
        conversationGoals: [
          "express opinions",
          "describe experiences",
          "make suggestions",
        ],
      },
    },
    {
      id: "advanced",
      label: "Advanced (B2)",
      requirements: {
        grammarTopics: [
          "subjunctive",
          "complex structures",
          "idiomatic expressions",
        ],
        expectedFluency: "natural conversation",
        conversationGoals: [
          "debate topics",
          "handle complex situations",
          "express nuanced opinions",
        ],
      },
    },
  ],
  focusAreas: [
    {
      id: "vocabulary",
      label: "Vocabulary Building",
      learningObjectives: [
        "Learn new contextual words",
        "Practice word families",
        "Master common phrases",
      ],
      assessmentMethods: ["word recognition", "usage in context"],
    },
    {
      id: "grammar",
      label: "Grammar Practice",
      learningObjectives: [
        "Master verb conjugations",
        "Use correct sentence structures",
        "Apply grammar rules in context",
      ],
      assessmentMethods: ["sentence construction", "error correction"],
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      learningObjectives: [
        "Perfect sound production",
        "Master French phonetics",
        "Natural rhythm and intonation",
      ],
      assessmentMethods: ["sound recognition", "pronunciation accuracy"],
    },
  ],
};

export default function EnhancedDialogueGenerator() {
  const [selectedScenario, setSelectedScenario] = useState("");
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("");
  const [generatedScenario, setGeneratedScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConversation, setShowConversation] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");

  // Preview state for showing relevant information based on selections
  const [preview, setPreview] = useState({
    vocabulary: [],
    keyPhrases: [],
    culturalNotes: [],
    levelRequirements: null,
  });

  const updatePreview = (scenario, level, focus) => {
    const selectedScenario = LEARNING_CONTENT.scenarios.find(
      (s) => s.id === scenario
    );
    const selectedLevel = level
      ? LEARNING_CONTENT.levels.find((l) => l.id === level)
      : null;

    const newPreview = {
      // Get key phrases for the selected level
      keyPhrases:
        selectedScenario && level
          ? selectedScenario.context.keyPhrases[level].map(
              (item) => item.phrase
            )
          : [],

      // Get vocabulary with context for the selected level
      vocabulary:
        selectedScenario && level
          ? selectedScenario.context.vocabulary[level].map((item) => ({
              word: item.word,
              context: item.context,
            }))
          : [],

      // Get cultural notes
      culturalNotes: selectedScenario
        ? selectedScenario.context.culturalNotes
        : [],

      // Get level requirements if level is selected
      levelRequirements: selectedLevel ? selectedLevel.requirements : null,
    };
    setPreview(newPreview);
  };

  const handleGenerate = async () => {
    if (!selectedScenario || !selectedLevel || !selectedFocus) {
      setError("Please select all options");
      return;
    }

    setLoading(true);
    setError("");
    setShowConversation(false);

    try {
      const selectedScenarioData = LEARNING_CONTENT.scenarios.find(
        (s) => s.id === selectedScenario
      );
      const levelRequirements = LEARNING_CONTENT.levels.find(
        (l) => l.id === selectedLevel
      )?.requirements;
      const focusObjectives = LEARNING_CONTENT.focusAreas.find(
        (f) => f.id === selectedFocus
      )?.learningObjectives;

      const response = await fetch("/api/generate-dialogue-test-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          languages: {
            native: nativeLanguage,
            target: targetLanguage,
          },
          scenario: {
            type: selectedScenario,
            context: selectedScenarioData.context,
            label: selectedScenarioData.context.label,
            keyPhrases: selectedScenarioData.context.keyPhrases[selectedLevel],
            vocabulary: selectedScenarioData.context.vocabulary[selectedLevel],
            culturalNotes: selectedScenarioData.context.culturalNotes,
            roles: selectedScenarioData.context.roles,
            situation: selectedScenarioData.context.situation,
          },
          level: {
            type: selectedLevel,
            requirements: levelRequirements,
            label: LEARNING_CONTENT.levels.find((l) => l.id === selectedLevel)
              ?.label,
          },
          focus: {
            type: selectedFocus,
            objectives: focusObjectives,
            label: LEARNING_CONTENT.focusAreas.find(
              (f) => f.id === selectedFocus
            )?.label,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const enhancedScenario = {
          title: scenarioTitle || "",
          ...data.scenario,
          introduction: {
            // Use the correct keys instead of language codes
            targetLanguage: data.scenario.introduction?.targetLanguage || "",
            nativeLanguage: data.scenario.introduction?.nativeLanguage || "",
          },
          vocabulary: data.scenario.vocabulary || [],
          dialogue: data.scenario.dialogue || [],
          culturalNotes: data.scenario.culturalNotes || [],
          keyPhrases: data.scenario.keyPhrases || [],
        };

        setGeneratedScenario(enhancedScenario);
        setShowConversation(true);
      } else {
        throw new Error(data.error || "Failed to generate scenario");
      }
    } catch (err) {
      setError(err.message);
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mb-4">
      <h1 className="header-title">French Conversation Generator</h1>

      {!generatedScenario && (
        <div className="space-y-6 my-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="block text-sm font-medium mb-2">
                Your Language
              </Label>
              <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your language..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AVAILABLE_LANGUAGES).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label className="block text-sm font-medium mb-2">
                Language to Learn
              </Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language to learn..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AVAILABLE_LANGUAGES)
                    .filter((lang) => lang.code !== nativeLanguage)
                    .map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Select Scenario */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              Select Scenario
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedScenario(value);
                const selectedScenarioObj = LEARNING_CONTENT.scenarios.find(
                  (scenario) => scenario.id === value
                );
                setScenarioTitle(selectedScenarioObj?.context.label || "");
                updatePreview(value, selectedLevel, selectedFocus);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a scenario..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">Health</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Health")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">Leisure</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Leisure")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">Food</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Food")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">School</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "School")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">
              Select Level
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedLevel(value);
                updatePreview(selectedScenario, value, selectedFocus);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">Available Levels</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">
              Select Focus Area
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedFocus(value);
                updatePreview(selectedScenario, selectedLevel, value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your focus..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">Focus Areas</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.focusAreas.map((focus) => (
                    <SelectItem key={focus.id} value={focus.id}>
                      {focus.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Preview Section */}
          {(preview.vocabulary.length > 0 ||
            preview.keyPhrases.length > 0 ||
            preview.culturalNotes.length > 0 ||
            preview.levelRequirements) && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md space-y-4">
              <h3 className="font-semibold text-xl mb-4 text-gray-800">
                Learning Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vocabulary Section */}
                {preview.vocabulary.length > 0 && (
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <BookOpen className="text-blue-500 mr-2" />
                      <p className="font-medium text-gray-800">
                        Key Vocabulary:
                      </p>
                    </div>
                    <ul className="text-sm space-y-1">
                      {preview.vocabulary.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle
                            className="text-green-500 mr-2"
                            size={16}
                          />
                          <span className="font-medium">{item.word}</span>
                          {item.context && (
                            <span className="text-gray-600">
                              {" "}
                              - {item.context}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Phrases Section */}
                {preview.keyPhrases.length > 0 && (
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="text-blue-500 mr-2" />
                      <p className="font-medium text-gray-800">
                        Common Phrases:
                      </p>
                    </div>
                    <ul className="text-sm list-disc list-inside">
                      {preview.keyPhrases.map((phrase, idx) => (
                        <li key={idx}>{phrase}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cultural Notes Section */}
                {preview.culturalNotes.length > 0 && (
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <Info className="text-blue-500 mr-2" />
                      <p className="font-medium text-gray-800">
                        Cultural Notes:
                      </p>
                    </div>
                    <ul className="text-sm list-disc list-outside pl-4">
                      {preview.culturalNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Level Requirements Section */}
                {preview.levelRequirements && (
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="text-blue-500 mr-2" />
                      <p className="font-medium text-gray-800">
                        Level Requirements:
                      </p>
                    </div>
                    <ul className="text-sm list-disc list-outside pl-4">
                      <li>
                        Vocabulary: {preview.levelRequirements.vocabulary} words
                      </li>
                      <li>
                        Expected Fluency:{" "}
                        {preview.levelRequirements.expectedFluency}
                      </li>
                      <li>
                        Grammar Topics:{" "}
                        {preview.levelRequirements.grammarTopics.join(", ")}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Conversation Scenario"}
          </Button>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Generated Scenario Display */}
      {generatedScenario && (
        <NewGeneratedDialogue
          scenario={generatedScenario}
          level={selectedLevel}
          focusArea={selectedFocus}
          nativeLanguage={nativeLanguage}
          targetLanguage={targetLanguage}
          title={LEARNING_CONTENT.scenarios.find((s) => s.id === selectedScenario)?.context.label}
        />
      )}
    </div>
  );
}
