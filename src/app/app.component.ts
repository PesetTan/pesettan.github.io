import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapComponent } from './map/map.component';
import { RsvpComponent } from './rsvp/rsvp.component';
import { GuestsComponent } from './guests/guests.component';
import { GuestsService } from './guests.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private dialog: MatDialog,
    private guestService: GuestsService) {}
  
  openRsvp(): void {
    const res = this.dialog.open(RsvpComponent);
    res.afterClosed().subscribe(r => {
      console.log('response', r)
      this.guestService.addGuests(r.name.value ?? '', r.oneMore ? 1 : 0)
    })
  }

  openMap(): void {
    this.dialog.open(MapComponent);
  }

  openGuestList(): void {
    this.dialog.open(GuestsComponent);
  }
}
