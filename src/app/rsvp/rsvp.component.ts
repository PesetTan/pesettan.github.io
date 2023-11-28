import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html'
})
export class RsvpComponent implements OnInit {
  guest = {
    name: new FormControl('', Validators.required),
    oneMore: false
  }

  constructor() { }

  ngOnInit(): void {
  }

  onOneMore(): void {
    this.guest.oneMore = !this.guest.oneMore;
  }
}
