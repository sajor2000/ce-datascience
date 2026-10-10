# Phase 3: Optional Specialized Reviews (Full mode only)

Read only after Phase 2 completes in Full mode. Lightweight mode skips this phase.

Based on problem type, optionally run specialized reviewers on the written documentation (in parallel where the platform supports it; otherwise sequentially):

- **performance_issue** -> `ce-performance-oracle`
- **security_issue** -> `ce-security-sentinel`
- **database_issue** -> `ce-data-mapping-reviewer`
- Any code-heavy issue -> always dispatch the `ce-code-simplicity-reviewer` agent, and additionally run the kieran reviewer that matches the repo's primary stack:
  - Python -> also load the `ce-kieran-python-reviewer` skill
  - R -> also load the `ce-r-code-reviewer` skill
  - TypeScript/JavaScript -> dispatch the `ce-code-simplicity-reviewer` agent; no separate TypeScript specialist ships in ce-datascience
  - Other stacks -> no kieran reviewer needed

Other agents that can enhance documentation on request:

- **ce-pattern-recognition-specialist**: identifies anti-patterns or repeating issues
- **ce-best-practices-researcher**: enriches the solution with industry best practices
- **ce-framework-docs-researcher**: links to framework/library documentation

These can run post-documentation (optional) or be invoked manually by the user after `ce-compound` completes.
