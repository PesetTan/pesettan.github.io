import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import { MapComponent } from './map/map.component';
import { RsvpComponent } from './rsvp/rsvp.component';
import { GuestsComponent } from './guests/guests.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    RsvpComponent,
    GuestsComponent
  ],
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
