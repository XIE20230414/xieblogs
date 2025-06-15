# Set console encoding to UTF-8. This helps with file paths or content containing special characters.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ================== Configuration Section ==================
# Source folder: Where you write and store your source files (e.g., your Obsidian vault)
$sourceFolder      = "X:\notes\obdocs\blog\src\content\blog"
# Destination folder: Your blog project's content directory
$destinationFolder = "X:\astropaper\Frosti\src\content\blog"
# Public assets folder: Where the video files will be copied for web access
$publicAssetsFolder = "X:\astropaper\Frosti\public\blog\assets"
# The root path of the Git repository
$repoPath          = "X:\astropaper\Frosti"
# Git commit message, including the current date and time
$commitMessage     = "Automated update of blog content $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# ================== Main Process Start ==================

# Check if the source folder exists
if (-Not (Test-Path $sourceFolder)) {
    Write-Error "Error: Source folder '$sourceFolder' does not exist."
    Read-Host -Prompt "Press any key to exit..."
    exit 1
}

# Check if the parent directory of the destination folder exists, so we can work with it
$destinationParentFolder = Split-Path $destinationFolder -Parent
if (-Not (Test-Path $destinationParentFolder)) {
    Write-Error "Error: The parent directory of the destination '$destinationParentFolder' does not exist."
    Read-Host -Prompt "Press any key to exit..."
    exit 1
}

# Change the current location to the Git repository path
Set-Location -Path $repoPath

# Check if Git is available
Write-Host "Checking if Git is available..."
try {
    git --version | Out-Null
} catch {
    Write-Error "Error: Git is not properly installed or not in the system's PATH: $_"
    Read-Host -Prompt "Press any key to exit..."
    exit 1
}

# Pull the latest code from the remote (optional but recommended)
Write-Host "Pulling the latest code from the remote repository..."
try {
    git pull origin main
} catch {
    Write-Error "Error: Unable to pull from the remote repository: $_"
    Read-Host -Prompt "Press any key to exit..."
    exit 1
}

# Clear all old content from the destination folder
Write-Host "Clearing destination folder: $destinationFolder"
try {
    # If the destination folder exists, clear its contents
    if (Test-Path $destinationFolder) {
        Get-ChildItem -Path $destinationFolder -Force | Remove-Item -Recurse -Force -ErrorAction Stop
    } else {
        # If it doesn't exist, create it to avoid errors during copy
        New-Item -Path $destinationFolder -ItemType Directory -Force | Out-Null
    }
} catch {
    Write-Error "Error: Failed to clear the destination folder: $_"
    Read-Host -Prompt "Press any key to exit..."
    exit 1
}

# Copy all new content from the source folder to the destination folder
Write-Host "Copying new content from the source folder..."
try {
    # Use \* to copy all contents (files and subfolders) from within the source folder
    Copy-Item -Path "$sourceFolder\*" -Destination $destinationFolder -Recurse -Force -ErrorAction Stop
} catch {
    Write-Error "Error: Failed to copy files: $_"
    Read-Host -Prompt "Press any key to exit..."
    exit 1
}

# Copy video files to public directory
Write-Host "Copying video files to public directory..."
try {
    # Create public assets directory if it doesn't exist
    if (-Not (Test-Path $publicAssetsFolder)) {
        New-Item -Path $publicAssetsFolder -ItemType Directory -Force | Out-Null
    }

    # Get all .mp4 files from the assets directory
    $videoFiles = Get-ChildItem -Path "$destinationFolder\assets" -Recurse -Filter "*.mp4"
    
    foreach ($video in $videoFiles) {
        # Get the relative path from the assets directory
        $relativePath = $video.FullName.Substring($destinationFolder.Length + 8) # +8 for "assets\"
        $targetPath = Join-Path $publicAssetsFolder $relativePath
        
        # Create target directory if it doesn't exist
        $targetDir = Split-Path $targetPath -Parent
        if (-Not (Test-Path $targetDir)) {
            New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        }
        
        # Copy only if source is newer or target doesn't exist
        if (-Not (Test-Path $targetPath) -or ($video.LastWriteTime -gt (Get-Item $targetPath).LastWriteTime)) {
            Copy-Item -Path $video.FullName -Destination $targetPath -Force
            Write-Host "Copied video: $($video.Name)"
        }
    }
} catch {
    Write-Error "Error: Failed to copy video files: $_"
    Read-Host -Prompt "Press any key to exit..."
    exit 1
}

# Check for file changes to commit
Write-Host "Checking for changes to commit..."
git add src/content/blog public/blog/assets
$changes = git status --porcelain

if (-not [string]::IsNullOrWhiteSpace($changes)) {
    # Commit the changes
    Write-Host "Changes detected. Committing..."
    try {
        git commit -m "$commitMessage"
    } catch {
        Write-Error "Error: Failed to commit changes: $_"
        Read-Host -Prompt "Press any key to exit..."
        exit 1
    }

    # Push changes to the remote repository
    Write-Host "Pushing changes to the remote repository..."
    try {
        git push origin main
    } catch {
        Write-Error "Error: Failed to push to the remote repository: $_"
        Read-Host -Prompt "Press any key to exit..."
        exit 1
    }

    Write-Host "Success! Blog content has been updated and pushed to the remote repository."
} else {
    Write-Host "No changes detected. Nothing to commit."
}

# Pause the script to view output information
Read-Host -Prompt "All operations completed. Press any key to exit..." 