import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AktuelnostiDirektorComponent } from './aktuelnosti-direktor.component';

describe('AktuelnostiDirektorComponent', () => {
  let component: AktuelnostiDirektorComponent;
  let fixture: ComponentFixture<AktuelnostiDirektorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AktuelnostiDirektorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AktuelnostiDirektorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
