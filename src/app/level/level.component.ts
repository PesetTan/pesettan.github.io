import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [ MatIconModule ],
  templateUrl: './level.component.html',
  styleUrl: './level.component.css'
})
export class LevelComponent {

@Input() level = 0;

}
