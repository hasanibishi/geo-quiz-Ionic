import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ILanguage } from 'src/app/models/language.model';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  selectedLanguage: string;
  languages: ILanguage[] = [
    { key: 'al', imgUrl: 'assets/images/al.jpg' },
    { key: 'en', imgUrl: 'assets/images/en.jpg' }
  ];

  backSubscription: Subscription;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private platform: Platform
  ) {
    const [initLanguage] = this.languages;
    this.translateService.use(initLanguage.key);
    this.selectedLanguage = initLanguage.key;

    this.backSubscription = this.platform.backButton.subscribeWithPriority(0, () => App.exitApp());
  }

  ngOnInit() {

  }

  start() {
    this.router.navigate(['board']);
  }

  setLanguage(key: string) {
    this.translateService.use(key);
    this.selectedLanguage = key;
  }

  ngOnDestroy() {
    this.backSubscription.unsubscribe();
  }
}
