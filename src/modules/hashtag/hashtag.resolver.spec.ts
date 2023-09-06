import { Test, TestingModule } from '@nestjs/testing';
import { HashtagResolver } from './hashtag.resolver';

describe('HashtagResolver', () => {
  let resolver: HashtagResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashtagResolver],
    }).compile();

    resolver = module.get<HashtagResolver>(HashtagResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
