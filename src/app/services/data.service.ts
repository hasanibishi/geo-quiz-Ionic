import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IQuestion } from '../models/question.model';
import { IRank } from '../models/rank.model';
import { JsonData } from './json-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private translateService: TranslateService,
  ) { }

  getData(): IRank[] {
    return JsonData.map(x => ({
      ...x,
      questions: x.questions.map(y => {
        const translatedQuestion: IQuestion = {
          ...y,
          text: this.translate(y.text),
          option_a: { isCorrect: y.option_a.isCorrect, value: this.translate(y.option_a.value) },
          option_b: { isCorrect: y.option_b.isCorrect, value: this.translate(y.option_b.value) },
          option_c: { isCorrect: y.option_c.isCorrect, value: this.translate(y.option_c.value) },
          option_d: { isCorrect: y.option_d.isCorrect, value: this.translate(y.option_d.value) }
        }

        return translatedQuestion;
      })
    }))
  }

  translate(key: string): string {
    return this.translateService.instant(key);
  }

  playAudio(audioType: string): void {
    const audio = new Audio();
    audio.src = `assets/sounds/${audioType}`;
    audio.play();
  }
}
