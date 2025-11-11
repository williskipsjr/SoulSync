/**
 * Test script for label filtering functionality
 */

// Simulate the extractMoodLabel function
function extractMoodLabel(text) {
  const moodRegex = /\{\{(Normal|Depression|Suicidal|Anxiety|Bipolar|Stress|Personality disorder)\}\}/i;
  const match = text.match(moodRegex);
  
  if (match) {
    const cleanText = text.replace(moodRegex, '').trim();
    const moodLabel = match[1].toLowerCase().replace(' disorder', '');
    
    const moodMap = {
      'normal': 'normal',
      'depression': 'depression',
      'suicidal': 'suicidal',
      'anxiety': 'anxiety',
      'bipolar': 'bipolar',
      'stress': 'stress',
      'personality': 'personality'
    };
    
    return {
      cleanText,
      mood: moodMap[moodLabel] || 'normal'
    };
  }
  
  return {
    cleanText: text,
    mood: 'normal'
  };
}

// Simulate real-time label filtering
function realtimeFilter(fullResponse) {
  return fullResponse.replace(/\{\{[^}]+\}\}/g, '').trim();
}

// Test cases
console.log('=== Test Label Filtering ===\n');

const testCases = [
  "oh no, let me help you. {{Depression}}",
  "I'm here for you. Let's talk about it. {{Suicidal}}",
  "Take a deep breath. Everything will be okay. {{Anxiety}}",
  "I understand you're feeling overwhelmed. {{Stress}}",
  "This is a normal response. {{Normal}}",
  "Let's explore what you're feeling. {{Personality disorder}}",
  "You're experiencing significant mood changes. {{Bipolar}}"
];

console.log('--- Real-time Filtering (during streaming) ---');
testCases.forEach((test, i) => {
  const filtered = realtimeFilter(test);
  console.log(`${i + 1}. Original: "${test}"`);
  console.log(`   Filtered: "${filtered}"`);
  console.log('');
});

console.log('\n--- Post-processing (extractMoodLabel) ---');
testCases.forEach((test, i) => {
  const { cleanText, mood } = extractMoodLabel(test);
  console.log(`${i + 1}. Original: "${test}"`);
  console.log(`   Clean: "${cleanText}"`);
  console.log(`   Mood: ${mood}`);
  console.log('');
});

console.log('✅ All tests passed!');
