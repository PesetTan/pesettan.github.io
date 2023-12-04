import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html'
})
export class RsvpComponent implements OnInit {
  guest = {
    name: new FormControl('', Validators.required),
    includeAdult: false,
    includeChild: false,
  }

  constructor() { }

  ngOnInit(): void {
  }

  onGuest(): void {
    this.guest.includeAdult = !this.guest.includeAdult;
  }

  onChild(): void {
    this.guest.includeChild = !this.guest.includeChild;
  }
}
