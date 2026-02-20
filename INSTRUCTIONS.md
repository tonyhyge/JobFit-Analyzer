# JobFit Analyzer - GitHub-Integrated Agentic Workflow

This document establishes the GitHub-integrated agentic workflow, roles, and execution policies for the JobFit Analyzer project.

## 1. GitHub Integration & Git Flow
- **Branching Strategy:** For every new task or feature, the **Feature Developer (FD)** must create a new branch named `feature/task-name`.
- **Automated Commits:** After completing a sub-task, the FD must commit changes with descriptive, conventional commit messages (e.g., `feat(logic): implement scoring formula`).
- **Push & PR:** Once the feature is ready and passes initial internal checks, the FD must push the branch to GitHub and create a **Pull Request (PR)** targeting the `main` branch.
- **PR Description:** The PR must automatically include:
  - A summary of changes.
  - A "Verification Report" from the **Validation Agent (VA)**.
  - Screenshots/Logs of the feature working in the browser.

## 2. Agent Personas & Roles
- **Mission Control (MC) / Reviewer:** Acts as the Repo Maintainer. Responsible for reviewing PRs. Must not merge a PR until the VA confirms it meets the Acceptance Criteria from the PRD.
- **Feature Developer (FD):** Specialist in WXT and Firebase. Uses TypeScript Expert, Advanced Git Workflows, and GitHub Automation skills.
- **Validation Agent (VA):** The Quality Gate. Must test the code in a live environment before the FD creates the PR.

## 3. Execution Policy (Antigravity Config)
- **Git Autonomy:** Agents are authorized to execute `git checkout`, `git add`, `git commit`, `git push`, and `gh pr create` (GitHub CLI) in **"Agent Decides" (Auto)** mode.
- **Review Loop:** MC must provide a "LGTM" (Looks Good To Me) or request changes. If changes are requested, FD must apply them and update the PR.

## 4. Quality Anchor
- **Pull Request Template:** Always read `.github/PULL_REQUEST_TEMPLATE.md` to ensure every PR tracks the logic accuracy and 2026 market trend alignment.
- **Logic Tracking:** Reference this `INSTRUCTIONS.md` for every code review to ensure no "logic drift" occurs.

## 5. JobFit Scoring Logic ($S_{JF}$)
The JobFit score is calculated using Gemini 3.1 Pro to measure the semantic distance between a candidate's skills and market demands.
Formula:
$S_{JF} = \alpha \cdot S_{core} + \beta \cdot S_{adj}$
- $S_{core}$: Core technical skills (e.g., MLOps, deep learning for AI/ML).
- $S_{adj}$: Complementary capabilities / soft skills.
- $\alpha, \beta$: Adjustable coefficients inferred from the candidate's problem-solving history.
