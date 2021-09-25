import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface ILanguage {
  key: string;
  imgUrl: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  selectedLanguage: string;
  languages: ILanguage[] = [
    { key: 'al', imgUrl: 'assets/images/al.jpg' },
    { key: 'en', imgUrl: 'assets/images/en.jpg' }
  ];

  constructor(
    private translateService: TranslateService
  ) {
    const [initLanguage] = this.languages;
    this.translateService.use(initLanguage.key);
    this.selectedLanguage = initLanguage.key;
  }

  ngOnInit() {

  }

  goToBoard() {

  }

  setLanguage(key: string) {
    this.translateService.use(key);
    this.selectedLanguage = key;
  }
}
