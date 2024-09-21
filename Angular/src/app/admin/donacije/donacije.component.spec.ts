import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonacijeComponent } from './donacije.component';

describe('DonacijeComponent', () => {
  let component: DonacijeComponent;
  let fixture: ComponentFixture<DonacijeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonacijeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonacijeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
