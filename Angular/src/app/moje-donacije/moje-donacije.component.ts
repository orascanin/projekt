import { Component,TemplateRef,OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Uvozi AuthService, servis za autentifikaciju korisnika.
import { Router } from '@angular/router'; // Uvozi Router za navigaciju između stranica.
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Uvozi NgbModal iz ng-bootstrap za rad s modalnim prozorima.
import { HttpClient,HttpHeaders } from '@angular/common/http'; // Uvozi HttpClient i HttpHeaders za slanje HTTP zahtjeva i postavljanje zaglavlja.
import { loadStripe } from '@stripe/stripe-js'; // Uvozi loadStripe za rad s Stripe API-jem.
import { format, utcToZonedTime } from 'date-fns-tz'; // Uvozi funkcije format i utcToZonedTime za rad s vremenskim zonama i formatiranje datuma.



const API_KEY = 'f729833d7a5fc294d5f07ec0934151ea8e94b3cfa33f58e74f8dad996eb29410'; // Definiše API ključ koji se koristi za autentifikaciju na serveru.


declare const bootstrap: any; // Deklaracija bootstrap objekta koji se koristi u kodu i koji može biti definiran u globalnom prostoru.
@Component({
  selector: 'app-moje-donacije',
  templateUrl: './moje-donacije.component.html',
  styleUrl: './moje-donacije.component.css'
})
export class MojeDonacijeComponent implements OnInit{
  isLoggedIn: boolean = false;   // Varijabla koja označava da li je korisnik prijavljen.
  userRole: string = ''; // Vraijabla koja čuva ulogu korisnika
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  stripe: any;  // Varijabla za Stripe objekt.
  card: any;  // Varijabla za Stripe card
  donations: any[] = [];  // Niz koji čuva sve donacije korisnika.
  topThreeDonations: any[] = []; // Dodano za TOP 3 donacije
  failedDonations: any[] = []; // Dodano za neuspjele donacije
  totalDonations: number = 0;  // Dodano za ukupni iznos donacija
  amount: number = 0;  // Dodano svojstvo za unos iznosa
  error: string | null = null;
  successMessage: string | null = null; // Poruka o uspjehu
  showSuccessPopup: boolean = false; // Variable to control the popup visibility


  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  async ngOnInit() {
    this.checkLoginStatus(); // Poziva metodu za provjeru statusa prijave korisnika.
    this.loadDonations(); // Poziva metodu za učitavanje svih donacija korisnika.
    this.loadTopThreeDonations(); // Poziva metodu za učitavanje TOP 3 donacija korisnika.
    this.loadFailedDonations(); // Poziva metodu za učitavanje neuspjelih donacija korisnika.
    this.loadTotalDonations();  // Poziva metodu za učitavanje ukupnog iznosa donacija.
  }
    // Metoda koja otvara modalni prozor koristeći ng-bootstrap.
  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }
  // Metoda koja provjerava da li je korisnik prijavljen.
  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn(); // Postavlja isLoggedIn na true ili false na osnovu rezultata metode isLoggedIn iz AuthService.

    
    if (this.isLoggedIn) {
            // Ako je korisnik prijavljen:
      this.userRole = this.authService.getRole(); // Postavlja userRole na osnovu uloge korisnika dobijene iz AuthService.
      const user = this.authService.getCurrentUser();  // Dobija trenutno prijavljenog korisnika iz AuthService.
      this.userName = user.first_name; // Postavlja userName na ime korisnika.
    } else {
      this.userRole = 'guest';
    }
  }
// Metoda koja učitava svih donacija korisnika.
  async loadDonations() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });

    const userId = this.authService.getCurrentUser().id;

    this.http.get<any[]>(`http://localhost:5000/donor/list_donations?user_id=${userId}`, { headers })
      .subscribe(response => {
        const timeZone = 'Europe/Sarajevo';
        this.donations = response.map(donation => { // Mapira svaki odgovor (donaciju) za formatiranje datuma.
          const zonedDate = utcToZonedTime(new Date(donation.donation_date), timeZone);   // Konvertuje UTC datum u lokalnu vremensku zonu.
          return {
            ...donation,
            donation_date: format(zonedDate, 'yyyy-MM-dd HH:mm:ss', { timeZone })  // Formatira datum donacije u lokalnu vremensku zonu.
          };
        });
      }, error => {
        console.error('Error loading donations:', error);    // Ispisuje grešku u konzolu ako dođe do greške prilikom učitavanja donacija.
      });
  }
    // Metoda koja učitava TOP 3 donacije korisnika.
  loadTopThreeDonations(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });

    const userId = this.authService.getCurrentUser().id;

    this.http.get<any[]>(`http://localhost:5000/donor/list3_donations?user_id=${userId}`, { headers })
      .subscribe(response => {
        const timeZone = 'Europe/Sarajevo';
        this.topThreeDonations = response.map(donation => {
          const zonedDate = utcToZonedTime(new Date(donation.donation_date), timeZone);
          return {
            ...donation,
            donation_date: format(zonedDate, 'yyyy-MM-dd HH:mm:ss', { timeZone })
          };
        });
      }, error => {
        console.error('Error loading top three donations:', error);
        this.error = 'Došlo je do greške prilikom učitavanja top 3 donacija.';
      });
  }
 // Metoda koja učitava neuspjele donacije korisnika.
  loadFailedDonations(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });

    const userId = this.authService.getCurrentUser().id;

    this.http.get<any[]>(`http://localhost:5000/donor/list_failed_donations?user_id=${userId}`, { headers })
      .subscribe(response => {
        const timeZone = 'Europe/Sarajevo';
        this.failedDonations = response.map(donation => {
          const zonedDate = utcToZonedTime(new Date(donation.donation_date), timeZone);
          return {
            ...donation,
            donation_date: format(zonedDate, 'yyyy-MM-dd HH:mm:ss', { timeZone })
          };
        });
      }, error => {
        console.error('Error loading failed donations:', error);
        this.error = 'Došlo je do greške prilikom učitavanja neuspjelih donacija.';
      });
  }
  // Metoda koja učitava ukupni iznos donacija korisnika.
  loadTotalDonations(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });
  
    const userId = this.authService.getCurrentUser().id;
  
    this.http.get<any>(`http://localhost:5000/donor/total_donations?user_id=${userId}`, { headers })
      .subscribe(response => {
        console.log('Total donations response:', response); // Dodano za debugiranje
        this.totalDonations = response.total_amount;
      }, error => {
        console.error('Error loading total donations:', error);
        this.error = 'Došlo je do greške prilikom učitavanja ukupnog iznosa donacija.';
      });
  }
  
  // Metoda koja odjavljuje korisnika.
  logout(): void {
    this.authService.logout();     // Poziva logout metodu iz AuthService za odjavu korisnika.
    this.isLoggedIn = false;     // Postavlja isLoggedIn na false jer je korisnik odjavljen.
   
  }
}
