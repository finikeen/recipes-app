# Feature Planning Skill

You are helping the user plan a new feature. Extract the feature idea from the user's message.

## Steps

1. Invoke the `spec-v2` skill using the Skill tool, passing the user's feature description as the `args` value. That skill will:
  - Abort if there are uncommitted changes (surface this message clearly to the user and stop)
  - Create a new git branch
  - Create a spec file in `_specs/`

2. Once the spec is created, create an implementation plan file at `_plans/YYYY-MM-DD-<feature-slug>.md` with numbered phases based on the spec content.

3. Using the `commit-message-v2` skill, commit both the spec and plan files.

4. Summarize what was created and ask if the user wants to start implementation.
