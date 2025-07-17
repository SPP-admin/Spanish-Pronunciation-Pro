export const lessonCategories = [
    {
        id: "vowels",
        title: "Vowels",
        description: "Practice the core Spanish vowel sounds.",
        lessons: [
            { value: "a", label: "A" },
            { value: "e", label: "E" },
            { value: "i", label: "I" },
            { value: "o", label: "O" },
            { value: "u", label: "U" },
        ],
        levels: [
            { value: "words", label: "Words" },
            { value: "simple_sentences", label: "Simple Sentences" },
            { value: "complex_sentences", label: "Complex Sentences" },
        ],
    },
    {
        id: "consonants",
        title: "Consonants",
        description: "Master tricky consonant pronunciations.",
        lessons: [
            { value: "soft_consonants", label: "Soft Consonants" },
            { value: "hard_consonants", label: "Hard Consonants" },
            { value: "vowel_consonant_combos", label: "Vowel-Consonant Combos" },
        ],
        levels: [
            { value: "words", label: "Words" },
            { value: "sentences", label: "Sentences" },
        ]
    },
    {
        id: "unique_sounds",
        title: "Unique Sounds",
        description: "Learn sounds unique to the Spanish language.",
        lessons: [
            { value: "ñ", label: "Ñ" },
            { value: "rr", label: "RR" },
            { value: "ll", label: "LL" },
            { value: "ch", label: "CH" },
            { value: "qu", label: "QU" },
        ],
        levels: [
            { value: "words", label: "Words" },
            { value: "sentences", label: "Sentences" },
        ]
    },
    {
        id: "special_vowel_combinations",
        title: "Special Vowel Combinations",
        description: "Master vowel combinations like 'ai', 'ei', 'oi'.",
        lessons: [
            { value: "ai", label: "AI" },
            { value: "ue", label: "UE" },
            { value: "eu", label: "EU" },
            { value: "au", label: "AU" },
            { value: "ei", label: "EI" },
            { value: "ia", label: "IA" },
            { value: "io", label: "IO" },
            { value: "oi", label: "OI" },
            { value: "ui", label: "UI" },
            { value: "ie", label: "IE" },
        ],
        levels: [
            { value: "words", label: "Words" },
            { value: "sentences", label: "Sentences" },
        ],
    },
    {
        id: "accent_marks",
        title: "Accent Marks",
        description: "Understand how accent marks affect pronunciation.",
        lessons: [
            { value: "accent_marks", label: "Accent Marks" },

        ],
        levels: [
            { value: "words", label: "Words" },
            { value: "sentences", label: "Sentences" },
        ],
    },
    {
        id: "regional_differences",
        title: "Regional Differences",
        description: "Explore pronunciation variations across Spanish-speaking countries.",
        lessons: [
            { value: "mexico", label: "Mexico" },
            { value: "spain", label: "Spain" },
            { value: "argentina", label: "Argentina" },
            { value: "puerto_rico", label: "Puerto Rico" },
        ],
        levels: [
            { value: "regional_practice", label: "Regional Practice" },
        ],
    },
];

export const completionRequirements = {
    "words": 5,
    "sentences": 4,
    "simple_sentences": 4,
    "complex_sentences": 2,
    "regional_practice": 2
}
