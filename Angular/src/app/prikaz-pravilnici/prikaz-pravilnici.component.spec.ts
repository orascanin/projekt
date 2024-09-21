import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrikazPravilniciComponent } from './prikaz-pravilnici.component';

describe('PrikazPravilniciComponent', () => {
  let component: PrikazPravilniciComponent;
  let fixture: ComponentFixture<PrikazPravilniciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrikazPravilniciComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrikazPravilniciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
