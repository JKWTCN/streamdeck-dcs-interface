param(
    [Parameter(Mandatory = $true)]
    [string]$Path
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archivePath = (Resolve-Path -LiteralPath $Path).Path
$temporaryPath = Join-Path (Split-Path -Parent $archivePath) ([System.IO.Path]::GetRandomFileName())
$source = $null
$target = $null

try {
    $source = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
    $target = [System.IO.Compression.ZipFile]::Open(
        $temporaryPath, [System.IO.Compression.ZipArchiveMode]::Create)

    foreach ($entry in $source.Entries) {
        $name = $entry.FullName.Replace('\', '/')
        $isDirectory = $name.EndsWith('/')
        $compression = [System.IO.Compression.CompressionLevel]::Optimal
        if ($isDirectory) {
            $compression = [System.IO.Compression.CompressionLevel]::NoCompression
        }
        $normalized = $target.CreateEntry($name, $compression)
        $normalized.LastWriteTime = $entry.LastWriteTime
        $normalized.ExternalAttributes = $entry.ExternalAttributes
        if ($isDirectory) {
            $normalized.ExternalAttributes = $normalized.ExternalAttributes -bor 0x10
        }

        $inputStream = $entry.Open()
        $outputStream = $null
        try {
            $outputStream = $normalized.Open()
            $inputStream.CopyTo($outputStream)
        }
        finally {
            if ($null -ne $outputStream) { $outputStream.Dispose() }
            $inputStream.Dispose()
        }
    }

    $target.Dispose()
    $target = $null
    $source.Dispose()
    $source = $null
    Move-Item -LiteralPath $temporaryPath -Destination $archivePath -Force
}
finally {
    if ($null -ne $target) { $target.Dispose() }
    if ($null -ne $source) { $source.Dispose() }
    if (Test-Path -LiteralPath $temporaryPath) {
        Remove-Item -LiteralPath $temporaryPath
    }
}
