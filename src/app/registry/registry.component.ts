import { Component } from '@angular/core';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html'
})
export class RegistryComponent {

  openCrateAndBarrel(): void {
    window.location.href = 'https://www.crateandbarrel.com/gift-registry/alyna-tan/r6825473'
  }

  openAmazon(): void {
    window.location.href = 'https://www.amazon.com/baby-reg/ellene-chan-march-2024-newark/2VMVIL6RDGHPU'
  }
}
