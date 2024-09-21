import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Uvozi AuthService iz servisa za autentifikaciju korisnika.
import { Router } from '@angular/router'; // Uvozi Router iz Angular router paketa za upravljanje navigacijom između stranica.
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Uvozi NgbModal iz ng-bootstrap paketa za rad s modalnim prozorima.
import { HttpClient } from '@angular/common/http'; // Uvozi HttpClient iz Angular common HTTP paketa za slanje HTTP zahtjeva.
declare const bootstrap: any; // Deklariše globalnu promjenjivu `bootstrap` koja se koristi za rad s Bootstrapovim funkcionalnostima u Angular projektu.
@Component({
  selector: 'app-donatori',
  templateUrl: './donatori.component.html',
  styleUrl: './donatori.component.css'
})
export class DonatoriComponent {
  isLoggedIn: boolean = false; // Varijabla koja označava da li je korisnik prijavljen.
  userRole: string = ''; // Varijabla koja čuva ulogu korisnika.
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  donations: any[] = [];   // Polje koje čuva listu donacija.
  selectedDonation: any = {};   // Varijabla koja čuva trenutno odabranu donaciju.
  donationAmount: string = '';  // Varijabla koja čuva iznos donacije.
  successMessage: string | null = null; // Varijabla koja čuva poruku o uspjehu, ili je null ako nema poruke.
  errorMessage: string | null = null;   // Varijabla koja čuva poruku o grešci, ili je null ako nema poruke.
  day1Donations: any[] = [];  
  day2Donations: any[] = [];
  day3Donations: any[] = [];
  activeDay: number = 1; // Varijabla koja označava koji dan je trenutno aktivan (1, 2, ili 3).
  displayedDonations: any[] = []; // Polje koje čuva donacije koje se trenutno prikazuju.
  selectedTab: string = 'day-1';  // Varijabla koja označava koji je tab trenutno odabran (dan 1, dan 2 ili dan 3).

  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();   // Poziva metodu za provjeru statusa prijave korisnika.
    this.loadDonations(); // Poziva metodu za učitavanje donacija.
  }
    // Metoda koja provjerava da li je korisnik prijavljen.
  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn(); 
    
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
   // Metoda koja učitava donacije.
  loadDonations(): void {
    this.http.get('http://localhost:5000/admin/list_donations', { withCredentials: true }).subscribe(
      (response: any) => {
        console.log('Response:', response); 
  
        if (Array.isArray(response)) {
          this.donations = response.map(donation => ({
            id: donation.id,
            amount: donation.amount,
            donation_date: donation.donation_date,
            transaction_id: donation.transaction_id,
            payment_status: donation.payment_status,
            first_name: donation.first_name,
            last_name: donation.last_name
          }));
  
      
          this.day1Donations = this.donations.slice(0, 5);
          this.day2Donations = this.donations.slice(5, 10);
          this.day3Donations = this.donations.slice(10);
        } else {
          console.error('Response is not an array', response);
        }
      },
      error => {
        console.error('Failed to load donations', error);
      }
    );
  }
 // Metoda koja odjavljuje korisnika.
  logout(): void {
    this.authService.logout(); 
    this.isLoggedIn = false;
    
  }
}
