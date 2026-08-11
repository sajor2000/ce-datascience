param(
  [Parameter(Position = 0)]
  [ValidateSet("claude", "codex", "doctor")]
  [string]$Target,

  [string]$Source = "",

  [ValidateSet("user", "project", "local")]
  [string]$Scope = "user",

  [switch]$Aliases,
  [string]$CodexHome = "",
  [string]$AgentsHome = "",
  [switch]$DryRun,
  [switch]$Help
)

$ErrorActionPreference = "Stop"

$PluginName = "ce-datascience"
$MarketplaceName = "ce-datascience-plugin"
$AliasMarker = "<!-- CE_DATASCIENCE_ALIAS_MANAGED v1 "
$ManagedStart = "# BEGIN CE DataScience plugin MCP -- do not edit this block"
$ManagedEnd = "# END CE DataScience plugin MCP"

function Show-Usage {
  @"
Usage:
  .\install.ps1 claude [-Aliases] [-Scope user|project|local]
  .\install.ps1 codex [-CodexHome PATH] [-AgentsHome PATH]
  .\install.ps1 codex -Source C:\approved\ce-datascience-codex-local
  .\install.ps1 doctor

Options:
  -Source PATH       Repo root, unpacked offline package, plugin folder, or plugin ZIP
  -Scope VALUE       Claude marketplace/alias scope: user, project, or local
  -Aliases           Also install safe bare /ce-* Claude aliases
  -CodexHome PATH    Codex profile root (default: CODEX_HOME or ~/.codex)
  -AgentsHome PATH   Codex .agents root for marketplace.json (default: AGENTS_HOME or ~/.agents)
  -DryRun            Print commands without writing files
  -Help              Show this help
"@
}

if ($Help -or [string]::IsNullOrWhiteSpace($Target)) {
  Show-Usage
  if ($Help) { exit 0 }
  exit 2
}

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($Source)) {
  $Source = $ScriptRoot
}
if ([string]::IsNullOrWhiteSpace($CodexHome)) {
  $CodexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
}
if ([string]::IsNullOrWhiteSpace($AgentsHome)) {
  $AgentsHome = if ($env:AGENTS_HOME) { $env:AGENTS_HOME } else { Join-Path $HOME ".agents" }
}

function Resolve-PathOrLiteral([string]$Path) {
  if ([System.IO.Path]::IsPathRooted($Path)) {
    return [System.IO.Path]::GetFullPath($Path)
  }
  return [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Path))
}

$Source = Resolve-PathOrLiteral $Source
$CodexHome = Resolve-PathOrLiteral $CodexHome
$AgentsHome = Resolve-PathOrLiteral $AgentsHome

function Test-CommandAvailable([string]$Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-Step([string]$Command, [string[]]$Arguments) {
  $rendered = "$Command " + (($Arguments | ForEach-Object {
    if ($_ -match "\s") { '"' + $_ + '"' } else { $_ }
  }) -join " ")
  if ($DryRun) {
    Write-Output "[dry-run] $rendered"
    return
  }
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$rendered failed with exit code $LASTEXITCODE"
  }
}

function Assert-Command([string]$Name) {
  if ($DryRun) { return }
  if (-not (Test-CommandAvailable $Name)) {
    throw "$Name is required for this install path."
  }
}

function Get-CommandStatus([string]$Name) {
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -ne $command) { return "available ($($command.Source))" }
  return "not found"
}

function Get-SourceStatus {
  if ((Test-Path (Join-Path $Source ".claude-plugin\marketplace.json")) -and (Test-Path (Join-Path $Source "plugins\$PluginName"))) {
    return "source checkout (standard Claude and Codex installer paths available)"
  }
  if (Test-Path (Join-Path $Source "install-codex-offline.sh")) { return "unpacked Codex offline package" }
  if ((Test-Path (Join-Path $Source "skills")) -and (Test-Path (Join-Path $Source ".claude-plugin"))) { return "unpacked Claude plugin folder" }
  if ($Source.EndsWith(".zip", [System.StringComparison]::OrdinalIgnoreCase)) { return "Claude plugin ZIP" }
  return "unrecognized; expected a source checkout or approved offline artifact"
}

function Show-Doctor {
  Write-Output "CE DataScience install check"
  Write-Output "Source: $Source"
  Write-Output "Source type: $(Get-SourceStatus)"
  Write-Output "Claude Code CLI: $(Get-CommandStatus 'claude')"
  Write-Output "Codex CLI: $(Get-CommandStatus 'codex')"
  Write-Output "Bun (optional for Codex agent bridge): $(Get-CommandStatus 'bun')"
  Write-Output ""
  Write-Output "Standard laptop:"
  Write-Output "  .\install.ps1 claude -Aliases"
  Write-Output "  .\install.ps1 codex"
  Write-Output ""
  Write-Output "Locked-down or corporate laptop:"
  Write-Output "  Claude: claude --plugin-dir C:\approved\ce-datascience.zip"
  Write-Output "  Codex:  .\install.ps1 codex -Source C:\approved\ce-datascience-codex-local"
  Write-Output ""
  Write-Output "Codex always requires the final host step: restart Codex, open /plugins, install CE DataScience from the local marketplace, then restart once more."
}

function Get-ClaudeCommandsDir {
  if ($Scope -eq "project" -or $Scope -eq "local") {
    return Join-Path (Get-Location) ".claude\commands"
  }
  return Join-Path $HOME ".claude\commands"
}

function Test-ManagedAlias([string]$Path) {
  if (-not (Test-Path $Path)) { return $false }
  return (Get-Content $Path -Raw).Contains($AliasMarker)
}

function New-AliasContent([string]$SkillName) {
  $template = @'
---
description: "Local alias for /__PLUGIN__:__SKILL__ from CE DataScience."
---
<!-- CE_DATASCIENCE_ALIAS_MANAGED v1 plugin=__PLUGIN__ skill=__SKILL__ -->
This local command is a convenience alias for the CE DataScience plugin skill:

`/__PLUGIN__:__SKILL__ $ARGUMENTS`

Delegate to that namespaced plugin skill and pass through the arguments exactly:

$ARGUMENTS
'@
  return $template.Replace("__PLUGIN__", $PluginName).Replace("__SKILL__", $SkillName)
}

function Install-ClaudeAliases([string]$PluginDir, [string]$PrebuiltCommandsDir = "") {
  $CommandsDir = Get-ClaudeCommandsDir
  if ($DryRun) {
    Write-Output "[dry-run] create $CommandsDir"
  } else {
    New-Item -ItemType Directory -Force -Path $CommandsDir | Out-Null
  }

  $sources = @()
  if (-not [string]::IsNullOrWhiteSpace($PrebuiltCommandsDir) -and (Test-Path $PrebuiltCommandsDir)) {
    $sources = Get-ChildItem $PrebuiltCommandsDir -Filter "ce-*.md" -File
  } elseif (Test-Path (Join-Path $PluginDir "skills")) {
    $sources = Get-ChildItem (Join-Path $PluginDir "skills") -Directory -Filter "ce-*" |
      Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") }
  } else {
    Write-Warning "Cannot install aliases because this source is not an unpacked plugin folder: $PluginDir"
    return
  }

  $managedNames = New-Object System.Collections.Generic.HashSet[string]
  foreach ($source in $sources) {
    $skillName = if ($source.Extension -eq ".md") { [System.IO.Path]::GetFileNameWithoutExtension($source.Name) } else { $source.Name }
    $fileName = "$skillName.md"
    $target = Join-Path $CommandsDir $fileName
    [void]$managedNames.Add($fileName)
    if ((Test-Path $target) -and -not (Test-ManagedAlias $target)) {
      Write-Output "skipped user-owned $fileName"
      continue
    }
    if ($DryRun) {
      Write-Output "[dry-run] install $fileName"
    } else {
      New-AliasContent $skillName | Set-Content -Path $target -Encoding UTF8
    }
    Write-Output "installed $fileName"
  }

  if (Test-Path $CommandsDir) {
    Get-ChildItem $CommandsDir -Filter "ce-*.md" -File | ForEach-Object {
      if (-not $managedNames.Contains($_.Name) -and (Test-ManagedAlias $_.FullName)) {
        if ($DryRun) { Write-Output "[dry-run] remove stale $($_.Name)" } else { Remove-Item $_.FullName -Force }
        Write-Output "removed stale $($_.Name)"
      }
    }
  }
}

function Set-JsonProperty([object]$Object, [string]$Name, [object]$Value) {
  if ($Object.PSObject.Properties.Name -contains $Name) {
    $Object.$Name = $Value
  } else {
    Add-Member -InputObject $Object -MemberType NoteProperty -Name $Name -Value $Value
  }
}

function Copy-DirectoryReplace([string]$SourceDir, [string]$DestDir) {
  if ($DryRun) {
    Write-Output "[dry-run] replace $DestDir from $SourceDir"
    return
  }
  if (Test-Path $DestDir) {
    Remove-Item -Recurse -Force $DestDir
  }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $DestDir) | Out-Null
  Copy-Item -Recurse -Force $SourceDir $DestDir
}

function Merge-CodexMarketplace([string]$MarketplacePath) {
  if ($DryRun) {
    Write-Output "[dry-run] merge $PluginName into $MarketplacePath"
    return
  }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $MarketplacePath) | Out-Null
  if (Test-Path $MarketplacePath) {
    $data = Get-Content $MarketplacePath -Raw | ConvertFrom-Json
  } else {
    $data = [pscustomobject]@{}
  }

  $plugins = @()
  if ($data.PSObject.Properties.Name -contains "plugins" -and $null -ne $data.plugins) {
    $plugins = @($data.plugins) | Where-Object { $_.name -ne $PluginName }
  }

  $entry = [pscustomobject]@{
    name = $PluginName
    source = [pscustomobject]@{ source = "local"; path = "./.codex/plugins/$PluginName" }
    policy = [pscustomobject]@{ installation = "AVAILABLE"; authentication = "ON_INSTALL" }
    category = "Data Science"
  }

  if (-not ($data.PSObject.Properties.Name -contains "name")) {
    Add-Member -InputObject $data -MemberType NoteProperty -Name "name" -Value "local-codex-plugins"
  }
  if (-not ($data.PSObject.Properties.Name -contains "interface")) {
    Add-Member -InputObject $data -MemberType NoteProperty -Name "interface" -Value ([pscustomobject]@{ displayName = "Local Codex Plugins" })
  }
  Set-JsonProperty $data "plugins" @($plugins + $entry)
  $data | ConvertTo-Json -Depth 10 | Set-Content -Path $MarketplacePath -Encoding UTF8
}

function Remove-CodexMcpConfig {
  $configPath = Join-Path $CodexHome "config.toml"
  if (-not (Test-Path $configPath)) {
    return
  }
  if ($DryRun) {
    Write-Output "[dry-run] remove managed CE DataScience MCP block from $configPath"
    return
  }
  $content = Get-Content $configPath -Raw
  $pattern = "(?ms)^$([regex]::Escape($ManagedStart))\r?\n.*?^$([regex]::Escape($ManagedEnd))\r?\n?"
  $content = [regex]::Replace($content, $pattern, "")
  Set-Content -Path $configPath -Value $content.TrimEnd() -Encoding UTF8
}

function Install-Claude {
  $repoMarketplace = Join-Path $Source ".claude-plugin\marketplace.json"
  $repoPlugin = Join-Path $Source "plugins\$PluginName"
  if ((Test-Path $repoMarketplace) -and (Test-Path $repoPlugin)) {
    Assert-Command "claude"
    Invoke-Step "claude" @("plugin", "marketplace", "add", $Source, "--scope", $Scope)
    Invoke-Step "claude" @("plugin", "install", "$PluginName@$MarketplaceName", "--scope", $Scope)
    if ($Aliases) { Install-ClaudeAliases $repoPlugin }
    Write-Output ""
    Write-Output "Claude install complete. Start Claude Code in a project and run:"
    if ($Aliases) { Write-Output "  /ce-setup" } else { Write-Output "  /$PluginName:ce-setup" }
    return
  }

  if ((Test-Path (Join-Path $Source "skills")) -and (Test-Path (Join-Path $Source ".claude-plugin"))) {
    if ($Aliases) { Install-ClaudeAliases $Source }
    Write-Output "Launch Claude Code with:"
    Write-Output "  claude --plugin-dir `"$Source`""
    Write-Output "Then run /$PluginName:ce-setup"
    return
  }

  if ((Test-Path (Join-Path $Source "commands")) -and $Aliases) {
    Install-ClaudeAliases "" (Join-Path $Source "commands")
    return
  }

  if ($Source.EndsWith(".zip", [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Output "Launch Claude Code with:"
    Write-Output "  claude --plugin-dir `"$Source`""
    Write-Output "Then run /$PluginName:ce-setup"
    return
  }

  throw "Could not find a CE DataScience Claude marketplace, plugin folder, alias package, or plugin ZIP at $Source"
}

function Install-CodexOffline {
  $pluginSrc = if (Test-Path (Join-Path $Source "plugins\$PluginName")) {
    Join-Path $Source "plugins\$PluginName"
  } elseif ((Test-Path (Join-Path $Source ".codex-plugin")) -and (Test-Path (Join-Path $Source "skills"))) {
    $Source
  } else {
    throw "Could not find a ce-datascience plugin directory under $Source"
  }

  $marketplaceRoot = Split-Path -Parent $AgentsHome
  $marketplacePath = Join-Path $AgentsHome "plugins\marketplace.json"
  $pluginDest = Join-Path $marketplaceRoot ".codex\plugins\$PluginName"
  Copy-DirectoryReplace $pluginSrc $pluginDest
  Merge-CodexMarketplace $marketplacePath

  $bridgeSourceCandidates = @(
    (Join-Path $Source "codex-agent-bridge\agents\$PluginName"),
    (Join-Path $Source ".codex\agents\$PluginName"),
    (Join-Path $Source "codex-home\agents\$PluginName")
  )
  $bridgeSource = $bridgeSourceCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($bridgeSource) {
    Copy-DirectoryReplace $bridgeSource (Join-Path $CodexHome "agents\$PluginName")
  } else {
    Write-Output "No Codex agent bridge found under $Source; installed native plugin marketplace only."
  }

  Remove-CodexMcpConfig
  Write-Output ""
  Write-Output "Codex offline install complete."
  Write-Output "Marketplace: $marketplacePath"
  Write-Output "Plugin:      $pluginDest"
  Write-Output "Codex home:  $CodexHome"
  Write-Output "Restart Codex, open /plugins, install CE DataScience, then restart again."
}

function Install-Codex {
  if (Test-Path (Join-Path $Source "install-codex-offline.sh")) {
    Install-CodexOffline
    return
  }

  if ((Test-Path (Join-Path $Source ".agents\plugins\marketplace.json")) -and (Test-Path (Join-Path $Source "plugins\$PluginName"))) {
    Assert-Command "codex"
    Invoke-Step "codex" @("plugin", "marketplace", "add", $Source)
    if (Test-CommandAvailable "bun") {
      if ($DryRun) {
        Write-Output "[dry-run] cd `"$Source`" && bun run src/index.ts install ./plugins/$PluginName --to codex --codex-home `"$CodexHome`""
      } else {
        Push-Location $Source
        try {
          Invoke-Step "bun" @("run", "src/index.ts", "install", "./plugins/$PluginName", "--to", "codex", "--codex-home", $CodexHome)
        } finally {
          Pop-Location
        }
      }
    } else {
      Write-Output "bun not found; registered the native Codex plugin marketplace only."
      Write-Output "Install CE DataScience from /plugins, or run the Bun bridge later for generated agents."
    }
    Write-Output ""
    Write-Output "Codex install prepared."
    Write-Output "Restart Codex, open /plugins, install CE DataScience, then start a new thread."
    return
  }

  throw "Could not find a CE DataScience Codex marketplace or offline package at $Source"
}

switch ($Target) {
  "claude" { Install-Claude }
  "codex" { Install-Codex }
  "doctor" { Show-Doctor }
}
