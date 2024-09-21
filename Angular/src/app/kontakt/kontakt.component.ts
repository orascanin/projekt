import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-kontakt',
  templateUrl: './kontakt.component.html',
  styleUrl: './kontakt.component.css'
})
export class KontaktComponent implements OnInit{
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  contact = {  // Objekt koji čuva podatke za kontakt formu.
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  private apiUrl = 'http://localhost:5000/send_email';
  constructor(private authService: AuthService,private router: Router,private http: HttpClient,private fb: FormBuilder) {}
 

  ngOnInit(): void {
    this.checkLoginStatus();  // Poziva metodu za provjeru statusa prijave korisnika.

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
  onSubmit() {   // Metoda koja se poziva kada se forma pošalje.
    this.http.post<any>(this.apiUrl, this.contact)
      .subscribe(
        response => {
          this.showMessage('Poruka je uspješno poslana!', 'success');  // Ako je HTTP POST zahtjev uspješan:
          this.resetForm();
        },
        error => {
          this.showMessage('Došlo je do greške pri slanju poruke.', 'error'); // Ako dođe do greške pri slanju poruke:
        }
      );
  }
  // Metoda koja prikazuje poruku korisniku.
  private showMessage(message: string, type: string) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) { // Ako element postoji:
      successMessage.innerText = message;
      successMessage.className = type === 'success' ? 'alert alert-success' : 'alert alert-danger';  // Postavlja tekst poruke.
      successMessage.style.display = 'block';  // Postavlja CSS klasu na osnovu tipa poruke (uspjeh ili greška).
      setTimeout(() => { // Prikazuje poruku.
        successMessage.style.display = 'none';
      }, 5000); // Sakrij poruku nakon 5 sekundi
    }
  }

  private resetForm() {   // Metoda koja resetuje kontakt formu.
    this.contact = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
   // Metoda koja odjavljuje korisnika.
  logout(): void {
    this.authService.logout(); 
    this.isLoggedIn = false;

  }
}
