import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FusionAuthService, UserInfo } from '@fusionauth/angular-sdk';
import { Subscription } from 'rxjs';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnDestroy {
  private fusionAuthService = inject(FusionAuthService);
  private subscription?: Subscription;

  readonly isLoggedIn = signal(this.fusionAuthService.isLoggedIn());
  readonly userInfo = signal<UserInfo | null>(null);
  readonly isGettingUserInfo = signal(false);
  readonly email = computed(() => this.userInfo()?.email);

  constructor() {
    this.subscription = this.fusionAuthService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn.set(loggedIn);
      if (loggedIn && !this.userInfo()) {
        this.fetchUserInfo();
      }
    });
  }

  private fetchUserInfo(): void {
    this.isGettingUserInfo.set(true);
    this.fusionAuthService
      .getUserInfoObservable()
      .subscribe({
        next: (userInfo) => {
          this.userInfo.set(userInfo);
          this.isGettingUserInfo.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isGettingUserInfo.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout(): void {
    this.fusionAuthService.logout();
  }

  login(): void {
    this.fusionAuthService.startLogin();
  }
}
