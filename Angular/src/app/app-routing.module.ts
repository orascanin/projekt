import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DonatoriComponent } from './donatori/donatori.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { PrikazAktuelnostiComponent } from './prikaz-aktuelnosti/prikaz-aktuelnosti.component';
import { PrikazNabavkeComponent } from './prikaz-nabavke/prikaz-nabavke.component';
import { PrikazIzvjestajiComponent } from './prikaz-izvjestaji/prikaz-izvjestaji.component';
import { PrikazSporazumiComponent } from './prikaz-sporazumi/prikaz-sporazumi.component';
import { PrikazPravilniciComponent } from './prikaz-pravilnici/prikaz-pravilnici.component';
import { DonirajComponent } from './doniraj/doniraj.component';
import { GalerijaComponent } from './galerija/galerija.component';
import { MojeDonacijeComponent } from './moje-donacije/moje-donacije.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { MenadzmentComponent } from './menadzment/menadzment.component';
import { OnamaComponent } from './onama/onama.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { KorisniciComponent } from './admin/korisnici/korisnici.component';
import { DjecaAdminComponent } from './admin/djeca-admin/djeca-admin.component';
import { PravilniciComponent } from './admin/pravilnici/pravilnici.component';
import { SporazumiComponent } from './admin/sporazumi/sporazumi.component';
import { JavnenabavkeComponent } from './admin/javnenabavke/javnenabavke.component';
import { DonacijeComponent } from './admin/donacije/donacije.component';
import { AktuelnostiComponent } from './admin/aktuelnosti/aktuelnosti.component';
import { IzvjestajiComponent } from './admin/izvjestaji/izvjestaji.component';
import { DirektorDashboardComponent } from './direktor/direktor-dashboard/direktor-dashboard.component';
import { NabavkeComponent } from './direktor/nabavke/nabavke.component';
import { PravilniciDirektorComponent } from './direktor/pravilnici-direktor/pravilnici-direktor.component';
import { NjegovateljiDirektorComponent } from './direktor/njegovatelji-direktor/njegovatelji-direktor.component';
import { DjecaDirektorComponent } from './direktor/djeca-direktor/djeca-direktor.component';
import { DonacijeDirektorComponent } from './direktor/donacije-direktor/donacije-direktor.component';
import { SporazumiDirektorComponent } from './direktor/sporazumi-direktor/sporazumi-direktor.component';
import { AktuelnostiDirektorComponent } from './direktor/aktuelnosti-direktor/aktuelnosti-direktor.component';
import { IzvjestajiDirektorComponent } from './direktor/izvjestaji-direktor/izvjestaji-direktor.component';
import { NjegovateljDashboardComponent } from './njegovatelj/njegovatelj-dashboard/njegovatelj-dashboard.component';
import { DjecaNjegovateljComponent } from './njegovatelj/djeca-njegovatelj/djeca-njegovatelj.component';
import { DonacijeNjegovateljComponent } from './njegovatelj/donacije-njegovatelj/donacije-njegovatelj.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent},
  { path: 'donatori', component: DonatoriComponent},
  { path: 'kontakt', component: KontaktComponent},
  { path: 'menadzment', component: MenadzmentComponent},
  { path: 'onama', component: OnamaComponent},
  { path: 'prikaz-aktuelnosti', component: PrikazAktuelnostiComponent},
  { path: 'prikaz-nabavke', component: PrikazNabavkeComponent},
  { path: 'prikaz-izvjestaji', component: PrikazIzvjestajiComponent},
  { path: 'prikaz-sporazumi', component: PrikazSporazumiComponent},
  { path: 'prikaz-pravilnici', component: PrikazPravilniciComponent},
  { path: 'doniraj', component: DonirajComponent},
  { path: 'galerija', component: GalerijaComponent},
  { path: 'admin/dashboard', component: AdminDashboardComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/korisnici', component: KorisniciComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/djeca-admin', component: DjecaAdminComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/pravilnici', component: PravilniciComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/sporazumi', component: SporazumiComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/javnenabavke', component: JavnenabavkeComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/donacije', component: DonacijeComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/aktuelnosti', component: AktuelnostiComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'admin/izvjestaji', component: IzvjestajiComponent,canActivate: [AuthGuard],data: { role: 'admin' }},
  { path: 'direktor/dashboard', component: DirektorDashboardComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/nabavke', component: NabavkeComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/pravilnici-direktor', component: PravilniciDirektorComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/njegovatelji-direktor', component: NjegovateljiDirektorComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/djeca-direktor', component: DjecaDirektorComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/donacije-direktor', component: DonacijeDirektorComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/sporazumi-direktor', component: SporazumiDirektorComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/aktuelnosti-direktor', component: AktuelnostiDirektorComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'direktor/izvjestaji-direktor', component: IzvjestajiDirektorComponent,canActivate: [AuthGuard],data: { role: 'director' } },
  { path: 'njegovatelj/dashboard', component: NjegovateljDashboardComponent, canActivate: [AuthGuard],data: { role: 'caregiver' } },
  { path: 'njegovatelj/djeca-njegovatelj', component: DjecaNjegovateljComponent, canActivate: [AuthGuard],data: { role: 'caregiver' } },
  { path: 'njegovatelj/donacije-njegovatelj', component: DonacijeNjegovateljComponent, canActivate: [AuthGuard],data: { role: 'caregiver' } },
  { path: 'moje-donacije', component: MojeDonacijeComponent,canActivate: [AuthGuard],data: { role: 'donor' } },
  { path: 'profile', component: ProfileComponent,canActivate: [AuthGuard],data: { role: 'donor' } },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home',pathMatch: 'full'  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
