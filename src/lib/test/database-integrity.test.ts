import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate unique emails to avoid conflicts
const generateUniqueEmail = () => `test-${uuidv4().slice(0, 8)}@example.com`;

describe('Database Integrity Tests', () => {
  let testUserId: string | undefined;
  let testTeamId: string | undefined;

  // Setup: Create a test user
  beforeAll(async () => {
    // Create a test user with a unique email
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: generateUniqueEmail(),
          password: 'TestPassword123!'
        })
      });
      
      const authData = await response.json();
      
      if (!response.ok) {
        console.error('Error creating test user:', authData.error);
        throw new Error(authData.error);
      }

      testUserId = authData.user?.id;

      // Create a test team
      if (testUserId) {
        const teamResponse = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Team',
            description: 'Team for database integrity tests',
            created_by: testUserId,
            invite_code: `TEST-${uuidv4().slice(0, 6)}`
          })
        });
        
        const team = await teamResponse.json();
        
        if (!teamResponse.ok) {
          console.error('Error creating test team:', team.error);
        } else {
          testTeamId = team.id;
        }
      }
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  });

  // Cleanup: Remove test user and related data
  afterAll(async () => {
    if (testUserId) {
      // Delete test data
      if (testTeamId) {
        await supabase.from('team_members').delete().eq('team_id', testTeamId);
        await supabase.from('teams').delete().eq('id', testTeamId);
      }
      
      // Delete test user
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  // Test 1: Team Member RLS Policies
  it('should not trigger infinite recursion when querying team members', async () => {
    // Skip if no test user or team
    if (!testUserId || !testTeamId) {
      console.warn('Skipping test due to missing test user or team');
      return;
    }

    // Insert test user as team member
    await supabase
      .from('team_members')
      .insert({
        team_id: testTeamId,
        user_id: testUserId,
        role: 'member'
      });

    // This query would previously cause infinite recursion
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', testTeamId);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data?.length).toBeGreaterThan(0);
  });

  // Test 2: User Onboarding Duplicate Key
  it('should not create duplicate onboarding records', async () => {
    // Skip if no test user
    if (!testUserId) {
      console.warn('Skipping test due to missing test user');
      return;
    }

    // First insertion should succeed
    const { error: error1 } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: testUserId,
        onboarding_completed: false
      });

    expect(error1).toBeNull();

    // Second insertion should not fail with duplicate key error
    const { error: error2 } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: testUserId,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    expect(error2).toBeNull();

    // Verify there's only one record
    const { data, error: countError } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', testUserId);

    expect(countError).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].onboarding_completed).toBe(true);
  });

  // Test 3: Work Schedules RLS
  it('should allow team members to view other members schedules', async () => {
    // Skip if no test user or team
    if (!testUserId || !testTeamId) {
      console.warn('Skipping test due to missing test user or team');
      return;
    }

    // Create a test schedule
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('work_schedules')
      .insert({
        user_id: testUserId,
        date: today,
        work_type: 'office'
      });

    // This query should work without infinite recursion
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('user_id', testUserId)
      .eq('date', today);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0].work_type).toBe('office');
  });

  // Test 4: User Profile Creation
  it('should automatically create a user profile on registration', async () => {
    // Create a new test user
    const testEmail = generateUniqueEmail();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    });

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();

    const newUserId = authData.user?.id;

    // Verify profile was created
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', newUserId);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBe(1);
    expect(data?.[0].user_id).toBe(newUserId);

    // Clean up
    if (newUserId) {
      await supabase.auth.admin.deleteUser(newUserId);
    }
  });
});