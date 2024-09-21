import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare const bootstrap: any;
@Component({
  selector: 'app-djeca-direktor',
  templateUrl: './djeca-direktor.component.html',
  styleUrl: './djeca-direktor.component.css'
})
export class DjecaDirektorComponent implements OnInit{
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


  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadChildren();
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn(); // Check login status via auth service
    
    if (this.isLoggedIn) {
      // If user is logged in, fetch role and name
      this.userRole = this.authService.getRole();
      const user = this.authService.getCurrentUser();
      this.userName = user.first_name;
    } else {
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
    formData.append('caregiver_id', this.caregiverId ? this.caregiverId.toString() : '');
    formData.append('jmbg', this.jmbg);
    formData.append('place_of_birth', this.placeOfBirth);
    formData.append('image', this.selectedImage ? this.selectedImage : new Blob(), this.selectedImage ? this.selectedImage.name : '');
    formData.append('parent_name', this.parentName);
    formData.append('notes', this.notes);

    this.http.post('http://localhost:5000/director/add_child', formData, { withCredentials: true }).subscribe(
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
        this.caregiverId = null;
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
    formData.append('caregiver_id', this.selectedChild.caregiver_id ? this.selectedChild.caregiver_id.toString() : '');
    formData.append('jmbg', this.selectedChild.jmbg);
    formData.append('place_of_birth', this.selectedChild.place_of_birth);
    formData.append('image', this.selectedImage ? this.selectedImage : new Blob(), this.selectedImage ? this.selectedImage.name : '');
    formData.append('parent_name', this.selectedChild.parent_name);
    formData.append('notes', this.selectedChild.notes);

    this.http.put(`http://localhost:5000/director/update_child/${this.selectedChild.id}`, formData, { withCredentials: true }).subscribe(
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
    this.http.delete(`http://localhost:5000/director/delete_child/${childId}`).subscribe(() => {
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
    this.http.get('http://localhost:5000/director/get_children', { withCredentials: true }).subscribe(
      (response: any) => {
        this.children = response; // Update children array with response data
      },
      error => {
        console.error('Failed to load children', error);
      }
    );
  }

  logout(): void {
    this.authService.logout(); 
    this.isLoggedIn = false;
 

  }
}