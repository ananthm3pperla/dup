
/**
 * Schedule Context for Hi-Bridge
 * Manages work schedules and anchor days using Replit Database
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { database } from '../lib/database';
import { scheduleAPI } from '../lib/api';

export interface WorkSchedule {
  id: string;
  userId: string;
  teamId: string;
  date: string;
  location: 'office' | 'remote' | 'hybrid';
  isAnchorDay: boolean;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnchorDay {
  id: string;
  teamId: string;
  date: string;
  votesFor: string[];
  votesAgainst: string[];
  isConfirmed: boolean;
  createdBy: string;
  createdAt: string;
}

interface ScheduleState {
  schedules: WorkSchedule[];
  anchorDays: AnchorDay[];
  isLoading: boolean;
  error: string | null;
}

type ScheduleAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SCHEDULES'; payload: WorkSchedule[] }
  | { type: 'SET_ANCHOR_DAYS'; payload: AnchorDay[] }
  | { type: 'ADD_SCHEDULE'; payload: WorkSchedule }
  | { type: 'UPDATE_SCHEDULE'; payload: WorkSchedule }
  | { type: 'REMOVE_SCHEDULE'; payload: string }
  | { type: 'ADD_ANCHOR_DAY'; payload: AnchorDay }
  | { type: 'UPDATE_ANCHOR_DAY'; payload: AnchorDay };

const initialState: ScheduleState = {
  schedules: [],
  anchorDays: [],
  isLoading: false,
  error: null,
};

const scheduleReducer = (state: ScheduleState, action: ScheduleAction): ScheduleState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload, isLoading: false };
    case 'SET_ANCHOR_DAYS':
      return { ...state, anchorDays: action.payload, isLoading: false };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    case 'REMOVE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.filter(s => s.id !== action.payload)
      };
    case 'ADD_ANCHOR_DAY':
      return { ...state, anchorDays: [...state.anchorDays, action.payload] };
    case 'UPDATE_ANCHOR_DAY':
      return {
        ...state,
        anchorDays: state.anchorDays.map(a => 
          a.id === action.payload.id ? action.payload : a
        )
      };
    default:
      return state;
  }
};

interface ScheduleContextType {
  schedules: WorkSchedule[];
  anchorDays: AnchorDay[];
  isLoading: boolean;
  error: string | null;
  loadSchedules: (startDate?: string, endDate?: string) => Promise<void>;
  loadAnchorDays: (teamId: string) => Promise<void>;
  createSchedule: (schedule: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkSchedule>;
  updateSchedule: (id: string, updates: Partial<WorkSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  createAnchorDay: (anchorDay: Omit<AnchorDay, 'id' | 'createdAt'>) => Promise<AnchorDay>;
  voteOnAnchorDay: (anchorDayId: string, vote: 'for' | 'against') => Promise<void>;
  confirmAnchorDay: (anchorDayId: string) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);
  const { user } = useAuth();

  /**
   * Load user schedules within a date range
   */
  const loadSchedules = async (
    startDate = new Date().toISOString().split('T')[0],
    endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  ) => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await scheduleAPI.getSchedule();
      const schedules = response.schedules || [];
      
      // Filter schedules by date range
      const filteredSchedules = schedules.filter((schedule: WorkSchedule) => 
        schedule.date >= startDate && schedule.date <= endDate
      );

      dispatch({ type: 'SET_SCHEDULES', payload: filteredSchedules });
    } catch (error) {
      console.error('Error loading schedules:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load schedules' });
    }
  };

  /**
   * Load anchor days for a team
   */
  const loadAnchorDays = async (teamId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Use database directly for anchor days
      const keys = await database.db.list('anchor:');
      const anchorDays: AnchorDay[] = [];

      for (const key of keys) {
        const anchorData = await database.db.get(key);
        if (anchorData) {
          const anchor: AnchorDay = JSON.parse(anchorData);
          if (anchor.teamId === teamId) {
            anchorDays.push(anchor);
          }
        }
      }

      dispatch({ type: 'SET_ANCHOR_DAYS', payload: anchorDays });
    } catch (error) {
      console.error('Error loading anchor days:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load anchor days' });
    }
  };

  /**
   * Create a new work schedule
   */
  const createSchedule = async (
    scheduleData: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkSchedule> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newSchedule: WorkSchedule = {
        ...scheduleData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await database.db.set(`schedule:${id}`, JSON.stringify(newSchedule));
      await database.db.set(`schedule:user:${scheduleData.userId}:${scheduleData.date}`, id);

      dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
      return newSchedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  };

  /**
   * Update an existing schedule
   */
  const updateSchedule = async (id: string, updates: Partial<WorkSchedule>) => {
    try {
      const scheduleData = await database.db.get(`schedule:${id}`);
      if (!scheduleData) throw new Error('Schedule not found');

      const schedule: WorkSchedule = JSON.parse(scheduleData);
      const updatedSchedule = {
        ...schedule,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await database.db.set(`schedule:${id}`, JSON.stringify(updatedSchedule));
      dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  };

  /**
   * Delete a schedule
   */
  const deleteSchedule = async (id: string) => {
    try {
      const scheduleData = await database.db.get(`schedule:${id}`);
      if (scheduleData) {
        const schedule: WorkSchedule = JSON.parse(scheduleData);
        await database.db.delete(`schedule:${id}`);
        await database.db.delete(`schedule:user:${schedule.userId}:${schedule.date}`);
      }

      dispatch({ type: 'REMOVE_SCHEDULE', payload: id });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Failed to delete schedule');
    }
  };

  /**
   * Create a new anchor day
   */
  const createAnchorDay = async (
    anchorDayData: Omit<AnchorDay, 'id' | 'createdAt'>
  ): Promise<AnchorDay> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newAnchorDay: AnchorDay = {
        ...anchorDayData,
        id,
        createdAt: new Date().toISOString(),
      };

      await database.db.set(`anchor:${id}`, JSON.stringify(newAnchorDay));
      dispatch({ type: 'ADD_ANCHOR_DAY', payload: newAnchorDay });
      return newAnchorDay;
    } catch (error) {
      console.error('Error creating anchor day:', error);
      throw new Error('Failed to create anchor day');
    }
  };

  /**
   * Vote on an anchor day
   */
  const voteOnAnchorDay = async (anchorDayId: string, vote: 'for' | 'against') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const anchorData = await database.db.get(`anchor:${anchorDayId}`);
      if (!anchorData) throw new Error('Anchor day not found');

      const anchorDay: AnchorDay = JSON.parse(anchorData);
      
      // Remove user from both arrays first
      const votesFor = anchorDay.votesFor.filter(id => id !== user.id);
      const votesAgainst = anchorDay.votesAgainst.filter(id => id !== user.id);

      // Add user to appropriate array
      if (vote === 'for') {
        votesFor.push(user.id);
      } else {
        votesAgainst.push(user.id);
      }

      const updatedAnchorDay = {
        ...anchorDay,
        votesFor,
        votesAgainst
      };

      await database.db.set(`anchor:${anchorDayId}`, JSON.stringify(updatedAnchorDay));
      dispatch({ type: 'UPDATE_ANCHOR_DAY', payload: updatedAnchorDay });
    } catch (error) {
      console.error('Error voting on anchor day:', error);
      throw new Error('Failed to vote on anchor day');
    }
  };

  /**
   * Confirm an anchor day
   */
  const confirmAnchorDay = async (anchorDayId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const anchorData = await database.db.get(`anchor:${anchorDayId}`);
      if (!anchorData) throw new Error('Anchor day not found');

      const anchorDay: AnchorDay = JSON.parse(anchorData);
      const updatedAnchorDay = {
        ...anchorDay,
        isConfirmed: true
      };

      await database.db.set(`anchor:${anchorDayId}`, JSON.stringify(updatedAnchorDay));
      dispatch({ type: 'UPDATE_ANCHOR_DAY', payload: updatedAnchorDay });
    } catch (error) {
      console.error('Error confirming anchor day:', error);
      throw new Error('Failed to confirm anchor day');
    }
  };

  const contextValue: ScheduleContextType = {
    schedules: state.schedules,
    anchorDays: state.anchorDays,
    isLoading: state.isLoading,
    error: state.error,
    loadSchedules,
    loadAnchorDays,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    createAnchorDay,
    voteOnAnchorDay,
    confirmAnchorDay,
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};

export default ScheduleProvider;
