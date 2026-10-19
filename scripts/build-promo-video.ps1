$ErrorActionPreference = 'Stop'

$projectDirectory = Split-Path -Parent $PSScriptRoot
$mediaDirectory = Join-Path $projectDirectory 'media'
$outputFile = Join-Path $mediaDirectory 'multiwordle-promo.mp4'

Push-Location $mediaDirectory
try {
    ffmpeg -y `
        -f lavfi `
        -i "color=c=0x0f172a:s=1080x1920:r=30:d=20" `
        -f lavfi `
        -i "anullsrc=channel_layout=stereo:sample_rate=48000" `
        -vf "drawbox=x=-120:y='mod(t*95,2300)-500':w=1320:h=520:color=0x6366f1@0.22:t=fill,drawbox=x=-120:y='2300-mod(t*75,2500)':w=1320:h=460:color=0x10b981@0.18:t=fill,drawbox=x=80:y=150:w=920:h=1620:color=0xffffff@0.035:t=fill,ass=multiwordle-promo.ass" `
        -t 20 `
        -c:v libx264 `
        -preset medium `
        -crf 19 `
        -pix_fmt yuv420p `
        -c:a aac `
        -b:a 128k `
        -shortest `
        -movflags +faststart `
        $outputFile
}
finally {
    Pop-Location
}

Write-Output $outputFile
