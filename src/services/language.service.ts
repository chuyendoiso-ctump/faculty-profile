
import { Injectable, signal } from '@angular/core';

export type Language = 'vi' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  readonly currentLang = signal<Language>(this.getInitialLanguage());

  private getInitialLanguage(): Language {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam === 'en' || langParam === 'vi') {
        return langParam as Language;
      }
    } catch (e) {
      // Ignore errors if window is not available
    }
    return 'vi'; // Default to Vietnamese
  }

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'vi' ? 'en' : 'vi');
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }
}
