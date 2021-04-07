import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  left_input: string = '20';
  right_input: string = '16';

  left_bbl_size = 80;
  right_bbl_size = 80;
  max: string = 'Consumption';
  min: string = 'Generation';
  percentage: any = 100;
  minSize: number; // Both bubbles parents boxes adgust width to minimum bubble size to maintain close positions
  righ_bbl_top = false; // Right bubble adds removes top value when left bubble is smaller

  ngOnInit() {
    this.toggle();
  }

  toggle() {
    const left_input = parseFloat(this.left_input);
    const right_input = parseFloat(this.right_input);
    const percentage =
      Math.min(left_input, right_input) / Math.max(left_input, right_input);
    if (left_input > right_input) {
      this.right_bbl_size = Math.round(percentage * 80);
      this.left_bbl_size = 80;
      this.max = 'Consumption';
      this.min = 'Generation';
      this.minSize = this.right_bbl_size;
      this.righ_bbl_top = false;
    }
    if (left_input < right_input) {
      this.left_bbl_size = Math.round(percentage * 80);
      this.right_bbl_size = 80;
      this.min = 'Consumption';
      this.max = 'Generation';
      this.minSize = this.left_bbl_size;
      this.righ_bbl_top = true;
    }
    if (left_input == right_input) {
      this.left_bbl_size = 80;
      this.right_bbl_size = 80;
      this.max = 'Consumption';
      this.min = 'Generation';
      this.minSize = 80;
      this.righ_bbl_top = false;
    }
    this.percentage = (percentage * 100).toFixed();
    console.log(this.left_bbl_size, this.right_bbl_size);
  }
}
