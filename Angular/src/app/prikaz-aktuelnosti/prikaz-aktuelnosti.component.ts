import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
declare const bootstrap: any;
@Component({
  selector: 'app-prikaz-aktuelnosti',
  templateUrl: './prikaz-aktuelnosti.component.html',
  styleUrl: './prikaz-aktuelnosti.component.css'
})
export class PrikazAktuelnostiComponent {
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  news: any[] = [];
  paginatedNews: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 3;
  totalPages: number = 0;
  isTextExpanded: boolean = false;

  constructor(private authService: AuthService,private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadNews();
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn(); // Check login status via auth service
    
    if (this.isLoggedIn) {
      // Ako je korisnik prijavljen, dohvatite ulogu i ime
      this.userRole = this.authService.getRole();
      const user = this.authService.getCurrentUser();
      
      // Spojite ime i prezime korisnika
      this.userName = user.first_name;
    } else {
      // Ako korisnik nije prijavljen, postavite ulogu na 'guest'
      this.userRole = 'guest';
    }
  }


  getFilenameFromPath(path: string): string {
    return path.split('/').pop() || '';
  }
  getImageUrl(path: string): string {
    // Pretpostavljamo da je putanja relativna od korena aplikacije
    return `http://localhost:5000/uploads/${this.getFilenameFromPath(path)}`;
  }
  
  loadNews(): void {
    this.http.get('http://localhost:5000/guest/guest_get_news', { withCredentials: true }).subscribe(
      (response: any) => {
        this.news = response;
        this.sortNewsByDate();
        this.totalPages = Math.ceil(this.news.length / this.itemsPerPage);
        this.updatePaginatedNews();
      },
      error => {
        console.error('Failed to load news', error);
      }
    );
  }

  sortNewsByDate(): void {
    this.news.sort((a: any, b: any) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());
  }

  updatePaginatedNews(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedNews = this.news.slice(startIndex, endIndex);
    
    // Initialize `isTextExpanded` property for each item
    this.paginatedNews.forEach(item => {
      if (typeof item.isTextExpanded === 'undefined') {
        item.isTextExpanded = false;
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedNews();
  }

  getPaginationArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
  }
  
  toggleText(): void {
    this.isTextExpanded = !this.isTextExpanded;
  }

}
