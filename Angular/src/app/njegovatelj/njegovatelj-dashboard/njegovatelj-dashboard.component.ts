import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-njegovatelj-dashboard',
  templateUrl: './njegovatelj-dashboard.component.html',
  styleUrl: './njegovatelj-dashboard.component.css'
})
export class NjegovateljDashboardComponent implements OnInit {
  isLoggedIn: boolean = false; // Variable to track if user is logged in
  userRole: string = '';
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  currentUserId: number | null = null;
  chatUsers: any[] = [];
  filteredUsers: any[] = [];
  selectedUser: any = null;
  chatMessages: any[] = [];
  messageText: string = '';
  searchTerm: string = '';
  showUserList: boolean = false;
  recentChats: any[] = [];
  children: any[] = [];
  searchFirstName: string = ''; // Dodaj ovu liniju
  searchLastName: string = '';  // Dodaj ovu liniju
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  constructor(private authService: AuthService,private http: HttpClient,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadChatUsers();
    this.loadChildren2();
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

  loadChatUsers(): void {
    this.authService.getUsers().subscribe(users => {
      this.chatUsers = users;
      this.filteredUsers = users;
      this.loadRecentChats(); // Učitajte korisnike sa kojima je vršena komunikacija
    });
  }

  loadRecentChats(): void {
    if (this.currentUserId !== null) {
      this.authService.getRecentChats(this.currentUserId).subscribe(recentChats => {
        this.recentChats = recentChats;
        this.filteredUsers = [...this.recentChats, ...this.filteredUsers];
      });
    }
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (this.searchTerm) {
      this.filteredUsers = this.chatUsers.filter(user =>
        (user.first_name + ' ' + user.last_name).toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredUsers = [...this.recentChats, ...this.chatUsers];
    }
    this.showUserList = true;
  }

  selectUser(user: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedUser = user;
    this.loadMessages();
    this.searchTerm = '';
    this.filteredUsers = [];
    this.showUserList = false;
  }

  loadMessages(): void {
    if (this.selectedUser && this.currentUserId !== null) {
      this.authService.getMessages(this.currentUserId, this.selectedUser.id).subscribe(messages => {
        this.chatMessages = messages;
        console.log('Loaded messages:', this.chatMessages); // Provjerite u konzoli
      }, error => {
        console.error('Error loading messages:', error);
      });
    }
  }

  sendMessage(): void {
    if (this.selectedUser && this.messageText.trim() && this.currentUserId !== null) {
      this.authService.sendMessage(this.currentUserId, this.selectedUser.id, this.messageText).subscribe(() => {
        const newMessage = {
          sender_id: this.currentUserId,
          receiver_id: this.selectedUser.id,
          message_text: this.messageText,
          created_at: new Date().toISOString()
        };
        this.chatMessages.push(newMessage);
        localStorage.setItem(`messages_${this.currentUserId}_${this.selectedUser.id}`, JSON.stringify(this.chatMessages));
        this.messageText = '';
      });
    }
  }
  loadChildren2(): void {
    // Pozivanje API-ja za dobijanje liste dece pod nadzorom prijavljenog njegovatelja
    this.http.get('http://localhost:5000/caregiver/get_children_ID', { withCredentials: true })
      .subscribe(
        (response: any) => {
          this.children = response;
        },
        error => {
          console.error('Failed to load children', error);
        }
      );
  }

  // Getter funkcija za filtriranje djece
  get filteredChildren(): any[] {
    return this.children.filter(child =>
      child.first_name.toLowerCase().includes(this.searchFirstName.toLowerCase()) &&
      child.last_name.toLowerCase().includes(this.searchLastName.toLowerCase())
    );
  }
  logout(): void {
    this.authService.logout(); // Call logout method from auth service
    this.isLoggedIn = false;
  
    // You might want to navigate to the login page or refresh the page after logout
  }
}
