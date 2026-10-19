param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'

$media = Join-Path $ProjectRoot 'media'
$interface = Join-Path $media 'multiwordle-interface.png'
$voice = Join-Path $media 'multiwordle-voice.wav'
$music = Join-Path $media 'multiwordle-music.wav'
$output = Join-Path $media 'multiwordle-promo-v2.mp4'
$ass = Join-Path $media 'multiwordle-promo-v2.ass'

if (-not (Test-Path -LiteralPath $interface)) {
    throw "Falta la captura real de la interfaz: $interface"
}

$narration = @'
¿Te pasa que abrís un juego de palabras y siempre termina siendo lo mismo? Imaginá tener cinco desafíos en un solo lugar. Videojuegos, fútbol, básquet, Fórmula Uno y países. Elegís tu categoría, comparás cada pista y encontrás la respuesta antes de quedarte sin intentos. Eso es Multi Wordle. Registrate, jugá y desafiá a tus amigos. ¿Cuánto sabés realmente?
'@

$escapedNarration = $narration.Replace("'", "''")
$voiceScript = @"
Add-Type -AssemblyName System.Speech
`$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
`$spanish = `$speaker.GetInstalledVoices() | Where-Object { `$_.VoiceInfo.Culture.Name -like 'es-*' } | Select-Object -First 1
if (`$spanish) { `$speaker.SelectVoice(`$spanish.VoiceInfo.Name) }
`$speaker.Rate = 1
`$speaker.Volume = 100
`$speaker.SetOutputToWaveFile('$($voice.Replace("'", "''"))')
`$speaker.Speak('$escapedNarration')
`$speaker.Dispose()
"@

$voiceScriptPath = Join-Path $env:TEMP 'multiwordle-voice.ps1'
Set-Content -LiteralPath $voiceScriptPath -Value $voiceScript -Encoding UTF8
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $voiceScriptPath

# Base musical original: pulso electrónico suave, sin derechos de terceros.
ffmpeg -y `
    -f lavfi -i "sine=frequency=110:sample_rate=48000:duration=35" `
    -f lavfi -i "sine=frequency=220:sample_rate=48000:duration=35" `
    -f lavfi -i "sine=frequency=329.63:sample_rate=48000:duration=35" `
    -filter_complex "[0:a]volume=0.035,tremolo=f=2:d=0.55[a0];[1:a]volume=0.018,tremolo=f=4:d=0.7[a1];[2:a]volume=0.012,tremolo=f=8:d=0.8[a2];[a0][a1][a2]amix=inputs=3,afade=t=in:st=0:d=1,afade=t=out:st=32:d=3[m]" `
    -map "[m]" -c:a pcm_s16le $music

$durationRaw = ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $voice
$duration = [Math]::Ceiling([double]$durationRaw + 1.2)

$filter = @"
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=35,eq=brightness=-0.33:saturation=1.20[bg];
[0:v]scale=1040:-2[screen];
[bg][screen]overlay=(W-w)/2:(H-h)/2,drawbox=x=0:y=0:w=iw:h=330:color=0x0f172a@0.90:t=fill,drawbox=x=0:y=1530:w=iw:h=390:color=0x0f172a@0.90:t=fill,ass='$($ass.Replace('\','/').Replace(':','\:'))'[v];
[2:a]volume=0.20[music];[1:a]highpass=f=80,lowpass=f=9000,acompressor=threshold=-18dB:ratio=3:attack=10:release=100,volume=1.25[voice];[music][voice]amix=inputs=2:duration=longest:dropout_transition=2,alimiter=limit=0.95[a]
"@

ffmpeg -y -loop 1 -i $interface -i $voice -i $music `
    -filter_complex $filter `
    -map '[v]' -map '[a]' -t $duration `
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 `
    -c:a aac -b:a 192k -movflags +faststart $output

Write-Output $output
