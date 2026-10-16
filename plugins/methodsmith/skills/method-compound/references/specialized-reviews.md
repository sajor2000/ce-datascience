# Phase 3: Optional Specialized Reviews (Full mode only)

Read only after Phase 2 completes in Full mode. Lightweight mode skips this phase.

Based on problem type, optionally run specialized reviewers on the written documentation (in parallel where the platform supports it; otherwise sequentially):

- **performance_issue** -> `method-performance-oracle`
- **security_issue** -> `method-security-sentinel`
- **database_issue** -> `method-data-mapping-reviewer`
- Any code-heavy issue -> always dispatch the `method-code-simplicity-reviewer` agent, and additionally run the kieran reviewer that matches the repo's primary stack:
  - Python -> also dispatch the `method-kieran-python-reviewer` agent
  - R -> also dispatch the `method-r-code-reviewer` agent
  - TypeScript/JavaScript -> dispatch the `method-code-simplicity-reviewer` agent; no separate TypeScript specialist ships in methodsmith
  - Other stacks -> no kieran reviewer needed

Other agents that can enhance documentation on request:

- **method-pattern-recognition-specialist**: identifies anti-patterns or repeating issues
- **method-best-practices-researcher**: enriches the solution with industry best practices
- **method-framework-docs-researcher**: links to framework/library documentation

These can run post-documentation (optional) or be invoked manually by the user after `method-compound` completes.
