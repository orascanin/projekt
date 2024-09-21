import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
declare const bootstrap: any;
@Component({
  selector: 'app-donacije',
  templateUrl: './donacije.component.html',
  styleUrl: './donacije.component.css'
})
export class DonacijeComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  donations: any[] = [];
  selectedDonation: any = {};
  donationAmount: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  day1Donations: any[] = [];
  day2Donations: any[] = [];
  day3Donations: any[] = [];
  activeDay: number = 1; // Variable to track the current active day
  displayedDonations: any[] = [];
  selectedTab: string = 'day-1';

  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadDonations();
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
  openAddModal(): void {
    (window as any).$('#addDonationModal').modal('show');
  }

  openEditModal(donation: any): void {
    this.selectedDonation = { ...donation };
    (window as any).$('#editDonationModal').modal('show');
  }
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }

  addDonation(): void {
    if (!this.donationAmount) {
      alert('Please provide an amount for the donation.');
      return;
    }
  
    // Pretvori amount u broj
    const donationAmount = parseFloat(this.donationAmount);
  
    if (isNaN(donationAmount)) {
      alert('Invalid amount provided.');
      return;
    }
  
    const donationData = { amount: donationAmount };
  
    this.http.post('http://localhost:5000/admin/add_donation', donationData, { withCredentials: true }).subscribe(
      response => {
        console.log('Donation added successfully', response);
        this.loadDonations();
        (window as any).$('#addDonationModal').modal('hide');
        this.donationAmount = '';
      },
      error => {
        console.error('Failed to add donation', error);
        // Handle error
      }
    );
  }

    updateDonation(): void {
      if (!this.selectedDonation.amount || !this.selectedDonation.donor_id) {
        alert('Please provide both amount and donor ID for the donation.');
        return;
      }
    
      const donationData = {
        amount: this.selectedDonation.amount,
        donor_id: this.selectedDonation.donor_id
      };
    
      this.http.put(`http://localhost:5000/admin/update_donation/${this.selectedDonation.id}`, donationData, { withCredentials: true }).subscribe(
        response => {
          console.log('Donation updated successfully', response);
          this.loadDonations();
          this.closeModal('#editDonationModal');
          (window as any).$('#editDonationModal').modal('hide');
          this.selectedDonation = {};
        },
        error => {
          console.error('Failed to update donation', error);
        }
      );
    }

  openDeleteModal(donation: any): void {
    this.selectedDonation = donation;
    const modal = document.getElementById('deleteDonationModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteDonationModal');
    if (modal) {
      modal.style.display = 'none';
    }
  } 



  loadDonations(): void {
    this.http.get('http://localhost:5000/admin/list_donations', { withCredentials: true }).subscribe(
      (response: any) => {
        console.log('Response:', response);  // Check the raw response data
  
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
  
          // Divide donations into days
          this.day1Donations = this.donations.slice(0, 10);
          this.day2Donations = this.donations.slice(10, 20);
          this.day3Donations = this.donations.slice(20);
        } else {
          console.error('Response is not an array', response);
        }
      },
      error => {
        console.error('Failed to load donations', error);
      }
    );
  }
  
  

  
  



  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    
    // You might want to navigate to the login page or refresh the page after logout
  }
}
