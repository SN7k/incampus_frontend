# PowerShell script to update the GitHub repository for the frontend

# Navigate to the frontend directory
Set-Location -Path "D:\SHOMBHU\Desktop\incampus\frontend"

# Initialize git if not already initialized
if (-not (Test-Path -Path ".git")) {
    Write-Host "Initializing git repository..."
    git init
}

# Configure git to use the correct remote
$remoteExists = git remote -v | Select-String -Pattern "origin"
if (-not $remoteExists) {
    Write-Host "Adding remote repository..."
    git remote add origin https://github.com/SN7k/incampus_frontend.git
}

# Add all files to git
Write-Host "Adding files to git..."
git add .

# Commit changes
Write-Host "Committing changes..."
git commit -m "Update frontend with latest changes"

# Push to GitHub
Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Done! Frontend code has been pushed to GitHub."
