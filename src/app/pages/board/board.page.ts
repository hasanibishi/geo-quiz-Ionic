import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IOption } from 'src/app/models/option.model';
import { IPublicOpinion } from 'src/app/models/public-opinion.model';
import { IQuestion } from 'src/app/models/question.model';
import { IRank } from 'src/app/models/rank.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  question: IQuestion;
  ranks: IRank[] = [];
  ranksCount: number = 1;
  currentMoney: number;
  answer: boolean = false;
  publicOpinion: IPublicOpinion;
  correctAnswer: string = '';

  help_ChangingQuestion: boolean = false;
  help_50x50: boolean = false;
  help_PhoneCall: boolean = false;
  help_Public: boolean = false;

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getQuestions();
  }

  getQuestions() {
    this.ranks = this.dataService.getData().sort((a, b) => b.rank - a.rank);

    const fQuestion = this.ranks.find(x => x.rank === this.ranksCount)?.questions;

    this.currentMoney = this.ranks.find(x => x.rank === this.ranksCount - 1)?.value;

    if (fQuestion)
      this.question = fQuestion[Math.floor(Math.random() * fQuestion?.length)];
  }

  changeQuestion() {
    if (!this.help_ChangingQuestion) {
      this.ranks = this.dataService.getData().sort((a, b) => b.rank - a.rank);
      const fQuestions = this.ranks.find(x => x.rank === this.ranksCount)?.questions;

      if (fQuestions) {
        let index = fQuestions.findIndex(x => x.id === this.question.id) + 1;

        if (index === 5)
          index = 0;

        this.question = fQuestions[index];
      }

      this.help_ChangingQuestion = true
    }
  }

  use50x50() {
    if (!this.help_50x50) {

      const a = this.question.option_a.isCorrect;
      const b = this.question.option_b.isCorrect;
      const c = this.question.option_c.isCorrect;
      const d = this.question.option_d.isCorrect;

      if (a) {
        this.question.option_b.value = '';
        this.question.option_d.value = '';
      }

      else if (b) {
        this.question.option_a.value = '';
        this.question.option_d.value = '';
      }

      else if (c) {
        this.question.option_a.value = '';
        this.question.option_d.value = '';
      }

      else if (d) {
        this.question.option_a.value = '';
        this.question.option_b.value = '';
      }

      this.help_50x50 = true;
    }
  }

  usePublic() {
    if (!this.help_Public) {

      // $('#helpPublicModal').modal('show');

      const a = this.question.option_a.isCorrect;
      const b = this.question.option_b.isCorrect;
      const c = this.question.option_c.isCorrect;
      const d = this.question.option_d.isCorrect;

      if (a) {
        this.publicOpinion = {
          percent_a: 80,
          percent_b: 5,
          percent_c: 5,
          percent_d: 10,
        };
      }
      else if (b) {
        this.publicOpinion = {
          percent_a: 5,
          percent_b: 80,
          percent_c: 5,
          percent_d: 10,
        };
      }
      else if (c) {
        this.publicOpinion = {
          percent_a: 5,
          percent_b: 5,
          percent_c: 80,
          percent_d: 10,
        };
      }
      else if (d) {
        this.publicOpinion = {
          percent_a: 10,
          percent_b: 5,
          percent_c: 5,
          percent_d: 80,
        };
      }

      this.help_Public = true
    }
  }

  usePhone() {
    if (!this.help_PhoneCall) {

      // $('#helpPhoneModal').modal('show');

      const a = this.question.option_a.isCorrect;
      const b = this.question.option_b.isCorrect;
      const c = this.question.option_c.isCorrect;
      const d = this.question.option_d.isCorrect;

      if (a)
        this.correctAnswer = 'A';

      else if (b)
        this.correctAnswer = 'B';

      else if (c)
        this.correctAnswer = 'C';

      else if (d)
        this.correctAnswer = 'D';

      this.help_PhoneCall = true
    }
  }

  selectedOption(option: IOption) {
    this.answer = option.isCorrect;
    // $('#confirmModal').modal('show');
  }

  checkAnswer() {
    if (this.answer) {
      // alertify.notify('Correct answer', 'success', 2, () => {

      this.ranksCount++;

      if (this.ranksCount === 16) {
        // $('#quizFinishedModal').modal('show');
      }

      else {
        this.getQuestions();
      }
      // });
    }

    else {
      const a = this.question.option_a.isCorrect;
      const b = this.question.option_b.isCorrect;
      const c = this.question.option_c.isCorrect;
      const d = this.question.option_d.isCorrect;

      if (a)
        this.correctAnswer = 'A';

      else if (b)
        this.correctAnswer = 'B';

      else if (c)
        this.correctAnswer = 'C';

      else if (d)
        this.correctAnswer = 'D';

      // $('#quizOverModal').modal('show');
    }

    // $('#confirmModal').modal('hide');
  }

  resetQuiz() {
    this.help_ChangingQuestion = false;
    this.help_50x50 = false;
    this.help_PhoneCall = false;
    this.help_Public = false;
    this.ranksCount = 1;

    this.getQuestions();
  }

  clear() {
    this.help_ChangingQuestion = false;
    this.help_50x50 = false;
    this.help_PhoneCall = false;
    this.help_Public = false;
  }

  goToHome() {
    this.router.navigate(['home']);

    this.clear();
  }

  // askForReloadingPage() {
  //   window.addEventListener("beforeunload", function (e) {
  //     var confirmationMessage = "\o/";
  //     e.returnValue = confirmationMessage;
  //     return confirmationMessage;
  //   });
  // }
}
