
import { Injectable, signal } from '@angular/core';

export interface FacultyProfile {
  id: string;
  fullName: string;
  
  // Academic Titles
  academicTitle: string;    // Display Value (Combined W + X + Y)
  academicTitleEn: string;  // English Translation
  
  // Sorting Scores (Internal)
  customOrder: number;  // From Column Z (Highest Priority)
  rankScore: number;    // From W (GS/PGS)
  degreeScore: number;  // From X (TS/ThS)
  specScore: number;    // From Y (BS/DS CKII...)

  department: string;   // Vietnamese Name
  departmentEn: string; // English Name
  email: string;
  orcid?: string;
  researchGate?: string;
  googleScholar?: string;
  profilePicture: string;
  interestPicture?: string;
  
  // Biography
  bioVi: string;
  bioEn: string;
  
  // Expertise
  expertiseVi: string;
  expertiseEn: string;
  
  // Research Interest Strings (Raw)
  researchInterestVi: string;
  researchInterestEn: string;

  // Research Interest Tags (Processed - Array)
  researchInterestViTags: string[];
  researchInterestEnTags: string[];
  
  // Articles
  articles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  readonly facultyList = signal<FacultyProfile[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // Persisted Search State
  readonly searchQuery = signal<string>('');
  readonly deptFilter = signal<string>('');
  readonly interestFilter = signal<string>('');
  readonly hasSearched = signal<boolean>(false);

  constructor() {
    this.fetchData();
  }

  async fetchData() {
    this.loading.set(true);
    try {
      // Google Sheet export link
      const url = 'https://docs.google.com/spreadsheets/d/1Phwg3ODnjxR5CGTqQD3wm6HC-sTHXFglOSN3nkJeoYA/export?format=csv';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const csvText = await response.text();
      const parsedData = this.parseCsvRobust(csvText);
      
      if (parsedData.length > 0) {
        this.facultyList.set(parsedData);
      } else {
        console.warn('Parsed data is empty, loading mock data.');
        this.loadMockData();
      }
    } catch (err) {
      console.error('Error fetching/parsing CSV:', err);
      this.loadMockData();
    } finally {
      this.loading.set(false);
    }
  }

  private convertGoogleDriveUrl(url: string): string {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/(?:\/d\/|id=)([-\w]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return url;
  }

  private cleanResearchTags(text: string, lang: 'vi' | 'en'): string[] {
    if (!text) return [];

    let processed = text
      .replace(/[\n\r]+/g, '|')
      .replace(/•|–|—|\+/g, '|')
      .replace(/(^|\|)\s*\d+[\.\)]/g, '|')
      .replace(/[,;]/g, '|');

    let items = processed.split('|');

    const cleanedItems = items.map(item => {
      let clean = item.trim();
      clean = clean.replace(/^[\-\.\:\s]+/, '');

      if (lang === 'vi') {
        clean = clean.replace(/^(nghiên cứu (về|các)|các vấn đề (về|liên quan)|tìm hiểu|lĩnh vực|chuyên ngành|định hướng)\s+/i, '');
        clean = clean.replace(/^về\s+/i, '');
      } else {
        clean = clean.replace(/^(research (on|in|into|about)|study (of|on)|focus (on|in)|field of|related to)\s+/i, '');
      }

      clean = clean.trim();
      if (clean.length > 0) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      return clean;
    });

    return cleanedItems.filter(item => {
      if (item.length < 3) return false;
      if (item.length > 80) return false; 
      if (/^[^a-zA-Zà-ỹÀ-Ỹ]+$/.test(item)) return false;
      return true;
    });
  }

  private processDepartment(rawDept: string): { vi: string, en: string } {
    let d = rawDept ? rawDept.trim() : '';

    const normalizationMap: Record<string, string> = {
      'Khoa KHCB': 'Khoa Khoa học Cơ bản',
      'Khoa Điều dưỡng & KTYH': 'Khoa Điều dưỡng và Kỹ thuật Y Học',
      'Khoa YTCC': 'Khoa Y tế Công cộng',
      'Khoa YHCT': 'Khoa Y học Cổ Truyền',
      'Phòng ĐT Sau Đại học': 'Phòng Đào tạo Sau Đại học',
      'Khoa RHM': 'Khoa Răng Hàm Mặt'
    };
    
    let vi = normalizationMap[d] || d;

    if (!vi) {
      return { vi: 'Khoa Y', en: 'Faculty of Medicine' };
    }

    const translationMap: Record<string, string> = {
      'Khoa Khoa học Cơ bản': 'Faculty of Basic Sciences',
      'Khoa Điều dưỡng và Kỹ thuật Y Học': 'Faculty of Nursing and Medical Technology',
      'Khoa Y': 'Faculty of Medicine',
      'Khoa Dược': 'Faculty of Pharmacy',
      'Khoa Y tế Công cộng': 'Faculty of Public Health',
      'Khoa Y học Cổ Truyền': 'Faculty of Traditional Medicine',
      'Khoa Răng Hàm Mặt': 'Faculty of Odonto-Stomatology',
      'Phòng Đào tạo Sau Đại học': 'Post-Graduate Training Office'
    };

    let en = translationMap[vi];
    if (!en) {
      en = vi;
    }

    return { vi, en };
  }

  /**
   * Helper to clean prefix like "1 - ", "2 - " from strings
   */
  private cleanPrefix(text: string): string {
    if (!text) return '';
    // Remove "Number" + "hyphen" at start
    return text.replace(/^\d+\s*-\s*/, '').trim();
  }

  /**
   * Calculate Scores based on Keywords
   */
  private getRankScore(text: string): number {
    const t = text.toUpperCase();
    // CRITICAL FIX: Check for "PGS" BEFORE "GS" because "PGS" contains "GS".
    // "PGS" -> 2 points
    if (t.includes('PGS') || t.includes('PHO GIAO SU')) return 2;
    // "GS" -> 3 points
    if (t.includes('GS') || t.includes('GIAO SU')) return 3;
    return 0;
  }

  private getDegreeScore(text: string): number {
    const t = text.toUpperCase();
    if (t.includes('TS') || t.includes('TIEN SI') || t.includes('PHD')) return 3;
    if (t.includes('THS') || t.includes('THAC SI') || t.includes('MSC')) return 2;
    return 0;
  }

  private getSpecScore(text: string): number {
    const t = text.toUpperCase();
    // BS CKII > DS CKII > BS > DS
    if (t.includes('BS') && t.includes('CKII')) return 5;
    if (t.includes('DS') && t.includes('CKII')) return 4;
    if ((t.includes('ĐD') || t.includes('DIEU DUONG')) && t.includes('CKII')) return 4;
    if ((t.includes('XN') || t.includes('XET NGHIEM')) && t.includes('CKII')) return 4;
    if ((t.includes('CĐHA') || t.includes('CHAN DOAN HINH ANH')) && t.includes('CKII')) return 4;

    // Check for "BS" but ensure it's not captured by CKII above (order matters)
    if (t.includes('BS') || t.includes('BAC SI')) return 3;
    if (t.includes('DS') || t.includes('DUOC SI')) return 2;
    if (t.includes('ĐD') || t.includes('DIEU DUONG')) return 2;
    if (t.includes('XN') || t.includes('XET NGHIEM')) return 2;
    if (t.includes('CĐHA') || t.includes('CHAN DOAN HINH ANH')) return 2;
    return 0;
  }

  /**
   * Translate specific terms for English Title
   */
  private translateTerm(term: string): string {
    const t = term.trim();
    if (!t) return '';
    
    // Exact or partial matches
    if (t === 'GS' || t === 'GS.') return 'Prof.';
    if (t === 'PGS' || t === 'PGS.') return 'Assoc. Prof.';
    if (t === 'TS' || t === 'TS.') return 'Ph.D.';
    if (t === 'ThS' || t === 'ThS.') return 'MSc.';
    
    // Complex replacements
    let en = t;
    if (en.includes('PGS')) en = en.replace(/PGS\.?/g, 'Assoc. Prof.');
    if (en.includes('GS')) en = en.replace(/GS\.?/g, 'Prof.');
    if (en.includes('TS')) en = en.replace(/TS\.?/g, 'Ph.D.');
    if (en.includes('ThS')) en = en.replace(/ThS\.?/g, 'MSc.');
    
    // Updated Translations for Specialist Level 2
    if (en.includes('BS CKII')) en = en.replace('BS CKII', 'Second Degree Specialist');
    else if (en.includes('BS')) en = en.replace('BS', 'MD');
    
    if (en.includes('DS CKII')) en = en.replace('DS CKII', 'Second Degree Specialist');
    else if (en.includes('DS')) en = en.replace('DS', 'Pharm');

    if (en.includes('ĐD CKII')) en = en.replace('ĐD CKII', 'Second Degree Specialist');
    else if (en.includes('ĐD')) en = en.replace('ĐD', 'RN');

    if (en.includes('XN CKII')) en = en.replace('XN CKII', 'Second Degree Specialist');
    else if (en.includes('XN')) en = en.replace('XN', 'Lab Tech');

    if (en.includes('CĐHA CKII')) en = en.replace('CĐHA CKII', 'Second Degree Specialist');
    else if (en.includes('CĐHA')) en = en.replace('CĐHA', 'Radiologist');

    return en;
  }

  private parseCsvRobust(text: string): FacultyProfile[] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++; 
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentVal);
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (currentVal || currentRow.length > 0) {
          currentRow.push(currentVal);
        }
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        currentVal += char;
      }
    }
    if (currentRow.length > 0 || currentVal) {
      currentRow.push(currentVal);
      rows.push(currentRow);
    }

    const result: FacultyProfile[] = [];
    
    // Column Indices (0-based)
    const col_B_Avatar = 1;
    const col_C_ORCID = 2;
    const col_D_RG = 3;
    const col_E_GS = 4;
    const col_F_ExpVi = 5;
    const col_G_ExpEn = 6;
    const col_H_BioVi = 7;
    const col_I_BioEn = 8;
    const col_J_IntVi = 9;
    const col_K_IntEn = 10;
    
    const col_L_Art1 = 11;
    const col_M_Name = 12;
    const col_O_Dept = 14;
    
    const col_P_Art2 = 15;
    const col_Q_Art3 = 16;
    const col_R_Art4 = 17;
    const col_S_Art5 = 18;
    
    const col_T_Img = 19; 
    const col_V_Email = 21; 
    
    // Title Columns
    const col_W_Rank = 22; // GS/PGS
    const col_X_Degree = 23; // TS/ThS
    const col_Y_Spec = 24; // BS/DS/CKII
    
    // Custom Order Column
    const col_Z_Order = 25; // Priority

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const get = (idx: number) => (row[idx] ? row[idx].trim() : '');

      const fullName = get(col_M_Name);
      if (!fullName) continue;

      const rawAvatarUrl = get(col_B_Avatar);
      const processedAvatarUrl = this.convertGoogleDriveUrl(rawAvatarUrl) || 'https://picsum.photos/300/400';

      const rawInterestImg = get(col_T_Img);
      const processedInterestImg = this.convertGoogleDriveUrl(rawInterestImg);

      const rawInterestVi = get(col_J_IntVi);
      const rawInterestEn = get(col_K_IntEn);

      // Process Department
      const rawDept = get(col_O_Dept);
      const deptInfo = this.processDepartment(rawDept);

      // Process Academic Titles
      const rawW = get(col_W_Rank);
      const rawX = get(col_X_Degree);
      const rawY = get(col_Y_Spec);

      // Cleaned values (remove prefixes like "1 - ")
      const valW = this.cleanPrefix(rawW);
      const valX = this.cleanPrefix(rawX);
      const valY = this.cleanPrefix(rawY);

      // Scores for Sorting
      const rankScore = this.getRankScore(valW);
      const degreeScore = this.getDegreeScore(valX);
      const specScore = this.getSpecScore(valY);

      // Custom Order from Column Z
      const rawZ = get(col_Z_Order);
      // Default to 0 if empty or NaN.
      const customOrder = rawZ && !isNaN(parseInt(rawZ, 10)) ? parseInt(rawZ, 10) : 0;

      // Construct Display Strings
      // Vietnamese: Join non-empty parts with space
      const fullTitleVi = [valW, valX, valY].filter(s => s !== '').join(' ');
      
      // English: Translate each part and join
      const fullTitleEn = [
        this.translateTerm(valW),
        this.translateTerm(valX),
        this.translateTerm(valY)
      ].filter(s => s !== '').join(' ');

      const rawArticles = [
        get(col_L_Art1),
        get(col_P_Art2),
        get(col_Q_Art3),
        get(col_R_Art4),
        get(col_S_Art5)
      ].filter(a => a.length > 5);

      result.push({
        id: `fac-${i}`,
        fullName: fullName,
        
        academicTitle: fullTitleVi,
        academicTitleEn: fullTitleEn,
        
        customOrder,
        rankScore,
        degreeScore,
        specScore,

        profilePicture: processedAvatarUrl,
        
        department: deptInfo.vi,
        departmentEn: deptInfo.en,
        
        email: get(col_V_Email),
        orcid: get(col_C_ORCID),
        researchGate: get(col_D_RG),
        googleScholar: get(col_E_GS),
        
        bioVi: get(col_H_BioVi), 
        bioEn: get(col_I_BioEn), 
        
        expertiseVi: get(col_F_ExpVi), 
        expertiseEn: get(col_G_ExpEn),
        
        researchInterestVi: rawInterestVi,
        researchInterestEn: rawInterestEn,
        
        researchInterestViTags: this.cleanResearchTags(rawInterestVi, 'vi'),
        researchInterestEnTags: this.cleanResearchTags(rawInterestEn, 'en'),
        
        articles: rawArticles,
        
        interestPicture: processedInterestImg,
      });
    }

    /**
     * UPDATED SORTING LOGIC
     * Priority:
     * 1. Rank (GS > PGS) - Descending
     * 2. Degree (TS > ThS) - Descending
     * 3. Name (Alphabetical)
     */
    result.sort((a, b) => {
      // 1. Rank (GS > PGS)
      if (a.rankScore !== b.rankScore) return b.rankScore - a.rankScore;
      
      // 2. Degree (TS > ThS)
      if (a.degreeScore !== b.degreeScore) return b.degreeScore - a.degreeScore;

      // 3. Name (Alphabetical by last word)
      const nameA = a.fullName.trim().split(/\s+/).pop() || '';
      const nameB = b.fullName.trim().split(/\s+/).pop() || '';
      
      const nameCompare = nameA.localeCompare(nameB, 'vi');
      if (nameCompare !== 0) return nameCompare;

      return a.fullName.localeCompare(b.fullName, 'vi');
    });

    return result;
  }

  private loadMockData() {
    const mocks: FacultyProfile[] = [
      {
        id: '1',
        fullName: 'Nguyễn Văn A',
        academicTitle: 'PGS. TS. DS', 
        academicTitleEn: 'Assoc. Prof. Ph.D. Pharm',
        customOrder: 0,
        rankScore: 2,
        degreeScore: 3,
        specScore: 2,
        department: 'Khoa Dược',
        departmentEn: 'Faculty of Pharmacy',
        email: 'nva@ctump.edu.vn',
        orcid: '0000-0001-2345-6789',
        researchGate: 'https://researchgate.net',
        googleScholar: 'https://scholar.google.com',
        profilePicture: 'https://picsum.photos/id/1012/300/400',
        interestPicture: 'https://picsum.photos/id/1059/400/300',
        bioVi: 'PGS.TS. Nguyễn Văn A hiện là giảng viên...',
        bioEn: 'Assoc. Prof. Ph.D. Nguyen Van A is currently...',
        expertiseVi: 'Dược lý',
        expertiseEn: 'Pharmacology',
        researchInterestVi: 'Đề kháng kháng sinh',
        researchInterestEn: 'Antibiotic resistance',
        researchInterestViTags: ['Đề kháng kháng sinh'],
        researchInterestEnTags: ['Antibiotic resistance'],
        articles: ['Article 1...']
      }
    ];
    this.facultyList.set(mocks);
  }
}
