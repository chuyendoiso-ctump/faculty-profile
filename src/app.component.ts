
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header.component';
import { FacultyListComponent } from './components/faculty-list.component';
import { FacultyDetailComponent } from './components/faculty-detail.component';
import { FacultyProfile } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FacultyListComponent, FacultyDetailComponent],
  template: `
    <div class="min-h-screen flex flex-col font-sans">
      <app-header />
      
      <main class="flex-grow bg-gray-50">
        @switch (currentView()) {
          @case ('list') {
             <app-faculty-list (selectFaculty)="viewDetail($event)" />
          }
          @case ('detail') {
             @if (selectedFaculty()) {
               <app-faculty-detail 
                 [faculty]="selectedFaculty()!" 
                 (goBack)="goBack()" 
               />
             }
          }
        }
      </main>

    </div>
  `
})
export class AppComponent {
  currentView = signal<'list' | 'detail'>('list');
  selectedFaculty = signal<FacultyProfile | null>(null);

  viewDetail(faculty: FacultyProfile) {
    this.selectedFaculty.set(faculty);
    this.currentView.set('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack() {
    this.selectedFaculty.set(null);
    this.currentView.set('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
