export interface IWorldCreateStatus {
  success: boolean;
  data: {
    world_id: number;
    progress: number;
    "is_ready": boolean;
  }
}
