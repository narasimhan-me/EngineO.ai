# Phase UX-2 – Product Workspace AEO + Automation UI (v1)

> Manual testing guide for Product Workspace AEO / Answers tab and per-product Automation History panel wired to AE-1.3 Answer Block persistence and AUE-2 Shopify Answer Block automations.

---

## Overview

This manual testing document covers the first version of the Product Workspace AEO + Automation UI:

1. **Answer Blocks (AEO) panel**
   - Reads persisted Answer Blocks per product via AE-1.3 endpoints.
   - Allows merchants to edit and save Answer Blocks.
   - Triggers Answer Block automations for Pro/Business plans.
   - Enforces Free-plan gating for automation triggers.

2. **Automation History (Answer Blocks) panel**
   - Surfaces AnswerBlockAutomationLog entries per product.
   - Shows trigger type, action, status, and basic error details.

**Related phases/sections:**

- IMPLEMENTATION_PLAN.md
  - Phase AE-1.3 – Answer Block Persistence (Shopify v1)
  - Phase AUE-2 – Shopify Answer Block Automations (Automation Engine v1)
  - Phase UX-2 – Product Workspace (per-product optimization workspace)

- Specs:
  - `docs/ANSWER_ENGINE_SPEC.md`
  - `docs/AUTOMATION_ENGINE_SPEC.md` (Section 8.7 – Shopify Answer Block Automations)
  - `docs/manual-testing/phase-ae-1.3-answer-block-persistence.md`
  - `docs/manual-testing/automation-engine-v1-shopify-answer-block-automations.md`

For structure and expectations, see `docs/MANUAL_TESTING_TEMPLATE.md`.

---

## Preconditions

- **Backend:**
  - NestJS API running locally (e.g., http://localhost:3001) with:
    - AE-1.3 Answer Block persistence migrations applied.
    - AUE-2 Shopify Answer Block automations (queue + worker) configured.
    - Redis available and answer_block_automation_queue worker enabled.

- **Frontend:**
  - Next.js app running (e.g., http://localhost:3000).
  - Product Workspace page accessible at:
    - `/projects/:projectId/products/:productId`

- **Data & accounts:**
  - Test Shopify store connected to a project.
  - At least one product with rich metadata.
  - At least one product with minimal metadata.
  - Test users on Free, Pro, and Business plans.

- **Authentication:**
  - Logged in as each test user (Free / Pro / Business) for plan-aware scenarios.

---

## Test Scenarios

### UX2-AEO-HP-001: View persisted Answer Blocks (Pro/Business)

**Goal:** Verify that the Answer Blocks panel reads and displays persisted Answer Blocks for a product.

**Steps:**
1. Log in as a Pro or Business user.
2. Navigate to Projects → select a Shopify-connected project → Products.
3. Click on a product known to have persisted Answer Blocks (via AE-1.3 flows or seeded data).
4. In the Product Optimization workspace, scroll to the Answer Blocks (AEO) panel.

**Expected Results:**
- The panel shows a header "Answer Blocks (AEO)" with a plan badge (Pro or Business).
- A list of Answer Blocks is rendered, one card per question:
  - Question label uses the canonical 10-question taxonomy where applicable.
  - Each card shows:
    - Question label and question ID.
    - Source indicator ("AI-generated" or "Edited by you").
    - Confidence badge (High/Medium/Low) based on confidenceScore.
    - Last updated timestamp derived from updatedAt.
  - The textarea for each answer is populated with answerText.

---

### UX2-AEO-HP-002: Edit and save Answer Blocks (Pro/Business)

**Goal:** Confirm user edits to Answer Blocks are persisted and survive reload.

**Steps:**
1. With UX2-AEO-HP-001 preconditions satisfied, choose a product with existing Answer Blocks.
2. In the Answer Blocks panel, update the answerText for 1–2 questions (e.g., clarify wording).
3. Click **Save Answer Blocks**.
4. Observe any toasts or inline messages.
5. Reload the page (browser reload) or navigate away and back to the same product workspace.

**Expected Results:**
- **Save action:**
  - Save button becomes disabled/spinner while saving.
  - Success toast appears (e.g., "Answer Blocks saved successfully.").
  - Unsaved changes indicator clears after success.
- **After reload:**
  - Edited answers remain exactly as saved.
  - Confidence badges and question labels remain present.
  - Source metadata for edited answers reflects userEdited (where exposed).
- No new AI generation is triggered automatically on reload for edited questions.

---

### UX2-AEO-HP-003: Trigger Answer Block automation (Pro/Business)

**Goal:** Verify that the Answer Blocks panel can trigger Answer Block automation and that updated answers appear after automation runs.

**Steps:**
1. Log in as a Pro or Business user.
2. Choose a product with:
   - Either no Answer Blocks, or
   - Existing Answer Blocks with at least one weak (low-confidence) answer.
3. Navigate to Product Workspace → Answer Blocks (AEO) panel.
4. Click **Run Answer Block automation**.
5. Wait for the worker to process the job (monitor logs if needed).
6. Click **Refresh** in both:
   - Answer Blocks panel.
   - Automation History (Answer Blocks) panel.

**Expected Results:**
- **Answer Blocks panel:**
  - Shows a success toast indicating automation was triggered.
  - After refresh:
    - Previously missing questions now have answers, or
    - Weak answers have been replaced with stronger AI-generated answers.
- **Automation History panel:**
  - A new log row appears for this product with:
    - triggerType: 'issue_detected' (or configured trigger).
    - action: 'generate_missing' (no prior blocks) or action: 'regenerate_weak'.
    - status: 'succeeded'.
    - planId matching the user's plan (pro/business).
  - No error message is present for successful runs.

---

### UX2-AEO-LIM-001: Free plan gating for Answer Block automations

**Goal:** Ensure Free plan users can view/edit Answer Blocks but cannot trigger Answer Block automations, and see clear upgrade messaging.

**Steps:**
1. Log in as a Free plan user.
2. Navigate to a project and product that has persisted Answer Blocks.
3. Scroll to the Answer Blocks (AEO) panel.
4. Inspect available controls and messaging.
5. Attempt to click **Run Answer Block automation** (if enabled) or observe disabled state.

**Expected Results:**
- **Answer Blocks panel:**
  - Plan badge shows "Free plan".
  - Existing Answer Blocks render and remain editable with **Save Answer Blocks**.
  - Automation-related controls (Generate/Run automation) are disabled or non-interactive.
  - A clear message explains that Answer Block automations are gated on Pro/Business plans and links to the billing/upgrade page.
- **Automation History panel:**
  - Either:
    - Shows skip_plan_free entries (if backend logs Free-plan attempts), or
    - Remains empty with explanatory text.
  - No successful Answer Block automation runs appear for Free-plan-only scenarios.

---

### UX2-AUTO-HP-004: Automation History panel – success, skip, and error entries

**Goal:** Validate that the Automation History panel surfaces the main Answer Block automation outcomes.

**Steps:**
1. Trigger at least one successful Answer Block automation (Pro/Business).
2. Trigger a scenario that leads to a skip, such as:
   - Running automation when all Answer Blocks are already strong.
   - Running automation when Answer Block generation yields no answers.
3. Simulate a failure (in a controlled environment), e.g., by:
   - Temporarily breaking AI provider configuration, or
   - Forcing an exception inside the worker in a test environment.
4. Refresh the Automation History panel after each scenario.

**Expected Results:**
- **Success case:**
  - Entry with status: 'succeeded', appropriate action, and no error text.
- **Skip cases:**
  - Entries with status: 'skipped' and actions such as:
    - skip_plan_free
    - skip_no_action
    - skip_no_generated_answers
  - No error text for expected skips.
- **Error case:**
  - Entry with status: 'failed' and action: 'error'.
  - Error icon and truncated error message visible in the Automation History panel.

---

## Regression & Integration Checks

- Confirm existing AE-1.2 ProductAnswersPanel behaviors are unchanged:
  - Ephemeral AI answer generation still works and respects AI limits.
  - Product Optimization workspace loads without type or runtime errors.
- Verify backend endpoints:
  - `GET /products/:id/answer-blocks`
  - `POST /products/:id/answer-blocks`
  - `POST /products/:id/answer-blocks/automation-run`
  - `GET /products/:id/automation-logs`
  - All enforce ownership and behave as described above.

---

## Documentation & Critical Paths

- **Critical paths impacted:**
  - **CP-011: Answer Engine (Answer Blocks & Answerability)** – Product Workspace AEO tab now reads and edits persisted Answer Blocks.
  - **CP-012: Automation Engine (Framework & Rules)** – Product-level Answer Block automation history now visible to merchants.

- **Ensure:**
  - `docs/testing/CRITICAL_PATH_MAP.md` entries for CP-011 and CP-012 reference this document for UI verification.
  - `IMPLEMENTATION_PLAN.md` v1 Shopify launch section lists this manual testing doc under Manual Testing.
