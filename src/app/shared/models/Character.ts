import {Tag} from "./Tag";

export class Character {
  id: string;
  name: string;
  description: string;
  creationDate: Date;
  tags: Tag[]
  selected: boolean;

  readonly type: string = 'character';

  constructor(id: string, name: string, description: string, creationDate: Date, tags: Tag[], selected: boolean) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.creationDate = creationDate;
    this.tags = tags;
    this.selected = selected;
  }
}
