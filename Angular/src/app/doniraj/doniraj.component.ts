import { Component,TemplateRef,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Uvoz AuthService za autentifikaciju
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';  // Uvoz NgbModal za rad s modals (popup) dijalozima
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js'; // Uvoz Stripe biblioteku za obradu plaćanja
import { format, utcToZonedTime } from 'date-fns-tz'; // Uvoz funkcija za rukovanje vremenskim zonama

declare const bootstrap: any; // Deklaracija varijable za Bootstrap (koristi se za rad s modalima).
const API_KEY = 'f729833d7a5fc294d5f07ec0934151ea8e94b3cfa33f58e74f8dad996eb29410'; // API ključ koji se koristi za autorizaciju HTTP zahtjeva.

@Component({
  selector: 'app-doniraj',
  templateUrl: './doniraj.component.html',
  styleUrl: './doniraj.component.css'
})
export class DonirajComponent implements OnInit{
  isLoggedIn: boolean = false; // Praćenje statusa prijave korisnika
  userRole: string = ''; // Spremanje korisničke uloge
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  stripe: any; // Stripe instanca za procesiranje plaćanja
  card: any; // Stripe kartična komponenta
  donations: any[] = []; // Spremanje liste donacija
  amount: number = 0;  // Dodano svojstvo za unos iznosa
  error: string | null = null; // Varijabla za spremanje poruka o greškama
  successMessage: string | null = null; // Poruka o uspjehu
  showSuccessPopup: boolean = false; // Praćenje prikaza uspješnog popup-a


  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  async ngOnInit() {   // Lifecycle hook (OnInit) koji se poziva prilikom inicijalizacije komponente
    this.checkLoginStatus();
    this.stripe = await loadStripe('pk_test_51McVsOCfu7fp2kt4zYvwhrOb88EnWprFo3Rf8dWJv83bnOyz3AvdfFZooYCGFjWSUwAZ1vCiL6dD0l8jOaf0HrSl004ddqjjcP'); // Učitavanje Stripe instance pomoću javnog ključa

    const elements = this.stripe.elements();  // Kreiranje Stripe elemenata
    this.card = elements.create('card'); // Kreiranje kartičnog elementa
    this.card.mount('#card-element'); // Postavljanje kartičnog elementa u DOM

    if (this.isLoggedIn && this.userRole === 'donor') {    // Ako je korisnik prijavljen i ima ulogu 'donor', učitaj donacije
        this.loadDonations();
    }
  }
  openModal(content: TemplateRef<any>) {  // Otvara modal (popup) koristeći TemplateRef za sadržaj modala
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }
  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn(); // Provjerava status prijave iz AuthService
    
    if (this.isLoggedIn) {  // Ako je prijavljen, postavi ulogu i ime korisnika
      this.userRole = this.authService.getRole(); // Dobiva ulogu korisnika
      const user = this.authService.getCurrentUser(); // Dobiva trenutnog korisnika
      this.userName = user.first_name; // Postavlja ime korisnika
    } else {
      this.userRole = 'guest';  // Ako nije prijavljen, korisnik je gost
    }
  }
  // Kreira donaciju pomoću Stripe-a
  async createDonation() {
    if (this.amount <= 0) { // Provjera je li iznos donacije ispravan
      alert('Please enter a valid amount.');
      return;
    }

    const headers = new HttpHeaders({    // Postavljanje zaglavlja za HTTP zahtjev, uključujući autorizacijski token i API ključ
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });
    const donor_id = this.authService.getCurrentUser().id; // Dobivanje ID korisnika (donatora)
    this.http.post<any>('http://localhost:5000/donor/donor_create_donation', { donor_id, amount: this.amount }, { headers })    // Slanje POST zahtjeva na server za kreiranje donacije
      .subscribe(async (response) => {
        const { client_secret } = response; // Dobivanje client_secret iz odgovora
         // Potvrđivanje plaćanja pomoću Stripe-a
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: this.card, // Kartični podaci
            billing_details: { name: this.userName }, // Podaci o korisniku
          },
        });
          // Ako dođe do greške pri plaćanju, prikazuje modal s greškom
        if (error) {
          console.error('Payment error:', error.message);
          const modalElement = document.getElementById('errorModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        } else if (paymentIntent.status === 'succeeded') { // Ako je plaćanje uspješno
          this.clearDonationForm(); // Očisti formu za donacije
          await this.loadDonations(); // Ponovo učitaj donacije
          const modalElement = document.getElementById('successModal');   // Prikaz modala s uspješnim plaćanjem
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        }
      }, error => {
        console.error('Error creating donation:', error);
      });
  }
 // Učitava listu donacija s API-a
  async loadDonations() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });
  
    const userId = this.authService.getCurrentUser().id; // Osigurajte da je userId dostupan
    // Slanje GET zahtjeva za učitavanje donacija
    this.http.get<any[]>(`http://localhost:5000/donor/list_donations?user_id=${userId}`, { headers })
      .subscribe(response => {
        const timeZone = 'Europe/Sarajevo';
        this.donations = response.map(donation => {
          const zonedDate = utcToZonedTime(new Date(donation.donation_date), timeZone);
          return {
            ...donation,
            donation_date: format(zonedDate, 'yyyy-MM-dd HH:mm:ss', { timeZone })
          };
        });
      }, error => {
        console.error('Error loading donations:', error);
      });
  }
     
  
   // Očisti formu za unos donacije
   clearDonationForm() {
    this.amount = 0; // Postavljanje iznosa na 0
    this.card.clear(); // Čišćenje kartičnih podataka
  }
    // Zatvara popup za uspješno plaćanje
    closePopup() {
      this.showSuccessPopup = false;
    }
      // Zatvara modal za uspjeh i preusmjerava na početnu stranicu
    closeSuccessModalAndRedirect() {
      // Zatvori modal
      const modalElement = document.getElementById('successModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.hide();
      }
    
      // Preusmjeri na početnu stranicu
      this.router.navigate(['/']); 
    }
    
  logout(): void {
    this.authService.logout();  // Poziva funkciju za odjavu u AuthService
    this.isLoggedIn = false; // Postavlja status prijave na false
   
  }
}
