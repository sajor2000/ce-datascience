type Branch = {
  name: string
  protected: boolean
  commit: { sha: string }
}

type PullRequest = {
  number: number
  html_url: string
  merged_at: string | null
  updated_at: string
  head: { sha: string }
}

export type Candidate = {
  branch: string
  pullRequest: PullRequest
  sha: string
}

export type Exclusion = {
  branch: string
  reason: string
}

export type Report = {
  candidates: Candidate[]
  exclusions: Exclusion[]
}

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>

const apiBase = process.env.GITHUB_API_URL ?? "https://api.github.com"

function nextPage(link: string | null): string | undefined {
  return link?.split(",").map((part) => part.trim()).find((part) => part.includes('rel="next"'))?.match(/<([^>]+)>/)?.[1]
}

export async function fetchAll<T>(fetcher: FetchLike, url: string, token: string): Promise<T[]> {
  const items: T[] = []
  let next: string | undefined = url

  while (next) {
    const response = await fetcher(next, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    if (!response.ok) throw new Error(`GitHub API request failed (${response.status}) for ${next}`)

    const page = await response.json()
    if (!Array.isArray(page)) throw new Error(`GitHub API returned a non-list response for ${next}`)
    items.push(...page as T[])
    next = nextPage(response.headers.get("link"))
  }

  return items
}

export function classifyBranches(defaultBranch: string, branches: Branch[], pullRequestsByBranch: Map<string, { open: PullRequest[]; closed: PullRequest[] }>): Report {
  const candidates: Candidate[] = []
  const exclusions: Exclusion[] = []

  for (const branch of branches) {
    if (branch.name === defaultBranch) {
      exclusions.push({ branch: branch.name, reason: "default branch" })
      continue
    }
    if (branch.protected) {
      exclusions.push({ branch: branch.name, reason: "protected branch" })
      continue
    }

    const pullRequests = pullRequestsByBranch.get(branch.name)
    if (!pullRequests) throw new Error(`Missing pull request data for ${branch.name}`)
    if (pullRequests.open.length > 0) {
      exclusions.push({ branch: branch.name, reason: "open pull request" })
      continue
    }

    const matchingMerged = pullRequests.closed.find((pullRequest) => pullRequest.merged_at && pullRequest.head.sha === branch.commit.sha)
    if (matchingMerged) {
      candidates.push({ branch: branch.name, pullRequest: matchingMerged, sha: branch.commit.sha })
    } else if (pullRequests.closed.length === 0) {
      exclusions.push({ branch: branch.name, reason: "no closed pull request" })
    } else if (pullRequests.closed.some((pullRequest) => pullRequest.merged_at)) {
      exclusions.push({ branch: branch.name, reason: "post-merge commits" })
    } else {
      exclusions.push({ branch: branch.name, reason: "no matching merged pull request" })
    }
  }

  return { candidates, exclusions }
}

export function renderReport(report: Report, trigger: string): string {
  const lines = ["## Weekly branch maintenance", "", `Trigger: \`${trigger}\``, ""]

  if (report.candidates.length === 0) {
    lines.push("No cleanup candidates found.")
  } else {
    lines.push("The following remote branches need human review before cleanup:", "", "| Branch | Merged pull request | Merged | Head SHA |", "| --- | --- | --- | --- |")
    for (const candidate of report.candidates) {
      lines.push(`| \`${candidate.branch}\` | [#${candidate.pullRequest.number}](${candidate.pullRequest.html_url}) | ${candidate.pullRequest.merged_at} | \`${candidate.sha.slice(0, 12)}\` |`)
    }
    lines.push("", "Use the interactive `ce-clean-gone-branches` workflow to inspect local worktrees and confirm any deletion.")
  }

  if (report.exclusions.length > 0) {
    const counts = new Map<string, number>()
    for (const exclusion of report.exclusions) counts.set(exclusion.reason, (counts.get(exclusion.reason) ?? 0) + 1)
    lines.push("", "Excluded branches:", "")
    for (const [reason, count] of [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))) lines.push(`- ${reason}: ${count}`)
  }

  return `${lines.join("\n")}\n`
}

async function run(): Promise<string> {
  const repository = process.env.GITHUB_REPOSITORY
  const token = process.env.GITHUB_TOKEN
  if (!repository || !token) throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required")

  const repositoryUrl = `${apiBase}/repos/${repository}`
  const repositoryResponse = await fetch(repositoryUrl, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
  })
  if (!repositoryResponse.ok) throw new Error(`GitHub API request failed (${repositoryResponse.status}) for ${repositoryUrl}`)
  const repositoryData = await repositoryResponse.json() as { default_branch?: string }
  if (!repositoryData.default_branch) throw new Error("GitHub API response did not include a default branch")

  const branches = await fetchAll<Branch>(fetch, `${repositoryUrl}/branches?per_page=100`, token)
  const [owner] = repository.split("/")
  const pullRequestsByBranch = new Map<string, { open: PullRequest[]; closed: PullRequest[] }>()

  for (const branch of branches) {
    if (branch.name === repositoryData.default_branch || branch.protected) continue
    const head = encodeURIComponent(`${owner}:${branch.name}`)
    const [open, closed] = await Promise.all([
      fetchAll<PullRequest>(fetch, `${repositoryUrl}/pulls?state=open&head=${head}&per_page=100`, token),
      fetchAll<PullRequest>(fetch, `${repositoryUrl}/pulls?state=closed&head=${head}&per_page=100`, token),
    ])
    pullRequestsByBranch.set(branch.name, { open, closed })
  }

  return renderReport(classifyBranches(repositoryData.default_branch, branches, pullRequestsByBranch), process.env.GITHUB_EVENT_NAME ?? "manual")
}

if (import.meta.main) {
  try {
    process.stdout.write(await run())
  } catch (error) {
    process.stdout.write(`## Weekly branch maintenance failed\n\n${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
