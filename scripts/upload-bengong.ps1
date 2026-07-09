$MUSIC_DIR = "E:\Music\Bengong"
$BUCKET    = "melody-music"

$files = Get-ChildItem $MUSIC_DIR -File | Where-Object { $_.Extension -match '\.(mp3|m4a|webm)$' }
Write-Host "Uploading $($files.Count) files from Bengong..."

foreach ($file in $files) {
    $remotePath = "$BUCKET/Bengong/$($file.Name)"
    $localPath  = $file.FullName
    Write-Host "-> $remotePath"
    npx wrangler r2 object put "$remotePath" --file="$localPath"
}
Write-Host "Done!"
