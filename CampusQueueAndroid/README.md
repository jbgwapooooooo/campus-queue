# Campus Queue — Android App

A campus queue management system for CIT (Cebu Institute of Technology) students built with Android (Kotlin) and Supabase.

---

## Architecture: Vertical Slicing + MVP

This project implements **Vertical Slicing** combined with the **MVP (Model–View–Presenter)** pattern.

### What is Vertical Slicing?

Instead of organizing code by layer (all activities in one folder, all presenters in another), Vertical Slicing organizes code **by feature**. Each feature folder contains every layer it needs:

```
features/
  auth/           ← Authentication Slice
    login/
      LoginActivity.kt      ← View
      LoginPresenter.kt     ← Presenter
      LoginContract.kt      ← MVP Contract
    register/
      RegisterActivity.kt   ← View
      RegisterPresenter.kt  ← Presenter
      RegisterContract.kt   ← MVP Contract

  dashboard/      ← Dashboard & Queue Slice
    DashboardActivity.kt    ← View
    DashboardPresenter.kt   ← Presenter
    DashboardContract.kt    ← MVP Contract
    ServiceAdapter.kt       ← RecyclerView Adapter

  profile/        ← Profile Slice
    view/
      ProfileActivity.kt    ← View
      ProfilePresenter.kt   ← Presenter
      ProfileContract.kt    ← MVP Contract
    update/
      UpdateProfileActivity.kt    ← View
      UpdateProfilePresenter.kt   ← Presenter
      UpdateProfileContract.kt    ← MVP Contract
    password/
      ChangePasswordActivity.kt   ← View
      ChangePasswordPresenter.kt  ← Presenter
      ChangePasswordContract.kt   ← MVP Contract
```

---

### What is MVP?

**MVP = Model · View · Presenter**

| Role | Class | Responsibility |
|---|---|---|
| **Model** | Supabase REST API via Retrofit | Data source — fetches and persists data |
| **View** | `Activity` | UI only — displays data, forwards events to Presenter |
| **Presenter** | `Presenter` | Business logic — calls Model, tells View what to display |

The **Contract** interface is an inner interface that explicitly defines the API between View and Presenter, binding them without tight coupling.

#### Base MVP Interfaces

All Views and Presenters extend shared base interfaces:

```kotlin
// base/BaseView.kt
interface BaseView<T> {
    fun showLoading()
    fun hideLoading()
    fun showError(message: String)
}

// base/BasePresenter.kt
interface BasePresenter {
    fun onDestroy()  // nullifies View reference to prevent memory leaks
}
```

#### Example: Login Slice

```
LoginContract.kt          ← Defines View and Presenter APIs
    LoginActivity.kt      ← Implements LoginContract.View → shows UI
    LoginPresenter.kt     ← Implements LoginContract.Presenter → calls API, updates View
```

---

## Features

- **Login / Register** — Supabase authentication with JWT tokens
- **Dashboard** — View all open services, join a queue, see your live position
- **Profile** — View avatar, member since, total queues joined
- **Edit Profile** — Change name, email, password, and avatar photo
- Session persistence via `SharedPreferences`
- Back button navigation on all child screens

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| Architecture | Vertical Slicing + MVP |
| Network | Retrofit 2 + OkHttp |
| Backend | Supabase (PostgreSQL + Auth + REST) |
| UI | Android Views (XML layouts) |

---

## Setup

1. Open the project in **Android Studio**
2. The Supabase credentials are already configured in `RetrofitClient.kt`
3. Run `assembleDebug` or press the Run button to deploy to an emulator or device

---

## Database

Run `database/setup_all.sql` in your Supabase SQL Editor to create all required tables and RLS policies.
