export interface ITextResponse {
  success: boolean;
  data: {
    story_text: string;
    world_text: string;
    editable_text: string;
  }
}
