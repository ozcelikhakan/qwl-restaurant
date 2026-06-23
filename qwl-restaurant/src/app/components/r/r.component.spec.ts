import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RComponent } from './r.component';

describe('RComponent', () => {
  let component: RComponent;
  let fixture: ComponentFixture<RComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
