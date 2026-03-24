
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacultyProfile } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-faculty-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-100 min-h-screen pb-12 font-sans text-slate-800">
      
      <!-- 1. BACK BUTTON STRIP -->
      <div class="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div class="container mx-auto px-4 py-3">
          <button 
            (click)="goBack.emit()" 
            class="flex items-center gap-2 text-gray-600 hover:text-ctump-blue font-bold uppercase text-sm tracking-wide transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            @if (lang() === 'vi') { Quay lại danh sách } @else { Back to Directory }
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT CONTAINER -->
      <div class="container mx-auto px-4 max-w-7xl">
        
        <!-- 2. CUSTOM HEADER (University Name) -->
        <div class="flex flex-col md:flex-row items-start md:items-end justify-between border-b-4 border-ctump-blue mb-8 pb-2 gap-4">
          <div class="flex flex-col">
            <div class="bg-ctump-blue text-white px-6 py-1 text-xs font-bold uppercase tracking-widest rounded-t-lg w-fit">
              {{ lang() === 'vi' ? faculty().department : faculty().departmentEn }}
            </div>
            <div class="text-ctump-blue text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mt-1">
              @if (lang() === 'vi') { CHUYÊN GIA } @else { OUR EXPERT }
            </div>
          </div>
          <div class="text-right hidden md:block">
            <h2 class="text-xl font-bold text-red-600">
              {{ lang() === 'vi' ? faculty().department : faculty().departmentEn }}
            </h2>
            <p class="text-sm text-red-500 uppercase tracking-wide font-bold">
              @if (lang() === 'vi') { Trường Đại học Y Dược Cần Thơ } @else { Can Tho University of Medicine and Pharmacy }
            </p>
          </div>
        </div>

        <!-- 3. LAYOUT REDESIGN -->
        <div class="flex flex-col gap-8">

          <!-- === SECTION A: PROFILE IDENTITY & BIOGRAPHY (Wide Layout) === -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative isolate overflow-hidden">
            
            <!-- Watermark Background Image (Top Right) -->
            <!-- Adjusted size to h-1/4 (25% height) as requested -->
            <img 
              src="https://lh3.googleusercontent.com/d/18OEcwHjYKEtb4iobQKEy_ymwaidXnTBx" 
              alt="" 
              class="absolute top-0 right-0 h-1/4 w-auto opacity-20 pointer-events-none -z-10 m-4"
            >

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              
              <!-- A1. Portrait Photo (3 cols) -->
              <div class="lg:col-span-3">
                <div class="bg-gray-50 p-1.5 shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500 border border-gray-200">
                  <img 
                    [src]="faculty().profilePicture" 
                    class="w-full aspect-[3/4] object-cover" 
                    alt="Portrait"
                    referrerpolicy="no-referrer"
                  >
                </div>
              </div>

              <!-- A2. Name, Contact & Bio (9 cols) -->
              <div class="lg:col-span-9 flex flex-col">
                
                <!-- Name & Title -->
                <div class="border-b border-gray-100 pb-4 mb-4">
                  <!-- Updated: Removed 'uppercase' class from h1, moved to name span -->
                   <h1 class="text-3xl lg:text-4xl font-black text-ctump-blue leading-tight drop-shadow-sm mb-2">
                    {{ lang() === 'vi' ? faculty().academicTitle : faculty().academicTitleEn }} 
                    <span class="uppercase">{{ faculty().fullName }}</span>
                  </h1>
                  
                  <!-- Contact Info Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm font-semibold text-[#c05016]">
                    <p class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <a [href]="'mailto:' + faculty().email" class="hover:underline">{{ faculty().email }}</a>
                    </p>
                    
                    @if (faculty().orcid) {
                      <p class="flex items-center gap-2">
                        <span class="font-bold text-gray-600 w-4">ID</span>
                        <a [href]="'https://orcid.org/' + faculty().orcid" target="_blank" class="hover:underline">ORCID: {{ faculty().orcid }}</a>
                      </p>
                    }
                    
                    @if (faculty().researchGate) {
                       <p class="flex items-center gap-2">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                         <a [href]="faculty().researchGate" target="_blank" class="hover:underline">Research Gate Profile</a>
                       </p>
                    }
                    @if (faculty().googleScholar) {
                       <p class="flex items-center gap-2">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                         <a [href]="faculty().googleScholar" target="_blank" class="hover:underline">Google Scholar Profile</a>
                       </p>
                    }
                  </div>
                </div>

                <!-- Biography Box (Wide) -->
                <div class="flex-grow flex flex-col">
                  <div class="bg-ctump-blue text-white px-4 py-1.5 text-sm font-bold uppercase rounded-t-md w-fit shadow-sm">
                     @if (lang() === 'vi') { Tiểu sử } @else { Biography }
                  </div>
                  <div class="bg-gray-50 border border-gray-300 p-5 text-sm text-gray-700 text-justify leading-relaxed shadow-inner rounded-b-md rounded-tr-md h-full bg-opacity-90">
                     <p class="whitespace-pre-line">
                       @if (lang() === 'vi') { {{ faculty().bioVi }} } @else { {{ faculty().bioEn }} }
                     </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- === SECTION B: SCIENTIFIC DETAILS (2 Columns) === -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <!-- COL 1: EXPERTISE, MODEL, INTERESTS (Left - approx 42%) -->
            <div class="lg:col-span-5 flex flex-col gap-6">
               
               <!-- 1. Area of Expertise -->
               <!-- Added break-words and handling for text overflow -->
               <div class="bg-ctump-blue text-white rounded-2xl p-6 shadow-lg relative overflow-hidden shrink-0">
                  <!-- Decorative Circle -->
                  <div class="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full pointer-events-none"></div>
                  
                  <h3 class="text-lg font-bold uppercase border-b border-white/30 pb-2 mb-3 inline-block relative z-10">
                    @if (lang() === 'vi') { Lĩnh vực chuyên môn } @else { Area of Expertise }
                  </h3>
                  
                  <div class="font-medium text-base leading-relaxed whitespace-pre-wrap break-words text-justify relative z-10">
                     @if (lang() === 'vi') { {{ faculty().expertiseVi }} } @else { {{ faculty().expertiseEn }} }
                  </div>
               </div>

               <!-- 2. Scientific Image -->
               @if (faculty().interestPicture) {
                  <div class="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center shadow-sm">
                    <h3 class="text-ctump-blue font-bold uppercase text-sm mb-3 self-start">
                      @if (lang() === 'vi') { HÌNH ẢNH KHOA HỌC } @else { SCIENTIFIC IMAGE }
                    </h3>
                    <img 
                        [src]="faculty().interestPicture" 
                        class="w-full h-auto object-contain max-h-[500px] shadow-sm rounded-sm"
                        alt="Scientific Model"
                        referrerpolicy="no-referrer"
                    >
                  </div>
               }

               <!-- 3. Research Interests -->
               <div class="border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm bg-white">
                 <div class="bg-blue-100 text-ctump-blue py-2 px-4 text-center font-bold uppercase tracking-wide text-sm">
                   @if (lang() === 'vi') { Định hướng nghiên cứu } @else { Research Interest }
                 </div>
                 <div class="p-4 bg-blue-50/50">
                    <ul class="space-y-2">
                      @for (item of getInterestsList(); track item) {
                        <li class="flex items-start gap-2 text-sm font-bold text-gray-700">
                           <span class="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                           <span class="break-words">{{ item }}</span>
                        </li>
                      } @empty {
                         <li class="italic text-gray-400 text-sm">Updating...</li>
                      }
                    </ul>
                 </div>
               </div>
            </div>

            <!-- COL 2: ARTICLES (Right - approx 58%) -->
            <div class="lg:col-span-7">
               <div class="border-2 border-ctump-blue rounded-xl overflow-hidden shadow-sm bg-white h-full flex flex-col relative isolate">
                
                <!-- Header -->
                <div class="bg-ctump-blue text-white py-3 px-6 text-center font-bold uppercase tracking-wide text-base shadow-sm z-20 relative">
                   @if (lang() === 'vi') { Công bố khoa học tiêu biểu } @else { Selected Articles }
                </div>

                <!-- Watermark Background Image (Bottom Right) -->
                <!-- Adjusted size to h-1/4 (25% height) as requested -->
                <img 
                  src="https://lh3.googleusercontent.com/d/1ro13o9WmEoYRDy8VWjD6H06XVD2a0C1Q" 
                  alt="" 
                  class="absolute bottom-0 right-0 h-1/4 w-auto opacity-20 pointer-events-none -z-10 m-2"
                >

                <!-- List Content -->
                <div class="p-6 bg-white/50 flex-grow z-10">
                  <ul class="space-y-4">
                    @for (article of faculty().articles; track $index) {
                      <li class="text-sm text-gray-800 leading-relaxed flex gap-3 text-justify border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <span class="text-ctump-blue font-bold text-xl leading-none mt-0.5">•</span>
                        <span class="break-words">{{ article }}</span>
                      </li>
                    } @empty {
                       <li class="italic text-gray-400 text-sm text-center py-10">Updating data...</li>
                    }
                  </ul>
                </div>
              </div>
            </div>

          </div> <!-- End Section B -->

        </div> <!-- End Layout -->
      </div>
    </div>
  `
})
export class FacultyDetailComponent {
  faculty = input.required<FacultyProfile>();
  goBack = output<void>();
  
  langService = inject(LanguageService);
  lang = this.langService.currentLang;

  getInterestsList() {
    const raw = this.lang() === 'vi' 
      ? this.faculty().researchInterestVi 
      : this.faculty().researchInterestEn;
    
    if (!raw) return [];

    // 1. Split by newline ONLY.
    // 2. Map: Remove leading bullet chars (-, +, *, •, en dash, em dash)
    // 3. Keep internal hyphens intact.
    return raw.split(/\r?\n/)
      .map(s => s.trim())
      .map(s => s.replace(/^[\s\-\+\*\•\–\—]+/, '').trim())
      .filter(s => s.length > 0);
  }
}
