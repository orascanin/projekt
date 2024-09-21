import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
declare const bootstrap: any;
@Component({
  selector: 'app-aktuelnosti',
  templateUrl: './aktuelnosti.component.html',
  styleUrl: './aktuelnosti.component.css'
})
export class AktuelnostiComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  news: any[] = [];
  selectedNews: any = {};
  newsTitle: string = '';
  newsDescription: string = '';
  selectedFile: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(private authService: AuthService,private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadNews(); // Load news items if user is an admin
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
    // Pretpostavljamo da je putanja relativna od korena aplikacije
    return `http://localhost:5000/uploads/${this.getFilenameFromPath(path)}`;
  }
  
  openEditModal(newsItem: any): void {
    this.selectedNews = { ...newsItem }; // Create a copy of news item for editing
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

    this.http.post('http://localhost:5000/admin/upload_news', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Upload successful', response);
        this.loadNews(); // Reload news after uploading a new one
        this.closeModal('#newsModal');
        (window as any).$('#newsModal').modal('hide'); // Hide modal on success
        // Reset form fields
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
    formData.append('file', this.selectedFile ? this.selectedFile : new Blob(), this.selectedFile ? this.selectedFile.name : '');
    formData.append('title', this.selectedNews.title);
    formData.append('description', this.selectedNews.description);

    this.http.put(`http://localhost:5000/admin/update_news/${this.selectedNews.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadNews();
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
      this.http.delete(`http://localhost:5000/admin/delete_news/${newsId}`).subscribe(() => {
        this.successMessage = 'News item deleted successfully';
        this.errorMessage = null;
        this.loadNews();  // Reload news after deletion
        this.closeDeleteModal();  // Close the modal after deletion
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      }, (error) => {
        this.errorMessage = 'Error deleting news item';
        this.successMessage = null;
        this.closeDeleteModal();  // Close the modal even if there is an error
        setTimeout(() => {
          this.errorMessage = null;
        }, 3000);
      });
    }
    
    
  
  loadNews(): void {
    this.http.get('http://localhost:5000/admin/get_news', { withCredentials: true }).subscribe(
      (response: any) => {
        this.news = response; // Update news array with response data
      },
      error => {
        console.error('Failed to load news', error);
      }
    );
  }
  

  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    // You might want to navigate to the login page or refresh the page after logout
  }
}
