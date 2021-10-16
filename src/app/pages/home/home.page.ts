import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ILanguage } from 'src/app/models/language.model';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { AudioType } from 'src/app/models/audio.enum';
import { DataService } from 'src/app/services/data.service';

const LNG_KEY: string = 'LNG_KEY';

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

  AUDIO_TYPE = AudioType;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private platform: Platform,
    private storage: Storage,
    private dataService: DataService
  ) {
    this.backSubscription = this.platform.backButton.subscribeWithPriority(0, () => App.exitApp());
  }

  async ngOnInit() {
    await this.storage.create();

    const language: string = await this.storage.get(LNG_KEY) ?? 'al';

    this.translateService.use(language);
    this.selectedLanguage = language;
  }

  start() {
    this.router.navigate(['board']);
  }

  setLanguage(key: string) {
    this.translateService.use(key);
    this.selectedLanguage = key;
    this.storage.set(LNG_KEY, key);
    this.dataService.playAudio(this.AUDIO_TYPE.TAP);
  }

  ngOnDestroy() {
    this.backSubscription.unsubscribe();
  }
}
