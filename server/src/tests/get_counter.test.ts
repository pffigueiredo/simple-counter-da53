
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and return a new counter when none exists', async () => {
    const result = await getCounter();

    expect(result.id).toBeDefined();
    expect(result.count).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should return existing counter when one exists', async () => {
    // Create a counter first
    await db.insert(countersTable)
      .values({
        count: 5
      })
      .execute();

    const result = await getCounter();

    expect(result.count).toEqual(5);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save new counter to database when none exists', async () => {
    await getCounter();

    // Verify counter was actually saved
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].count).toEqual(0);
    expect(counters[0].id).toBeDefined();
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return first counter when multiple exist', async () => {
    // Create multiple counters
    await db.insert(countersTable)
      .values({ count: 10 })
      .execute();
    
    await db.insert(countersTable)
      .values({ count: 20 })
      .execute();

    const result = await getCounter();

    expect(result.count).toEqual(10);
    expect(result.id).toBeDefined();
  });
});
