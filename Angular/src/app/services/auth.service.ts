
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root' // Osigurava da je auth.service.ts dostupan na nivou cijele aplikacije
})
export class AuthService {
  private apiUrl = 'http://localhost:5000'; // URL vašeg Flask API-a
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null); //varijabla za praćenje trenutnog korisnika
  public currentUser: Observable<any> = this.currentUserSubject.asObservable(); // varijabla za praćenje promjena korisnika
  private redirectUrl: string = ''; // Drži URL na koji treba vratiti korisnika nakon login-a
  private userId: number | null = null; // uzima ID trenutno prijavljenog korisnika
  private socket: Socket; // Dodaj Socket.IO klijent
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' // HTTP zaglavlje za JSON sadržaj
    }),
    withCredentials: true // Omogućava slanje kolačića za autentifikaciju
  };

  constructor(private http: HttpClient, private router: Router) {
    // Učitajte korisnika ako je već prijavljen
       // Inicijalizacija SocketIO klijenta
       this.socket = io(this.apiUrl);

    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (storedUser) {
      this.currentUserSubject.next(storedUser); // Ažuriraj trenutnog korisnika
    }
 
  }

  login(email: string, password: string, rememberMe: boolean): Observable<any> {  // Definiše metodu `login` koja prima tri parametra: `email`, `password`, i `rememberMe`. 
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password, remember_me: rememberMe }, this.httpOptions) // URL poziva API-ja je `${this.apiUrl}/login` (kombinuje osnovni URL `apiUrl` sa `/login` endpointom).
      .pipe( // Metoda `pipe` se koristi za obradu rezultata iz HTTP zahtjeva, omogućavajući manipulaciju podacima iz `Observable`.
        tap(response => { 
          if (response && response.user) { // Provjerava da li odgovor (`response`) postoji i da li sadrži korisničke podatke (`response.user`).
            // Spremanje korisničkih podataka i tokena u localStorage
            console.log('User Data from Backend:', response.user);
            localStorage.setItem('currentUser', JSON.stringify(response.user)); // Pohranjivanje korisnika
            
            if (response.token) {
              console.log('Token received from backend:', response.token);
              localStorage.setItem('token', response.token); // Spremanje tokena
            }
            
            this.currentUserSubject.next(response.user); // Ažuriranje trenutnog korisnika
            if (this.redirectUrl) {
              this.router.navigate([this.redirectUrl]); // Preusmjeravanje nakon prijave
              this.redirectUrl = ''; // Resetiraj URL
            } else {
              this.router.navigate(['/home']); // Preusmjeravanje na početnu stranicu
            }
          }
        }),
        catchError(this.handleError) // obrada greške
      );
  }
// Funkcija za registraciju korisnika
// Ova funkcija prima `userData`, podatke o korisniku, i vraća Observable koji omogućava praćenje odgovora servera.
register(userData: any): Observable<any> {
  
  // Vraća rezultat HTTP POST zahtjeva prema API-ju na URL-u `${this.apiUrl}/register`.
  // `userData` sadrži podatke o korisniku (ime, prezime, email, lozinka itd.) koji se šalju u tijelu zahtjeva.
  // `this.httpOptions` postavlja zaglavlja zahtjeva, npr. za Content-Type ili autorizaciju, ako je potrebno.
  return this.http.post<any>(`${this.apiUrl}/register`, userData, this.httpOptions)
    
    // Koristi `pipe` metodu da uključi dodatne operatore na Observable koji se vraća. 
    .pipe(
      
      // Operator `catchError` presreće eventualne greške koje se mogu dogoditi tokom slanja HTTP zahtjeva.
      // Ako dođe do greške, poziva se `handleError` funkcija, koja obrađuje grešku.
      catchError(this.handleError)
    );
}


   // Funkcija za odjavu korisnika
  logout() {
    localStorage.removeItem('currentUser'); // Brisanje korisničkih podataka
    localStorage.removeItem('token'); // Uklonite token prilikom odjave
    this.currentUserSubject.next(null); // Postavljanje trenutnog korisnika na null
    this.router.navigate(['/home']); // Preusmjeravanje na početnu stranicu nakon odjave
  }
  
 // Funkcija za dobivanje trenutnog korisnika
  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('Current User:', user);
    return user;
  }

  // Provjera je li korisnik prijavljen
  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  // Dobivanje korisničke uloge
  getRole(): string {
    const user = this.getCurrentUser();
    return user.role || ''; // Vraća ulogu korisnika ili prazan string
  }
  // Dobivanje korisničkog imena
  getUsername(): string {
    const user = this.getCurrentUser();
    return user.first_name || 'Profil'; // Prikaži ime korisnika ili default 'Profil'
  }
  // Postavljanje URL-a za preusmjeravanje
  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }
  // Obrada grešaka
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);// Ispis greške u konzolu
    throw error;
  }
  // Dodavanje korisnika (za admina)
  addUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/add_user`, userData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  // Dobivanje liste korisnika (za admina)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // Ažuriranje korisnika (za admina)
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/update_user/${userId}`, userData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
   // Brisanje korisnika (za admina)
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/delete_user/${userId}`);
  }
    // Osvježavanje tokena
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response && response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));// Ažuriranje trenutnog korisnika
            if (response.token) {
              localStorage.setItem('token', response.token); // Ažurirajte token
            }
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(this.handleError)
      );
  }
 // Dohvatanje tokena iz localStorage-a
  getToken(): string | null {
    return localStorage.getItem('token'); // Provjerite da li pohranjujete token u localStorage
  }

  // Nova funkcija za provjeru i postavljanje tokena
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Nova funkcija za uklanjanje tokena
  removeToken(): void {
    localStorage.removeItem('token');
  }
  
  updateUserProfile(userData: any): Observable<any> {
    const token = this.getToken(); // Dobijanje tokena iz localStorage
    const currentUser = this.getCurrentUser(); // Dobijanje trenutno prijavljenog korisnika
    const userId = currentUser.id; // Pretpostavljamo da imate ID korisnika u `currentUser`

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Dodajte Authorization zaglavlje
    });

    // Pošaljite zahtev za ažuriranje korisničkih podataka samo za trenutno prijavljenog korisnika
    return this.http.put<any>(`${this.apiUrl}/donor/update_user/${userId}`, userData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
 // Dohvatanje ID-a trenutnog korisnika
  getUserId(): number | null {
    const currentUser = this.getCurrentUser();
    return currentUser.id || null; 
  } 
    
 // Dobivanje poruka između dva korisnika
  getMessages(senderId: number, receiverId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get_messages`, {
      params: { sender_id: senderId.toString(), receiver_id: receiverId.toString() }
    });
  }
    // Slanje poruke
  sendMessage(senderId: number, receiverId: number, messageText: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send_message`, { sender_id: senderId, receiver_id: receiverId, message_text: messageText });
  }
    // Dobivanje nedavnih razgovora korisnika
  getRecentChats(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-chats/${userId}`);
  }
  // Dobivanje donacija po danu
  getDonationsByDay(year: number, month: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/donations/${year}/${month}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  //Funkcija za slanje email
  // Definiše metodu `sendContactEmail` koja prima četiri argumenta: `name`, `email`, `subject`, i `message` tipa `string`.
// Ova metoda vraća `Observable<any>`, što znači da će se poziv API-ja izvršiti asinhrono i može se pretplatiti na rezultat.
  sendContactEmail(name: string, email: string, subject: string, message: string): Observable<any> {
    const body = { name, email, subject, message }; // Kreira objekt `body` koji sadrži proslijeđene parametre: `name`, `email`, `subject`, i `message`.
    // Vraća rezultat HTTP POST zahteva koristeći `this.http.post<any>`, gdje:
// `${this.apiUrl}/send_email` - formira URL poziva API-ja dodavanjem `/send_email` na osnovni URL (`this.apiUrl`).
// `body` je telo zahtjeva koje sadrži podatke (ime, email, naslov i poruku) koji se šalju na server.
// `this.httpOptions` - postavlja opcije za HTTP zahtev, poput zaglavlja (npr. `Content-Type`).
    return this.http.post<any>(`${this.apiUrl}/send_email`, body, this.httpOptions)
      .pipe(
        catchError(this.handleError)
// `catchError` operator iz `rxjs` služi za hvatanje i obradu grešaka koje se mogu dogoditi tokom HTTP zahtjeva.
// Ako dođe do greške, ona će biti obrađena unutar metode `handleError`.
      );
  }
  
  // Funkcija za dobivanje vremenskih podataka
getWeather(city: string): Observable<any> {
  const apiKey = 'c974f956dd45e95a43429cafbd1ecd10'; // Ovdje stavi svoj API ključ za vremenske podatke
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // Koristi OpenWeatherMap API URL

  return this.http.get<any>(url) // HTTP GET zahtjev prema API-ju za vremenske podatke
    .pipe(
      catchError(this.handleError) // Obrada grešaka
    );
}


}
