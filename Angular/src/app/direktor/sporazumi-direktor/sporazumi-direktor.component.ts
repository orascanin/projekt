import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
declare const bootstrap: any;
@Component({
  selector: 'app-sporazumi-direktor',
  templateUrl: './sporazumi-direktor.component.html',
  styleUrl: './sporazumi-direktor.component.css'
})
export class SporazumiDirektorComponent {
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  agreements: any[] = [];
  selectedAgreement: any = {};
  agreementTitle: string = '';
  selectedFile: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(private authService: AuthService,private router: Router,private modalService: NgbModal,private http: HttpClient) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadAgreements(); // Load agreements if user is logged in
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
  
  openModal(): void {
    (window as any).$('#agreementModal').modal('show');
  }

  openEditModal(agreement: any): void {
    this.selectedAgreement = { ...agreement }; // Create a copy of agreement for editing
    (window as any).$('#editAgreementModal').modal('show');
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }

  uploadAgreement(): void {
    if (!this.agreementTitle || !this.selectedFile) {
      alert('Please provide an agreement title and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('title', this.agreementTitle);

    this.http.post('http://localhost:5000/director/upload_agreement', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Upload successful', response);
        this.loadAgreements(); // Reload agreements after uploading a new one
        this.closeModal('#editAgreementModal');
        (window as any).$('#agreementModal').modal('hide'); // Hide modal on success
        // Reset form fields
        this.agreementTitle = '';
        this.selectedFile = null;
      },
      error => {
        console.error('Upload failed', error);
        // Handle error
      }
    );
  }

  updateAgreement(): void {
    if (!this.selectedAgreement.title) {
      alert('Please provide a title for the agreement.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile ? this.selectedFile : new Blob(), this.selectedFile ? this.selectedFile.name : '');
    formData.append('title', this.selectedAgreement.title);

    this.http.put(`http://localhost:5000/director/update_agreement/${this.selectedAgreement.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadAgreements();
        (window as any).$('#editAgreementModal').modal('hide');
        this.selectedAgreement = {};
        this.selectedFile = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }

  openDeleteModal(agreement: any): void {
    this.selectedAgreement = agreement;
    const modal = document.getElementById('deleteAgreementModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteAgreementModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }



  loadAgreements(): void {
    this.http.get('http://localhost:5000/director/get_agreements', { withCredentials: true }).subscribe(
      (response: any) => {
        this.agreements = response; // Update agreements array with response data
      },
      error => {
        console.error('Failed to load agreements', error);
      }
    );
  }


  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    
    // You might want to navigate to the login page or refresh the page after logout
  }
}
