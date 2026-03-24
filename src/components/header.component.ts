
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white shadow-md border-b-4 border-ctump-blue sticky top-0 z-50">
      <div class="container mx-auto px-4 h-20 flex items-center justify-between">
        <!-- Logo Area -->
        <div class="flex items-center space-x-4">
           <img 
             [src]="logoSrc()" 
             (error)="handleImageError()"
             alt="CTUMP Logo" 
             class="h-16 w-auto object-contain drop-shadow-sm"
           >
           
           <div class="hidden md:block">
             <h1 class="text-ctump-blue font-bold text-lg uppercase leading-tight">
               @if (lang() === 'vi') { Trường Đại học Y Dược Cần Thơ } @else { Can Tho University of Medicine and Pharmacy }
             </h1>
             <p class="text-xs text-gray-500 uppercase tracking-widest font-medium">
               @if (lang() === 'vi') { 
                 Trách nhiệm - Chất lượng - Phát triển - Hội nhập 
               } @else { 
                 Responsibility - Quality - Development - Integration 
               }
             </p>
           </div>
        </div>

        <!-- Language Toggle -->
        <div class="flex items-center space-x-2">
           <button 
             class="px-3 py-1 rounded border transition-colors duration-200 text-sm font-semibold"
             [class.bg-ctump-blue]="lang() === 'vi'"
             [class.text-white]="lang() === 'vi'"
             [class.bg-gray-100]="lang() !== 'vi'"
             [class.text-gray-600]="lang() !== 'vi'"
             (click)="setLang('vi')"
           >
             VI
           </button>
           <button 
             class="px-3 py-1 rounded border transition-colors duration-200 text-sm font-semibold"
             [class.bg-ctump-blue]="lang() === 'en'"
             [class.text-white]="lang() === 'en'"
             [class.bg-gray-100]="lang() !== 'en'"
             [class.text-gray-600]="lang() !== 'en'"
             (click)="setLang('en')"
           >
             EN
           </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  langService = inject(LanguageService);
  lang = this.langService.currentLang;

  // Strategy:
  // 1. Try absolute path from root '/public/logo.png' first
  // 2. If fails, fallback to the provided Google Drive Direct Link
  logoSrc = signal('/public/logo.png');
  
  private usingFallback = false;

  setLang(l: 'vi' | 'en') {
    this.langService.setLanguage(l);
  }

  handleImageError() {
    if (!this.usingFallback) {
      console.warn('Local logo failed. Switching to Google Drive fallback.');
      this.usingFallback = true;
      // Converted Google Drive View Link to Direct Image Link
      // ID: 1LLQR-mHfKryaXWvGB8PIlDYxaJGaVq31
      this.logoSrc.set('https://lh3.googleusercontent.com/d/1LLQR-mHfKryaXWvGB8PIlDYxaJGaVq31');
    }
  }
}
