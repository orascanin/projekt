import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NabavkeComponent } from './nabavke.component';

describe('NabavkeComponent', () => {
  let component: NabavkeComponent;
  let fixture: ComponentFixture<NabavkeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NabavkeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NabavkeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
