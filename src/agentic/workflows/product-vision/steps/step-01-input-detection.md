# Step 1: Input Detection

## EXECUTION RULES

- Detect input source
- Generate topic slug
- Initialize workflow state
- Do not proceed until state file is created
- Output: `workflow-state.yaml` initialized

---

## SEQUENCE

### 1.1 Parse Command Arguments

**Analyze the `/product-vision` invocation:**

```
Pattern matching:
- /product-vision                      -> input: user
- /product-vision path/to/notes.md     -> input: file
```

**Set variables:**
```yaml
input_type: "user" | "file"
input_source: null | "<path>"
```

### 1.2 Fetch/Validate Input

**If input_type == "file":**
- Read file at `input_source`
- Validate it exists and has content
- Store content as `raw_input`

**If input_type == "user":**
- Prompt user: "Describe your product idea in a few sentences"
- Store response as `raw_input`

### 1.3 Generate Topic Slug

From `raw_input`:
- Extract the core topic/feature name
- Convert to kebab-case

**Examples:**
- "User authentication with SSO" -> `user-authentication-sso`
- "Payment processing flow" -> `payment-processing`
- "Dashboard analytics" -> `dashboard-analytics`

**Set variables:**
```yaml
topic: "kebab-case-topic"
```

### 1.4 Generate Workflow Instance ID

**Generate unique instance ID to prevent parallel workflow collisions:**

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
# Example: 20240115-143052-a7b2
```

**Set output_path with instance ID:**
```yaml
output_path: "{ide-folder}/{outputFolder}/product/vision/{topic}/{instance_id}"
```

This ensures parallel workflows don't overwrite each other's files.

### 1.5 Create Output Directory

```bash
mkdir -p {output_path}
```

### 1.6 Initialize Workflow State

**Create `{output_path}/workflow-state.yaml`:**

```yaml
workflow: product-vision
version: "1.0.0"

# Workflow configuration
input_type: {input_type}
input_source: {input_source}

# Topic identification
topic: {topic}
instance_id: {instance_id}
output_path: {output_path}

# Timing
started_at: {ISO_timestamp}
updated_at: {ISO_timestamp}

# Progress tracking
status: "in_progress"
current_step: 1
steps_completed: []

# Brainstorming session
brainstorming_techniques_used: []
ideas_generated: 0
technique_selection_mode: ""

# Vision discovery confirmation loop
discovery_attempts: 0
discovery_confirmed: false

# Vision deepening
questions_asked: 0
critical_open_questions: 0
decisions_logged: 0

# Artifacts
artifacts:
  context: null
  brainstorming: null
  discovery: null
  vision_decisions: null
  vision: null

# Validation
validation:
  context_gathering_complete: false
  brainstorming_complete: false
  discovery_complete: false
  required_sections_present: false
  discovery_confirmed: false
  gate_passed: false
```

### 1.7 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 1
    name: "input-detection"
    completed_at: {ISO_timestamp}

current_step: 2
updated_at: {ISO_timestamp}
```

**Output to user:**
```
Workflow initialized

Topic: {topic}
Path: {output_path}

Gathering codebase context...
```

---

## NEXT STEP

Load and execute: `step-02-context-gathering.md`
