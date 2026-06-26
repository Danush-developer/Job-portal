import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCandidates } from './all-candidates';

describe('AllCandidates', () => {
  let component: AllCandidates;
  let fixture: ComponentFixture<AllCandidates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCandidates],
    }).compileComponents();

    fixture = TestBed.createComponent(AllCandidates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
