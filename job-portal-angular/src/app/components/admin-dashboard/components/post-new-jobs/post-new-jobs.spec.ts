import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostNewJobs } from './post-new-jobs';

describe('PostNewJobs', () => {
  let component: PostNewJobs;
  let fixture: ComponentFixture<PostNewJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostNewJobs],
    }).compileComponents();

    fixture = TestBed.createComponent(PostNewJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
