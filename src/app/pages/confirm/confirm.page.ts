import { Component, Input } from '@angular/core';
import { IConfirm } from 'src/app/models/confirm.model';

@Component({
  selector: 'app-confirm',
  templateUrl: 'confirm.page.html',
  styleUrls: ['confirm.page.scss'],
})
export class ConfirmPage {

  @Input() params: IConfirm;

  confirm() {
    this.params.btnConfirm();
  }

  close() {
    this.params.btnClose();
  }
}
