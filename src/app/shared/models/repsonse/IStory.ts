export interface IStory {

  story_id: number;
  story_name: string;
  created_on: Date;
  world_id: number;
  world_name: string;
  creation_status: {
    progress: number;
    is_ready: boolean;
  }
}
