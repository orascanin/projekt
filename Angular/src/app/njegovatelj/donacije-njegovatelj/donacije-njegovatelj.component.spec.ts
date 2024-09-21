import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonacijeNjegovateljComponent } from './donacije-njegovatelj.component';

describe('DonacijeNjegovateljComponent', () => {
  let component: DonacijeNjegovateljComponent;
  let fixture: ComponentFixture<DonacijeNjegovateljComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonacijeNjegovateljComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonacijeNjegovateljComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
