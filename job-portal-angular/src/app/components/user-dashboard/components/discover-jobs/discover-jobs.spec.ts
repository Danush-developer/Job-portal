import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverJobs } from './discover-jobs';

describe('DiscoverJobs', () => {
  let component: DiscoverJobs;
  let fixture: ComponentFixture<DiscoverJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverJobs],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoverJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
