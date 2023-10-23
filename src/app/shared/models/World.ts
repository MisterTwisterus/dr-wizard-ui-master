import {Tag} from "./Tag";

export class World {
  id: number;
  name: string;
  creationDate: Date;
  tags: Tag[];
  selected: boolean;


  constructor(id: number, name: string, creationDate: Date, tags: Tag[], selected: boolean) {
    this.id = id;
    this.name = name;
    this.creationDate = creationDate;
    this.tags = tags;
    this.selected = selected;
  }
}
