$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path -Parent $PSScriptRoot
$releaseRoot = Join-Path $siteRoot 'releases'
$releaseName = 'norou-vfx-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$releasePath = Join-Path $releaseRoot $releaseName
$archivePath = Join-Path $releaseRoot ($releaseName + '.zip')
$siteFiles = @('index.html', 'robots.txt', 'assets/norou-player.js', 'assets/norou-player.css')

foreach ($relativePath in $siteFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $siteRoot $relativePath) -PathType Leaf)) {
        throw "Missing release file: $relativePath"
    }
}
if ((Test-Path -LiteralPath $releasePath) -or (Test-Path -LiteralPath $archivePath)) {
    throw 'Release already exists; no files were overwritten.'
}
New-Item -ItemType Directory -Path (Join-Path $releasePath 'assets') | Out-Null
foreach ($relativePath in $siteFiles) {
    Copy-Item -LiteralPath (Join-Path $siteRoot $relativePath) -Destination (Join-Path $releasePath $relativePath)
    if ((Get-FileHash -LiteralPath (Join-Path $siteRoot $relativePath)).Hash -ne
        (Get-FileHash -LiteralPath (Join-Path $releasePath $relativePath)).Hash) {
        throw "Release copy mismatch: $relativePath"
    }
}
Compress-Archive -LiteralPath @((Join-Path $releasePath 'index.html'), (Join-Path $releasePath 'robots.txt'), (Join-Path $releasePath 'assets')) -DestinationPath $archivePath
Write-Output "Upload folder: $releasePath"
Write-Output "Upload ZIP: $archivePath"
