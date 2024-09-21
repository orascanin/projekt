import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root' //osigurava da je auth.guard.ts dostupan na nivou cijele aplikacije
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}
 // `canActivate` metoda definiše logiku za provjeru da li korisnik može pristupiti ruti
 // Prima `ActivatedRouteSnapshot` i `RouterStateSnapshot` koji sadrže informacije o trenutnoj ruti i stanju
  canActivate(
    route: ActivatedRouteSnapshot,   
    state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['role'];   // Dobija očekivanu ulogu iz podataka o ruti (`route.data['role']`). Ovo se postavlja prilikom definisanja rute
    const currentRole = this.authService.getRole();  // Dobija trenutnu ulogu korisnika pozivanjem metode `getRole()` iz `AuthService`.
  
    console.log('Trenutna uloga korisnika u AuthGuard:', currentRole);     // Ispisuje trenutnu ulogu korisnika u konzolu radi praćenja.
  
    if (this.authService.isLoggedIn() && currentRole === expectedRole) {   // Provjerava da li je korisnik prijavljen i da li njegova uloga odgovara očekivanoj ulozi za ovu rutu.
      return true;      // Ako su oba uslova ispunjena, pristup ruti je dozvoljen i metoda vraća `true`.
    } else {
      this.router.navigate(['/login']);    // Ako korisnik nije prijavljen ili nema odgovarajuću ulogu, preusmjerava ga na login stranicu.
      return false; // Zabranjuje pristup ruti vraćanjem `false`.
    }
  }
  
  
}
