import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = ''; // Definiše promjenljivu `email` tipa string koja čuva unos korisnikovog email-a. Podrazumjevana vrijednost je prazan string.
  password: string = ''; // Definiše promjenljivu `password` tipa string koja čuva unos lozinke.
  rememberMe: boolean = false; // Definiše promjenljivu `rememberMe` koja čuva stanje checkbox-a "zapamti me".
  error: string = ''; // Definiše promjenljivu `error` koja će čuvati eventualne poruke o greškama tokom prijave.
  isPasswordVisible: boolean = false;  // Definiše promjenljivu `isPasswordVisible` koja kontroliše vidljivost lozinke.

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() { // Definiše metodu `onSubmit` koja se poziva kada korisnik pošalje formu za prijavu.
    this.authService.login(this.email, this.password, this.rememberMe)     // Poziva metodu `login` iz `AuthService` koja šalje email, lozinku i status "zapamti me" na server.
      .subscribe(
        response => {
          console.log('Login response:', response); 
          const userRole = this.authService.getRole(); // Dohvata ulogu korisnika nakon prijave pomoću metode `getRole` iz `AuthService`.
          console.log('User role after login:', userRole); 
  
          if (userRole === 'admin') {
            this.router.navigate(['/admin/dashboard']);    // Ako je korisnikova uloga 'admin', preusmjerava ga na dashboard za administratore.
          } else if (userRole === 'donor') {
            this.router.navigate(['/home']);     // Ako je uloga 'donor', preusmjerava ga na početnu stranicu.
          } else if (userRole === 'director') {
            this.router.navigate(['/direktor/dashboard']);  // Ako je uloga 'director', preusmjerava ga na dashboard za direktore.
          } else if (userRole === 'caregiver') {
            this.router.navigate(['/njegovatelj/dashboard']);   // Ako je uloga 'caregiver' (negovatelj), preusmjerava ga na dashboard za negovatelje.
          }
        },
        error => {
         // Ako dođe do greške tokom prijave, izvršava se ovaj blok koda.
          console.log('Login error:', error); // Ispisuje grešku u konzolu radi praćenja.
          this.error = 'Neuspješna prijava. Provjerite svoje podatke.';
        }
      );
  }

  togglePasswordVisibility() { // Definiše metodu `togglePasswordVisibility` koja menja stanje vidljivosti lozinke.
    this.isPasswordVisible = !this.isPasswordVisible;  // Prebacivanje statusa vidljivosti lozinke
    const passwordField: any = document.getElementById('password');   // Pronalazi HTML element za unos lozinke pomoću `document.getElementById`.
    if (this.isPasswordVisible) {
      passwordField.type = 'text';     // Ako je `isPasswordVisible` `true`, postavlja tip polja lozinke na `text` kako bi se lozinka vidjela.
    } else {
      passwordField.type = 'password';    // Ako je `isPasswordVisible` `false`, postavlja tip polja nazad na `password` kako bi lozinka bila skrivena.
    }
  }
}
