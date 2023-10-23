import {ModelTypes} from "./types/ModelTypes";

export class Settings {
  name: ModelTypes;
  action: string;
  note: string;
  memory: string;
  nsfw: boolean;
  isAdventure: boolean;
  hasAutomaticMemory: boolean;
  hasAutomaticGuidelines: boolean;
  maxOutputLength: number;
  numberOfGenerations: number

  constructor(name: ModelTypes, action: string, note: string, memory: string, nsfw: boolean, isAdventure: boolean, hasAutomaticMemory: boolean, hasAutomaticGuidelines: boolean, maxOutputLength: number, numberOfGenerations: number) {
    this.name = name;
    this.action = action;
    this.note = note;
    this.memory = memory;
    this.nsfw = nsfw;
    this.isAdventure = isAdventure;
    this.hasAutomaticMemory = hasAutomaticMemory;
    this.hasAutomaticGuidelines = hasAutomaticGuidelines;
    this.maxOutputLength = maxOutputLength;
    this.numberOfGenerations = numberOfGenerations;
  }
}
