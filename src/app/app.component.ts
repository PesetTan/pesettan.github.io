import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapComponent } from './map/map.component';
import { RsvpComponent } from './rsvp/rsvp.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'web';

  constructor(public dialog: MatDialog) {}
  
  openRsvp(): void {
    this.dialog.open(RsvpComponent);
  }

  openMap(): void {
    this.dialog.open(MapComponent);
  }
}
