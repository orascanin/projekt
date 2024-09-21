import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrikazAktuelnostiComponent } from './prikaz-aktuelnosti.component';

describe('PrikazAktuelnostiComponent', () => {
  let component: PrikazAktuelnostiComponent;
  let fixture: ComponentFixture<PrikazAktuelnostiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrikazAktuelnostiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrikazAktuelnostiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
