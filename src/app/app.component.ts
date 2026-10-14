import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { ExperienceComponent } from "./experience/experience.component";
import { ContactComponent } from "./contact/contact.component";
import { EducationComponent } from "./education/education.component";
import { SkillsComponent } from "./skills/skills.component";
import { RevealDirective } from './reveal.directive';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [HeaderComponent, ExperienceComponent, ContactComponent, EducationComponent, SkillsComponent, RevealDirective]
})
export class AppComponent {
  title = 'resume';
}
