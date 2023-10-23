import {Tag} from "./Tag";

export class Story {
  id: number;
  name: string;
  creationDate: Date;
  worldName: string;
  worldId: number;
  tags: Tag[];
  selected: boolean;


  constructor(id: number, name: string, creationDate: Date, worldName: string, worldId: number, tags: Tag[], selected: boolean) {
    this.id = id;
    this.name = name;
    this.creationDate = creationDate;
    this.worldName = worldName;
    this.worldId = worldId;
    this.tags = tags;
    this.selected = selected;
  }
}
