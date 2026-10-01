# Implementation Plan: Switch Account & Multi-Account System

## 1. Overview
Implement the PlayTube "Switch Account" feature matching the screenshot and user specifications:
- When a user clicks **"Switch Account"** in the profile dropdown, they navigate to `/switch-account`.
- If no other accounts are added yet, it displays the Switch Account modal containing the cyan **`+ Add Account`** button (pixel-identical to the user's provided screenshot).
- Clicking **`+ Add Account`** redirects to `/login?type=add_account`.
- Logging in as a second user automatically links the current session and stores both accounts in the switched accounts list (up to 3 accounts maximum, matching PlayTube's default).
- On `/switch-account`, the modal displays all active saved accounts with their avatar, name, and email. The currently active account has a checkmark icon. Clicking any other account switches immediately to that session without re-authenticating. An 'X' button allows removing inactive accounts from the list.

---

## 2. Architecture & Data Flow

### 2.1 Storage & Session Mechanism
- **Cookie**: `pt_switched_accounts` (HTTP-only or secure cookie containing the list of active account sessions):
  ```json
  [
    {
      "userId": 1,
      "name": "Site Admin",
      "username": "admin",
      "email": "admin@example.com",
      "avatar": "/upload/photos/d-avatar.jpg",
      "sessionToken": "token-1..."
    },
    {
      "userId": 2,
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": "/upload/photos/d-avatar.jpg",
      "sessionToken": "token-2..."
    }
  ]
  ```
- Maximum accounts limit: `3` (configurable / capped).
- Tokens are verified against the `sessions` table in the database to ensure deleted or revoked sessions cannot be accessed.

### 2.2 Server Actions (`src/modules/auth/switch-account.actions.ts`)
1. **`getSwitchedAccountsAction()`**:
   - Reads `pt_switched_accounts` cookie and the active session.
   - Verifies all tokens in the database; cleans up any expired/invalid sessions.
   - Ensures the current logged-in user is in the list.
   - Returns the list of accounts and marks `isActive: true` for the current user.
2. **`switchAccountAction(targetUserId: number)`**:
   - Finds the target account in `pt_switched_accounts`.
   - Validates that its session token exists in `sessions` table.
   - Swaps Better Auth session cookie (`better-auth.session_token` / `__Secure-better-auth.session_token`) to the target session token.
   - Revalidates path `/` and returns `{ success: true }`.
3. **`removeSwitchedAccountAction(userId: number)`**:
   - Removes the specified non-active user from the `pt_switched_accounts` cookie.

### 2.3 Login Page Integration (`src/app/(auth)/login/page.tsx`)
- Detects `type === "add_account"` from `searchParams`.
- Before logging in to the new account, preserves the existing user's session token into `pt_switched_accounts`.
- Upon successful login of the second user, adds the new user's session to `pt_switched_accounts`.
- Redirects to `/` (or `redirectUrl`) as the newly logged-in account, with all accounts now available in the switch list.

### 2.4 `/switch-account` Page (`src/app/(public)/switch-account/page.tsx`)
- Server component that loads the current session and switched accounts list via `getSwitchedAccountsAction()`.
- Renders `SwitchAccountModal` matching the screenshot:
  - Dark container / card with `#121212` background, rounded borders.
  - Header: **Switch Account** with close button `✕` (navigates back).
  - List of accounts (if > 1):
    - Avatar, Name, Email.
    - Checkmark icon next to the active account.
    - Clickable card for inactive accounts to switch.
    - Remove button `✕` on hover for inactive accounts.
  - Button: **`+ Add Account`** with cyan color (`#04abf2`), full width, white text. (Hidden if 3 accounts reached).

---

## 3. Step-by-Step Execution Plan

- [ ] **Step 1: Create Server Actions for Switch Account**
  - Create `src/modules/auth/switch-account.actions.ts` with `getSwitchedAccountsAction`, `switchAccountAction`, and `removeSwitchedAccountAction`.
- [ ] **Step 2: Update Login Flow for `add_account`**
  - Update `src/app/(auth)/login/page.tsx` and create a helper server action `saveCurrentAccountForSwitchAction()` to register existing and new sessions into `pt_switched_accounts`.
- [ ] **Step 3: Create `/switch-account` Page & Modal Component**
  - Create `src/app/(public)/switch-account/page.tsx` and `src/components/auth/SwitchAccountModal.tsx` matching the user's screenshot.
- [ ] **Step 4: Update Profile Dropdown in Navigation**
  - Ensure the "Switch Account" link in `src/components/layout/Navigation.tsx` routes directly to `/switch-account`.
- [ ] **Step 5: Verify & Test**
  - Test modal appearance with single account.
  - Test "+ Add Account" click -> login with second user -> return with both accounts preserved.
  - Test seamless switching between accounts.
  - Test removing an inactive account.
  - Run `npx tsc --noEmit` and commit locally after each step.
