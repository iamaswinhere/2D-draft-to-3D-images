
export type View = 'Isometric' | 'Front' | 'Side' | 'Top';

export interface GeneratedImage {
  view: View;
  imageUrl: string;
}

export interface PromptObject {
  view: View;
  prompt: string;
}
