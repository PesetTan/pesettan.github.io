import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GuestsService } from '../guests.service';

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html'
})
export class RsvpComponent implements OnInit {
  guest = new FormGroup({
    name: new FormControl('', Validators.required),
    oneMore: new FormControl(false)
  })

  constructor() { }

  ngOnInit(): void {
  }
}
