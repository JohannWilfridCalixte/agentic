# Setup Guide for Product Managers

Agentic is a multi-agent framework that works inside Claude Code and Cursor (AI-powered code editors). It lets you run **workflows** -- structured, multi-step processes that leverage AI to accomplish tasks like answering questions about your codebase or writing product specifications.

You do not need to write code. You will type commands into a terminal inside Claude Code or Cursor, interact with AI agents that ask you questions, and review the outputs they produce (mostly Markdown documents).

This guide covers three workflows relevant to PMs:

- **ask-codebase** -- ask a question about your product's existing behavior and get a plain-language answer
- **product-spec** -- turn a rough idea into a rigorous product specification through guided questioning
- **product-vision** -- turn a rough idea into a comprehensive product vision document through creative brainstorming and rigorous questioning

---

## Prerequisites

Before installing agentic, you need two things:

1. A code editor: **Claude Code** or **Cursor** (or both)
2. A GitHub Personal Access Token to download the package from GitHub's npm registry

### Step 1: Get a GitHub Personal Access Token (PAT)

Agentic is open-source and published on GitHub's npm package registry. GitHub requires a Personal Access Token to download packages from this registry, even for public packages.

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a descriptive name like `agentic-registry-access`
4. Under **"Select scopes"**, check only **`read:packages`**
5. Click **"Generate token"**
6. **Copy the token immediately** -- you will not be able to see it again after leaving the page

### Step 2: Configure your npm registry

Your computer needs to know where to find the agentic package and how to authenticate. This is done through a file called `.npmrc`.

#### What is `.npmrc`?

It is a small configuration file that tells npm (the package manager) where to download packages from and what credentials to use. The file lives in your **home directory**:

- **macOS / Linux**: `~/.npmrc` which means `/Users/YOUR_USERNAME/.npmrc`
- **Windows**: `C:\Users\YOUR_USERNAME\.npmrc`

#### How to create or edit `.npmrc`

Open your terminal (the built-in terminal in Claude Code or Cursor, or the Terminal app on macOS) and paste the following command. Replace `YOUR_TOKEN_HERE` with the token you copied in Step 1:

```bash
echo "@JohannWilfridCalixte:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE" >> ~/.npmrc
```

This command appends two lines to your `.npmrc` file (creating the file if it does not exist):

- Line 1 tells npm: "For any package starting with `@JohannWilfridCalixte`, use GitHub's registry"
- Line 2 tells npm: "When talking to GitHub's registry, use this token to authenticate"

#### Verify it worked

Run this command to see the contents of your `.npmrc` file:

```bash
cat ~/.npmrc
```

You should see at least these two lines (among possibly others):

```
@JohannWilfridCalixte:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxx
```

If the file is empty or missing, repeat the step above.

---

## Installation

With your registry configured, you can now install agentic. Open your terminal **inside your project's root directory** (the top-level folder of the codebase you want to work with) and run:

```bash
bunx @JohannWilfridCalixte/agentic@alpha init -w ask-codebase,product-spec,product-vision -n YOUR_TEAM_NAME --ide YOUR_IDE
```

### Breaking down the command

| Part | Meaning |
|------|---------|
| `bunx` | Runs a package without permanently installing it. You can also use `npx` or `pnpx` instead -- they all do the same thing. |
| `@JohannWilfridCalixte/agentic@alpha` | The agentic package, using the alpha release channel. |
| `init` | Tells agentic to set itself up in the current project. |
| `-w ask-codebase,product-spec,product-vision` | Install only these three workflows. No spaces around the comma. |
| `-n YOUR_TEAM_NAME` | A namespace prefix for your team. Must be lowercase, start with a letter, and be 2-30 characters long. Example: `myteam`, `acme`, `productx`. |
| `--ide YOUR_IDE` | Which editor you use. Possible values: `claude`, `cursor`, or `both`. |

### Example

If your team name is `acme` and you use Claude Code:

```bash
bunx @JohannWilfridCalixte/agentic@alpha init -w ask-codebase,product-spec,product-vision -n acme --ide claude
```

Or with npx instead of bunx:

```bash
npx @JohannWilfridCalixte/agentic@alpha init -w ask-codebase,product-spec,product-vision -n acme --ide claude
```

### What happens after installation

Agentic creates configuration files in your project. These register the workflows as slash commands you can invoke inside your editor.

### Namespace and invocation

The namespace you chose with `-n` determines how you call workflows. If you used `-n acme`:

| Editor | Command format | Example |
|--------|---------------|---------|
| Claude Code | `/acme:workflow:WORKFLOW_NAME` | `/acme:workflow:ask-codebase` |
| Cursor | `/acme-workflow-WORKFLOW_NAME` | `/acme-workflow-product-spec` |

If you did not provide `-n`, the default namespace is `agentic`.

### Output location

All artifacts (documents, state files) produced by workflows go into a folder called `_<namespace>_output/` inside your project directory. For namespace `acme`, that is `_acme_output/`.

---

## Workflow: ask-codebase

### What it does

Answers questions about your product's existing behavior by exploring the codebase, then translating what it finds into plain language that non-technical people can understand.

### When to use it

- You want to know how a feature currently works
- You need to understand a business rule implemented in code
- You are preparing a spec and need to verify current behavior
- A stakeholder asks "does our product do X?" and you are not sure

### How to invoke it

**Claude Code:**

```
/acme:workflow:ask-codebase
```

**Cursor:**

```
/acme-workflow-ask-codebase
```

(Replace `acme` with your actual namespace.)

### Input options

You can provide your question in several ways:

| Method | Example | When to use |
|--------|---------|-------------|
| No arguments | `/acme:workflow:ask-codebase` | The workflow will prompt you to type your question interactively. |
| Inline text | `/acme:workflow:ask-codebase How does password reset work?` | Quick, simple questions. |
| Path to a file | `/acme:workflow:ask-codebase path/to/question.md` | Longer or more detailed questions you have written in a file. |
| GitHub issue | `/acme:workflow:ask-codebase #123` or a full GitHub issue URL | When your question is captured in a GitHub issue. |

### What happens step by step

1. **Input Classification** -- The workflow reads your question and figures out what you are asking about.

2. **Architect Context Gathering** -- An AI subagent explores the codebase to find all code relevant to your question. This happens automatically; you do not need to do anything.

3. **Functional Understanding Synthesis** -- Another AI subagent takes the technical findings and translates them into plain, non-technical language. It produces a document describing what the code does in terms a PM can understand.

4. **You Review and Confirm** -- The workflow pauses and shows you the functional understanding. This is where you participate:
   - If the understanding looks correct, confirm it and the workflow proceeds.
   - If something is wrong or unclear, explain what needs correcting. The workflow loops back and refines its understanding.
   - The workflow will not move forward if there is material ambiguity about what you are asking.

5. **Final Answer** -- Once you have confirmed the functional understanding, a subagent writes the final, polished answer to your question.

### What artifacts are produced

All outputs are saved to: `_<namespace>_output/task/ask-codebase/{topic}/{instance_id}/`

| File | Description |
|------|-------------|
| `workflow-state.yaml` | Internal state tracking for the workflow run. |
| `input-question.md` | Your original question as parsed by the workflow. |
| `technical-context.md` | Raw technical findings from the codebase exploration. |
| `functional-understanding.md` | The plain-language translation of what the code does. |
| `answer.md` | The final answer to your question. This is the main deliverable. |

### Concrete example

You want to know how your product handles user invitations.

1. In Claude Code, type: `/acme:workflow:ask-codebase How does the user invitation flow work? What happens when someone is invited but already has an account?`

2. The AI explores the codebase and finds the invitation-related code.

3. It produces a functional understanding: "When a user is invited, the system first checks if an account with that email already exists. If it does, the existing user is added to the workspace directly without sending an invitation email. If not, an invitation email is sent with a signup link..."

4. You review this. Maybe you notice it did not mention what happens to pending invitations when someone signs up independently. You say: "What happens if someone signs up on their own while they have a pending invitation?"

5. The workflow refines its understanding and presents it again.

6. Once you confirm, the final answer is written to `answer.md`.

---

## Workflow: product-spec

### What it does

Transforms a rough product idea into a precise, structured product specification through rigorous, guided questioning. The AI asks you discovery questions informed by actual codebase context, so the spec accounts for how the product works today.

### When to use it

- You have a new feature idea and need to formalize it
- You want to write a spec but are not sure what questions to answer
- You need a spec that accounts for existing product behavior and technical constraints
- You want to speed up the spec-writing process while maintaining rigor

### How to invoke it

**Claude Code:**

```
/acme:workflow:product-spec
```

**Cursor:**

```
/acme-workflow-product-spec
```

### Input options

| Method | Example | When to use |
|--------|---------|-------------|
| No arguments (interactive) | `/acme:workflow:product-spec` | Start from scratch; the workflow prompts you for your idea. |
| Path to a notes file | `/acme:workflow:product-spec path/to/notes.md` | You have already written some rough notes about the feature. |
| Auto mode | `/acme:workflow:product-spec --auto` | The AI makes decisions autonomously (see below). |
| Auto mode + file | `/acme:workflow:product-spec --auto path/to/notes.md` | Autonomous mode starting from your notes file. |

### Interactive mode vs. auto mode

**Interactive mode** (default): The AI asks you questions one at a time and waits for your answers. You are in full control of every product decision. This is the recommended mode for most PMs.

**Auto mode** (`--auto`): The AI makes product decisions on its own, based on codebase context and best practices. It logs every decision and flags low-confidence ones. Use this when you want a first draft quickly and plan to review it afterwards. All autonomous decisions are recorded in `decision-log.md`.

### What happens step by step

1. **Input Detection** -- The workflow parses your input, initializes its state, and generates a topic name for the spec.

2. **Context Gathering** -- An AI subagent explores the codebase to understand the current product and technical landscape. This gives the AI context about what already exists, so it can ask informed questions.

3. **Product Discovery** -- An AI subagent generates discovery questions informed by the codebase context. These are the big questions that need answers before a spec can be written: problem definition, target users, success metrics, scope boundaries, and acceptance criteria.

4. **You Review Discovery** -- The workflow pauses and shows you the discovery findings. This is your chance to:
   - Confirm the discovery is on the right track.
   - Correct any misunderstandings.
   - Add context the AI may have missed.
   - If you reject, the workflow loops back to refine the discovery.

5. **Product Questioning** -- The AI asks you remaining product questions one at a time. These are specific, targeted questions that fill in the gaps. Answer each one as it comes.
   - If you say "just decide" to a question, the AI will challenge you once (to make sure you really want it to decide), then make the decision itself and log it as `DEVELOPER_DEFERRED`.
   - The workflow will not move on to writing the spec if critical open questions remain (problem definition, target users, success metrics, scope, acceptance criteria).

6. **Write Spec** -- Once all critical questions are answered, a subagent writes the full product specification and compiles it into a final document.

### What artifacts are produced

All outputs are saved to: `_<namespace>_output/product/specs/{topic}/{instance_id}/`

| File | Description |
|------|-------------|
| `workflow-state.yaml` | Internal state tracking for the workflow run. |
| `decision-log.md` | (Auto mode only) Log of all autonomous decisions with confidence scores. |
| `context-{topic}.md` | Product and technical context gathered from the codebase. |
| `discovery-{topic}.md` | Discovery findings and initial analysis of the product idea. |
| `product-decisions.md` | Record of all product decisions made during questioning. |
| `spec-{topic}.md` | The final product specification. This is the main deliverable. |

### Concrete example

You want to spec out a "team billing" feature.

1. In Claude Code, type: `/acme:workflow:product-spec`

2. The workflow asks: "What feature or product idea would you like to spec out?"

3. You type: "We need to add team billing so that one person can pay for their entire team instead of individual subscriptions."

4. The AI explores the codebase and learns about the existing billing system, subscription model, and team/workspace structure.

5. Discovery phase: The AI presents its understanding -- "The product currently has individual Stripe subscriptions per user. Teams exist as workspaces with member management. Adding team billing would require a new subscription type tied to workspaces rather than users..."

6. You review and confirm (or correct).

7. The AI starts asking questions one by one:
   - "Should the team billing admin be able to set spending limits per member?"
   - "When a user leaves a team with team billing, should they automatically get a free-tier individual subscription?"
   - "Should proration apply when team size changes mid-billing-cycle?"

8. You answer each question. The AI uses your answers to build the spec.

9. The final `spec-team-billing.md` is written with all sections: problem statement, target users, requirements, acceptance criteria, edge cases, and scope boundaries.

---

---

## Workflow: product-vision

### What it does

Transforms a rough product idea into a comprehensive product vision document through creative brainstorming (100+ ideas using structured techniques) followed by rigorous questioning. The output is a rich 15-section vision document covering everything from problem space and personas to market context, strategic goals, roadmap, and business model.

### When to use it

- You are defining a new product or major initiative
- You need a strategic vision document before writing individual feature specs
- You want to explore an idea deeply before committing to a direction
- You need alignment on product direction, principles, and roadmap

### How to invoke it

**Claude Code:**

```
/acme:workflow:product-vision
```

**Cursor:**

```
/acme-workflow-product-vision
```

### Input options

| Method | Example | When to use |
|--------|---------|-------------|
| No arguments | `/acme:workflow:product-vision` | Start from scratch; the workflow prompts you for your idea. |
| Path to a notes file | `/acme:workflow:product-vision path/to/notes.md` | You have already written some rough notes about the vision. |

This workflow is always interactive -- there is no auto mode. Product vision requires human judgment at every step.

### What happens step by step

1. **Input Detection** -- The workflow parses your input and initializes its state.

2. **Context Gathering** -- An AI subagent explores the codebase to understand the existing product and technical landscape.

3. **Creative Exploration** -- This is the distinctive step. A brainstorming session uses structured creative techniques (62 techniques across 10 categories) to generate 100+ ideas. You choose how techniques are selected: browse and pick, AI-recommended, random discovery, or a progressive flow. The session explores problem space, users, market, value proposition, features, business model, and risks.

4. **Vision Discovery** -- Informed by the brainstorming output, an AI subagent asks you structured questions about each vision element: vision statement, problem space, target users, market context, value proposition, product principles, strategic goals, success metrics, features, user journeys, business model, risks, and roadmap.

5. **You Confirm Vision Direction** -- The workflow pauses to present the vision discovery summary. If something is wrong, the workflow loops back to refine.

6. **Vision Deepening** -- The AI asks you detailed follow-up questions one at a time across 12 categories, filling in gaps. The workflow will not proceed to writing if critical vision questions remain unanswered.

7. **Write Vision Document** -- The CPO subagent compiles all artifacts into the final 15-section vision document.

### What artifacts are produced

All outputs are saved to: `_<namespace>_output/product/vision/{topic}/{instance_id}/`

| File | Description |
|------|-------------|
| `workflow-state.yaml` | Internal state tracking for the workflow run. |
| `context-{topic}.md` | Product and technical context gathered from the codebase. |
| `brainstorming-{topic}.md` | Full brainstorming session: ideas, themes, breakthrough concepts. |
| `discovery-{topic}.md` | Vision discovery findings across all 13 vision elements. |
| `vision-decisions.md` | Record of all vision decisions made during deepening. |
| `vision-{topic}.md` | The final product vision document. This is the main deliverable. |

### Concrete example

You want to create a vision for a "developer analytics platform."

1. In Claude Code, type: `/acme:workflow:product-vision`

2. The workflow asks for your idea. You type: "A platform that gives engineering teams real-time visibility into developer productivity, code quality, and delivery metrics."

3. The AI explores the codebase for existing context, then starts a brainstorming session. You choose "AI-Recommended" technique selection. The session generates 120+ ideas across problem space, users, market positioning, features, and business model.

4. Vision discovery uses the brainstorming output to ask you focused questions: "During brainstorming, the idea of integrating with existing CI/CD pipelines emerged. How central is that to your vision?"

5. You confirm the vision direction, then answer deepening questions one by one across all vision dimensions.

6. The final `vision-developer-analytics.md` is a comprehensive 15-section document covering executive summary, vision statement, detailed personas, competitive landscape, value proposition, product principles, strategic goals with OKRs, prioritized features, user journeys, business model, risks with mitigation, and a phased roadmap.

### Output location

Vision documents: `_<namespace>_output/product/vision/{topic}/{instance_id}/vision-{topic}.md`

---

## FAQ and Troubleshooting

### "Command not found" when running the install command

**Problem:** Your terminal does not recognize `bunx`, `npx`, or `pnpx`.

**Solution:** You need to install a JavaScript runtime first:
- For `bunx`: Install Bun from [https://bun.sh](https://bun.sh) by running `curl -fsSL https://bun.sh/install | bash` in your terminal
- For `npx`: Install Node.js from [https://nodejs.org](https://nodejs.org) (npx comes bundled with it)
- For `pnpx`: Install pnpm by running `npm install -g pnpm` (requires Node.js first)

After installing, close and reopen your terminal, then try again.

### "401 Unauthorized" or "403 Forbidden" during installation

**Problem:** Your GitHub token is missing, expired, or does not have the right scope.

**Solution:**
1. Open `~/.npmrc` and check the token is there: `cat ~/.npmrc`
2. Make sure the token line looks like: `//npm.pkg.github.com/:_authToken=ghp_...`
3. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens) and verify the token has `read:packages` scope and is not expired
4. If in doubt, generate a new token and update `~/.npmrc`

### "Package not found" during installation

**Problem:** The registry line in `.npmrc` is missing or has a typo.

**Solution:** Run `cat ~/.npmrc` and verify you see this exact line:
```
@JohannWilfridCalixte:registry=https://npm.pkg.github.com
```
Note the capital letters in `JohannWilfridCalixte` must match exactly.

### The slash command does not appear in Claude Code or Cursor

**Problem:** The init command may not have completed successfully, or you are in the wrong directory.

**Solution:**
1. Make sure you ran the `init` command from the root of your project (the top-level folder)
2. Try running the init command again
3. Restart Claude Code or Cursor after installation

### "I don't know what my namespace is"

If you forgot what namespace you used during installation, check the output folder in your project. Look for a folder starting with `_` and ending with `_output`. For example, `_acme_output` means your namespace is `acme`.

If no such folder exists yet (workflows have not been run), look at the configuration files created by agentic in your project's `.claude/` or `.cursor/` directories.

### The workflow seems stuck

Both workflows involve AI agents doing work in the background (exploring code, synthesizing information). This can take 30 seconds to a few minutes depending on the size of your codebase. Wait for the AI to finish before concluding something is stuck.

If a workflow genuinely freezes (no output for several minutes), you can cancel it (Ctrl+C on macOS/Linux) and run the command again.

### "Can I run these workflows without being in a codebase?"

No. Both workflows explore actual code to produce context-aware results. You must run them from inside a project directory that contains source code.

### "What if I answer a question wrong during the workflow?"

During the review steps (step 4 in both workflows), you can reject the AI's understanding and provide corrections. The workflow loops back and incorporates your feedback. There is no penalty for going back and forth -- the goal is to get the right answer.

### "Where do I find the final output?"

All outputs go to `_<namespace>_output/` in your project directory:
- ask-codebase answers: `_<namespace>_output/task/ask-codebase/{topic}/{instance_id}/answer.md`
- product specs: `_<namespace>_output/product/specs/{topic}/{instance_id}/spec-{topic}.md`
- product vision: `_<namespace>_output/product/vision/{topic}/{instance_id}/vision-{topic}.md`

Open these files in any text editor or Markdown viewer.
