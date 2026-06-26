import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalentPool } from './talent-pool';

describe('TalentPool', () => {
  let component: TalentPool;
  let fixture: ComponentFixture<TalentPool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalentPool],
    }).compileComponents();

    fixture = TestBed.createComponent(TalentPool);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
