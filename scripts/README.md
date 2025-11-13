# remove-committed-env.sh

This script untracks common local environment files from the git index while leaving your local copies intact. It also ensures .gitignore contains common env patterns.

Usage:

1. Create a branch: git checkout -b chore/untrack-env-files
2. Run the script from the repository root: ./scripts/remove-committed-env.sh
3. Push and open a PR.

Security note: This script does not rewrite git history. If secrets were committed in the past, rotate the secrets immediately and consider using BFG or git filter-repo to purge history.
