import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
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
export class BoardPage implements OnInit, OnDestroy {

  question: IQuestion;
  ranks: IRank[] = [];
  ranksCount: number = 1;
  currentEarnedValue: number;
  publicOpinion: IPublicOpinion;
  selectedAnswer: IOption;

  usedChangingQuestion: boolean = false;
  usedHelpBy50x50: boolean = false;
  usedHelpByPhone: boolean = false;
  usedHelpByPublic: boolean = false;

  onWrongAnswer: boolean = false;

  backSubscription: Subscription;

  constructor(
    private dataService: DataService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private translateService: TranslateService
  ) {
    this.backSubscription = this.platform.backButton.subscribeWithPriority(1, async () => {
      const element = await this.alertController.getTop();

      if (element) {
        if (this.onWrongAnswer) {
          this.goToHome();
          element.dismiss();
        }
        else {
          element.dismiss();
          return;
        }
      }

      else {
        this.leaveQuiz();
      }
    })
  }

  ngOnInit(): void {
    this.getQuestions();
  }

  async checkQuestion(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate('confirm'),
      message: this.translate('is-this-your-final-answer'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate('no')
        }, {
          text: this.translate('yes'),
          handler: () => this.checkAnswer()
        }
      ]
    });

    await alert.present();
  }

  getQuestions(): void {
    this.ranks = this.dataService.getData().sort((a, b) => b.rank - a.rank);

    const fQuestion = this.ranks.find(x => x.rank === this.ranksCount)?.questions;

    this.currentEarnedValue = this.ranks.find(x => x.rank === this.ranksCount - 1)?.value;

    if (fQuestion)
      this.question = fQuestion[Math.floor(Math.random() * fQuestion?.length)];
  }

  changeQuestion(): void {
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

  use50x50(): void {
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

  usePublicOpinion(): void {
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

      this.helpByPublicOpinion();

      this.usedHelpByPublic = true
    }
  }

  usePhoneCall(): void {
    if (!this.usedHelpByPhone) {

      this.selectedAnswer = {
        value: this.getCorrectAnwser()
      }

      this.helpByPhone();

      this.usedHelpByPhone = true
    }
  }

  selectedOption(option: IOption, optionKey: string): void {
    this.selectedAnswer = {
      value: optionKey,
      isCorrect: option.isCorrect
    };

    this.checkQuestion();
  }

  async checkAnswer(): Promise<void> {

    if (this.selectedAnswer.isCorrect) {
      const toast = await this.toastController.create({
        message: this.translate('correct-answer'),
        duration: 2000,
        color: 'light',
        cssClass: 'text-center',
        position: 'top'
      });

      toast.present();

      this.optionBackgroundColor(this.getCorrectAnwser(), '#289328');

      await toast.onDidDismiss();

      this.ranksCount++;

      this.optionBackgroundColor(this.getCorrectAnwser(), 'transparent');

      if (this.ranksCount === 16) {
        await this.quizFinished();
      }

      else {
        this.getQuestions();
      }
    }

    else {
      this.selectedAnswer = {
        value: this.getCorrectAnwser()
      }

      this.quizOver();
    }
  }

  async helpByPhone(): Promise<void> {
    const htmlMessage: string = `
      <div class="text-center">
        ${this.translate('your-friend-says')}: <br> <i>"${this.translate('i-think-the-correct-answer-is')} <b>${this.selectedAnswer.value}</b>"</i>
      </div>`;

    const alert = await this.alertController.create({
      header: `${this.translate('calling')}...`,
      message: htmlMessage,
      backdropDismiss: false,
      buttons: [this.translate('okay-thank-you')]
    });

    await alert.present();
  }

  async helpByPublicOpinion(): Promise<void> {
    const htmlMessage: string = `
      <div class="helpByPublicOpinion">
        <div>
          <span>${this.publicOpinion?.percent_a}%</span>
          <span id="a"></span>
          <span class="text-center">A</span>
        </div>
        <div>
          <span>${this.publicOpinion?.percent_b}%</span>
          <span id="b"></span>
          <span class="text-center">B</span>
        </div>
        <div>
          <span>${this.publicOpinion?.percent_c}%</span>
          <span id="c"></span>
          <span class="text-center">C</span>
        </div>
        <div>
          <span>${this.publicOpinion?.percent_d}%</span>
          <span id="d"></span>
          <span class="text-center">D</span>
        </div>
      </div>`;

    const alert = await this.alertController.create({
      header: this.translate('public-opinion'),
      message: htmlMessage,
      backdropDismiss: false,
      buttons: [this.translate('okay-thank-you')]
    });

    await alert.present();

    setTimeout(() => {
      (document.querySelector('#a') as HTMLElement).style.height = `${this.publicOpinion?.percent_a}%`;
      (document.querySelector('#b') as HTMLElement).style.height = `${this.publicOpinion?.percent_b}%`;
      (document.querySelector('#c') as HTMLElement).style.height = `${this.publicOpinion?.percent_c}%`;
      (document.querySelector('#d') as HTMLElement).style.height = `${this.publicOpinion?.percent_d}%`;
    }, 1000);
  }

  async quizOver(): Promise<void> {
    this.onWrongAnswer = true;

    const htmlMessage: string = `
      <div class="text-center">
          <i class="far fa-frown fa-4x"></i> <br>
          <span>${this.translate('the-correct-answer-was')} <b>${this.selectedAnswer.value}</b></span> <br>
          <span>${this.translate('you-earned-just')} € ${this.currentEarnedValue || 0}</span>
          <br> <br>
          ${this.translate('do-you-want-to-play-again')}
      </div>`;

    const alert = await this.alertController.create({
      message: htmlMessage,
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate('no'),
          handler: () => this.goToHome()
        }, {
          text: this.translate('yes'),
          handler: () => this.resetQuiz()
        }
      ]
    });

    await alert.present();
  }

  async quizFinished(): Promise<void> {
    const htmlMessage: string = `
      <div class="text-center">
        <i class="far fa-smile-wink fa-4x"></i> <br>
        <span>${this.translate('congratulations')}</span> <br> <br>
        <span>${this.translate('you-earned')} € 1 ${this.translate('million')}</span>
        <br> <br>
        ${this.translate('do-you-want-to-play-again')}
      </div>`;

    const alert = await this.alertController.create({
      message: htmlMessage,
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate('no'),
          handler: () => this.goToHome()
        }, {
          text: this.translate('yes'),
          handler: () => this.resetQuiz()
        }
      ]
    });

    await alert.present();
  }

  async leaveQuiz(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate('confirm'),
      message: this.translate('are-you-sure-to-leave-the-quiz'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate('no'),
        }, {
          text: this.translate('yes'),
          handler: () => this.goToHome()
        }
      ]
    });

    await alert.present();
  }

  getCorrectAnwser(): string {
    let options: IOption[] = [];

    options.push(
      { value: 'A', isCorrect: this.question.option_a.isCorrect },
      { value: 'B', isCorrect: this.question.option_b.isCorrect },
      { value: 'C', isCorrect: this.question.option_c.isCorrect },
      { value: 'D', isCorrect: this.question.option_d.isCorrect }
    )

    const foundOption = options.find(x => x.isCorrect === true);

    return foundOption.value;
  }

  resetQuiz(): void {
    this.clear();

    this.ranksCount = 1;

    this.getQuestions();
  }

  optionBackgroundColor(option: string, color: string): void {
    (document.querySelector(`#option_${option.toLowerCase()}`) as HTMLElement).style.backgroundColor = color;
  }

  clear(): void {
    this.usedChangingQuestion = false;
    this.usedHelpBy50x50 = false;
    this.usedHelpByPhone = false;
    this.usedHelpByPublic = false;
    this.onWrongAnswer = false;
  }

  goToHome(): void {
    this.backSubscription.unsubscribe();
    this.router.navigate(['home']);
    this.clear();
  }

  translate(key: string): string {
    return this.translateService.instant(key);
  }

  ngOnDestroy(): void {
    this.backSubscription.unsubscribe();
  }
}
