import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  bub1: string;
  bub2: string;

  bbl1 = 150;
  bbl2 = 150;
  max: string = 'Consumption';
  min: string = 'Generation';
  percentage: any = 100;

  toggle() {
    const bub1 = parseFloat(this.bub1);
    const bub2 = parseFloat(this.bub2);
    const percentage = Math.min(bub1, bub2) / Math.max(bub1, bub2);
    if (bub1 > bub2) {
      this.bbl2 = Math.round(percentage * 150);
      this.bbl1 = 150;
      this.max = 'Consumption';
      this.min = 'Generation';
    }
    if (bub1 < bub2) {
      this.bbl1 = Math.round(percentage * 150);
      this.bbl2 = 150;
      this.min = 'Consumption';
      this.max = 'Generation';
    }
    if (bub1 == bub2) {
      this.bbl1 = 150;
      this.bbl2 = 150;
      this.max = 'Consumption';
      this.min = 'Generation';
    }
    this.percentage = (percentage * 100).toFixed();
    console.log(this.bbl1, this.bbl2);
  }
}
