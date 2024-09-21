import { Component, OnInit,ViewChild,TemplateRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-prikaz-izvjestaji',
  templateUrl: './prikaz-izvjestaji.component.html',
  styleUrl: './prikaz-izvjestaji.component.css'
})
export class PrikazIzvjestajiComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  reports: any[] = []; // Array to store reports
  selectedFile: File | null = null;
  sanitizedUrl: SafeResourceUrl | null = null;
  documentUrl: SafeResourceUrl | null = null; 
  @ViewChild('documentModal', { static: false }) documentModal!: TemplateRef<any>;
  constructor(private authService: AuthService,private http: HttpClient,private router: Router,public modalService: NgbModal,private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadReports(); // Dodajte ovo
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
  loadReports(): void {
    this.http.get<any[]>('http://localhost:5000/guest/guest_get_reports').subscribe(
      response => {
        this.reports= response;
      },
      error => {
        console.error('Failed to load reports', error);
      }
    );
  }

  openDocument(filePath: string): void {
    if (filePath) {
      // Sanitize the URL
      this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:5000/${filePath}`);
      // Open the modal
      this.modalService.open(this.documentModal, { size: 'lg' });
    } else {
      console.error('No file name provided');
    }
  }
  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    // You might want to navigate to the login page or refresh the page after logout
  }
  
}
