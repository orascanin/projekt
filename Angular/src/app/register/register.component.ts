import { Component } from '@angular/core';
import { Router } from '@angular/router';// Importuje `Router`, što omogućava navigaciju između različitih ruta unutar aplikacije.
import { AuthService } from '../services/auth.service'; // Importuje `AuthService`, koji pruža metode za autentifikaciju korisnika, uključujući registraciju.

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent { // Definiše `RegisterComponent` klasu koja će obuhvatiti funkcionalnost registracione forme.
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  gender: string = '';
  phoneNumber: string = '';
  country: string = '';
  city: string = '';
  address: string = '';
  postalCode: string = '';
  error: string = '';
// Ovdje se definišu varijable koje prate podatke unosa forme. Svaka varijabla predstavlja polje koje korisnik ispunjava (ime, email, lozinka, itd.). 
// `error` je string koji sadrži eventualnu grešku prilikom pokušaja registracije.
 
  passwordVisible: boolean = false; 
  confirmPasswordVisible: boolean = false;
  isPasswordVisible: boolean = false;  // Dodana varijabla za praćenje statusa vidljivosti lozinke
  // Ove tri varijable prate da li je vidljivost polja za lozinku i potvrdu lozinke uključena (true) ili isključena (false).
  constructor(private authService: AuthService, private router: Router) {}

 // Ova metoda prebacuje stanje varijable `confirmPasswordVisible`. Ako je `true`, postavlja se na `false` i obrnuto, čime se mijenja vidljivost polja za potvrdu lozinke.
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Lozinke se ne poklapaju.';
      return;
    }     // Provjerava da li unesena lozinka i potvrda lozinke nisu iste. Ako se ne poklapaju, postavlja se greška i izlazi se iz funkcije.
  
    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      gender: this.gender,
      phoneNumber: this.phoneNumber,
      country: this.country,
      city: this.city,
      address: this.address,
      postalCode: this.postalCode
    })  // Poziva metodu `register` iz `AuthService`, prosljeđujući podatke iz forme (ime, email, lozinku itd.).
    .subscribe(
      response => {
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Registration error:', error); 
        this.error = 'Registracija nije uspjela. Provjerite svoje podatke.';
      }
    );
  }  // Ako je registracija uspješna (`response`), korisnik se preusmjerava na login stranicu. Ako dođe do greške (`error`), prikazuje se poruka o grešci.
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;  // Prebacivanje statusa vidljivosti lozinke
    const passwordField: any = document.getElementById('password');
    if (this.isPasswordVisible) {
      passwordField.type = 'text';
    } else {
      passwordField.type = 'password';
    }
  } // Ova metoda prebacuje stanje varijable `isPasswordVisible` i mijenja tip polja za lozinku između `text` i `password`, čime korisnik može vidjeti ili sakriti unesenu lozinku.
}
  

