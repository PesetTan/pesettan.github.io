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
    this.dialog.open(RsvpComponent);
  }

  openMap(): void {
    this.dialog.open(MapComponent);
  }

  openGuestList(): void {
    const res = this.dialog.open(GuestsComponent)
    res.afterClosed().subscribe(r => {
      this.guestService.addGuests(r.controls.name.value ?? '', r.controls.oneMore ? 1 : 0)
    })
  }
}
