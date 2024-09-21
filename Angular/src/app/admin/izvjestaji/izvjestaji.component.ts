import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare const bootstrap: any;
@Component({
  selector: 'app-izvjestaji',
  templateUrl: './izvjestaji.component.html',
  styleUrl: './izvjestaji.component.css'
})
export class IzvjestajiComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  reportTitle: string = '';
  selectedFile: File | null = null;
  reports: any[] = []; // Array to store reports
  selectedReport: any = {}; // Odabrani izvještaj za uređivanje
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadReports(); // Load reports if user is an admin
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
    (window as any).$('#reportModal').modal('show');
  }
  openEditModal(report: any): void {
    this.selectedReport = { ...report }; // Napravite kopiju izvještaja za uređivanje
    (window as any).$('#editReportModal').modal('show');
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
  uploadReport(): void {
    if (!this.reportTitle || !this.selectedFile) {
      alert('Please provide a report title and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('title', this.reportTitle);

    this.http.post('http://localhost:5000/admin/upload_report', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Upload successful', response);
        this.loadReports(); // Reload reports after uploading a new one
        this.closeModal('#editReportModal');
        (window as any).$('#reportModal').modal('hide'); // Hide modal on success
        // Reset form fields
        this.reportTitle = '';
        this.selectedFile = null;
      },
      error => {
        console.error('Upload failed', error);
        // Handle error
      }
    );
  }
  updateReport(): void {
    if (!this.selectedReport.title) {
      alert('Please provide a title for the report.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile ? this.selectedFile : new Blob(), this.selectedFile ? this.selectedFile.name : '');
    formData.append('title', this.selectedReport.title);

    this.http.put(`http://localhost:5000/admin/update_report/${this.selectedReport.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadReports();
        (window as any).$('#editReportModal').modal('hide');
        this.selectedReport = {};
        this.selectedFile = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }

openDeleteModal(report: any): void {
  this.selectedReport = report;
  const modal = document.getElementById('deleteReportModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

// Funkcija za zatvaranje modalnog prozora
closeDeleteModal(): void {
  const modal = document.getElementById('deleteReportModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Funkcija za potvrdu brisanja izvještaja
confirmDelete(reportId: number): void {
  this.http.delete(`http://localhost:5000/admin/delete_report/${reportId}`).subscribe(() => {
    this.successMessage = 'Report deleted successfully';
    this.errorMessage = null;
    this.loadReports();  // Ponovo učitajte izvještaje nakon brisanja
    this.closeDeleteModal();

    // Resetiraj poruku nakon 3 sekunde
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);

  }, (error) => {
    this.errorMessage = 'Error deleting report';
    this.successMessage = null;
    this.closeDeleteModal();

    // Resetiraj poruku nakon 3 sekunde
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  });
}


  loadReports(): void {
    this.http.get('http://localhost:5000/admin/get_reports', { withCredentials: true }).subscribe(
      (response: any) => {
        this.reports = response; // Update reports array with response data
      },
      error => {
        console.error('Failed to load reports', error);
      }
    );
  }


  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
  
    // You might want to navigate to the login page or refresh the page after logout
  }
}
