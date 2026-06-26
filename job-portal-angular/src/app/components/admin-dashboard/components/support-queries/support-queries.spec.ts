import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportQueries } from './support-queries';

describe('SupportQueries', () => {
  let component: SupportQueries;
  let fixture: ComponentFixture<SupportQueries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportQueries],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportQueries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
