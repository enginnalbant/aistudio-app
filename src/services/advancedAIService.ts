import { supabase } from './supabaseClient';
import { GoogleGenAI } from "@google/genai";
import { getAI } from "./aiConfig";

export class AdvancedAIService {
  private model = "gemini-3.1-pro-preview";

  async logReasoningChain(messageId: string, chain: any[], tokens: number) {
    const { error } = await supabase
      .from('ai_reasoning_chains')
      .insert({
        message_id: messageId,
        chain,
        tokens_used: tokens
      });
    if (error) console.error('Error logging reasoning chain:', error);
  }

  async detectAnomalies(module: string, data: any) {
    const ai = getAI();
    // This would typically involve a call to Gemini to analyze the data for patterns
    const prompt = `Analyze the following ${module} data for anomalies, suspicious patterns, or significant deviations from norms: ${JSON.stringify(data)}`;
    
    try {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.anomalies && result.anomalies.length > 0) {
        for (const anomaly of result.anomalies) {
          await supabase.from('ai_anomaly_detection').insert({
            module,
            severity: anomaly.severity || 'medium',
            description: anomaly.description,
            evidence: anomaly.evidence
          });
        }
      }
      return result;
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      return null;
    }
  }

  async predictStockDemand(stockId: string, history: any[]) {
    const ai = getAI();
    const prompt = `Based on the following stock movement history, predict the demand for the next 30 days. Stock ID: ${stockId}. History: ${JSON.stringify(history)}`;
    
    try {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const prediction = JSON.parse(response.text || '{}');
      
      await supabase.from('ai_prediction_history').insert({
        type: 'StockDemand',
        prediction
      });

      return prediction;
    } catch (error) {
      console.error('Stock demand prediction failed:', error);
      return null;
    }
  }

  async getSuggestedActions() {
    const { data, error } = await supabase
      .from('ai_suggested_actions')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

export const advancedAI = new AdvancedAIService();
