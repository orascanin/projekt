import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare const bootstrap: any;
@Component({
  selector: 'app-djeca-njegovatelj',
  templateUrl: './djeca-njegovatelj.component.html',
  styleUrls: ['./djeca-njegovatelj.component.css']
})
export class DjecaNjegovateljComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  childFirstName: string = '';
  childLastName: string = '';
  dateOfBirth: string = '';
  dateOfAdmission: string = '';
  caregiverId: number | null = null;
  jmbg: string = '';
  placeOfBirth: string = '';
  selectedImage: File | null = null;
  parentName: string = '';
  notes: string = '';
  children: any[] = [];
  selectedChild: any = {};
  successMessage: string | null = null;
  errorMessage: string | null = null;
    // Nove varijable za pretraživanje
    searchFirstName: string = '';
    searchLastName: string = '';
    searchQuery: string = '';
    searchResult: any = null; // Rezultat pretrage
noSearchResult: boolean = false; // Da li postoji rezultat pretrage

  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadChildren();
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
    (window as any).$('#childModal').modal('show');
  }

  openEditModal(child: any): void {
    this.selectedChild = { ...child }; // Create a copy of the child for editing
    (window as any).$('#editChildModal').modal('show');
  }

  onImageChange(event: any): void {
    this.selectedImage = event.target.files[0] as File;
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }
  getFilenameFromPath(path: string): string {
    return path.split('/').pop() || '';
  }
  getImageUrl(path: string): string {
    // Pretpostavljamo da je putanja relativna od korena aplikacije
    return `http://localhost:5000/uploads/${this.getFilenameFromPath(path)}`;
  }


  convertDateToMySQLFormat(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Month je 0-based
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  addChild(): void {
    if (!this.childFirstName || !this.childLastName || !this.dateOfBirth || !this.dateOfAdmission || !this.jmbg || !this.placeOfBirth) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', this.childFirstName);
    formData.append('last_name', this.childLastName);
    formData.append('date_of_birth', this.convertDateToMySQLFormat(new Date(this.dateOfBirth)));
    formData.append('date_of_admission', this.convertDateToMySQLFormat(new Date(this.dateOfAdmission)));
    // No need to append caregiver_id
    formData.append('jmbg', this.jmbg);
    formData.append('place_of_birth', this.placeOfBirth);
    formData.append('image', this.selectedImage ? this.selectedImage : new Blob(), this.selectedImage ? this.selectedImage.name : '');
    formData.append('parent_name', this.parentName);
    formData.append('notes', this.notes);

    this.http.post('http://localhost:5000/caregiver/add_child', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Add successful', response);
        this.loadChildren(); // Reload children after adding a new one
        this.closeModal('#childModal');
        (window as any).$('#childModal').modal('hide');
        // Reset form fields
        this.childFirstName = '';
        this.childLastName = '';
        this.dateOfBirth = '';
        this.dateOfAdmission = '';
        this.jmbg = '';
        this.placeOfBirth = '';
        this.selectedImage = null;
        this.parentName = '';
        this.notes = '';
      },
      error => {
        console.error('Add failed', error);
        // Handle error
      }
    );
  }


  updateChild(): void {
    if (!this.selectedChild.first_name || !this.selectedChild.last_name) {
      alert('Please provide a title for the child.');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', this.selectedChild.first_name);
    formData.append('last_name', this.selectedChild.last_name);
    formData.append('date_of_birth', this.convertDateToMySQLFormat(new Date(this.selectedChild.date_of_birth)));
    formData.append('date_of_admission', this.convertDateToMySQLFormat(new Date(this.selectedChild.date_of_admission)));
    // No need to append caregiver_id
    formData.append('jmbg', this.selectedChild.jmbg);
    formData.append('place_of_birth', this.selectedChild.place_of_birth);
    formData.append('image', this.selectedImage ? this.selectedImage : new Blob(), this.selectedImage ? this.selectedImage.name : '');
    formData.append('parent_name', this.selectedChild.parent_name);
    formData.append('notes', this.selectedChild.notes);

    this.http.put(`http://localhost:5000/caregiver/update_child/${this.selectedChild.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadChildren();
        this.closeModal('#editChildModal');
        (window as any).$('#editChildModal').modal('hide');
        this.selectedChild = {};
        this.selectedImage = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }
  searchChildren(): void {
    const queryParams: any = {};
  
    if (this.searchFirstName) {
      queryParams.first_name = this.searchFirstName;
    }
    if (this.searchLastName) {
      queryParams.last_name = this.searchLastName;
    }
    if (this.jmbg) {
      queryParams.jmbg = this.jmbg;
    }
  
    this.http.get('http://localhost:5000/caregiver/search_get_children', {
      params: queryParams,
      withCredentials: true
    }).subscribe(
      (response: any) => {
        if (response.length === 0) {
          this.noSearchResult = true; 
          this.searchResult = null;
          this.loadChildren(); 
        } else if (response.length === 1) {
          this.noSearchResult = false; 
          this.searchResult = response[0];
          this.children = []; 
        } else {
          this.noSearchResult = false; 
          this.searchResult = null;
          this.children = response;
        }
      },
      error => {
        console.error('Failed to search children', error);
      }
    );
  }
  

  openDeleteModal(child: any): void {
    this.selectedChild = child;
    const modal = document.getElementById('deleteChildModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteChildModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  confirmDelete(childId: number): void {
    this.http.delete(`http://localhost:5000/caregiver/delete_child/${childId}`).subscribe(() => {
      this.successMessage = 'Child deleted successfully';
      this.errorMessage = null;
      this.loadChildren();  // Reload children after deletion
      this.closeDeleteModal();

      // Reset message after 3 seconds
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    }, (error) => {
      this.errorMessage = 'Error deleting child';
      this.successMessage = null;
      this.closeDeleteModal();

      // Reset message after 3 seconds
      setTimeout(() => {
        this.errorMessage = null;
      }, 3000);
    });
  }

  loadChildren(): void {
    this.http.get('http://localhost:5000/caregiver/get_children', { withCredentials: true }).subscribe(
      (response: any) => {
        this.children = response; // Update children array with response data
      },
      error => {
        console.error('Failed to load children', error);
      }
    );
  }
  loadChildren2(): void {
    this.http.get('http://localhost:5000/caregiver/get_children_ID', { withCredentials: true }).subscribe(
      (response: any) => {
        this.children = response; // Update children array with response data
      },
      error => {
        console.error('Failed to load children', error);
      }
    );
  }
  

  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;

    // You might want to navigate to the login page or refresh the page after logout
  }
}
