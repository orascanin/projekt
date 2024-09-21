import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JavnenabavkeComponent } from './javnenabavke.component';

describe('JavnenabavkeComponent', () => {
  let component: JavnenabavkeComponent;
  let fixture: ComponentFixture<JavnenabavkeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JavnenabavkeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JavnenabavkeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
