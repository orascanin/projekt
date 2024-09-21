import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrikazIzvjestajiComponent } from './prikaz-izvjestaji.component';

describe('PrikazIzvjestajiComponent', () => {
  let component: PrikazIzvjestajiComponent;
  let fixture: ComponentFixture<PrikazIzvjestajiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrikazIzvjestajiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrikazIzvjestajiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
