import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FusionAuthService, UserInfo } from '@fusionauth/angular-sdk';
import { Subscription } from 'rxjs';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {
  private fusionAuthService: FusionAuthService = inject(FusionAuthService);

  isLoggedIn: boolean = false;
  userInfo: UserInfo | null = null;
  isGettingUserInfo: boolean = false;
  subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.fusionAuthService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn && !this.userInfo) {
        this.fetchUserInfo();
      }
    });
  }

  private fetchUserInfo(): void {
    this.fusionAuthService
      .getUserInfoObservable({
        onBegin: () => (this.isGettingUserInfo = true),
        onDone: () => (this.isGettingUserInfo = false),
      })
      .subscribe({
        next: (userInfo) => (this.userInfo = userInfo),
        error: (error) => console.error(error),
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout() {
    this.fusionAuthService.logout();
  }

  login() {
    this.fusionAuthService.startLogin();
  }
}