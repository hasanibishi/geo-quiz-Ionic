import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: 'info.page.html',
  styleUrls: ['info.page.scss'],
})
export class InfoPage {

  @Input() btnClose: () => void;

  closePopover() {
    this.btnClose();
  }
}
