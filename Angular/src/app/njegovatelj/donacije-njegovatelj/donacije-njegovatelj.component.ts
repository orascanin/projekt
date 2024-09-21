import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';
import { format, utcToZonedTime } from 'date-fns-tz';
declare const bootstrap: any;
const API_KEY = 'f729833d7a5fc294d5f07ec0934151ea8e94b3cfa33f58e74f8dad996eb29410';
// Pobrinite se da odgovara onome koji je generiran na backendu


@Component({
  selector: 'app-donacije-njegovatelj',
  templateUrl: './donacije-njegovatelj.component.html',
  styleUrls: ['./donacije-njegovatelj.component.css']
})
export class DonacijeNjegovateljComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = '';
  userName: string = '';
  stripe: any;
  card: any;
  donations: any[] = [];
  amount: number = 0;
  error: string | null = null;
  successMessage: string | null = null;
  showSuccessPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private modalService: NgbModal
  ) {}

  async ngOnInit() {
    this.checkLoginStatus();
    this.stripe = await loadStripe('pk_test_51McVsOCfu7fp2kt4zYvwhrOb88EnWprFo3Rf8dWJv83bnOyz3AvdfFZooYCGFjWSUwAZ1vCiL6dD0l8jOaf0HrSl004ddqjjcP');
    
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');

    if (this.isLoggedIn && this.userRole === 'caregiver') {
      this.loadDonations();
    }
  }

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.userRole = user.role;
      this.userName = user.first_name;
    } else {
      this.userRole = 'guest';
    }
  }

  async createDonation() {
    if (this.amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });
    const donor_id = this.authService.getCurrentUser().id;
    this.http.post<any>('http://localhost:5000/caregiver/director_create_donation', { donor_id, amount: this.amount }, { headers })
      .subscribe(async (response) => {
        const { client_secret } = response;

        const { error, paymentIntent } = await this.stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: this.card,
            billing_details: { name: this.userName },
          },
        });

        if (error) {
          console.error('Payment error:', error.message);
          const modalElement = document.getElementById('errorModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        } else if (paymentIntent.status === 'succeeded') {
          this.clearDonationForm();
          await this.loadDonations();
          const modalElement = document.getElementById('successModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        }
      }, error => {
        console.error('Error creating donation:', error);
      });
  }

  async loadDonations() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-API-Key': API_KEY
    });
  
    const userId = this.authService.getCurrentUser().id; // Osigurajte da je userId dostupan
  
    this.http.get<any[]>(`http://localhost:5000/caregiver/list_donations?user_id=${userId}`, { headers })
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
  



  clearDonationForm() {
    this.amount = 0;
    this.card.clear();
  }

  closePopup() {
    this.showSuccessPopup = false;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
   
  }
}
