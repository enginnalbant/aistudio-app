import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowDefinition {
  id: string;
  name: string;
  module: string;
  config: {
    states: string[];
    transitions: Record<string, string[]>;
    rules?: Record<string, any>;
  };
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Archived';
}

export interface WorkflowInstance {
  id: string;
  definition_id: string;
  current_state: string;
  context: any;
  history: any[];
}

export class WorkflowService {
  async getDefinitions() {
    const { data, error } = await supabase
      .from('workflow_definitions')
      .select('*')
      .eq('status', 'Active');
    
    if (error) throw error;
    return data as WorkflowDefinition[];
  }

  async createInstance(definitionId: string, initialState: string, context: any = {}) {
    const { data, error } = await supabase
      .from('workflow_instances')
      .insert({
        definition_id: definitionId,
        current_state: initialState,
        context,
        history: [{ state: initialState, timestamp: new Date().toISOString(), action: 'INIT' }]
      })
      .select()
      .single();

    if (error) throw error;
    return data as WorkflowInstance;
  }

  async transition(instanceId: string, nextState: string, action: string, contextUpdate: any = {}) {
    // 1. Get current instance
    const { data: instance, error: fetchError } = await supabase
      .from('workflow_instances')
      .select('*, workflow_definitions(*)')
      .eq('id', instanceId)
      .single();

    if (fetchError) throw fetchError;

    const definition = instance.workflow_definitions as WorkflowDefinition;
    const currentState = instance.current_state;

    // 2. Validate transition
    if (!definition.config.transitions[currentState]?.includes(nextState)) {
      throw new Error(`Invalid transition from ${currentState} to ${nextState}`);
    }

    // 3. Update instance
    const newHistory = [
      ...instance.history,
      { state: nextState, timestamp: new Date().toISOString(), action }
    ];

    const { data, error: updateError } = await supabase
      .from('workflow_instances')
      .update({
        current_state: nextState,
        context: { ...instance.context, ...contextUpdate },
        history: newHistory
      })
      .eq('id', instanceId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data as WorkflowInstance;
  }
}

export const workflowService = new WorkflowService();
