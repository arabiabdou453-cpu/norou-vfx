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
$headEnd = $html.IndexOf('</head>', [System.StringComparison]::OrdinalIgnoreCase)
$headHtml = if ($headEnd -ge 0) { $html.Substring(0, $headEnd) } else { '' }

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
    'Dedicated video player installed after hydration' = $html -match 'assets/norou-player\.js' -and $playerScript.Length -gt 0 -and $playerScript -match 'window\.addEventListener\("load", initialize'
    'Player assets are cache-busted' = $html -match 'assets/norou-player\.js\?v=\d{8}-\d+' -and $html -match 'assets/norou-player\.css\?v=\d{8}-\d+'
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
    'Text is never rewritten after the first paint' = $html -notmatch 'normalizeText\('
    'Original Home and About navigation fixed' = $html -match 'setSectionAnchor\(hero,\s*"home"\)' -and $html -match 'setSectionAnchor\(about,\s*"about",\s*true,\s*20\)' -and $html -match 'text\s*===\s*"Home"' -and $html -match 'link\.href\s*=\s*"#about"'
    'Navigation targets visible Framer variant' = $html -match 'offsetParent\s*!==\s*null'
    'Work anchors the visible video at the viewport top' = $html -match 'const workVideo = work\?\.querySelector\("video"\)' -and $html -match 'setSectionAnchor\(workVideo \|\| work, "work", false, 0\)'
    'Contact anchors the complete footer below the navbar' = $html -match 'setSectionAnchor\(contact, "contact", false, 92\)'
    'Section navigation jumps immediately below the navbar' = $html -match 'enableSectionNavigation' -and $html -match 'getBoundingClientRect\(\)\.top - offset' -and $html -match 'behavior:\s*"auto"' -and $html -notmatch 'behavior:\s*window\.matchMedia'
    'Section navigation corrects a post-layout offset' = $html -match 'const alignAfterLayout' -and $html -match 'window\.requestAnimationFrame\(\(\) => \{\s*window\.requestAnimationFrame\(alignAfterLayout\);'
    'Navbar click handler cannot be skipped by Framer prevention' = $html -notmatch 'if \(event\.defaultPrevented \|\| event\.button !== 0'
    'Navbar state remains accessible without persistent visual color' = $html -match 'data-norou-section-link' -and $html -match 'setActiveNavigation' -and $html -match 'aria-current' -and $headHtml -notmatch '\[aria-current="location"\][^{]*\{[^}]*#623bff'
    'Navbar accent appears only on pointer hover' = $headHtml -match 'a\[data-norou-section-link\]:hover[^\{]*\.framer-1fjbrv2' -and $headHtml -match 'a\[data-norou-section-link\]:hover[^\{]*p'
    'Home always returns to the document top' = $html -match 'id\s*===\s*"home"' -and $html -match 'top:\s*0'
    'Direct section URLs are restored after Framer hydration' = $html -match 'scrollToSection' -and $html -match 'window\.addEventListener\("load"' -and $html -match 'window\.location\.hash\.slice\(1\)'
    'Showreel autoplays once without looping' = $html -match '<video[^>]+autoplay' -and $html -match 'showreel\.loop\s*=\s*false' -and $html -match 'showreel\.autoplay\s*=\s*true' -and $html -match 'showreel\.preload\s*=\s*"auto"'
    'Enhancements wait for Framer hydration' = $html -match 'window\.addEventListener\("load", startEnhancements' -and $html -notmatch '(?m)^\s*startEnhancements\(\);\s*$'
    'Navbar survives Framer hydration without delayed page reveal' = $html -match 'data-norou-nav-link="Work"' -and $html -match 'new MutationObserver' -and $html -notmatch ', 900\)'
    'Critical hero and navbar stability CSS loads from the head' = $headHtml -match 'id="norou-critical-stability"' -and $headHtml -match 'section\[data-framer-name="Hero"\].*data-framer-appear-id.*opacity:\s*1\s*!important' -and $headHtml -match 'filter:none!important' -and $headHtml -match 'nav:not\(:has\(\[data-norou-nav-link="Work"\]\)\)'
    'Showreel layout is stable before Work navigation' = $headHtml -match 'section\[data-framer-name="Section - Showreel"\].*data-framer-name="Video Container".*transform:none!important'
    'Navbar recovery is scoped and temporary' = $html -match 'new MutationObserver' -and $html -match 'getElementById\("main"\)' -and $html -match 'observer\.disconnect\(\)' -and $html -match ', 8000\)'
    'Incomplete desktop navbar never flashes' = $headHtml -match 'nav:not\(:has\(\[data-norou-nav-link="Work"\]\)\)[^{]*\{[^}]*visibility:\s*hidden\s*!important'
    'Service cards are compact on desktop' = $html -match 'norou-service-card-wrap' -and $html -match 'min-height:150px!important' -and $html -match 'padding:22px 36px!important'
    'Services opens below the 92px navbar' = $html -match 'servicesPanel' -and $html -match 'Content Wrapper' -and $html -match 'setSectionAnchor\(servicesPanel, "services", false, 112\)'
    'Page is never hidden while waiting for enhancements' = $html -notmatch '#main\s*\{\s*visibility:\s*hidden' -and $html -notmatch 'classList\.add\("norou-ready"\)'
    'Footer keeps only the WhatsApp Hire Me CTA' = $html -match 'Hire Me on WhatsApp' -and $html -match 'ctaContainer\.style\.display\s*=\s*"none"' -and $html -match 'link\.getAttribute\("href"\)'
    'Heavy custom navigation remains disabled' = $html -notmatch 'assets/norou-navigation\.(?:js|css)'
    'Professional section links are configured' = $html -match 'data-norou-nav-link' -and $html -match 'Work' -and $html -match 'Services' -and $html -match 'Contact'
    'Navbar order ends with Contact' = $html -match '\{ label: "Services", href: "#services" \},\s*\{ label: "Contact", href: "#contact" \}' -and $html -match 'item\.label\s*===\s*"Contact"'
    'Navbar does not duplicate About' = $html -notmatch '\{ label: "About", href: "#about" \},'
    'Duplicated Instagram CTA is removed' = $html -match 'framer-q1WkO' -and $html -match 'style\.display\s*=\s*"none"'
    'Copyright is configured' = $html -match '© 2026 Norouvfx\. All rights reserved\.'
    'Hero and contact copy remain original' = $html -match "I’m your creative partner" -and $html -notmatch "I create commercials that command attention" -and $html -notmatch "Have a project in mind\? Let’s make something people remember\."
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
