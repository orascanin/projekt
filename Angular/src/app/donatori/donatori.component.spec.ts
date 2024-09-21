import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonatoriComponent } from './donatori.component';

describe('DonatoriComponent', () => {
  let component: DonatoriComponent;
  let fixture: ComponentFixture<DonatoriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonatoriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonatoriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
