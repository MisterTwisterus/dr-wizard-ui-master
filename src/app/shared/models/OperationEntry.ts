import {DataTypes} from "./types/DataTypes";

export class OperationEntry {
  id: number | string;
  name: string;
  type: DataTypes


  constructor(id: number | string, name: string, type: DataTypes) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}
