import { supabase } from './supabase';
import { OrgChart } from '../types';

export async function getOrgChart(rootId: string): Promise<OrgChart | null> {
  try {
    const { data, error } = await supabase.rpc('get_org_chart', { root_id: rootId });
    
    if (error) {
      console.error('Error fetching org chart:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getOrgChart:', err);
    return null;
  }
}