import { Component } from '@angular/core';
import { LevelComponent } from "../level/level.component";

@Component({
    selector: 'app-skills',
    standalone: true,
    templateUrl: './skills.component.html',
    imports: [LevelComponent]
})
export class SkillsComponent {

}
