import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IConfirm } from 'src/app/models/confirm.model';

@Component({
  selector: 'app-confirm',
  templateUrl: 'confirm.page.html',
  styleUrls: ['confirm.page.scss'],
})
export class ConfirmPage {

  @Input() params: IConfirm;

  constructor(
    private domSanitizer: DomSanitizer
  ) { }

  confirm() {
    this.params.btnConfirm();
  }

  close() {
    this.params.btnClose();
  }

  get htmlTemplate() {
    return this.domSanitizer.bypassSecurityTrustHtml(this.params.htmlTemplate);
  }
}
