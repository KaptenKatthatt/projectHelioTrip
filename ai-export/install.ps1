param(
  [Parameter(Mandatory = $true)]
  [string]$TargetProjectPath
)

$ErrorActionPreference = "Stop"
$sourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$resolvedTarget = Resolve-Path -Path $TargetProjectPath

if (-not (Test-Path -Path $resolvedTarget -PathType Container)) {
  throw "Target directory does not exist: $TargetProjectPath"
}

Write-Host "Copying template files..."
Copy-Item -Path (Join-Path $sourceDir "template\*") -Destination $resolvedTarget -Recurse -Force

Write-Host "Copying quality-gates guide..."
$targetExportDir = Join-Path $resolvedTarget "ai-export"
New-Item -ItemType Directory -Path $targetExportDir -Force | Out-Null
Copy-Item -Path (Join-Path $sourceDir "quality-gates") -Destination $targetExportDir -Recurse -Force
Copy-Item -Path (Join-Path $sourceDir "README.md") -Destination (Join-Path $targetExportDir "README.md") -Force

$manifestPath = Join-Path $sourceDir "manifest.json"
if (Test-Path -Path $manifestPath) {
  Copy-Item -Path $manifestPath -Destination (Join-Path $targetExportDir "manifest.json") -Force
}

Write-Host "Done."
Write-Host "Next steps:"
Write-Host "1) Open $resolvedTarget\context\AGENTS_CONTEXT.md"
Write-Host "2) Apply updates from $resolvedTarget\CUSTOMIZE_BEFORE_USE.md"
Write-Host "3) Run verification commands: npx tsc --noEmit and npm run lint"
