# Hi-Bridge QA Test Plan

## Database Error Fixes Validation

This QA test plan focuses on verifying that the recent fixes for database-related errors are working properly. These include infinite recursion in RLS policies and duplicate key violations during user onboarding.

### 1. Team Member Loading Tests

| Test Case           | Steps                                                                           | Expected Result                                             | Status |
| ------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| Load Teams          | 1. Log in to the application<br>2. Navigate to dashboard                        | Teams load successfully without "infinite recursion" errors | ⬜     |
| View Team Members   | 1. Log in to the application<br>2. Navigate to Teams page<br>3. Click on a team | Team members display without infinite recursion errors      | ⬜     |
| Load Work Schedules | 1. Log in to the application<br>2. Navigate to Schedule page                    | Schedule data loads without infinite recursion errors       | ⬜     |
| Load Check-ins      | 1. Log in as a team leader<br>2. Navigate to dashboard<br>3. View check-in data | Check-in data loads without infinite recursion errors       | ⬜     |

### 2. User Onboarding Tests

| Test Case             | Steps                                                                                                | Expected Result                                           | Status |
| --------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------ |
| New User Registration | 1. Sign up with a new email<br>2. Complete verification<br>3. Proceed to onboarding                  | Onboarding flow starts without duplicate key errors       | ⬜     |
| Complete Onboarding   | 1. Sign up as a new user<br>2. Go through onboarding flow<br>3. Submit onboarding data               | Onboarding data saves without duplicate key errors        | ⬜     |
| Auth Callback Flow    | 1. Sign up with a new email<br>2. Click email verification link<br>3. Observe auth callback handling | Auth callback processes without duplicate key errors      | ⬜     |
| Demo Mode Fallback    | 1. Trigger a database error deliberately<br>2. Observe system behavior                               | System falls back to demo mode with appropriate messaging | ⬜     |

### 3. Edge Case Tests

| Test Case                | Steps                                                                                           | Expected Result                                       | Status |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------ |
| Concurrent User Creation | 1. Create multiple user accounts simultaneously<br>2. Observe system handling                   | No duplicate key errors occur despite concurrency     | ⬜     |
| Network Interruption     | 1. Start onboarding flow<br>2. Temporarily disable network<br>3. Re-enable network and continue | System recovers gracefully without duplicate records  | ⬜     |
| Team Member RLS          | 1. Log in as a team member<br>2. Attempt to view teams you don't belong to                      | Proper RLS enforcement without recursion errors       | ⬜     |
| Large Team Loading       | 1. Create a team with many members (50+)<br>2. Load team dashboard                              | Team data loads efficiently without timeout or errors | ⬜     |

### 4. Performance Tests

| Test Case                 | Steps                                                                                     | Expected Result                      | Status |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------ | ------ |
| Dashboard Loading Time    | 1. Log in to application<br>2. Measure time to load dashboard                             | Dashboard loads in under 3 seconds   | ⬜     |
| Team Members Query        | 1. Log in as team leader<br>2. Navigate to team with many members<br>3. Measure load time | Team members load in under 2 seconds | ⬜     |
| Schedule View Performance | 1. Navigate to schedule view with many entries<br>2. Measure render time                  | Schedule renders in under 3 seconds  | ⬜     |

## Reporting Bugs

When reporting bugs related to database errors, please include:

1. The exact error message
2. Steps to reproduce
3. User role (team leader, member)
4. Browser and device information
5. Screenshot of the error if possible

## Deployment Checklist

Before deploying fixes to production:

- [ ] All tests pass in development environment
- [ ] Database migration scripts are properly tested
- [ ] RLS policies have been validated
- [ ] Onboarding flow works end-to-end
- [ ] Performance metrics are within acceptable ranges
