import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html'
})
export class RsvpComponent implements OnInit {
  name = new FormControl('');

  constructor() { }

  ngOnInit(): void {
  }

}
