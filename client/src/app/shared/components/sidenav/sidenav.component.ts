import { Subreddit } from '../../../../../../models/Subreddit';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidenavMenuItemComponent } from './sidenav-menu-item/sidenav-menu-item.component';
import { SidenavCommunityItemComponent } from './sidenav-community-item/sidenav-community-item.component';
import { ProfileService } from '../../services/profile/profile.service';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    RouterModule,
    SidenavMenuItemComponent,
    SidenavCommunityItemComponent,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent implements OnInit {
  profileService = inject(ProfileService);
  // subreddits$: Observable<Subreddit[]>;
  subreddits: Subreddit[] = [];

  // constructor() {
  //   this.subreddits$ = this.profileService.getUserSubscribedSubreddits();
  // }

  async ngOnInit(): Promise<void> {
    this.subreddits = await firstValueFrom(
      this.profileService.getUserSubscribedSubreddits()
    );

    this.sortSubreddits();
  }

  toggleFavorite(event: { id: string; currentlyFavorited: boolean }) {
    const i = this.subreddits.findIndex(
      (subreddit) => subreddit.id === event.id
    );
    this.subreddits[i].favorited = !event.currentlyFavorited;
    this.sortSubreddits();
  }

  sortSubreddits() {
    this.subreddits = this.subreddits.sort((a, b) => {
      if (a.favorited !== b.favorited) {
        return a.favorited ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });
  }
}
