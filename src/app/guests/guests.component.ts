import { Component, OnInit } from '@angular/core';
import { Guest, GuestsService } from '../guests.service';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html'
})
export class GuestsComponent implements OnInit {

  guests : Guest[] = [];
  total : number = 0;

  constructor(private guestService: GuestsService) { }

  ngOnInit(): void {
    this.guestService.getGuests().subscribe( g => {
      this.guests = g
      g.forEach(guest => {
        this.total += 1
        this.total += +guest.additional
      })
    });
  }

}
