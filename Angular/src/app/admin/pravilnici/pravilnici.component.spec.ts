import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PravilniciComponent } from './pravilnici.component';

describe('PravilniciComponent', () => {
  let component: PravilniciComponent;
  let fixture: ComponentFixture<PravilniciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PravilniciComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PravilniciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
