/**
 * Database Integrity Tests for Hi-Bridge
 * Tests for Replit Database functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authAPI, userAPI, teamAPI, pulseAPI } from '../supabase';

describe('Database Integrity Tests', () => {
  let testUserId: string;
  let testTeamId: string;

  beforeEach(async () => {
    // Setup test data
    console.log('Setting up test data...');
  });

  afterEach(async () => {
    // Cleanup test data
    if (testTeamId) {
      try {
        // Clean up team members
        console.log('Cleaning up test team members...');
        // Clean up team
        console.log('Cleaning up test team...');
      } catch (error) {
        console.error('Error cleaning up test team:', error);
      }
    }

    if (testUserId) {
      try {
        console.log('Cleaning up test user...');
      } catch (error) {
        console.error('Error cleaning up test user:', error);
      }
    }
  });

  // Test 1: User Registration
  it('should create a user account successfully', async () => {
    const testEmail = `test-${Date.now()}@example.com`;

    const result = await authAPI.register({
      email: testEmail,
      password: 'TestPassword123!',
      fullName: 'Test User',
      role: 'employee'
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.email).toBe(testEmail);

    testUserId = result.data?.id || '';
  });

  // Test 2: Team Creation
  it('should create a team successfully', async () => {
    // First create a user
    const testEmail = `test-${Date.now()}@example.com`;
    const userResult = await authAPI.register({
      email: testEmail,
      password: 'TestPassword123!',
      fullName: 'Test User',
      role: 'manager'
    });

    expect(userResult.success).toBe(true);
    testUserId = userResult.data?.id || '';

    // Create team
    const teamResult = await teamAPI.createTeam({
      name: 'Test Team',
      description: 'A test team for database integrity testing'
    });

    expect(teamResult.success).toBe(true);
    expect(teamResult.data).toBeDefined();
    expect(teamResult.data?.name).toBe('Test Team');

    testTeamId = teamResult.data?.id || '';
  });

  // Test 3: Pulse Check Submission
  it('should submit a pulse check successfully', async () => {
    // First create a user
    const testEmail = `test-${Date.now()}@example.com`;
    const userResult = await authAPI.register({
      email: testEmail,
      password: 'TestPassword123!',
      fullName: 'Test User',
      role: 'employee'
    });

    expect(userResult.success).toBe(true);
    testUserId = userResult.data?.id || '';

    // Submit pulse check
    const pulseResult = await pulseAPI.submitPulse({
      rating: 4,
      comment: 'Feeling good today!'
    });

    expect(pulseResult.success).toBe(true);
    expect(pulseResult.data).toBeDefined();
    expect(pulseResult.data?.rating).toBe(4);
  });

  // Test 4: User Profile Creation
  it('should automatically create a user profile on registration', async () => {
    const testEmail = `test-${Date.now()}@example.com`;

    const result = await authAPI.register({
      email: testEmail,
      password: 'TestPassword123!',
      fullName: 'Test User',
      role: 'employee'
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    testUserId = result.data?.id || '';

    // Verify profile was created
    const profileResult = await userAPI.getProfile();

    expect(profileResult.success).toBe(true);
    expect(profileResult.data).toBeDefined();
    expect(profileResult.data?.id).toBe(testUserId);
  });
});