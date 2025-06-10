---
title: powershell脚本
description: 关于「powershell脚本」的记录与想法
pubDate: 2025-06-10
image: /image/p15.png
categories:
  - tech
tags:
  - day
---
📅 **时间**: 13:28  
🌤️ **天气**: 银川 20~32℃ 晴

> 春风又绿江南岸，明月何时照我还？

<cite style="text-align: right; display: block;">— 王安石 · 《泊船瓜洲》</cite>

## 正文


```bash
# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ================== Configuration Section ==================
$sourceFolder      = "X:"
$destinationFolder = "X:"
$repoPath          = "X:"
$commitMessage     = "Automated update of Markdown files $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# ================== Main Process Start ==================

# Check if source folder exists
if (-Not (Test-Path $sourceFolder)) {
    Write-Error "Source folder '$sourceFolder' does not exist."
    Read-Host -Prompt "Press any key to continue..."
    exit 1
}

# Check if destination folder exists
if (-Not (Test-Path $destinationFolder)) {
    Write-Error "Destination folder '$destinationFolder' does not exist."
    Read-Host -Prompt "Press any key to continue..."
    exit 1
}

# Change location to repository path
Set-Location -Path $repoPath

# Check if Git is available
Write-Host "Checking if Git is available..."
try {
    git --version | Out-Null
} catch {
    Write-Error "Git is not properly installed or not added to system PATH: $_"
    Read-Host -Prompt "Press any key to continue..."
    exit 1
}

# Pull latest code from remote (optional)
Write-Host "Pulling latest code from remote..."
try {
    git pull origin main
} catch {
    Write-Error "Unable to pull code from remote repository: $_"
    Read-Host -Prompt "Press any key to continue..."
    exit 1
}

# Clear old .md files in destination folder
Write-Host "Clearing old .md files in destination folder..."
try {
    Get-ChildItem -Path "$destinationFolder\*.md" -Force | Remove-Item -Force -ErrorAction Stop
} catch {
    Write-Error "Unable to clear destination folder: $_"
    Read-Host -Prompt "Press any key to continue..."
    exit 1
}

# Copy new files into destination folder
Write-Host "Copying Markdown files..."
try {
    Copy-Item -Path "$sourceFolder\*.md" -Destination $destinationFolder -Force -ErrorAction Stop
} catch {
    Write-Error "Unable to copy Markdown files: $_"
    Read-Host -Prompt "Press any key to continue..."
    exit 1
}

# Check for changes
Write-Host "Checking for changes to commit..."
git add src/content/blog
$changes = git status --porcelain

if (-not [string]::IsNullOrWhiteSpace($changes)) {
    # Commit changes
    Write-Host "Committing changes..."
    try {
        git commit -m "$commitMessage"
    } catch {
        Write-Error "Unable to commit changes: $_"
        Read-Host -Prompt "Press any key to continue..."
        exit 1
    }

    # Push changes to remote repository
    Write-Host "Pushing changes to remote repository..."
    try {
        git push origin main
    } catch {
        Write-Error "Unable to push changes to remote repository: $_"
        Read-Host -Prompt "Press any key to continue..."
        exit 1
    }

    Write-Host "Successfully pushed Markdown files to remote repository."
} else {
    Write-Host "No changes detected, nothing to commit."
}

# Pause script to view output information
Read-Host -Prompt "Press any key to continue..."

```