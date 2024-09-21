import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
declare const bootstrap: any;
@Component({
  selector: 'app-nabavke',
  templateUrl: './nabavke.component.html',
  styleUrl: './nabavke.component.css'
})
export class NabavkeComponent implements OnInit{
  isLoggedIn: boolean = false;
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
    this.loadProcurements();
  }

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
  openModal(): void {
    (window as any).$('#procurementModal').modal('show');
  }

  openEditModal(procurement: any): void {
    this.selectedProcurement = { ...procurement }; // Kreiraj kopiju odabrane nabavke za uređivanje
    (window as any).$('#editProcurementModal').modal('show');
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
      alert('Molimo unesite naslov i odaberite fajl.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('title', this.procurementTitle);

    this.http.post('http://localhost:5000/director/upload_procurement', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Upload successful', response);
        this.loadProcurements(); // Učitajte javne nabavke nakon uspješnog upload-a
        this.closeModal('#procurementModal');
        (window as any).$('#procurementModal').modal('hide'); // Sakrij modal na uspješan upload

        // Resetirajte formu
        this.procurementTitle = '';
        this.selectedFile = null;
      },
      error => {
        console.error('Upload failed', error);
        // Rukovanje greškom
      }
    );
  }

  updateProcurement(): void {
    if (!this.selectedProcurement.title) {
      alert('Molimo unesite naslov za javnu nabavku.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile ? this.selectedFile : new Blob(), this.selectedFile ? this.selectedFile.name : '');
    formData.append('title', this.selectedProcurement.title);

    this.http.put(`http://localhost:5000/director/update_procurement/${this.selectedProcurement.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadProcurements(); // Učitajte ažurirane nabavke
        (window as any).$('#editProcurementModal').modal('hide');
        this.selectedProcurement = {};  // Resetiraj selekciju
        this.selectedFile = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }

  loadProcurements(): void {
    this.http.get('http://localhost:5000/director/get_procurements', { withCredentials: true }).subscribe(
      (response: any) => {
        this.procurements = response; // Ažurirajte array javnih nabavki
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
