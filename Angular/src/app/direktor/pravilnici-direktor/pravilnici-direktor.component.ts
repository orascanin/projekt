import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
declare const bootstrap: any;

@Component({
  selector: 'app-pravilnici-direktor',
  templateUrl: './pravilnici-direktor.component.html',
  styleUrl: './pravilnici-direktor.component.css'
})
export class PravilniciDirektorComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  regulations: any[] = [];
  selectedRegulation: any = {};
  regulationTitle: string = '';
  selectedFile: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(private authService: AuthService,private router: Router,private modalService: NgbModal,private http: HttpClient) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadRegulations();
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
    (window as any).$('#regulationModal').modal('show');
  }

  openEditModal(regulation: any): void {
    this.selectedRegulation = { ...regulation }; // Napravite kopiju regulation za uređivanje
    (window as any).$('#editRegulationModal').modal('show');
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

  uploadRegulation(): void {
    if (!this.regulationTitle || !this.selectedFile) {
      alert('Please provide a regulation title and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('title', this.regulationTitle);

    this.http.post('http://localhost:5000/director/upload_regulation', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Upload successful', response);
        this.loadRegulations(); // Reload regulations after uploading a new one
        this.closeModal('editRegulationModal');
        (window as any).$('#regulationModal').modal('hide'); // Hide modal on success
        // Reset form fields
        this.regulationTitle = '';
        this.selectedFile = null;
      },
      error => {
        console.error('Upload failed', error);
        // Handle error
      }
    );
  }

  updateRegulation(): void {
    if (!this.selectedRegulation.title) {
      alert('Please provide a title for the regulation.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile ? this.selectedFile : new Blob(), this.selectedFile ? this.selectedFile.name : '');
    formData.append('title', this.selectedRegulation.title);

    this.http.put(`http://localhost:5000/director/update_regulation/${this.selectedRegulation.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadRegulations();
        (window as any).$('#editRegulationModal').modal('hide');
        this.selectedRegulation = {};
        this.selectedFile = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }

  openDeleteModal(regulation: any): void {
    this.selectedRegulation = regulation;
    const modal = document.getElementById('deleteRegulationModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteRegulationModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }



  loadRegulations(): void {
    this.http.get('http://localhost:5000/director/get_regulations', { withCredentials: true }).subscribe(
      (response: any) => {
        this.regulations = response; // Update regulations array with response data
      },
      error => {
        console.error('Failed to load regulations', error);
      }
    );
  }
  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    
    // You might want to navigate to the login page or refresh the page after logout
  }
}
