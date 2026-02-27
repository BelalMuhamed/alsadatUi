import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Component,Input, Output, EventEmitter, ViewChild, Renderer2  } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-side-bar-component',
   standalone: true,
  imports: [CommonModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule,RouterModule],
  templateUrl: './side-bar-component.html',
  styleUrl: './side-bar-component.css'
})
export class SideBarComponent {
  
  isOpen = true;
  settingsOpened = false;
  StocksOpened=false;
  hrOpened = false;
  leaveOpen = false;

toggleSettings() {
  this.settingsOpened = !this.settingsOpened;
}
toggleStocks() {
  this.StocksOpened = !this.StocksOpened;
}

  currentTheme: 'light-mode' | 'dark-mode' = 'dark-mode';

  constructor(private renderer: Renderer2) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onOpenedChange(opened: boolean) {
    this.isOpen = opened;
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('theme');
      this.currentTheme = savedTheme === 'light-mode' ? 'light-mode' : 'dark-mode';
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', this.currentTheme);
    }
    this.applyTheme();
  }

  private applyTheme(): void {
  if (typeof document !== 'undefined') {
    const body = document.body;
    this.renderer.removeClass(body, 'light-mode');
    this.renderer.removeClass(body, 'dark-mode');
    this.renderer.addClass(body, this.currentTheme);
  }
}

}
