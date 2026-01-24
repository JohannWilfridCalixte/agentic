# Step 4: Security Context

## EXECUTION RULES

- 🎯 Invoke Security agent for threat modeling and security requirements
- 📋 Security decides all security-related questions
- 🚫 Orchestrator does NOT make security decisions
- ✅ Output: `security-addendum.md`

---

## AGENT HANDOFF

**Load Security Context Agent:**
```
@.claude/agents/security.md
```

**Provide context:**
- `spec.md` - product requirements with security implications
- `technical-context.md` - technical landscape
- `workflow_mode` - interactive or auto

---

## SECURITY CONTEXT TASK

### Threat Modeling

Analyze story for:
1. **Assets** - what needs protection
2. **Actors** - who interacts with the system
3. **Trust boundaries** - where security enforcement happens
4. **Attack vectors** - potential threats

### Security Document Sections

**Required output in `security-addendum.md`:**

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Security Addendum
Status: Draft
Owner: Security
Created: {ISO_timestamp}
---

# Security Addendum - {story_id}

## Security Objectives
- Confidentiality: {requirements}
- Integrity: {requirements}
- Availability: {requirements}

## Assets / Actors / Trust Boundaries

### Assets
| Asset | Sensitivity | Protection Required |
|-------|-------------|---------------------|
| {asset} | {High/Med/Low} | {protection} |

### Actors
| Actor | Trust Level | Permissions |
|-------|-------------|-------------|
| {actor} | {level} | {permissions} |

### Trust Boundaries
{Diagram or description of trust boundaries}

## Multi-Tenancy Isolation (MANDATORY)

> Required for all multi-tenant systems.

| Concern | Requirement | Implementation |
|---------|-------------|----------------|
| Data isolation | {requirement} | {how} |
| Resource isolation | {requirement} | {how} |
| Tenant context | {requirement} | {how} |

## Security Requirements

### SEC-REQ-01: {Requirement title}
**Category**: {Auth | Input Validation | Data Protection | ...}
**Priority**: {Critical | High | Medium}
**Description**: {Detailed requirement}
**Verification**: {How to verify compliance}

### SEC-REQ-02: {Requirement title}
...

## OWASP Top 10 Mapping

| OWASP Category | Applicable | Mitigation |
|----------------|------------|------------|
| A01: Broken Access Control | {Yes/No} | {mitigation} |
| A02: Cryptographic Failures | {Yes/No} | {mitigation} |
| A03: Injection | {Yes/No} | {mitigation} |
| A04: Insecure Design | {Yes/No} | {mitigation} |
| A05: Security Misconfiguration | {Yes/No} | {mitigation} |
| A06: Vulnerable Components | {Yes/No} | {mitigation} |
| A07: Auth Failures | {Yes/No} | {mitigation} |
| A08: Data Integrity Failures | {Yes/No} | {mitigation} |
| A09: Logging Failures | {Yes/No} | {mitigation} |
| A10: SSRF | {Yes/No} | {mitigation} |

## GDPR / Compliance Constraints
{If applicable}

## Security Verification Matrix

| SEC-REQ | Test Type | Test Location | Pass Criteria |
|---------|-----------|---------------|---------------|
| SEC-REQ-01 | {unit/integration/manual} | {path} | {criteria} |
```

### Auto Mode Decisions

**Security decisions follow same pattern:**
- Log decision with context
- Include security-specific rationale
- Note compliance implications in trade-offs

---

## STEP COMPLETION

**Write to:** `{story_path}/security-addendum.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  security_context: "{story_path}/security-addendum.md"

steps_completed:
  - step: 4
    name: "security-context"
    completed_at: {ISO_timestamp}
    output: "{story_path}/security-addendum.md"

current_step: 5
```

---

## NEXT STEP

Load `step-05-architect-plan.md`
