import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare const bootstrap: any;
@Component({
  selector: 'app-djeca-admin',
  templateUrl: './djeca-admin.component.html',
  styleUrl: './djeca-admin.component.css'
})
export class DjecaAdminComponent implements OnInit{
  isLoggedIn: boolean = false;   // Varijabla koja prati da li je korisnik prijavljen
  userRole: string = '';// Varijabla koja prati ulogu korisnika
  userName: string = '';  // Varijabla za spremanje korisničkog imena
  childFirstName: string = '';  // Ime djeteta koje se unosi u formi
  childLastName: string = '';  // Prezime djeteta
  dateOfBirth: string = '';  // Datum rođenja dejteta
  dateOfAdmission: string = '';  // Datum prijema djeteta u sistem
  caregiverId: number | null = null;  // ID staratelja (nullable vrednost)
  jmbg: string = '';  // JMBG deteta
  placeOfBirth: string = '';  // Mesto rođenja deteta
  selectedImage: File | null = null;  // Datoteka slike djeteta (može biti null)
  parentName: string = '';  // Ime roditelja
  notes: string = '';  // Napomene o djetetu
  children: any[] = [];  // Cijela lista  djece iz baze
  selectedChild: any = {};  // Trenutno odabrano djete za uređivanje
  successMessage: string | null = null;  // Poruka uspeha operacije (nullable)
  errorMessage: string | null = null;  // Poruka greške operacije (nullable)


  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    private http: HttpClient
  ) {}

  ngOnInit(): void {  // Metoda koja se pokreće kada se komponenta inicijalizuje
    this.checkLoginStatus();  // Provera statusa prijave korisnika
    this.loadChildren();  // Učitavanje liste dece iz baze
  }
  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn(); 
    
    if (this.isLoggedIn) {
  
      this.userRole = this.authService.getRole();
      const user = this.authService.getCurrentUser();
      this.userName = user.first_name;
    } else {
      this.userRole = 'guest';
    }
  }
  openModal(): void { // Otvaranje modala za dodavanje djeteta
    (window as any).$('#childModal').modal('show');
  }

  openEditModal(child: any): void { // Otvaranje modala za uređivanje djeteta
    this.selectedChild = { ...child };
    (window as any).$('#editChildModal').modal('show');
  }

  onImageChange(event: any): void { // Obrada promjene slike
    this.selectedImage = event.target.files[0] as File;
  }

  closeModal(modalId: string): void { // Zatvaranje modala prema njegovom ID-u
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }
  getFilenameFromPath(path: string): string { // Funkcija za dobivanje naziva datoteke
    return path.split('/').pop() || '';
  }
  getImageUrl(path: string): string { // Funkcija za dobavljanje URL-a slike
    // Pretpostavljamo da je putanja relativna od korjena aplikacije
    return `http://localhost:5000/uploads/${this.getFilenameFromPath(path)}`;
  }


  convertDateToMySQLFormat(date: Date): string { // Konverzija datuma u format MySQL-a
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); 
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  addChild(): void { // Dodavanje novog djeteta
    if (!this.childFirstName || !this.childLastName || !this.dateOfBirth || !this.dateOfAdmission || !this.jmbg || !this.placeOfBirth) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', this.childFirstName);
    formData.append('last_name', this.childLastName);
    formData.append('date_of_birth', this.convertDateToMySQLFormat(new Date(this.dateOfBirth)));
    formData.append('date_of_admission', this.convertDateToMySQLFormat(new Date(this.dateOfAdmission)));
    formData.append('caregiver_id', this.caregiverId ? this.caregiverId.toString() : '');
    formData.append('jmbg', this.jmbg);
    formData.append('place_of_birth', this.placeOfBirth);
    formData.append('image', this.selectedImage ? this.selectedImage : new Blob(), this.selectedImage ? this.selectedImage.name : '');
    formData.append('parent_name', this.parentName);
    formData.append('notes', this.notes);

    this.http.post('http://localhost:5000/admin/add_child', formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Add successful', response);
        this.loadChildren(); 
        this.closeModal('#childModal');
        (window as any).$('#childModal').modal('hide');
   
        this.childFirstName = '';
        this.childLastName = '';
        this.dateOfBirth = '';
        this.dateOfAdmission = '';
        this.caregiverId = null;
        this.jmbg = '';
        this.placeOfBirth = '';
        this.selectedImage = null;
        this.parentName = '';
        this.notes = '';
      },
      error => {
        console.error('Add failed', error);
    
      }
    );
  }

  updateChild(): void { // Uređivanje podataka o djetetu
    if (!this.selectedChild.first_name || !this.selectedChild.last_name) {
      alert('Please provide a title for the child.');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', this.selectedChild.first_name);
    formData.append('last_name', this.selectedChild.last_name);
    formData.append('date_of_birth', this.convertDateToMySQLFormat(new Date(this.selectedChild.date_of_birth)));
    formData.append('date_of_admission', this.convertDateToMySQLFormat(new Date(this.selectedChild.date_of_admission)));
    formData.append('caregiver_id', this.selectedChild.caregiver_id ? this.selectedChild.caregiver_id.toString() : '');
    formData.append('jmbg', this.selectedChild.jmbg);
    formData.append('place_of_birth', this.selectedChild.place_of_birth);
    formData.append('image', this.selectedImage ? this.selectedImage : new Blob(), this.selectedImage ? this.selectedImage.name : '');
    formData.append('parent_name', this.selectedChild.parent_name);
    formData.append('notes', this.selectedChild.notes);

    this.http.put(`http://localhost:5000/admin/update_child/${this.selectedChild.id}`, formData, { withCredentials: true }).subscribe(
      response => {
        console.log('Update successful', response);
        this.loadChildren();
        this.closeModal('#editChildModal');
        (window as any).$('#editChildModal').modal('hide');
        this.selectedChild = {};
        this.selectedImage = null;
      },
      error => {
        console.error('Update failed', error);
      }
    );
  }


  
  loadChildren(): void { // Ispis liste djece
    this.http.get('http://localhost:5000/admin/get_children', { withCredentials: true }).subscribe(
      (response: any) => {
        this.children = response; 
      },
      error => {
        console.error('Failed to load children', error);
      }
    );
  }

    
    openDeleteModal(procurement: any): void { // Otvaranje modela za brisanje
      this.selectedChild = procurement;
      const modal = document.getElementById('deleteChildModal');
      if (modal) {
        modal.style.display = 'block';
      }
    }
  
    closeDeleteModal(): void { // Zatvaranje modela za brisanje
      const modal = document.getElementById('deleteChildModal');
      if (modal) {
        modal.style.display = 'none';
      }
    }
  
    confirmDelete(childId: number): void { // Brisanje djeteta
      this.http.delete(`http://localhost:5000/admin/delete_child/${childId}`).subscribe(() => {
        this.successMessage = 'Child deleted successfully';
        this.errorMessage = null;
        this.loadChildren();  
        this.closeDeleteModal();
  
       
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      }, (error) => {
        this.errorMessage = 'Error deleting child';
        this.successMessage = null;
        this.closeDeleteModal();
  
        // Reset message after 3 seconds
        setTimeout(() => {
          this.errorMessage = null;
        }, 3000);
      });
    }
  
  


  logout(): void { // Funkcija za odjavu
    this.authService.logout(); 
    this.isLoggedIn = false;
  
    
  }
}
