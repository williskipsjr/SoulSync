#!/bin/bash

echo "🔍 Testing Ollama Connection..."
echo ""

# Test 1: Check if Ollama is running
echo "1️⃣ Checking if Ollama is running on localhost:11434..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running!"
else
    echo "❌ Ollama is NOT running"
    echo "   Please start Ollama with: ollama serve"
    echo ""
    exit 1
fi

echo ""

# Test 2: List installed models
echo "2️⃣ Checking installed models..."
MODELS=$(curl -s http://localhost:11434/api/tags)
echo "$MODELS"
echo ""

# Test 3: Check if llama2 is installed
echo "3️⃣ Checking for llama2:latest..."
if echo "$MODELS" | grep -q "llama2"; then
    echo "✅ llama2 model is installed!"
else
    echo "❌ llama2 model NOT found"
    echo "   Please install with: ollama pull llama2:latest"
    echo ""
    exit 1
fi

echo ""

# Test 4: Send a test message
echo "4️⃣ Testing chat with llama2:latest..."
RESPONSE=$(curl -s http://localhost:11434/api/chat -d '{
  "model": "llama2:latest",
  "messages": [
    {
      "role": "user",
      "content": "Say hello in 5 words or less"
    }
  ],
  "stream": false
}')

if [ $? -eq 0 ]; then
    echo "✅ Chat test successful!"
    echo "Response: $RESPONSE"
else
    echo "❌ Chat test failed"
    echo ""
    exit 1
fi

echo ""
echo "🎉 All tests passed! Ollama is ready for SoulSync."
