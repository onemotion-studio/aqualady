$content = [System.IO.File]::ReadAllText('aqualady-aquaero/src/pages/BookingPage.tsx')
$content = $content -replace 'teal-brand', 'gradient-primary'
[System.IO.File]::WriteAllText('aqualady-aquaero/src/pages/BookingPage.tsx', $content)
Write-Host "Replacements done"