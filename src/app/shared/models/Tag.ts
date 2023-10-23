export class Tag {
  id: string;
  name: string;
  color: string;
  creationDate: Date;
  selected: boolean;

  readonly type: string = 'tags';


  constructor(id: string, name: string, color: string, creationDate: Date, selected: boolean) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.creationDate = creationDate;
    this.selected = selected;
  }
}
