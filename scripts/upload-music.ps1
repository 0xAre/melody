# Upload musik ke Cloudflare R2 via wrangler (paralel 5 jobs)
# Jalankan dari folder E:\Project APP\melody:
#   .\scripts\upload-music.ps1

$MUSIC_DIR = "E:\Music"
$BUCKET    = "melody-music"
$PARALLEL  = 5

$files = Get-ChildItem $MUSIC_DIR -Recurse -File |
         Where-Object { $_.Extension -match '\.(mp3|m4a|webm)$' }

Write-Host "Ditemukan $($files.Count) file audio. Mulai upload..." -ForegroundColor Cyan

$total   = $files.Count
$done    = 0
$failed  = @()
$lock    = [System.Object]::new()

$jobs = @()

foreach ($file in $files) {
    $relFolder  = $file.Directory.Name
    $remotePath = "$BUCKET/$relFolder/$($file.Name)"
    $localPath  = $file.FullName

    # Tunggu jika sudah 5 job aktif
    while (($jobs | Where-Object { $_.State -eq 'Running' }).Count -ge $PARALLEL) {
        Start-Sleep -Milliseconds 200
    }

    # Panen job yang selesai
    $completed = $jobs | Where-Object { $_.State -ne 'Running' }
    foreach ($j in $completed) {
        $res = Receive-Job $j -ErrorAction SilentlyContinue
        $jobs = $jobs | Where-Object { $_.Id -ne $j.Id }
        Remove-Job $j
        $done++
        if ($done % 20 -eq 0 -or $done -eq $total) {
            Write-Host "  [$done/$total] ..." -ForegroundColor Gray
        }
    }

    $jobs += Start-Job -ScriptBlock {
        param($local, $remote)
        npx wrangler r2 object put $remote --file=$local 2>&1
    } -ArgumentList $localPath, $remotePath
}

# Tunggu sisa job
$jobs | Wait-Job | ForEach-Object {
    Receive-Job $_ -ErrorAction SilentlyContinue
    Remove-Job $_
    $done++
}

Write-Host "`n=== UPLOAD SELESAI ===" -ForegroundColor Green
Write-Host "Berhasil: $done/$total"
