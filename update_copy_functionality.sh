#!/bin/zsh

# This script updates all output HTML files in the ai directory to use the centralized copy.js functionality
# It adds the script import if missing and adds the createCopyButton call if missing

# List of files to update (excluding income)
OUTPUT_FILES=(
  "ai/enneagram/enneagramoutput.html"
  "ai/event/eventoutput.html"
  "ai/emotion/emotionoutput.html"
  "ai/philosophy/philosophyoutput.html"
  "ai/social/socialoutput.html"
  "ai/quiz/quizoutput.html"
  "ai/fitness/fitnessoutput.html"
  "ai/research/researchoutput.html"
)

echo "Updating output files to use centralized copy.js functionality..."

for file in "${OUTPUT_FILES[@]}"; do
  echo "Processing $file..."
  
  # Check if the file exists
  if [[ ! -f "$file" ]]; then
    echo "File $file does not exist, skipping."
    continue
  fi
  
  # 1. Add the script import if it doesn't exist
  if ! grep -q '<script src="../../utility/copy.js"></script>' "$file"; then
    echo "Adding script import to $file..."
    # Insert the script tag right before the last </body> tag
    sed -i '' 's|</body>|  <script src="../../utility/copy.js"></script>\n</body>|' "$file"
  else
    echo "Script import already exists in $file."
  fi
  
  # 2. Remove any commented out copy functionality
  if grep -q "Copy functionality moved to /utility/copy.js" "$file"; then
    echo "Removing commented copy functionality from $file..."
    # Create a temporary file
    sed '/\/\/ Copy functionality moved to \/utility\/copy.js/,/}/d' "$file" > "${file}.tmp"
    mv "${file}.tmp" "$file"
  fi
  
  # 3. Add createCopyButton call if it doesn't exist
  if ! grep -q "createCopyButton('output-span')" "$file"; then
    echo "Adding createCopyButton call to $file..."
    # Find the line right before the end of the main IIFE
    # This is tricky to do automatically, so we'll insert it near the end of the script
    sed -i '' 's|})();|      // Initialize centralized copy button\n      createCopyButton('"'output-span'"');\n    })();|' "$file"
  else
    echo "createCopyButton call already exists in $file."
  fi
  
  echo "Finished processing $file"
  echo "------------------------"
done

echo "All files have been updated!"
