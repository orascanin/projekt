import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PravilniciDirektorComponent } from './pravilnici-direktor.component';

describe('PravilniciDirektorComponent', () => {
  let component: PravilniciDirektorComponent;
  let fixture: ComponentFixture<PravilniciDirektorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PravilniciDirektorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PravilniciDirektorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
