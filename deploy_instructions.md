# Deploy Word Streak Game

To share your game with friends outside your network, you have several options:

## Option 1: GitHub Pages (Recommended - Free)
1. Go to https://github.com and sign in (or create an account)
2. Click the "+" icon and select "New repository"
3. Name it "wordstreak-game" (or any name you like)
4. Make sure "Public" is selected
5. Don't initialize with README
6. Click "Create repository"
7. Run these commands in your terminal:
```bash
git remote add origin https://github.com/YOUR_USERNAME/wordstreak-game.git
git branch -M main
git push -u origin main
```
8. Go to your repository settings on GitHub
9. Scroll to "Pages" section
10. Under "Source", select "Deploy from a branch"
11. Choose "main" branch and "/ (root)" folder
12. Click Save
13. Your game will be available at: https://YOUR_USERNAME.github.io/wordstreak-game/

## Option 2: Vercel (Free, Instant)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import from Git repository
5. Your game will get a URL like: https://wordstreak-game.vercel.app

## Option 3: Netlify Drop (Instant, No Account Needed)
1. Go to https://app.netlify.com/drop
2. Drag and drop your entire WordstreakClaude folder
3. You'll get an instant URL to share

## Option 4: Surge.sh (Command Line, Free)
1. Install surge: `npm install -g surge`
2. Run: `surge` in your project directory
3. Follow the prompts to get a public URL

Choose the option that works best for you!