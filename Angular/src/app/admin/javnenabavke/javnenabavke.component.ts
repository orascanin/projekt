import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
declare const bootstrap: any;
@Component({
  selector: 'app-javnenabavke',
  templateUrl: './javnenabavke.component.html',
  styleUrl: './javnenabavke.component.css'
})
export class JavnenabavkeComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  procurements: any[] = [];
  selectedProcurement: any = {};
  procurementTitle: string = '';
  selectedFile: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  
  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadProcurements(); // Load procurements if user is an admin
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
    (window as any).$('#procurementModal').modal('show');
  }

  openEditModal(procurement: any): void {
    this.selectedProcurement = { ...procurement }; // Create a copy of procurement for editing
    (window as any).$('#editProcurementModal').modal('show');
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

  uploadProcurement(): void {
    if (!this.procurementTitle || !this.selectedFile) {
      alert('Please provide a procurement title and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('title', this.procurementTitle);

    this.http.post('http://localhost:5000/admin/upload_procurement', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Upload successful', response);
        this.loadProcurements(); // Reload procurements after uploading a new one
        this.closeModal('#editProcurementModal');
        (window as any).$('#procurementModal').modal('hide'); // Hide modal on success
        // Reset form fields
        this.procurementTitle = '';
        this.selectedFile = null;
      },
      error => {
        console.error('Upload failed', error);
        // Handle error
      }
    );
  }

  updateProcurement(): void {
    if (!this.selectedProcurement.title) {
      alert('Please provide a title for the procurement.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile ? this.selectedFile : new Blob(), this.selectedFile ? this.selectedFile.name : '');
    formData.append('title', this.selectedProcurement.title);

    this.http.put(`http://localhost:5000/admin/update_procurement/${this.selectedProcurement.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadProcurements();
        (window as any).$('#editProcurementModal').modal('hide');
        this.selectedProcurement = {};
        this.selectedFile = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }

  openDeleteModal(procurement: any): void {
    this.selectedProcurement = procurement;
    const modal = document.getElementById('deleteProcurementModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteProcurementModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  confirmDelete(procurementId: number): void {
    this.http.delete(`http://localhost:5000/admin/delete_procurement/${procurementId}`).subscribe(() => {
      this.successMessage = 'Procurement deleted successfully';
      this.errorMessage = null;
      this.loadProcurements();  // Reload procurements after deletion
      this.closeDeleteModal();

      // Reset message after 3 seconds
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    }, (error) => {
      this.errorMessage = 'Error deleting procurement';
      this.successMessage = null;
      this.closeDeleteModal();

      // Reset message after 3 seconds
      setTimeout(() => {
        this.errorMessage = null;
      }, 3000);
    });
  }

  loadProcurements(): void {
    this.http.get('http://localhost:5000/admin/get_procurements', { withCredentials: true }).subscribe(
      (response: any) => {
        this.procurements = response; // Update procurements array with response data
      },
      error => {
        console.error('Failed to load procurements', error);
      }
    );
  }

  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    
    // You might want to navigate to the login page or refresh the page after logout
  }
}
