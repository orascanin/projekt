import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { error } from 'jquery';
import { HttpErrorResponse } from '@angular/common/http';
const apiKey = 'f729833d7a5fc294d5f07ec0934151ea8e94b3cfa33f58e74f8dad996eb29410';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  isLoggedIn: boolean = false; // Varijabla koja označava da li je korisnik prijavljen
  userRole: string = '';  // Varijabla koja čuva ulogu korisnika.
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  users: any = {};  // Varijabla koja čuva podatke korisnika.
  successMessage: string | null = null;  // Varijabla koja čuva poruku o uspjehu, ili je null ako nema poruke.
  errorMessage: string | null = null;  // Varijabla koja čuva poruku o grešci, ili je null ako nema poruke.
  userId: number | null = null; // Varijabla koja čuva ID korisnika.
  updatedUser: any = {}; // Varijabla koja čuva ažurirane podatke korisnika.
  error: string | null = null;  // Dodajte ovu liniju
  password_hash: string | null = null; // Polje za lozinku
  apiUrl: string = 'http://localhost:5000/donor/update_profile';
  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();     // Poziva metodu za provjeru statusa prijave korisnika.
    this.userId = this.authService.getCurrentUser()?.id; // Postavite userId ovdje
    if (this.userId) {
      this.loadUserProfile();
    }
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

  // Metoda koja učitava profil korisnika.
  loadUserProfile(): void {
    const headers = new HttpHeaders({
      'X-API-Key': apiKey
    });

    if (!this.userId) {
      console.error('User ID is not set');
      this.errorMessage = 'User ID is not set';
      return;
    }

    this.http.get<any>(`http://localhost:5000/donor/profile?user_id=${this.userId}`, { headers, withCredentials: true })
      .subscribe(
        response => {
          this.users = response;  // Ako je zahtjev uspješan, postavlja korisničke podatke.
        },
        error => {
          console.error('Error loading user profile', error);
          this.errorMessage = 'Failed to load user profile';  // Postavlja poruku o greški.
        }
      );
  }
  // Metoda koja ažurira podatke korisnika.
  updateUser(): void {
    if (!this.isLoggedIn) {
      alert('User not logged in.');
      return;
    }
     // Ažurirani podaci korisnika.
    const updatedData: any = {
      user_id: this.userId, 
      first_name: this.users.first_name || '',
      last_name: this.users.last_name || '',
      email: this.users.email || '',
      phone_number: this.users.phone_number || '',
      country: this.users.country || '',
      city: this.users.city || '',
      address: this.users.address || '',
      postal_code: this.users.postal_code || '',
      password_hash: this.password_hash || ''
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    });

    this.http.put<any>(this.apiUrl, updatedData, { headers, withCredentials: true })
      .subscribe(
        response => {
          this.successMessage = 'User data updated successfully!'; // Ako je zahtjev uspješan, postavlja poruku o uspjehu.
        },
        error => {
          console.error('Error updating user data:', error); // Ako dođe do greške, ispisuje grešku u konzolu.
          this.error = 'An error occurred while updating user data.';
        }
      );
  }
    // Metoda koja obrađuje greške HTTP zahtjeva.
  handleError(error: HttpErrorResponse): void {
    this.errorMessage = `An error occurred: ${error.message}`;
  }
  // Metoda koja otvara modalni prozor za uspjeh.
  openSuccessModal(): void {
    this.modalService.open('successModal'); 
  }
    // Metoda koja odjavljuje korisnika.
  logout(): void {
    this.authService.logout();
    localStorage.removeItem('token'); // Uklonite token prilikom odjave
    this.isLoggedIn = false;
    this.clearLocalStorage();
   
  }
    // Metoda koja čisti localStorage.
  clearLocalStorage(): void {
    localStorage.clear();
  }
}
