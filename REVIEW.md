# Frontend Review — Library SaaS (React Native)

A code and architecture review done before production work starts. This file only lists problems and the direction of each fix; no code changes have been made yet. Tick an item when it's fixed.

Line numbers refer to commit `main` as of 29 Sep 2026. Backend findings, the system architecture review and the open product questions are in the backend repo's `REVIEW.md`. Several items here depend on those backend fixes and are marked **(needs backend)**.

## Priority scale

| Priority | Meaning |
|---|---|
| **P0** | Security hole or leaked secret. Fix before the next release. |
| **P1** | Users see wrong or stale data, or get stuck. |
| **P2** | Will hurt maintainability or make the next features harder. |
| **P3** | Cleanup and consistency. |

## Product decisions that affect the app

- Trial is 14 days.
- Overdue means unpaid fees. The membership is paused with the seat reserved for 7 days, a warning goes out on day 6, and on day 7 the membership is cancelled and the seat released. The app needs to show the paused state and the days left.
- One owner can have several libraries (branches) in the future.

---

## 1. Security and release

- [ ] **FS1 · P0 · Play Store upload key passwords are public.**
  Where: `android/gradle.properties:46–49`.
  Problem: the upload keystore alias and passwords are committed in a public repo, and the password is weak. The keystore file itself isn't in the repo, but anyone who ever gets it now has everything needed to sign an update as you.
  Fix direction: move signing values out of the repo (your user-level Gradle properties or CI secrets), change the keystore passwords, and if the keystore file was ever shared or uploaded anywhere, ask Google Play to reset the upload key.

- [ ] **FS2 · P1 · Release builds allow plain HTTP to any server.**
  Where: `android/app/src/main/AndroidManifest.xml:5` (`usesCleartextTraffic="true"`), `res/xml/network_security_config.xml` (a LAN IP).
  Problem: this is in the *main* manifest, so the store build allows unencrypted traffic too. It's only needed for local development.
  Fix direction: keep cleartext settings in the debug manifest only.

- [ ] **FS3 · P1 · Passwords and tokens written to device logs.**
  Where: `features/auth/authServices/authServices.ts:9` logs the login payload (password), `:16` logs the full response (token), `components/SplashScreen.tsx:24` logs the stored auth data (token). There are 79 `console.*` calls in `src/`.
  Problem: on Android, release builds still write `console` output to the system log, which other tools on the device can read.
  Fix direction: remove sensitive logs, and strip `console` calls from release builds with a Babel plugin.

- [ ] **FS4 · P1 · Logout leaves the previous owner's data and notifications on the device.**
  Where: `features/auth/authSlice/authSlice.ts:156–167`, `features/settings/screens/Menu.tsx:93`.
  Problem: logout clears Keychain and AsyncStorage, but not the React Query cache, which holds students and payments for up to 30 minutes. A different owner who logs in on the same phone can see the previous owner's lists until they refetch. The device's push token also stays attached to the old owner on the server, so that owner's alerts keep arriving on this phone.
  Fix direction: on logout, clear the query cache, call the backend logout, and unregister the device token **(needs backend: device token table, D8)**.

- [ ] **FS5 · P3 · `google-services.json` is in a public repo.**
  Firebase config isn't a secret by itself, but make sure the API key in it is restricted to your app in Google Cloud, and consider Firebase App Check.

- [ ] **FS6 · P2 · Code shrinking is off in release builds.**
  Where: `android/app/build.gradle:60` (`enableProguardInReleaseBuilds = false`).
  Problem: bigger APK and no obfuscation. Turn it on and test a release build, since some libraries need keep rules.

---

## 2. Session and auth

- [ ] **FA1 · P1 · Expired token leaves the user stuck.**
  Where: `constants/api/client.ts` (a request interceptor, but no response interceptor).
  Problem: tokens expire after 7 days. After that, the app still thinks the user is logged in (the token is only read from Keychain, never checked), every API call fails, and screens show blank data. The user has no way out except finding logout in the menu.
  Fix direction: a response interceptor that handles 401 in one place, by refreshing the token **(needs backend S7)** or logging out and returning to sign-in.

- [ ] **FA2 · P2 · Every app launch waits 2 extra seconds.**
  Where: `components/SplashScreen.tsx:11–13`.
  Problem: the splash waits a fixed 2 seconds *before* reading Keychain. Use the native splash screen and check auth immediately.

- [ ] **FA3 · P2 · Redux reducers write to storage.**
  Where: `authSlice.ts:97`, `:130`, `:147`, `:152`, `:165–166`.
  Problem: reducers call Keychain and AsyncStorage. Reducers must be pure: these writes are async and unawaited, so if one fails, Redux state and storage silently disagree (for example, logged in in memory, logged out on next launch).
  Fix direction: do the storage writes in the mutation's success handler or a Redux listener, then update state.

- [ ] **FA4 · P2 · The same data lives in three places.**
  Where: the library is stored in Redux (`auth.library`), AsyncStorage (`library-data`) and React Query (`allLibraries`). Sign-in and sign-up loading and error state are kept in Redux (`authSlice.ts:25–29`) while `useMutation` already tracks them.
  Problem: these copies drift. For example, `isLibraryCreated` comes from Keychain on launch, not from the server.
  Fix direction: server data only in React Query. A small session store holds only the token and the selected library id.

- [ ] **FA5 · P1 · The app assumes one library.**
  Where: `features/dashboard/screens/Dashbaord.tsx:32` (`libraries[0]`), `libraryId` passed through route params and read from AsyncStorage (`AddStudents.tsx:209`).
  Problem: with branches, every screen needs to know which branch is selected, and switching branch must refresh everything.
  Fix direction: a "current library" in session state, a branch switcher, and every query key starting with the library id.

---

## 3. Data layer (API calls and React Query)

- [ ] **FD1 · P1 · Failed requests look like empty data.**
  Where: `features/dashboard/dashboardServices/dashboardService.ts:10–12` and `:22–24`, `features/settings/settingsServices/settingsServices.tsx:11–13`.
  Problem: these functions catch the error, log it and return `undefined`. React Query then treats the failure as success, so the dashboard shows blanks and `NaN%` occupancy instead of an error with a retry button. Other services throw `new Error(message)`, which loses the HTTP status code, so the app can't tell "not found" from "no internet" from "subscription expired".
  Fix direction: one API layer that always throws a normalized error (status, code, message), and error states on screens.

- [ ] **FD2 · P1 · Lists don't update after changes.**
  Where: `features/students/studentQueries/studentQueries.tsx:18–27` (`useAddStudent` refreshes only the dashboard, not the student list, which is cached for 30 minutes at `:39`), `useDeleteStudent` refreshes nothing. Cache refreshes are also scattered across screens (`AddStudents.tsx:231`, `AddExpense.tsx:107`), and `ViewAllExpenses.tsx:72–79` deletes the cache on every focus, which defeats caching.
  Problem: an owner adds a student and doesn't see them in the list.
  Fix direction: one query-key factory per feature, and every mutation hook refreshes all the keys it affects. Screens never touch the cache directly.

- [ ] **FD3 · P2 · Query key without the library id.**
  Where: `features/settings/settingsQueries/settingsQueries.tsx:32` (`['libraryDetails']`).
  Problem: with branches, one branch's details will show for another.

- [ ] **FD4 · P2 · Circular import through `index.js`.**
  Where: `studentQueries.tsx:1` imports `queryClient` from the app entry file, which imports `App`, which eventually imports `studentQueries`.
  Problem: circular imports can give `undefined` at startup depending on load order, and they break Fast Refresh.
  Fix direction: use `useQueryClient()` inside hooks, or move the client to its own module.

- [ ] **FD5 · P2 · Types don't match the backend.**
  Where: 33 uses of `any`, mutation payloads typed `any`, and the student type in `service/studentService.ts:3–12` has `libarary_id` and `amount`, while the backend expects `library_id`, `total_fee` and `amount_paid`.
  Problem: TypeScript can't catch a wrong field name, which is exactly the kind of bug that reaches users.
  Fix direction: define request and response types once per endpoint. Once the backend has validation schemas (C2), share or generate the types from them.

- [ ] **FD6 · P2 · Environment is switched by editing code.**
  Where: `constants/api/config.ts:6` (`IS_DEV = false`).
  Problem: it's easy to ship a build pointing at `localhost`, or test against production by accident.
  Fix direction: build-time environment config (dev/staging/prod), not a hardcoded flag.

---

## 4. Notifications

- [ ] **FN1 · P1 · Push setup runs inside the Dashboard screen.**
  Where: `Dashbaord.tsx:46`, `services/notificationService.js:74–76`.
  Problem: the token is re-registered every time the dashboard mounts, and the permission prompt appears the first time it opens. More importantly, Firebase requires the background message handler to be registered outside React, at app start (in `index.js`). Registered inside a component, it isn't there when the app is killed, so background messages aren't handled.
  Fix direction: register the background handler at app start, and run permission plus token registration once after login, in an app-level hook.

- [ ] **FN2 · P2 · Notifications do nothing when opened.**
  Where: `notificationService.js:64–72`.
  Problem: foreground messages are only logged, and tapping a notification doesn't open the relevant screen (for example the expiring-soon list).

---

## 5. Screens and forms

- [ ] **FU1 · P2 · The Add Student form is built differently from every other form.**
  Where: `features/students/screens/AddStudents.tsx` (854 lines, 17 `useState` hooks, hand-written validation).
  Problem: 9 other forms use `react-hook-form` with `yup`. This one, the most important form in the app, doesn't, so its validation and error display behave differently.
  Fix direction: move it to the same form approach, and split it into a form hook plus smaller components (student details, seat and time picker, payment).

- [ ] **FU2 · P2 · Very large components.**
  `ReceiptModal.tsx` 688 lines, `ListOfStudents.tsx` 608, `RenewMembershipModal.tsx` 584. Data fetching, formatting and UI are mixed in each. Split data hooks from presentational components.

- [ ] **FU3 · P2 · No design system.**
  Problem: 286 hardcoded hex colors across screens and components. `constants/theme.ts` is a leftover from the Expo template and isn't used. Changing the brand color or adding dark mode means editing dozens of files.
  Fix direction: shared tokens for colors, spacing and typography, plus a few base components (button, input, card, screen) that all screens use.

- [ ] **FU4 · P2 · Duplicated helpers.**
  `formatCurrency` is defined in 3 places (`Dashbaord.tsx:50`, `RenewMembershipModal.tsx:157`, `receiptHelpers.ts:14`) next to `utils/FormatAmount.ts`. `useDebounce` is defined inside `AddStudents.tsx:38`. Move each to one shared file.

- [ ] **FU5 · P2 · Subscription status shown wrong.**
  Where: `Dashbaord.tsx:99`.
  Problem: anything that isn't `trial` is shown as "Active", including an expired subscription.

- [ ] **FU6 · P1 · The paused / overdue flow has no UI yet.**
  The confirmed rule needs: a paused badge with days left before cancellation, a filter for paused students, and a way to collect payment that re-activates the membership **(needs backend A2, A3)**.

- [ ] **FU7 · P3 · Receipt PDF breaks on special characters.**
  Where: `features/students/studentHelpers/receiptHelpers.ts` (`generateReceiptHTML`).
  Problem: student and library names are inserted into HTML as-is, so a name containing `<` or `&` breaks the layout. Escape values before inserting them.

- [ ] **FU8 · P3 · Receipts exist only on the device that made them.**
  A receipt is generated as a PDF on the phone at payment time. If the owner needs to re-send it later or from another phone, it has to be rebuilt from data that may have changed. A receipt endpoint on the server would give one source of truth.

---

## 6. Navigation

- [ ] **FNav1 · P2 · Navigators aren't typed.**
  Where: `features/students/studentNavigation/StudentNavigator.tsx`, `navigation/SetupNavigator.tsx` (no param lists), `route.params` cast with `as` in screens.
  Problem: a wrong screen name or missing param is only found at runtime.
  Fix direction: a param list type for every navigator and typed `useNavigation` and `useRoute`.

- [ ] **FNav2 · P3 · Small navigation inconsistencies.**
  `LibrarySetup` is registered in both `AuthStack` and `SetupStack`. `StudentStack` has no initial route, so navigating to `Student` without a `screen` lands on Add Student.

---

## 7. Structure and code quality

Current layout:

```
src/
  App.tsx  store.ts
  components/   feedback/ layout/ ui/
  constants/    api/ fonts.ts theme.ts
  features/<feature>/   screens/ components/ + differently named service, query, navigation folders
  navigation/   services/   utils/
```

Grouping by feature is the right choice. The problems are naming and what lives where.

- [ ] **FC1 · P2 · Folder names differ in every feature.**
  Examples: `auth/authQuery/authQueries.tsx`, `dashboard/dashboardQueries/dashboardQuery.tsx`, `finance/financeQueries/`, `students/service/` vs `finance/services/` vs `settings/settingsServices/`, `students/studentNavigation/` vs `finance/navigation/` vs `helpfulInfo/helpfulInfoNavigator/`. Each new feature makes a new variation.
  Fix direction: the same fixed set of files in every feature (see target layout).

- [ ] **FC2 · P3 · Typos in file and identifier names.**
  `Dashbaord.tsx`, `ConfirmationModel.tsx` (modal), `udpatePassword`, "Helpfull Info" (visible in the UI at `Dashbaord.tsx:105`), `libarary_id`.

- [ ] **FC3 · P3 · Wrong file types and locations.**
  Service and query files use `.tsx` without JSX. `services/notificationService.js` is JavaScript in a TypeScript project. The API client lives in `constants/`. A hook (`useKeyboardHook.tsx`) lives in `components/layout/`.

- [ ] **FC4 · P2 · No working tests or CI.**
  `__tests__/App.test.tsx` imports `../App`, which doesn't exist (the app is in `src/App.tsx`), so `npm test` fails. Nothing runs lint or typecheck on push.

- [ ] **FC5 · P2 · No crash reporting.**
  In production you won't know when the app crashes on a user's phone. Add a crash reporter before real users arrive.

- [ ] **FC6 · P3 · README is the React Native template.**
  It should say how to run the app against each environment and how to make a release build.

---

## 8. Target frontend architecture

**Layers, top to bottom:**

1. **Screens** show UI and call feature hooks. No API calls, no cache handling.
2. **Feature hooks** (`queries.ts`) wrap React Query. Each feature has a query-key factory, and every mutation refreshes the keys it affects.
3. **API functions** (`api.ts` per feature) make typed requests.
4. **One HTTP client** adds the token, refreshes on 401 or logs out, and turns every failure into one error shape.

**State:**

- Server data lives only in React Query.
- A small session store holds the token, the current library id and a few UI flags.
- The token stays in Keychain.
- Forms use `react-hook-form` everywhere, with the same validation library as the backend so the rules can be shared.

**Target layout:**

```
src/
  app/            App.tsx, providers, queryClient, store, notification bootstrap
  navigation/     root navigator + typed param lists
  api/            client, auth/401 handling, error type, endpoints
  features/
    <feature>/    api.ts  queries.ts  schemas.ts  types.ts
                  screens/  components/  utils.ts
  shared/
    components/   Button, Input, Card, Screen, EmptyState, ErrorState
    hooks/        useDebounce, useKeyboard
    theme/        colors, spacing, typography
    utils/        currency, dates (IST), phone
```

**Order that avoids rework:** API client and error shape first (FD1, FA1), then the session and current-library state (FA4, FA5), then query keys (FD2, FD3). Screens and styling come after, because they depend on the first three.
