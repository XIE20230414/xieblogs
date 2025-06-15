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
            Write-Host "Copied video: $($video.Name) to $targetPath"
        }
    }
} catch {
    Write-Error "Error: Failed to copy video files: $_"
    Read-Host -Prompt "Press any key to exit..."
    exit 1
} 