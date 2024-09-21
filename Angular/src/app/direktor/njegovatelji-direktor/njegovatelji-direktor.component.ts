import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
declare const bootstrap: any;
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'director' | 'caregiver' | 'donor';
  // Dodaj ostala polja prema potrebi
}

@Component({
  selector: 'app-njegovatelji-direktor',
  templateUrl: './njegovatelji-direktor.component.html',
  styleUrl: './njegovatelji-direktor.component.css'
})
export class NjegovateljiDirektorComponent implements OnInit {

  isLoggedIn: boolean = false;
  userRole: string = '';
  userName: string = '';
  //users: any[] = [];
  users: any[] = [];
  selectedUser: any = {};
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private http: HttpClient, private router: Router,private modalService: NgbModal) { }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadUsers();
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
  openCreateModal(): void {
    this.selectedUser = {};
    (window as any).$('#createUserModal').modal('show');
  }

  openEditModal(user: any): void {
    this.selectedUser = { ...user };
    (window as any).$('#editUserModal').modal('show');
  }

      closeModal(modalId: string): void {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.hide();
        }
      }


  createUser(): void {
    if (!this.selectedUser.first_name || !this.selectedUser.last_name || !this.selectedUser.email) {
      alert('Please fill in all required fields.');
      return;
    }
   

    this.http.post('http://localhost:5000/director/add_user', this.selectedUser, { withCredentials: true }).subscribe(
      response => {
        this.successMessage = 'User created successfully';
        this.errorMessage = null;
        this.loadUsers();
        this.closeModal('createUserModal');
        (window as any).$('#createUserModal').modal('hide'); // Hide modal on success
      // this.closeModal();
      },
      error => {
        console.error('Creation failed', error);
        this.errorMessage = 'Error creating user';
        this.successMessage = null;
      }
    );
  }

  updateUser(): void {
    if (!this.selectedUser.id || !this.selectedUser.first_name || !this.selectedUser.last_name || !this.selectedUser.email) {
      alert('Please fill in all required fields.');
      return;
    }
  

    this.http.put(`http://localhost:5000/director/update_user/${this.selectedUser.id}`, this.selectedUser, { withCredentials: true }).subscribe(
      response => {
        this.successMessage = 'User updated successfully';
        this.errorMessage = null;
        this.loadUsers();
        //this.closeModal();
        this.closeModal('editUserModal');
        (window as any).$('#editUserModal').modal('hide'); // Hide modal on success
        this.selectedUser='';
      },
      error => {
        console.error('Update failed', error);
        this.errorMessage = 'Error updating user';
        this.successMessage = null;
      }
    );
  }

  openDeleteModal(user: any): void {
    this.selectedUser = user;
    const modal = document.getElementById('deleteUserModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }


    loadUsers(): void {
      this.http.get<User[]>('http://localhost:5000/director/users', { withCredentials: true }).subscribe(
        (response: User[]) => {
          // Filtriranje korisnika sa rolom 'caregiver'
          this.users = response.filter(user => user.role === 'caregiver');
        },
        error => {
          console.error('Failed to load users', error);
        }
      );
    }

  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
   
    // You might want to navigate to the login page or refresh the page after logout
  }
}
