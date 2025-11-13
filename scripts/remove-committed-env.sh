#!/bin/sh
# Run from repo root. Safe: this untracks env files but keeps local copies.
set -e

# List of common env files to untrack
FILES=".env .env.local .env.development .env.test .env.production"

# Untrack files if they exist in the index
for f in $FILES; do
  if git ls-files --error-unmatch "$f" > /dev/null 2>&1; then
    git rm --cached --ignore-unmatch "$f"
    echo "Untracked $f"
  fi
done

# Ensure .gitignore contains patterns
for p in ".env" ".env.local" ".env.*.local"; do
  grep -qF "$p" .gitignore 2>/dev/null || echo "$p" >> .gitignore
done

git add .gitignore
git commit -m "chore: untrack local env files and add .gitignore entries" || echo "Nothing to commit"
echo "Done. If any secrets were committed historically, rotate keys immediately."
