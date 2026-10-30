import { sanitizeUpdateProfilePayload, toUserProfile } from './profile.mapper';

describe('Profile data', () => {
  it('normalizes optional fields, supports clearing and excludes privilege fields', () => {
    expect(
      sanitizeUpdateProfilePayload({
        name: ' Ana ',
        email: ' qa@example.invalid ',
        store: ' Loja ',
        jobTitle: ' Repositora ',
        phone: ' ',
        city: null,
        state: ' pe ',
        ...{ specialBadge: 'FOUNDER', role: 'ADMIN' },
      }),
    ).toEqual({
      name: 'Ana',
      email: 'qa@example.invalid',
      store: 'Loja',
      jobTitle: 'Repositora',
      phone: null,
      city: null,
      state: 'PE',
    });
  });
  it('keeps older accounts without optional fields usable', () => {
    expect(
      toUserProfile({
        id: 'u1',
        name: 'Ana',
        email: 'qa@example.invalid',
        role: 'USER',
      }),
    ).toMatchObject({
      specialBadge: null,
      store: null,
      jobTitle: null,
      phone: null,
      city: null,
      state: null,
    });
  });
});
