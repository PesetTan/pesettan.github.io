import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { ExperienceComponent } from "./experience/experience.component";
import { ContactComponent } from "./contact/contact.component";
import { EducationComponent } from "./education/education.component";
import { SkillsComponent } from "./skills/skills.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [RouterOutlet, HeaderComponent, ExperienceComponent, ContactComponent, EducationComponent, SkillsComponent]
})
export class AppComponent {
  title = 'resume';
}
