import {ModelTypes} from "../types/ModelTypes";

export interface ISettings {
  success: boolean,
  data: {
    model_name: ModelTypes,
    authors_note: string,
    memory_section: string,
    nsfw: boolean,
    adventure_mode: boolean,
    automatic_memory: boolean,
    automatic_guidelines: boolean,
    max_output_length: number,
    number_of_generations: number
  }
}
