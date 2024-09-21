import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-menadzment',
  templateUrl: './menadzment.component.html',
  styleUrl: './menadzment.component.css'
})
export class MenadzmentComponent {
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  
  constructor(private authService: AuthService,private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
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

  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    // You might want to navigate to the login page or refresh the page after logout
  }
}
