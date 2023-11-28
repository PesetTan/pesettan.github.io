import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapComponent } from './map/map.component';
import { RsvpComponent } from './rsvp/rsvp.component';
import { GuestsComponent } from './guests/guests.component';
import { GuestsService } from './guests.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegistryComponent } from './registry/registry.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private guestService: GuestsService) {}
  
  openRsvp(): void {
    const res = this.dialog.open(RsvpComponent);
    res.afterClosed().subscribe(r => {
      console.log('response', r)
      this.guestService.addGuests(r.name.value ?? '', r.oneMore ? 1 : 0).subscribe(res => {
        this.snackBar.open('See you Saturday!', 'OK');
      })
    });
  }

  openMap(): void {
    this.dialog.open(MapComponent);
  }

  openGuestList(): void {
    this.dialog.open(GuestsComponent);
  }

  openRegistry(): void {
    this.dialog.open(RegistryComponent);
  }
}
