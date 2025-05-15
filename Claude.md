# Claude Project Profile – Zen Commit

## 🧘 Project Type

- This is a **personal** project.
- Maintain a clean, focused tone in the code and UX — simplicity and clarity are core values.

---

## 🎯 Purpose

Zen Commit is a CLI utility that enhances Git commit workflows by guiding users through a structured, distraction-free commit experience using the Ink framework.

The tool must:
- Show staged file changes
- Guide commit message creation (type, subject, body)
- Validate input and execute commits safely
- Avoid noisy or distracting terminal output

---

## 🔍 Project-Specific Behavior

- **Always read the local `plan.md` and follow it strictly**.
- **Do not jump ahead**. Implement **one step at a time** as listed in the plan.
- Always check for additional `Claude.md` files at any level and follow the guidelines accordingly
- In the presence of both global and local configs, **local rules override global rules**.
- Each change and implementation must adhere to its `docs/steps` document, however, always think harder before implementing and don't just copy/paste what it says, make sure the implementation makes sense and adapt when it doesn't to achieve the desired end result

---

## 🛠️ Technologies

- Node.js (20.x or higher)
- TypeScript with strict typing and path aliases
- Ink + React for CLI UI
- simple-git for Git operations
- execa for shell commands
- meow for argument parsing
- Jest for unit and integration testing

---

## 🧪 Testing Guidelines

- Use **TDD** for every task:
    - Write failing test first
    - Make it pass
    - Commit
- Mock external Git commands in tests — no real Git interaction
- Track coverage and maintain high test quality (>90%)

---

## 💻 Directory Layout

- `src/index.tsx`: CLI entry point
- `src/components/`: All Ink components
- `src/logic/`: Git and commit logic
- `docs/steps/`: Implementation instructions
- `__tests__/`: Test files, mirroring `src/`

---

## 🧠 Claude Behavior Expectations

- Confirm file layout and task goal before writing code
- Break each step into subtasks when needed
- Avoid assumptions, especially in CLI interactions
- Ask user for clarification if any ambiguity arises
- Keep UI clean and focused — no excessive animations or output
- Validate all input and display helpful error messages
- Never hardcode paths; respect project-relative structure

---

## 🧾 Commit Message Guidelines

- Use structured format (e.g., `type: subject`, optional body)
- Validate length, clarity, and format
- Do **not** use conventional commit prefixes unless task specifies
- Do not commit unless user has reviewed the output

---

## 📦 Dependencies Checklist

Install the following dependencies as part of setup:

```
Dependencies:
  - ink
  - react
  - chalk
  - simple-git
  - execa
  - meow
  - ink-text-input

Dev Dependencies:
  - typescript
  - ts-node
  - jest
  - ts-jest
  - @types/react
  - @types/node
  - @types/jest
```

---

## 📁 Task Tracker

Claude must update the `docs/plan.md` task table status for each completed item and never skip or reorder steps.
