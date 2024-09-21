
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
declare var PureCounter: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = '';
  userName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    new PureCounter();

    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      this.userRole = this.authService.getRole();
      const user = this.authService.getCurrentUser();
      this.userName = user.first_name;

      // Preusmjeravanje na dashboard ako je korisnik prijavljen
      if (this.userRole === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (this.userRole === 'director') {
        this.router.navigate(['/direktor/dashboard']);
      } else if (this.userRole === 'caregiver') {
        this.router.navigate(['/njegovatelj/dashboard']);
      }
    } else {
      this.userRole = 'guest';
    }
  }
  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
    // You might want to navigate to the login page or refresh the page after logout
  }
  doniraj(): void {
    if (!this.isLoggedIn) {
      // Sačuvaj trenutnu rutu
      this.authService.setRedirectUrl('/doniraj');
      // Ako korisnik nije prijavljen, preusmjeri ga na login stranicu
      this.router.navigate(['/login']);
    } else {
      // Ako je korisnik prijavljen, preusmjeri ga na stranicu za doniranje
      this.router.navigate(['/doniraj']);
    }
  }
}


