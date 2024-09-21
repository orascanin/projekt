import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrikazNabavkeComponent } from './prikaz-nabavke.component';

describe('PrikazNabavkeComponent', () => {
  let component: PrikazNabavkeComponent;
  let fixture: ComponentFixture<PrikazNabavkeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrikazNabavkeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrikazNabavkeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
