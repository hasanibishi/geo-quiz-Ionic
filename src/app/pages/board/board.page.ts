import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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

  usedChangingQuestion: boolean = false;
  usedHelpBy50x50: boolean = false;
  usedHelpByPhone: boolean = false;
  usedHelpByPublic: boolean = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getQuestions();
  }

  async checkQuestion() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Is this your final answer?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No'
        }, {
          text: 'Yes',
          handler: () => this.checkAnswer()
        }
      ]
    });

    await alert.present();
  }

  getQuestions() {
    this.ranks = this.dataService.getData().sort((a, b) => b.rank - a.rank);

    const fQuestion = this.ranks.find(x => x.rank === this.ranksCount)?.questions;

    this.currentMoney = this.ranks.find(x => x.rank === this.ranksCount - 1)?.value;

    if (fQuestion)
      this.question = fQuestion[Math.floor(Math.random() * fQuestion?.length)];
  }

  changeQuestion() {
    if (!this.usedChangingQuestion) {
      this.ranks = this.dataService.getData().sort((a, b) => b.rank - a.rank);
      const fQuestions = this.ranks.find(x => x.rank === this.ranksCount)?.questions;

      if (fQuestions) {
        let index = fQuestions.findIndex(x => x.id === this.question.id) + 1;

        if (index === 5)
          index = 0;

        this.question = fQuestions[index];
      }

      this.usedChangingQuestion = true
    }
  }

  use50x50() {
    if (!this.usedHelpBy50x50) {

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

      this.usedHelpBy50x50 = true;
    }
  }

  usePublic() {
    if (!this.usedHelpByPublic) {

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

      this.usedHelpByPublic = true
    }
  }

  usePhone() {
    if (!this.usedHelpByPhone) {
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

      this.helpByPhone();

      this.usedHelpByPhone = true
    }
  }

  selectedOption(option: IOption) {
    this.answer = option.isCorrect;
    this.checkQuestion();
  }

  checkAnswer() {
    if (this.answer) {
      this.ranksCount++;

      if (this.ranksCount === 16) {
        this.quizFinished();
      }

      else {
        this.getQuestions();
      }
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

      this.quizOver();
    }
  }

  async helpByPhone() {
    const htmlMessage: string = `
      <div class="text-center">
        Your friend says: <br> <i>"I think the correct answer is <b>${this.correctAnswer}</b>"</i>
      </div>`;

    const alert = await this.alertController.create({
      header: 'Calling',
      message: htmlMessage,
      backdropDismiss: false,
      buttons: ['Okay, thank you']
    });

    await alert.present();
  }

  async quizOver() {
    const htmlMessage: string = `
      <div class="text-center">
          <i class="far fa-frown fa-4x"></i> <br>
          <span>The correct answer was <b>${this.correctAnswer}</b></span> <br>
          <span>You earned just € ${this.currentMoney || 0}</span>
          <br> <br>
          Do you want to play again?
      </div>`;

    const alert = await this.alertController.create({
      message: htmlMessage,
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => this.goToHome()
        }, {
          text: 'Yes',
          handler: () => this.resetQuiz()
        }
      ]
    });

    await alert.present();
  }

  async quizFinished() {
    const htmlMessage: string = `
      <div class="text-center">
        <i class="far fa-smile-wink fa-4x"></i> <br>
        <span>Congratulations!</span> <br> <br>
        <span>You earned € 1 MILLION</span>
        <br> <br>
        Do you want to play again?
      </div>`;

    const alert = await this.alertController.create({
      message: htmlMessage,
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => this.goToHome()
        }, {
          text: 'Yes',
          handler: () => this.resetQuiz()
        }
      ]
    });

    await alert.present();
  }

  async leaveQuiz() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure to leave the quiz?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No'
        }, {
          text: 'Yes',
          handler: () => this.goToHome()
        }
      ]
    });

    await alert.present();
  }

  resetQuiz() {
    this.usedChangingQuestion = false;
    this.usedHelpBy50x50 = false;
    this.usedHelpByPhone = false;
    this.usedHelpByPublic = false;
    this.ranksCount = 1;

    this.getQuestions();
  }

  clear() {
    this.usedChangingQuestion = false;
    this.usedHelpBy50x50 = false;
    this.usedHelpByPhone = false;
    this.usedHelpByPublic = false;
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
