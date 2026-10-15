export interface Obstacle {
  id: string;
  label: string;
  isHazard: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  distance: string;
  location: 'left' | 'center' | 'right' | 'ground' | 'overhead';
  /**
   * Normalized bounding box [ymin, xmin, ymax, xmax] scaled 0 to 1000
   */
  box2d: [number, number, number, number];
}

export interface VisionAnalysisResult {
  summary: string;
  navigationAdvice: string;
  audioAlert: string;
  pathClear: boolean;
  urgentHazards: string[];
  obstacles: Obstacle[];
  detectedText?: string;
  sceneContext?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  spokenSummary?: string;
  timestamp: Date;
  obstacles?: Obstacle[];
  hazardWarning?: string;
  audioBase64?: string;
  taskType?: 'obstacle_safety' | 'read_text' | 'scene_description' | 'currency_reader' | 'general';
}

export type VisionTask = 'obstacle_safety' | 'read_text' | 'scene_description' | 'currency_reader';

export interface PresetScene {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}
