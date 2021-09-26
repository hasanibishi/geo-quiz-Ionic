import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ILanguage } from 'src/app/models/language.model';

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
    private translateService: TranslateService,
    private router: Router
  ) {
    const [initLanguage] = this.languages;
    this.translateService.use(initLanguage.key);
    this.selectedLanguage = initLanguage.key;
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
}
