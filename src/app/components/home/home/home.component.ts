import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  minDate = '2021-05-05';
  maxDate = '2022-05-05';
  dateSelected(e) {
    console.log('SELECTED DATE->', e);
  }
}
