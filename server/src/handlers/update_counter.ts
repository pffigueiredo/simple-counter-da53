
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput, type Counter } from '../schema';
import { sql, eq } from 'drizzle-orm';

export async function updateCounter(input: UpdateCounterInput): Promise<Counter> {
  try {
    // Ensure counter record exists - create if it doesn't
    await db.execute(sql`
      INSERT INTO counters (count) 
      SELECT 0 
      WHERE NOT EXISTS (SELECT 1 FROM counters LIMIT 1)
    `);

    let result;
    
    switch (input.operation) {
      case 'increment':
        result = await db.update(countersTable)
          .set({ 
            count: sql`count + 1`,
            updated_at: new Date()
          })
          .returning()
          .execute();
        break;
      case 'decrement':
        result = await db.update(countersTable)
          .set({ 
            count: sql`count - 1`,
            updated_at: new Date()
          })
          .returning()
          .execute();
        break;
      case 'reset':
        result = await db.update(countersTable)
          .set({ 
            count: 0,
            updated_at: new Date()
          })
          .returning()
          .execute();
        break;
    }

    return result[0];
  } catch (error) {
    console.error('Counter update failed:', error);
    throw error;
  }
}
