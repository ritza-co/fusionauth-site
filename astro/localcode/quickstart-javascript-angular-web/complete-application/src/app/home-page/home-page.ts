import { Component, inject } from '@angular/core';
import { FusionAuthService } from '@fusionauth/angular-sdk';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})
export class HomePage {
  private fusionAuthService = inject(FusionAuthService);

  login() {
    this.fusionAuthService.startLogin();
  }
  register() {
    this.fusionAuthService.startRegistration();
  }
}