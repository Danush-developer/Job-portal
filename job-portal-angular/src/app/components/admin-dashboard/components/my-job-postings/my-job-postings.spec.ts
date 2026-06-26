import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyJobPostings } from './my-job-postings';

describe('MyJobPostings', () => {
  let component: MyJobPostings;
  let fixture: ComponentFixture<MyJobPostings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyJobPostings],
    }).compileComponents();

    fixture = TestBed.createComponent(MyJobPostings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
