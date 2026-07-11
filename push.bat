@echo off
setlocal

echo ==============================
echo  Push to GitHub
echo ==============================

:: Check git is available
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    pause
    exit /b 1
)

:: Stage all changes (excluding .env via .gitignore)
echo.
echo Staging files...
git add -A

:: Show what will be committed
echo.
echo Files to commit:
git status --short

:: Ask for commit message
echo.
set /p MSG="Enter commit message (or press Enter for default): "
if "%MSG%"=="" set MSG=Update project

:: Commit
echo.
echo Committing...
git commit -m "%MSG%"

:: Push
echo.
echo Pushing to origin/main...
git push origin main

echo.
echo ==============================
echo  Done!
echo ==============================
pause
