import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AktuelnostiComponent } from './aktuelnosti.component';

describe('AktuelnostiComponent', () => {
  let component: AktuelnostiComponent;
  let fixture: ComponentFixture<AktuelnostiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AktuelnostiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AktuelnostiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
