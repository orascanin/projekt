import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KontaktComponent } from './kontakt/kontakt.component';
import { DonatoriComponent } from './donatori/donatori.component';
import { PrikazNabavkeComponent } from './prikaz-nabavke/prikaz-nabavke.component';
import { PrikazIzvjestajiComponent } from './prikaz-izvjestaji/prikaz-izvjestaji.component';
import { PrikazPravilniciComponent } from './prikaz-pravilnici/prikaz-pravilnici.component';
import { PrikazSporazumiComponent } from './prikaz-sporazumi/prikaz-sporazumi.component';
import { PrikazAktuelnostiComponent } from './prikaz-aktuelnosti/prikaz-aktuelnosti.component';
import { GalerijaComponent } from './galerija/galerija.component';
import { DonirajComponent } from './doniraj/doniraj.component';
import { ProfileComponent } from './profile/profile.component';
import { MojeDonacijeComponent } from './moje-donacije/moje-donacije.component';
import { OnamaComponent } from './onama/onama.component';
import { MenadzmentComponent } from './menadzment/menadzment.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AktuelnostiComponent } from './admin/aktuelnosti/aktuelnosti.component';
import { DjecaAdminComponent } from './admin/djeca-admin/djeca-admin.component';
import { DonacijeComponent } from './admin/donacije/donacije.component';
import { IzvjestajiComponent } from './admin/izvjestaji/izvjestaji.component';
import { JavnenabavkeComponent } from './admin/javnenabavke/javnenabavke.component';
import { KorisniciComponent } from './admin/korisnici/korisnici.component';
import { PravilniciComponent } from './admin/pravilnici/pravilnici.component';
import { SporazumiComponent } from './admin/sporazumi/sporazumi.component';
import { AktuelnostiDirektorComponent } from './direktor/aktuelnosti-direktor/aktuelnosti-direktor.component';
import { DirektorDashboardComponent } from './direktor/direktor-dashboard/direktor-dashboard.component';
import { DjecaDirektorComponent } from './direktor/djeca-direktor/djeca-direktor.component';
import { DonacijeDirektorComponent } from './direktor/donacije-direktor/donacije-direktor.component';
import { IzvjestajiDirektorComponent } from './direktor/izvjestaji-direktor/izvjestaji-direktor.component';
import { NabavkeComponent } from './direktor/nabavke/nabavke.component';
import { NjegovateljiDirektorComponent } from './direktor/njegovatelji-direktor/njegovatelji-direktor.component';
import { PravilniciDirektorComponent } from './direktor/pravilnici-direktor/pravilnici-direktor.component';
import { SporazumiDirektorComponent } from './direktor/sporazumi-direktor/sporazumi-direktor.component';
import { DjecaNjegovateljComponent } from './njegovatelj/djeca-njegovatelj/djeca-njegovatelj.component';
import { DonacijeNjegovateljComponent } from './njegovatelj/donacije-njegovatelj/donacije-njegovatelj.component';
import { NjegovateljDashboardComponent } from './njegovatelj/njegovatelj-dashboard/njegovatelj-dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    KontaktComponent,
    DonatoriComponent,
    PrikazNabavkeComponent,
    PrikazIzvjestajiComponent,
    PrikazPravilniciComponent,
    PrikazSporazumiComponent,
    PrikazAktuelnostiComponent,
    GalerijaComponent,
    DonirajComponent,
    ProfileComponent,
    MojeDonacijeComponent,
    OnamaComponent,
    MenadzmentComponent,
    AdminDashboardComponent,
    AktuelnostiComponent,
    DjecaAdminComponent,
    DonacijeComponent,
    IzvjestajiComponent,
    JavnenabavkeComponent,
    KorisniciComponent,
    PravilniciComponent,
    SporazumiComponent,
    AktuelnostiDirektorComponent,
    DirektorDashboardComponent,
    DjecaDirektorComponent,
    DonacijeDirektorComponent,
    IzvjestajiDirektorComponent,
    NabavkeComponent,
    NjegovateljiDirektorComponent,
    PravilniciDirektorComponent,
    SporazumiDirektorComponent,
    DjecaNjegovateljComponent,
    DonacijeNjegovateljComponent,
    NjegovateljDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    CommonModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
