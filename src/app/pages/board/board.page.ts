import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AudioType } from 'src/app/models/audio.enum';
import { IOption } from 'src/app/models/option.model';
import { IHallAssistance } from 'src/app/models/hall-assistance.model';
import { IQuestion } from 'src/app/models/question.model';
import { IRank } from 'src/app/models/rank.model';
import { DataService } from 'src/app/services/data.service';
import { OptionColor } from 'src/app/models/option-color.enum';
import { ConfirmPage } from '../confirm/confirm.page';
import { IConfirm } from 'src/app/models/confirm.model';

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
  hallAssistance: IHallAssistance;
  selectedAnswer: IOption;

  usedChangingQuestion: boolean = false;
  usedHelpBy50x50: boolean = false;
  usedHelpByPhone: boolean = false;
  usedHelpByHall: boolean = false;

  onWrongAnswer: boolean = false;

  AUDIO_TYPE = AudioType;
  OPTION_COLOR = OptionColor;

  backButtonSubscription: Subscription;

  backButtonOnDelaySubscription: Subscription;

  constructor(
    private dataService: DataService,
    private router: Router,
    private toastController: ToastController,
    private platform: Platform,
    private translateService: TranslateService,
    private popoverController: PopoverController
  ) {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(1, async () => {
      const element = await this.popoverController.getTop();

      if (element) {
        if (this.onWrongAnswer) {
          this.goToHome();
          element.dismiss();
        }
        else {
          element.dismiss();
          this.clearInjectedStyle();
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
    this.dataService.playAudio(this.AUDIO_TYPE.FINAL_ANSWER);

    const params: IConfirm = {
      btnClose: () => {
        popover.dismiss();
        this.clearInjectedStyle();
      },
      btnConfirm: () => {
        popover.dismiss();
        this.checkAnswer();
      },
      header: this.translate('confirm'),
      message: this.translate('is-this-your-final-answer'),
      buttonLabels: {
        btnClose: this.translate('no'),
        btnConfirm: this.translate('yes')
      }
    }

    const popover = await this.popoverController.create({
      component: ConfirmPage,
      componentProps: {
        params: params
      },
      backdropDismiss: false
    });

    await popover.present();
  }

  getQuestions(): void {
    this.clearInjectedStyle();

    this.ranks = this.dataService.getData().sort((a, b) => b.rank - a.rank);

    const fQuestion = this.ranks.find(x => x.rank === this.ranksCount)?.questions;

    this.currentEarnedValue = this.ranks.find(x => x.rank === this.ranksCount - 1)?.value;

    if (fQuestion)
      this.question = fQuestion[Math.floor(Math.random() * fQuestion?.length)];
  }

  changeQuestion(): void {
    if (!this.usedChangingQuestion) {

      this.dataService.playAudio(this.AUDIO_TYPE.DIVIDE);

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

      this.dataService.playAudio(this.AUDIO_TYPE.DIVIDE);

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

  useHallAssistance(): void {
    if (!this.usedHelpByHall) {

      this.dataService.playAudio(this.AUDIO_TYPE.DIVIDE);

      const a = this.question.option_a.isCorrect;
      const b = this.question.option_b.isCorrect;
      const c = this.question.option_c.isCorrect;
      const d = this.question.option_d.isCorrect;

      if (a) {
        this.hallAssistance = {
          percent_a: 80,
          percent_b: 5,
          percent_c: 5,
          percent_d: 10,
        };
      }
      else if (b) {
        this.hallAssistance = {
          percent_a: 5,
          percent_b: 80,
          percent_c: 5,
          percent_d: 10,
        };
      }
      else if (c) {
        this.hallAssistance = {
          percent_a: 5,
          percent_b: 5,
          percent_c: 80,
          percent_d: 10,
        };
      }
      else if (d) {
        this.hallAssistance = {
          percent_a: 10,
          percent_b: 5,
          percent_c: 5,
          percent_d: 80,
        };
      }

      this.helpByHallAssistance();

      this.usedHelpByHall = true
    }
  }

  usePhoneCall(): void {
    if (!this.usedHelpByPhone) {

      this.dataService.playAudio(this.AUDIO_TYPE.DIVIDE);

      this.selectedAnswer = {
        value: this.getCorrectAnwser()
      }

      this.helpByPhone();

      this.usedHelpByPhone = true
    }
  }

  selectedOption(option: IOption, optionKey: string): void {
    this.optionBackgroundColor(optionKey, this.OPTION_COLOR.YELOW);

    this.selectedAnswer = {
      value: optionKey,
      isCorrect: option.isCorrect
    };

    this.checkQuestion();
  }

  async checkAnswer(): Promise<void> {

    if (this.selectedAnswer.isCorrect) {

      this.lockScreen(true);

      this.backButtonOnDelaySubscription = this.platform.backButton.subscribeWithPriority(9999, () => { });

      this.dataService.playAudio(this.AUDIO_TYPE.WIN);

      this.optionBackgroundColor(this.getCorrectAnwser(), this.OPTION_COLOR.GREEN);

      const toast = await this.toastController.create({
        message: this.translate('correct-answer'),
        duration: 2000,
        color: 'light',
        cssClass: 'text-center',
        position: 'top'
      });

      toast.present();

      await toast.onDidDismiss();

      this.ranksCount++;

      this.optionBackgroundColor(this.getCorrectAnwser(), null);

      if (this.ranksCount === 16) {
        await this.quizFinished();
      }

      else {
        this.getQuestions();
      }
    }

    else {
      this.lockScreen(true);

      this.backButtonOnDelaySubscription = this.platform.backButton.subscribeWithPriority(9999, () => { });

      this.dataService.playAudio(this.AUDIO_TYPE.LOSE);

      this.optionBackgroundColor(this.getCorrectAnwser(), this.OPTION_COLOR.GREEN);

      this.selectedAnswer = {
        value: this.getCorrectAnwser()
      }

      setTimeout(() => {
        this.quizOver();
      }, 3000);
    }
  }

  async helpByPhone(): Promise<void> {
    const params: IConfirm = {
      btnClose: () => {
        popover.dismiss();
      },
      header: `${this.translate('calling')}...`,
      message: `${this.translate('your-friend-says')}: ${this.translate('i-think-the-correct-answer-is')} ${this.selectedAnswer.value}`,
      buttonLabels: {
        btnClose: this.translate('okay-thank-you')
      }
    }

    const popover = await this.popoverController.create({
      component: ConfirmPage,
      componentProps: {
        params: params
      },
      backdropDismiss: false
    });

    await popover.present();
  }

  async helpByHallAssistance(): Promise<void> {
    const htmlMessage: string = `
      <div class="helpByHallAssistance">
        <div>
          <span>${this.hallAssistance?.percent_a}%</span>
          <span id="a" style="height: ${this.hallAssistance?.percent_a}%"></span>
          <span class="text-center">A</span>
        </div>
        <div>
          <span>${this.hallAssistance?.percent_b}%</span>
          <span id="b" style="height: ${this.hallAssistance?.percent_b}%"></span>
          <span class="text-center">B</span>
        </div>
        <div>
          <span>${this.hallAssistance?.percent_c}%</span>
          <span id="c" style="height: ${this.hallAssistance?.percent_c}%"></span>
          <span class="text-center">C</span>
        </div>
        <div>
          <span>${this.hallAssistance?.percent_d}%</span>
          <span id="d" style="height: ${this.hallAssistance?.percent_d}%"></span>
          <span class="text-center">D</span>
        </div>
      </div>`;

    const params: IConfirm = {
      btnClose: () => {
        popover.dismiss();
      },
      header: this.translate('hall-assistance'),
      message: '',
      htmlTemplate: htmlMessage,
      buttonLabels: {
        btnClose: this.translate('okay-thank-you')
      }
    }

    const popover = await this.popoverController.create({
      component: ConfirmPage,
      componentProps: {
        params: params
      },
      backdropDismiss: false
    });

    await popover.present();
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

    const params: IConfirm = {
      btnClose: () => {
        popover.dismiss();
        this.goToHome();
      },
      btnConfirm: () => {
        popover.dismiss();
        this.resetQuiz()
      },
      header: '',
      message: '',
      htmlTemplate: htmlMessage,
      buttonLabels: {
        btnClose: this.translate('no'),
        btnConfirm: this.translate('yes')
      }
    }

    const popover = await this.popoverController.create({
      component: ConfirmPage,
      componentProps: {
        params: params
      },
      backdropDismiss: false
    });

    await popover.present();
  }

  async quizFinished(): Promise<void> {

    this.dataService.playAudio(this.AUDIO_TYPE.FINISHED);

    const htmlMessage: string = `
      <div class="text-center">
        <i class="far fa-smile-wink fa-4x"></i> <br>
        <span>${this.translate('congratulations')}</span> <br>
        <span>${this.translate('you-earned')} € 1 ${this.translate('million')}</span>
        <br> <br>
        ${this.translate('do-you-want-to-play-again')}
      </div>`;

    const params: IConfirm = {
      btnClose: () => {
        popover.dismiss();
        this.goToHome();
      },
      btnConfirm: () => {
        popover.dismiss();
        this.resetQuiz()
      },
      header: '',
      message: '',
      htmlTemplate: htmlMessage,
      buttonLabels: {
        btnClose: this.translate('no'),
        btnConfirm: this.translate('yes')
      }
    }

    const popover = await this.popoverController.create({
      component: ConfirmPage,
      componentProps: {
        params: params
      },
      backdropDismiss: false
    });

    await popover.present();
  }

  async leaveQuiz(): Promise<void> {

    const params: IConfirm = {
      btnClose: () => {
        popover.dismiss();
      },
      btnConfirm: () => {
        popover.dismiss();
        this.goToHome();
      },
      header: this.translate('confirm'),
      message: this.translate('are-you-sure-to-leave-the-quiz'),
      buttonLabels: {
        btnClose: this.translate('no'),
        btnConfirm: this.translate('yes')
      }
    }

    const popover = await this.popoverController.create({
      component: ConfirmPage,
      componentProps: {
        params: params
      },
      backdropDismiss: false
    });

    await popover.present();
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
    this.usedHelpByHall = false;
    this.onWrongAnswer = false;

    if (this.backButtonSubscription)
      this.backButtonSubscription.unsubscribe();

    if (this.backButtonOnDelaySubscription)
      this.backButtonOnDelaySubscription.unsubscribe();
  }

  clearInjectedStyle(): void {
    (document.querySelector('#option_a') as HTMLElement).style.backgroundColor = null;
    (document.querySelector('#option_b') as HTMLElement).style.backgroundColor = null;
    (document.querySelector('#option_c') as HTMLElement).style.backgroundColor = null;
    (document.querySelector('#option_d') as HTMLElement).style.backgroundColor = null;

    this.lockScreen(false);

    if (this.backButtonOnDelaySubscription)
      this.backButtonOnDelaySubscription.unsubscribe();
  }

  lockScreen(status: boolean) {
    (document.querySelector('.board-content') as HTMLElement).style.pointerEvents = status ? 'none' : 'all';
  }

  goToHome(): void {
    this.router.navigate(['home']);
    this.clear();
    this.clearInjectedStyle();
  }

  translate(key: string): string {
    return this.translateService.instant(key);
  }

  ngOnDestroy(): void {
    this.clear();
  }
}
