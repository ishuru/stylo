export interface Layer {
  id: string;
  type: 'text' | 'image';
  name: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  fontFamily?: 'font-headline' | 'font-body';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  editable: boolean;
  aiPrompt?: string;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  component: string;
  width: number;
  height: number;
  layers: Layer[];
  favorite?: boolean;
}
