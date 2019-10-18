/*!
 * Copyright 2019 Cognite AS
 */

import { initializeSectorLoader } from '../../sector/initializeSectorLoader';
import {
  DiscardSectorDelegate,
  ConsumeSectorDelegate,
  FetchSectorDelegate,
  ParseSectorDelegate
} from '../../sector/delegates';
import { waitUntill } from '../wait';
import { expectSetEqual } from '../expects';

describe('initializeSectorLoader', () => {
  const fetch: FetchSectorDelegate = jest.fn();
  const parse: ParseSectorDelegate = jest.fn();
  const discard: DiscardSectorDelegate = jest.fn();
  const consume: ConsumeSectorDelegate = jest.fn();

  beforeEach(() => jest.resetAllMocks());

  test('call returns delegate', () => {
    const delegate = initializeSectorLoader(fetch, parse, discard, consume);
    expect(delegate).toBeDefined();
  });

  test('first delegate invocation calls consume is called for all sectors', async () => {
    // Arrange
    const consumed = new Set<number>();
    const myConsume: ConsumeSectorDelegate = jest.fn((id, sector) => {
      consumed.add(id);
    });
    const delegate = initializeSectorLoader(fetch, parse, discard, myConsume);
    const sectorIds = [1, 2, 3];

    // Act
    delegate(new Set<number>(sectorIds));
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));

    // Assert
    expectSetEqual(consumed, sectorIds);
  });

  test('second invocation only consumes new sectors', async () => {
    // Arrange
    const consumed = new Set<number>();
    const myConsume: ConsumeSectorDelegate = jest.fn((id, sector) => {
      consumed.add(id);
    });
    const delegate = initializeSectorLoader(fetch, parse, discard, myConsume);
    const sectorIds = [1, 2, 3];
    delegate(new Set<number>(sectorIds));
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));
    const newSectorIds = [1, 2, 3, 4, 5];

    // Act
    delegate(new Set<number>(newSectorIds));
    await waitUntill(() => newSectorIds.every(x => consumed.has(x)));

    // Assert
    expectSetEqual(consumed, newSectorIds);
  });

  test('second invocation discards unwanted sectors', async () => {
    // Arrange
    const consumed = new Set<number>();
    const discarded = new Set<number>();
    const myConsume: ConsumeSectorDelegate = jest.fn(id => {
      consumed.add(id);
    });
    const myDiscard: DiscardSectorDelegate = jest.fn(id => {
      discarded.add(id);
    });
    const delegate = initializeSectorLoader(fetch, parse, myDiscard, myConsume);
    const sectorIds = [1, 2, 3, 4, 5];
    delegate(new Set<number>(sectorIds));
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));
    const newSectorIds = [1, 3, 5];

    // Act
    delegate(new Set<number>(newSectorIds));
    await waitUntill(() => [2, 4].every(x => discarded.has(x)));

    // Assert
    expectSetEqual(discarded, [2, 4]);
  });
});
