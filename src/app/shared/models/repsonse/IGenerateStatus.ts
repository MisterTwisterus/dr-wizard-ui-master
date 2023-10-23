export interface IGenerateStatus {
  success: boolean,
  data: {
    finished: boolean,
    generated_text: string
  }
}
