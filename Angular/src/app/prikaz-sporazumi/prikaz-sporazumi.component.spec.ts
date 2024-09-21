import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrikazSporazumiComponent } from './prikaz-sporazumi.component';

describe('PrikazSporazumiComponent', () => {
  let component: PrikazSporazumiComponent;
  let fixture: ComponentFixture<PrikazSporazumiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrikazSporazumiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrikazSporazumiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
