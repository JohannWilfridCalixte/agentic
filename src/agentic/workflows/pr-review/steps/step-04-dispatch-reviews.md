# Step 4: Dispatch Reviews

---

## ORCHESTRATOR ACTION

**You MUST delegate all reviews using the Task tool. Do NOT review code yourself.**

Dispatch QA, Test QA, and Security QA reviews. These can run in parallel (no dependencies between them).

---

## ERROR HANDLING

If a review agent fails:
1. Retry once
2. If retry fails, set the corresponding review artifact to `null` in workflow-state.yaml
3. Add a note to the review summary: "**{agent} review unavailable** — agent failed after retry"
4. Proceed with available reviews

---

## REVIEW AGENTS

### 4.1 Delegate QA Review (Code)

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning QA review.'

{language_skills_prompt}

# TASK: Review PR Code Quality

You are reviewing PR #{pr_number}: {pr_title}

This is a PR review (not an implementation review). You are reviewing code written by another developer. Focus on:
- Code quality, readability, maintainability
- Architectural consistency with the codebase
- Potential bugs or edge cases
- Adherence to patterns found in technical context

PR diff: {output_path}/pr-diff.patch
PR metadata: {output_path}/pr-metadata.md
Technical context: {output_path}/technical-context.md

Review ONLY implementation code (NOT tests - Test QA handles that).

## Finding Format (Verbosity Level: {verbosity_level})

Format each finding based on verbosity level:
- **Level 1 (Concise):** Severity + short description (1-2 sentences)
- **Level 2 (Detailed):** Severity + issue title + detailed description
- **Level 3 (Comprehensive):** Severity + issue title + detailed description + file:line pointers + explanation of how to fix

Always include severity: blocker | major | minor | nit

If the PR has no issues, state an explicit clean verdict with 0 findings.

Output to: {output_path}/qa-review.md
")
```

Validate: `{output_path}/qa-review.md` exists and contains review content (findings or explicit clean verdict).

### 4.2 Delegate Test QA Review

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-test-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning Test QA review.'

{language_skills_prompt}

# TASK: Review PR Test Quality

You are reviewing PR #{pr_number}: {pr_title}

This is a PR review. Focus on:
- Test coverage for new/changed code
- Test quality and reliability
- Missing edge case tests
- Test naming and organization

PR diff: {output_path}/pr-diff.patch
PR metadata: {output_path}/pr-metadata.md
Technical context: {output_path}/technical-context.md

If the PR contains no test changes, evaluate whether tests SHOULD have been included. Report missing test coverage as findings. If no tests are expected (e.g., docs-only change, config change), report 0 findings with explanation.

## Finding Format (Verbosity Level: {verbosity_level})

Format each finding based on verbosity level:
- **Level 1 (Concise):** Severity + short description (1-2 sentences)
- **Level 2 (Detailed):** Severity + issue title + detailed description
- **Level 3 (Comprehensive):** Severity + issue title + detailed description + file:line pointers + explanation of how to fix

Always include severity: blocker | major | minor | nit

If the PR has no issues, state an explicit clean verdict with 0 findings.

Output to: {output_path}/test-qa-review.md
")
```

Validate: `{output_path}/test-qa-review.md` exists and contains review content (findings or explicit clean verdict).

### 4.3 Delegate Security QA Review

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-security-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning Security QA review.'

{language_skills_prompt}

# TASK: Security Review of PR

You are reviewing PR #{pr_number}: {pr_title}

This is a PR review. Focus on:
- Security vulnerabilities (OWASP top 10)
- Secrets, credentials, or sensitive data
- Input validation and sanitization
- Authentication/authorization gaps
- Dependency security concerns

PR diff: {output_path}/pr-diff.patch
PR metadata: {output_path}/pr-metadata.md
Technical context: {output_path}/technical-context.md

## Finding Format (Verbosity Level: {verbosity_level})

Format each finding based on verbosity level:
- **Level 1 (Concise):** Severity + short description (1-2 sentences)
- **Level 2 (Detailed):** Severity + issue title + detailed description
- **Level 3 (Comprehensive):** Severity + issue title + detailed description + file:line pointers + explanation of how to fix

Always include severity: blocker | major | minor | nit

If the PR has no issues, state an explicit clean verdict with 0 findings.

Output to: {output_path}/security-review.md
")
```

Validate: `{output_path}/security-review.md` exists and contains review content (findings or explicit clean verdict).

### 4.4 Aggregate Results

Read all available review files. Collect all issues by severity:

```yaml
review_results:
  qa:
    blocker: {count}
    major: {count}
    minor: {count}
    nit: {count}
  test_qa:
    blocker: {count}
    major: {count}
    minor: {count}
    nit: {count}
  security:
    blocker: {count}
    major: {count}
    minor: {count}
    nit: {count}
  totals:
    blocker: {sum}
    major: {sum}
    minor: {sum}
    nit: {sum}
  verdict: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"
```

**Verdict logic:**
- `APPROVE` — 0 blockers AND 0 majors
- `REQUEST_CHANGES` — any blockers
- `COMMENT` — no blockers but has majors

### 4.5 Update State

**Append to `steps_completed`:**
```yaml
artifacts:
  qa_review: "{output_path}/qa-review.md"
  test_qa_review: "{output_path}/test-qa-review.md"
  security_review: "{output_path}/security-review.md"

review_results: {aggregated counts from 4.4}

steps_completed:
  - step: 4
    name: "dispatch-reviews"
    completed_at: {ISO}

current_step: 5
```

---

## NEXT STEP

Load `step-05-output.md`
