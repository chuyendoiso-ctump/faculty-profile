
import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DataService, FacultyProfile } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      
      <!-- BRAND IDENTITY BANNER -->
      <div class="mb-8 rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white">
        <img 
          src="/public/nhandien.png" 
          alt="CTUMP Brand Identity" 
          class="w-full h-auto object-cover max-h-[300px]"
          loading="lazy"
          onerror="this.style.display='none'"
        >
      </div>

      <!-- Search and Filter Section -->
      <form [formGroup]="searchForm" (ngSubmit)="triggerSearch()" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1 h-8 bg-ctump-blue rounded-full"></div>
          <h2 class="text-2xl font-bold text-gray-800">
            @if (lang() === 'vi') { Danh sách Giảng viên } @else { Faculty Directory }
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Search Input -->
          <div class="group">
            <label class="block text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
               @if (lang() === 'vi') { Tên giảng viên } @else { Faculty Name }
            </label>
            <div class="relative">
              <input 
                type="text" 
                formControlName="searchQuery"
                [placeholder]="lang() === 'vi' ? 'Nhập tên...' : 'Enter name...'"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ctump-blue focus:border-ctump-blue focus:outline-none transition-all"
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Department Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              @if (lang() === 'vi') { Đơn vị công tác } @else { Department }
            </label>
            <select 
              formControlName="deptFilter"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ctump-blue focus:border-ctump-blue focus:outline-none transition-all cursor-pointer"
            >
              <option value="">
                @if (lang() === 'vi') { -- Tất cả đơn vị -- } @else { -- All Departments -- }
              </option>
              @for (dept of departments(); track dept.vi) {
                <option [value]="dept.vi">
                  {{ lang() === 'vi' ? dept.vi : dept.en }}
                </option>
              }
            </select>
          </div>

           <!-- Research Interest Filter -->
           <div>
            <label class="block text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              @if (lang() === 'vi') { Định hướng nghiên cứu } @else { Research Interest }
            </label>
            <input 
              type="text" 
              formControlName="interestFilter"
              [placeholder]="lang() === 'vi' ? 'Nhập lĩnh vực...' : 'Enter topic...'"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ctump-blue focus:border-ctump-blue focus:outline-none transition-all"
            >
          </div>
        </div>

        <div class="flex justify-center">
          <button 
            type="submit"
            class="bg-ctump-blue hover:bg-blue-800 text-white font-medium py-2.5 px-8 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            @if (lang() === 'vi') { Tìm kiếm } @else { Search }
          </button>
        </div>
      </form>

      <!-- Faculty Grid -->
      @if (dataService.loading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-ctump-blue"></div>
          <p class="mt-4 text-gray-500 font-medium">Loading data...</p>
        </div>
      } @else if (!hasSearched()) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <p class="text-lg text-center px-4">
            @if (lang() === 'vi') { Vui lòng nhập thông tin và nhấn "Tìm kiếm" để xem danh sách giảng viên. } @else { Please enter search criteria and click "Search" to view the faculty directory. }
          </p>
        </div>
      } @else {
        <div class="flex flex-col gap-6">
          @for (faculty of filteredList(); track faculty.id) {
            <div 
              class="group bg-white rounded-2xl shadow-sm hover:shadow-md hover:border-ctump-blue hover:ring-1 hover:ring-ctump-blue transition-all duration-300 overflow-hidden cursor-pointer flex flex-col sm:flex-row border border-gray-100"
              (click)="selectFaculty.emit(faculty)"
            >
              <!-- Avatar Container -->
              <div class="relative w-full sm:w-48 sm:min-w-[12rem] aspect-[3/4] sm:aspect-auto overflow-hidden bg-gray-100 shrink-0">
                <img 
                  [src]="faculty.profilePicture" 
                  alt="Avatar" 
                  class="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span class="text-white text-sm font-medium">
                     @if (lang() === 'vi') { Xem chi tiết &rarr; } @else { View Profile &rarr; }
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 flex-grow flex flex-col justify-center">
                <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-ctump-blue transition-colors">
                  {{ lang() === 'vi' ? faculty.academicTitle : faculty.academicTitleEn }} 
                  <span class="uppercase">{{ faculty.fullName }}</span>
                </h3>
                
                <p class="text-sm text-gray-600 font-medium mb-3 flex items-center gap-2">
                   <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  {{ lang() === 'vi' ? faculty.department : faculty.departmentEn }}
                </p>

                <p class="text-gray-600 text-sm line-clamp-3 mb-4 text-justify">
                  {{ lang() === 'vi' ? faculty.bioVi : faculty.bioEn }}
                </p>
                
                <div class="mt-auto">
                  <div class="flex flex-wrap gap-2">
                    @let interests = lang() === 'vi' ? faculty.researchInterestViTags : faculty.researchInterestEnTags;
                    @for (tag of interests.slice(0, 4); track tag) {
                      <span class="inline-block bg-blue-50 text-ctump-blue text-xs px-2.5 py-1 rounded-full border border-blue-100 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[100%]">
                        {{ tag }}
                      </span>
                    }
                    @if (interests.length > 4) {
                      <span class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
                        +{{ interests.length - 4 }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @empty {
             <div class="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-lg">
                  @if (lang() === 'vi') { Không tìm thấy kết quả nào. } @else { No results found. }
                </p>
             </div>
          }
        </div>
      }
    </div>
  `
})
export class FacultyListComponent {
  dataService = inject(DataService);
  langService = inject(LanguageService);
  selectFaculty = output<FacultyProfile>();
  
  lang = this.langService.currentLang;
  
  searchForm = new FormGroup({
    searchQuery: new FormControl(this.dataService.searchQuery()),
    deptFilter: new FormControl(this.dataService.deptFilter()),
    interestFilter: new FormControl(this.dataService.interestFilter())
  });

  hasSearched = this.dataService.hasSearched;

  constructor() {
    // Sync form changes to DataService signals
    this.searchForm.valueChanges.subscribe(val => {
      if (val.searchQuery !== undefined && val.searchQuery !== null) {
        this.dataService.searchQuery.set(val.searchQuery);
      }
      if (val.deptFilter !== undefined && val.deptFilter !== null) {
        this.dataService.deptFilter.set(val.deptFilter);
      }
      if (val.interestFilter !== undefined && val.interestFilter !== null) {
        this.dataService.interestFilter.set(val.interestFilter);
      }
    });
  }

  // Extract unique departments for filter dropdown (bilingual)
  departments = computed(() => {
    const list = this.dataService.facultyList();
    const map = new Map<string, string>(); // Use map to ensure unique VI keys

    list.forEach(f => {
      if (f.department) {
        map.set(f.department, f.departmentEn);
      }
    });

    const result = Array.from(map.entries()).map(([vi, en]) => ({ vi, en }));
    // Sort by Vietnamese name
    return result.sort((a, b) => a.vi.localeCompare(b.vi));
  });

  filteredList = computed(() => {
    const list = this.dataService.facultyList();
    const q = this.dataService.searchQuery().toLowerCase();
    const d = this.dataService.deptFilter(); // This holds the Vietnamese Department Name
    const i = this.dataService.interestFilter().toLowerCase();
    const l = this.lang();

    return list.filter(item => {
      const matchName = item.fullName.toLowerCase().includes(q);
      // Filter logic matches against the stored department (which is VI)
      const matchDept = d ? item.department === d : true;
      const matchInterest = l === 'vi' 
        ? item.researchInterestVi.toLowerCase().includes(i) 
        : item.researchInterestEn.toLowerCase().includes(i);
      
      return matchName && matchDept && matchInterest;
    });
  });

  triggerSearch() {
    this.hasSearched.set(true);
  }
}
