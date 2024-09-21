import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonirajComponent } from './doniraj.component';

describe('DonirajComponent', () => {
  let component: DonirajComponent;
  let fixture: ComponentFixture<DonirajComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonirajComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonirajComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
