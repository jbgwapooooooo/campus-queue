# Campus Queue — React Vertical Slice

This is a React implementation of the Campus Queue system applying the **Vertical Slicing** architectural pattern.

## Architecture

Instead of grouping code vertically by technical concerns (e.g. `src/components`, `src/hooks`, `src/services`), this project groups code horizontally into **Features Slices**.

### Features Directory (`src/features`)

```text
src/
  features/
    auth/                 ← Everything related to user authentication
      components/
        LoginForm.jsx
    dashboard/            ← Everything related to the main campus services page
      components/
        Dashboard.jsx
    profile/              ← Everything related to the student's profile UI
      components/
        ProfileView.jsx
    queue/                ← Everything logic/display specific to queue interactions
      components/
        ActiveQueueBanner.jsx
  App.jsx                 ← The Orchestrator holding the views together
  index.css               ← Base generic stylings isolated from slices
```

### Why Vertical Slicing?
- **High Cohesion:** When you need to edit the queue logic, you go to `src/features/queue/`. All related components, hooks, and services live there.
- **Scalability:** Adding new features like "Admin Panel" simply means creating a new `src/features/admin/` folder without touching or bloating the rest of the app.
- **Maintainability:** Deleting a feature simply means deleting its folder. No dead code left behind.
