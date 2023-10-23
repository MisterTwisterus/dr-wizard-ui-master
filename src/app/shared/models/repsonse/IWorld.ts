export interface IWorld {
  world_id: number;
  world_name: string;
  created_on: Date;
  creation_status: {
    progress: number;
    is_ready: boolean;
  }
}
