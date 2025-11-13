# remove-committed-env.sh

This repository helper creates a script to untrack local environment files from git while leaving your local copies intact, and updates .gitignore to prevent re-committing them.

Usage:

1. Create a branch: git checkout -b chore/untrack-env-files
2. Run from repo root: ./scripts/remove-committed-env.sh
3. Review commits and open a PR.

Security note: This script does NOT rewrite git history. If secrets were committed in the past, rotate them immediately and consider using BFG or git filter-repo to purge history.

.gitignore changes: append (if missing) the following lines:
# Local environment files
.env
.env.local
.env.development
.env.test
.env.production
.env.*.local

# Secrets / keys
*.secret
*.key

# Editor / OS cruft
.vscode/
.DS_Store
