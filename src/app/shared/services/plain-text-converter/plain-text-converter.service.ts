import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlainTextConverterService {
  async convertToPlainText(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        resolve(text);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  }
}
