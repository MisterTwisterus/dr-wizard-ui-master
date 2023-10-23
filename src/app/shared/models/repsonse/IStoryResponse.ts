import {IStory} from "./IStory";

export interface IStoryResponse {
  data: { stories: IStory[] },
  success: boolean;

}
