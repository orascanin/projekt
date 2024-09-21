import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
declare const bootstrap: any;
@Component({
  selector: 'app-aktuelnosti-direktor',
  templateUrl: './aktuelnosti-direktor.component.html',
  styleUrl: './aktuelnosti-direktor.component.css'
})
export class AktuelnostiDirektorComponent implements OnInit{
  isLoggedIn: boolean = false; 
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  news: any[] = [];
  selectedNews: any = {};
  newsTitle: string = '';
  newsDescription: string = '';
  selectedFile: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadNews();
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
    (window as any).$('#newsModal').modal('show');
  }

  getFilenameFromPath(path: string): string {
    return path.split('/').pop() || '';
  }

  getImageUrl(path: string): string {
    // Pretpostavljamo da je putanja relativna od korjena aplikacije
    return `http://localhost:5000/uploads/${this.getFilenameFromPath(path)}`;
  }

  openEditModal(newsItem: any): void {
    this.selectedNews = { ...newsItem }; 
    (window as any).$('#editNewsModal').modal('show');
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

  uploadNews(): void {
    if (!this.newsTitle || !this.newsDescription || !this.selectedFile) {
      alert('Please provide a news title, description, and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('title', this.newsTitle);
    formData.append('description', this.newsDescription);

    this.http.post('http://localhost:5000/director/upload_news', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Upload successful', response);
        this.loadNews(); 
        this.closeModal('newsModal');
        (window as any).$('#newsModal').modal('hide'); 
        this.newsTitle = '';
        this.newsDescription = '';
        this.selectedFile = null;
      },
      error => {
        console.error('Upload failed', error);
        // Handle error
      }
    );
  }

  updateNews(): void {
    if (!this.selectedNews.title || !this.selectedNews.description) {
      alert('Please provide a title and description for the news.');
      return;
    }

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    formData.append('title', this.selectedNews.title);
    formData.append('description', this.selectedNews.description);

    this.http.put(`http://localhost:5000/director/update_news/${this.selectedNews.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadNews();
        this.closeModal('editNewsModal');
        (window as any).$('#editNewsModal').modal('hide');
        this.selectedNews = {};
        this.selectedFile = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }

  openDeleteModal(newsItem: any): void {
    this.selectedNews = newsItem;
    const modalElement = document.getElementById('deleteNewsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeDeleteModal(): void {
    const modalElement = document.getElementById('deleteNewsModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  confirmDelete(newsId: number): void {
    this.http.delete(`http://localhost:5000/director/delete_news/${newsId}`, { withCredentials: true }).subscribe(
      () => {
        this.successMessage = 'News item deleted successfully';
        this.errorMessage = null;
        this.loadNews();  
        this.closeDeleteModal();  
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error => {
        this.errorMessage = 'Error deleting news item';
        this.successMessage = null;
        this.closeDeleteModal();  // Close the modal even if there is an error
        setTimeout(() => {
          this.errorMessage = null;
        }, 3000);
      }
    );
  }

  loadNews(): void {
    this.http.get('http://localhost:5000/director/get_news', { withCredentials: true }).subscribe(
      (response: any) => {
        this.news = response; // Update news array with response data
      },
      error => {
        console.error('Failed to load news', error);
      }
    );
  }


  logout(): void {
    this.authService.logout(); 
    this.isLoggedIn = false;

   
  }
}
