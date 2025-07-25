
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput } from '../schema';
import { updateCounter } from '../handlers/update_counter';
import { sql } from 'drizzle-orm';

describe('updateCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should increment counter from 0 to 1', async () => {
    const input: UpdateCounterInput = { operation: 'increment' };
    
    const result = await updateCounter(input);
    
    expect(result.count).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter', async () => {
    // Set initial counter value
    await db.insert(countersTable).values({ count: 5 }).execute();
    
    const input: UpdateCounterInput = { operation: 'increment' };
    const result = await updateCounter(input);
    
    expect(result.count).toEqual(6);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement counter', async () => {
    // Set initial counter value
    await db.insert(countersTable).values({ count: 10 }).execute();
    
    const input: UpdateCounterInput = { operation: 'decrement' };
    const result = await updateCounter(input);
    
    expect(result.count).toEqual(9);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement to negative values', async () => {
    // Start with 0 counter
    await db.insert(countersTable).values({ count: 0 }).execute();
    
    const input: UpdateCounterInput = { operation: 'decrement' };
    const result = await updateCounter(input);
    
    expect(result.count).toEqual(-1);
  });

  it('should reset counter to 0', async () => {
    // Set initial counter value
    await db.insert(countersTable).values({ count: 42 }).execute();
    
    const input: UpdateCounterInput = { operation: 'reset' };
    const result = await updateCounter(input);
    
    expect(result.count).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update timestamp on operation', async () => {
    // Set initial counter with old timestamp
    const oldDate = new Date('2020-01-01T00:00:00Z');
    await db.insert(countersTable).values({ 
      count: 1, 
      updated_at: oldDate 
    }).execute();
    
    const input: UpdateCounterInput = { operation: 'increment' };
    
    const result = await updateCounter(input);
    
    expect(result.updated_at > oldDate).toBe(true);
  });

  it('should save changes to database', async () => {
    const input: UpdateCounterInput = { operation: 'increment' };
    const result = await updateCounter(input);
    
    // Verify the change was persisted
    const counters = await db.select().from(countersTable).execute();
    
    expect(counters).toHaveLength(1);
    expect(counters[0].count).toEqual(1);
    expect(counters[0].id).toEqual(result.id);
  });

  it('should handle multiple operations sequentially', async () => {
    // Start fresh
    await updateCounter({ operation: 'reset' });
    
    // Increment twice
    await updateCounter({ operation: 'increment' });
    await updateCounter({ operation: 'increment' });
    
    // Decrement once
    const result = await updateCounter({ operation: 'decrement' });
    
    expect(result.count).toEqual(1);
  });
});
