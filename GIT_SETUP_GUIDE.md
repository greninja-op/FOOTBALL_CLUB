# Git Setup and Push Guide

## Prerequisites
- Git installed on your system
- GitHub account with access to the repository

## Step 1: Initialize Git Repository

```bash
# Navigate to your project root
cd /path/to/your/project

# Initialize git (if not already initialized)
git init

# Add the remote repository
git remote add origin https://github.com/greninja-op/FOOTBALL_CLUB.git

# Verify remote was added
git remote -v
```

## Step 2: Create .gitignore File

Before committing, ensure sensitive files are ignored:

```bash
# The .gitignore should already exist, but verify it contains:
```

**Root .gitignore:**
```
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/

# Temporary files
*.tmp
*.temp
```

**Server .gitignore (server/.gitignore):**
```
node_modules/
.env
*.log
dist/
coverage/
```

**Client .gitignore (client/.gitignore):**
```
node_modules/
.env
.env.local
dist/
*.log
coverage/
```

## Step 3: Stage and Commit Files

```bash
# Check current status
git status

# Add all files (respecting .gitignore)
git add .

# Commit with descriptive message
git commit -m "Phase 1 Complete: Authentication & Frontend Foundation

- Implemented full-stack authentication system with JWT
- Created 10 Mongoose schemas with validation
- Built React frontend with routing and protected routes
- Added role-based access control (Admin/Manager/Coach/Player)
- Implemented shared Navbar component
- Created database seeding script with 4 test users
- Added comprehensive verification tests and documentation"
```

## Step 4: Push to GitHub

```bash
# Push to main branch (or master, depending on your default branch)
git push -u origin main

# If the branch is named 'master' instead:
# git push -u origin master

# If you get an error about divergent branches, you may need to pull first:
# git pull origin main --rebase
# Then push again:
# git push -u origin main
```

## Step 5: Verify Push

1. Go to https://github.com/greninja-op/FOOTBALL_CLUB
2. Verify all files are present
3. Check that .env files are NOT visible (they should be ignored)

## Common Issues and Solutions

### Issue 1: Remote already exists
```bash
# Remove existing remote
git remote remove origin

# Add it again
git remote add origin https://github.com/greninja-op/FOOTBALL_CLUB.git
```

### Issue 2: Authentication failed
```bash
# Use GitHub Personal Access Token instead of password
# Generate token at: https://github.com/settings/tokens
# Use token as password when prompted
```

### Issue 3: Branch name mismatch
```bash
# Check current branch name
git branch

# Rename branch if needed
git branch -M main

# Then push
git push -u origin main
```

### Issue 4: Repository not empty
```bash
# If remote has existing commits, pull first
git pull origin main --allow-unrelated-histories

# Resolve any conflicts, then push
git push -u origin main
```

## Future Commits

After the initial push, use this workflow:

```bash
# Check what changed
git status

# Add specific files or all changes
git add .

# Commit with descriptive message
git commit -m "Your commit message here"

# Push to remote
git push
```

## Branch Strategy (Optional)

For better organization, consider using branches:

```bash
# Create and switch to development branch
git checkout -b development

# Make changes and commit
git add .
git commit -m "Your changes"

# Push development branch
git push -u origin development

# When ready to merge to main:
git checkout main
git merge development
git push
```

## Useful Git Commands

```bash
# View commit history
git log --oneline

# View changes before committing
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View remote URL
git remote -v

# Update from remote
git pull

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# Delete branch
git branch -d branch-name
```

## Security Checklist

Before pushing, verify:
- [ ] .env files are in .gitignore
- [ ] No passwords or secrets in code
- [ ] No API keys committed
- [ ] JWT_SECRET not in repository
- [ ] MongoDB connection strings not exposed
- [ ] All sensitive data in .env files

## Next Steps

After successful push:
1. Set up MongoDB (see MONGODB_SETUP_GUIDE.md)
2. Configure environment variables on deployment platform
3. Set up CI/CD pipeline (optional)
4. Add collaborators to repository (if needed)
