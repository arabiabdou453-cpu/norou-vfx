$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$htmlPath = Join-Path $projectRoot 'index.html'
$robotsPath = Join-Path $projectRoot 'robots.txt'
$playerScriptPath = Join-Path $projectRoot 'assets\norou-player.js'
$playerStylePath = Join-Path $projectRoot 'assets\norou-player.css'
$html = Get-Content -Raw -LiteralPath $htmlPath
$robots = Get-Content -Raw -LiteralPath $robotsPath
$playerScript = if (Test-Path -LiteralPath $playerScriptPath) { Get-Content -Raw -LiteralPath $playerScriptPath } else { '' }
$playerStyle = if (Test-Path -LiteralPath $playerStylePath) { Get-Content -Raw -LiteralPath $playerStylePath } else { '' }
$htmlWithoutScripts = [regex]::Replace($html, '<script\b[^>]*>.*?</script>', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)

$checks = [ordered]@{
    'Correct portfolio metadata' = $html -notmatch 'StoryStream|Real Mehedi'
    'Responsive viewport configured' = $html -match 'width=device-width, initial-scale=1'
    'Theme color configured' = $html -match 'name="theme-color"'
    'Structured data configured' = $html -match 'application/ld\+json'
    'Framer editor preload removed' = $html -notmatch 'framer_force_showing_editorbar_since'
    'Framer badge markup removed at runtime' = $html -match 'id="norou-quality-fixes"'
    'No YouTube iframe loads before user action' = $html -notmatch '<iframe[^>]+src="https://www\.youtube(?:-nocookie)?\.com/embed/'
    'Early guard blocks Framer YouTube requests' = $html -match 'id="norou-youtube-guard"' -and $html -match 'HTMLIFrameElement\.prototype'
    'Lazy video placeholders configured' = $html -match 'data-norou-video-id="[A-Za-z0-9_-]{11}"'
    'Dedicated video player installed' = $html -match 'assets/norou-player\.js' -and $playerScript.Length -gt 0
    'Player assets are cache-busted' = $html -match 'assets/norou-player\.js\?v=20260831' -and $html -match 'assets/norou-player\.css\?v=20260831'
    'Only clicked video may autoplay' = $html -notmatch '<iframe[^>]+autoplay=1' -and $playerScript -match 'autoplay=1'
    'Active inline iframe bypasses placeholder observer' = $playerScript -match 'norouPlayerActive\s*===\s*"true"'
    'Closing destroys the active inline iframe' = $playerScript -match 'closeActivePlayer' -and $playerScript -match 'activePlayer\.layer\.remove\(\)'
    'Native YouTube controls configured' = $playerScript -match 'controls=1' -and $playerScript -match 'fs=1' -and $playerScript -match 'playsinline=1' -and $playerScript -match 'allowFullscreen\s*=\s*true'
    'Framer gradient percentages normalized' = $html -notmatch '[+-]?\d+(?:\.\d+)?e[+-]?\d+%'
    'Video cards are passive containers' = $playerScript -match 'const card\s*=\s*document\.createElement\("div"\)' -and $playerScript -notmatch 'button\.className\s*=\s*"norou-video-card"'
    'Only the YouTube icon opens a video' = $playerScript -match 'play\.type\s*=\s*"button"' -and $playerScript -match 'closest\("\.norou-video-card__play"\)'
    'Play actions bypass Framer click interception' = $playerScript -match 'document\.addEventListener\("pointerup"' -and $playerScript -match 'document\.addEventListener\("keydown"' -and $playerScript -match 'openInlinePlayer\(video, card, play\)'
    'No custom modal player remains' = $playerScript -notmatch 'norou-player__dialog|requestFullscreen|aria-modal' -and $playerStyle -notmatch '\.norou-player__dialog'
    'Inline player host is installed' = $playerScript -match 'norou-inline-player' -and $playerStyle -match '\.norou-inline-player'
    'Opening another card closes the active player' = $playerScript -match 'closeActivePlayer\(false\)' -and $playerScript -match 'activePlayer'
    'Full YouTube button is the click target' = $playerScript -match 'closest\("\.norou-video-card__play"\)' -and $playerStyle -match 'touch-action:\s*manipulation'
    'Video controls stay above Framer overlays' = $playerStyle -match '\.norou-video-slot\s*\{[\s\S]*?z-index:\s*3\s*!important' -and $playerStyle -match '\.norou-video-card__play\s*\{[\s\S]*?z-index:\s*4'
    'Mobile play target is comfortable' = $playerStyle -match 'width:\s*72px' -and $playerStyle -match 'height:\s*52px'
    'Mobile close target is accessible' = $playerStyle -match 'min-width:\s*46px' -and $playerStyle -match 'min-height:\s*46px'
    'No broad iframe CSS overrides modal sizing' = $html -notmatch '\*:has\(> iframe\[src\*="youtube-nocookie\.com/embed/"\]\)'
    'Six portfolio video IDs configured' = @('_j9ewTMvYvk', 'doOU2AIX2r4', 'KnavSFeuBNI', 'tSyr8gRAS7Y', '-BWhYYHI5Wk', 'lejcLUhH5IA') | ForEach-Object { $html -match [regex]::Escape($_) } | Where-Object { -not $_ } | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { $_ -eq 0 }
    'Reduced motion supported' = $html -match 'prefers-reduced-motion: reduce'
    'Project typo corrected in source' = $htmlWithoutScripts -notmatch 'porject'
    'Project typo corrected after hydration' = $html -match '\[/porject ideas/g, "project ideas"\]'
    'Original Home and About navigation fixed' = $html -match 'setSectionAnchor\(hero,\s*"home"\)' -and $html -match 'text\s*===\s*"Home"' -and $html -match 'link\.href\s*=\s*"#about"'
    'Navigation targets visible Framer variant' = $html -match 'offsetParent\s*!==\s*null'
    'Section anchors target complete sections' = $html -match 'setSectionAnchor' -and $html -match 'dataset\.norouAnchor' -and $html -match 'scrollMarginTop\s*=\s*"120px"'
    'Section navigation scrolls safely below the navbar' = $html -match 'enableSectionNavigation' -and $html -match 'scrollIntoView' -and $html -match 'history\.replaceState'
    'Direct section URLs are restored after Framer hydration' = $html -match 'initialId\s*=\s*window\.location\.hash\.slice\(1\)' -and $html -match 'initialTarget\.scrollIntoView'
    'Showreel autoplays once without looping' = $html -match '<video[^>]+autoplay' -and $html -match 'showreel\.loop\s*=\s*false' -and $html -match 'showreel\.autoplay\s*=\s*true' -and $html -match 'showreel\.preload\s*=\s*"auto"'
    'Footer keeps only the WhatsApp Hire Me CTA' = $html -match 'Hire Me on WhatsApp' -and $html -match 'ctaContainer\.style\.display\s*=\s*"none"' -and $html -match 'link\.getAttribute\("href"\)'
    'Heavy custom navigation remains disabled' = $html -notmatch 'assets/norou-navigation\.(?:js|css)'
    'Professional section links are configured' = $html -match 'data-norou-nav-link' -and $html -match 'Work' -and $html -match 'Services' -and $html -match 'Contact'
    'Duplicated Instagram CTA is removed' = $html -match 'framer-q1WkO' -and $html -match 'style\.display\s*=\s*"none"'
    'Copyright is configured' = $html -match '© 2026 Norouvfx\. All rights reserved\.'
    'Hero and contact copy are improved' = $html -match 'commercials that command attention' -and $html -match 'Let’s make something people remember'
    'Robots references sitemap' = $robots -match '(?m)^Sitemap:'
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
foreach ($check in $checks.GetEnumerator()) {
    $status = if ($check.Value) { 'PASS' } else { 'FAIL' }
    Write-Output ("[{0}] {1}" -f $status, $check.Key)
}

if ($failed.Count -gt 0) {
    throw ("Static audit failed: {0} check(s)." -f $failed.Count)
}
