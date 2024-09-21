import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IzvjestajiDirektorComponent } from './izvjestaji-direktor.component';

describe('IzvjestajiDirektorComponent', () => {
  let component: IzvjestajiDirektorComponent;
  let fixture: ComponentFixture<IzvjestajiDirektorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IzvjestajiDirektorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IzvjestajiDirektorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
