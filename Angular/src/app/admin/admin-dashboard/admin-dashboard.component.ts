import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApexOptions } from 'ng-apexcharts';
interface DailyDonation {
  date: string;
  total_amount: string; // `total_amount` je string, ne broj
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']  // ispravi naziv u `styleUrls`
})
export class AdminDashboardComponent implements OnInit {
  isLoggedIn: boolean = false; // Status prijave korisnika
  userRole: string = ''; // Uloga korisnika
  userName: string = ''; // Ime korisnika
  currentUserId: number | null = null; // ID trenutnog korisnika
  chatUsers: any[] = []; // Lista korisnika za chat
  filteredUsers: any[] = []; // Filtrirani korisnici na osnovu pretrage
  selectedUser: any = null; // Odabrani korisnik za chat
  chatMessages: any[] = []; // Poruke chata
  messageText: string = ''; // Tekst poruke koji korisnik unosi
  searchTerm: string = ''; // Termin za pretragu korisnika
  showUserList: boolean = false; // Status za prikazivanje liste korisnika
  recentChats: any[] = []; // Nedavne chat poruke
  donations: any[] = []; // Lista donacija
  year: number = new Date().getFullYear(); // Trenutna godina
  month: number = new Date().getMonth() + 1; // Trenutni mesec (1-12)
  weatherData: any;
  city: string = 'Bihać'; // Grad za koji želiš dohvatiti vremenske podatke
  currentTime: string = ''; // Inicijalizovana sa praznim stringom

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus(); // Provera statusa prijave
    this.loadChatUsers(); // Učitavanje korisnika za chat
    this.loadDonations(); // Učitavanje donacija
    this.getWeather();
    this.updateTime(); // Poziv funkcije koja prikazuje trenutno vrijeme
    setInterval(() => {
      this.updateTime(); // Osvježava vrijeme svakih 1000ms (1 sekunda)
    }, 1000);
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userRole = this.authService.getRole();
      const user = this.authService.getCurrentUser();
      this.userName = user.first_name;
      this.currentUserId = this.authService.getUserId();
    } else {
      this.userRole = 'guest';
    }
  }

  loadChatUsers(): void { // Metoda za učitavanje korisnika za chat
    this.authService.getUsers().subscribe(users => { // Pozivanje auth.service.ts za dobijanje korisnika
      this.chatUsers = users; // Postavljanje svih korisnika
      this.filteredUsers = users; // Postavljanje filtriranih korisnika
      this.loadRecentChats(); // Učitavanje nedavnih chatova
    });
  }
loadRecentChats(): void { // Metoda za učitavanje nedavnih chatova
    if (this.currentUserId !== null) { // Provera da li je ID korisnika postavljen
      this.authService.getRecentChats(this.currentUserId).subscribe(recentChats => { // Pozivanje servisa za dobijanje nedavnih chatova
        this.recentChats = recentChats; // Postavljanje nedavnih chatova
        this.filteredUsers = [...this.recentChats, ...this.filteredUsers]; // Kombinovanje nedavnih chatova i filtriranih korisnika
      });
    }
  }

 onSearch(event: Event): void { // Metoda koja se poziva na pretragu korisnika
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase(); // Uzimanje unetog teksta i konvertovanje u mala slova
    if (this.searchTerm) { // Ako je unet tekst
      this.filteredUsers = this.chatUsers.filter(user => // Filtriranje korisnika na osnovu pretrage
        (user.first_name + ' ' + user.last_name).toLowerCase().includes(this.searchTerm) // Provera da li ime i prezime uključuju pretragu
      );
    } else {
      this.filteredUsers = [...this.recentChats, ...this.chatUsers]; // Ako nema pretrage, vraćanje svih korisnika
    }
    this.showUserList = true; // Prikazivanje liste korisnika
  }

  selectUser(user: any, event: Event): void { // Metoda za selektovanje korisnika
    event.preventDefault(); // Sprečavanje podrazumevanog ponašanja
    event.stopPropagation(); // Sprečavanje propagacije događaja
    this.selectedUser = user; // Postavljanje odabranog korisnika
    this.loadMessages(); // Učitavanje poruka za odabranog korisnika
    this.searchTerm = ''; // Resetovanje termina za pretragu
    this.filteredUsers = []; // Resetovanje filtriranih korisnika
    this.showUserList = false; // Sakrivanje liste korisnika
  }

  loadMessages(): void { // Metoda za učitavanje poruka
    if (this.selectedUser && this.currentUserId !== null) { // Provera da li je odabran korisnik i da li je ID korisnika postavljen
      this.authService.getMessages(this.currentUserId, this.selectedUser.id).subscribe(messages => { // Pozivanje servisa za dobijanje poruka
        this.chatMessages = messages; // Postavljanje učitanih poruka
        console.log('Loaded messages:', this.chatMessages); // Ispis poruka u konzoli
      }, error => {
        console.error('Error loading messages:', error); // Ispis greške u konzoli
      });
    }
  }

  sendMessage(): void { // Metoda za slanje poruke
    if (this.selectedUser && this.messageText.trim() && this.currentUserId !== null) { // Provera da li je odabran korisnik, da li je tekst poruke prazan i da li je ID korisnika postavljen
      this.authService.sendMessage(this.currentUserId, this.selectedUser.id, this.messageText).subscribe(() => { // Pozivanje servisa za slanje poruke
        const newMessage = { // Kreiranje nove poruke
          sender_id: this.currentUserId, // ID pošiljaoca
          receiver_id: this.selectedUser.id, // ID primaoca
          message_text: this.messageText, // Tekst poruke
          created_at: new Date().toISOString() // Vreme kreiranja poruke
        };
        this.chatMessages.push(newMessage); // Dodavanje nove poruke u listu poruka
        localStorage.setItem(`messages_${this.currentUserId}_${this.selectedUser.id}`, JSON.stringify(this.chatMessages)); // Čuvanje poruka u localStorage
        this.messageText = ''; // Resetovanje teksta poruke
      });
    }
  }

  loadDonations(): void { // Metoda za učitavanje donacija
    this.authService.getDonationsByDay(this.year, this.month) // Pozivanje servisa za dobijanje donacija
      .subscribe(data => {
        this.donations = data; // Postavljanje učitanih donacija
      });
  }

  onYearChange(newYear: number): void { // Metoda koja se poziva pri promeni godine
    this.year = newYear; // Postavljanje nove godine
    this.loadDonations(); // Učitavanje donacija za novu godinu
  }

  onMonthChange(newMonth: number): void { // Metoda koja se poziva pri promeni meseca
    this.month = newMonth; // Postavljanje novog meseca
    this.loadDonations(); // Učitavanje donacija za novi mesec
  }
  getWeather() {
    this.authService.getWeather(this.city).subscribe(
      data => {
        this.weatherData = data; // Postavi primljene podatke u varijablu
        console.log(this.weatherData);
      },
      error => {
        console.error('Error fetching weather data:', error);
      }
    );
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString(); // Postavlja trenutno formatirano vrijeme (HH:mm:ss)
  }
  logout(): void { // Metoda za odjavu
    this.authService.logout(); // Pozivanje servisa za odjavu
    this.isLoggedIn = false; // Postavljanje statusa prijave na false
  
  }
}
