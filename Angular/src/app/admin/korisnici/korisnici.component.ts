import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
declare const bootstrap: any;

@Component({
  selector: 'app-korisnici',
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.css'
})
export class KorisniciComponent implements OnInit{


  users: any[] = [];
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  notificationMessage: string = ''; // Varijabla za obavijest
  paginatedUsers: any[] = [];
  newUser: any = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gender: '',
    phone_number: '',
    country: '',
    city: '',
    address: '',
    postal_code: '',
    role: ''
  };
  userToUpdate: any = {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gender: '',
    phone_number: '',
    country: '',
    city: '',
    address: '',
    postal_code: '',
    role: ''
  };
  



  deleteUserId: number | null = null;

  currentPage: number = 1;
  usersPerPage: number = 10;
  totalPages: number = 0;

  
 

  constructor(private authService: AuthService,private http: HttpClient,private router: Router) {}


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
  loadUsers(): void {
    this.authService.getUsers().subscribe(
      (data: any[]) => {
        this.users = data;
        this.totalPages = Math.ceil(this.users.length / this.usersPerPage);
        this.paginateUsers();
      },
      error => {
        console.error('Error loading users', error);
      }
    );
  }
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }
  

  addUser(): void {
    this.authService.addUser(this.newUser).subscribe(
      response => {
        console.log('User added successfully', response);
        this.loadUsers(); // Refresh the user list
        this.newUser = {
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          gender: '',
          phone_number: '',
          country: '',
          city: '',
          address: '',
          postal_code: '',
          role: ''
        }; // Reset form
        this.closeModal('addUserModal'); // Close modal
      },
      error => {
        console.error('Error adding user', error);
      }
    );
  }
 
  updateUser(): void {
    if (this.userToUpdate.id) {
      this.authService.updateUser(this.userToUpdate.id, this.userToUpdate).subscribe(
        response => {
          console.log('User updated successfully', response);
          this.loadUsers(); // Refresh the user list
          this.userToUpdate = { // Reset form
            id: null,
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            gender: '',
            phone_number: '',
            country: '',
            city: '',
            address: '',
            postal_code: '',
            role: '',
         
          };
          this.closeModal('editUserModal'); // Close modal
        },
        error => {
          console.error('Error updating user', error);
        }
      );
    } else {
      console.error('User ID is missing');
    }
  }

  selectUserForUpdate(user: any): void {
    this.userToUpdate = { ...user }; // Copy user data to the update form
  }
  selectUserForDelete(userId: number): void {
    this.deleteUserId = userId;
  }

  confirmDelete(): void {
    if (this.deleteUserId !== null) {
      this.authService.deleteUser(this.deleteUserId).subscribe(
        response => {
          console.log('User deleted successfully', response);
          this.loadUsers(); // Osvježite listu korisnika
          this.deleteUserId = null; // Resetirajte ID nakon brisanja
          this.notificationMessage = 'Korisnik uspješno uklonjen.'; 
          this.closeModal('deleteUserModal'); // Close modal
        },
        error => {
          console.error('Error deleting user', error);
        }
      );
    }
  }

  paginateUsers(): void {
    const startIndex = (this.currentPage - 1) * this.usersPerPage;
    const endIndex = startIndex + this.usersPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateUsers();
    }
  }

  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    // You might want to navigate to the login page or refresh the page after logout
  }
}

