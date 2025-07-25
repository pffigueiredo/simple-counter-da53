
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load the counter on component mount
  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleOperation = async (operation: 'increment' | 'decrement' | 'reset') => {
    setIsLoading(true);
    try {
      const result = await trpc.updateCounter.mutate({ operation });
      setCounter(result);
    } catch (error) {
      console.error(`Failed to ${operation} counter:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = () => handleOperation('increment');
  const handleDecrement = () => handleOperation('decrement');
  const handleReset = () => handleOperation('reset');

  if (!counter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading counter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            🔢 Counter App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-8 shadow-lg">
              <p className="text-lg font-medium mb-2">Current Count</p>
              <p className="text-6xl font-bold">{counter.count}</p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleDecrement}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="h-16 text-lg font-semibold bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
            >
              ➖ <br />
              <span className="text-sm">Decrement</span>
            </Button>
            
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="h-16 text-lg font-semibold bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-800"
            >
              🔄 <br />
              <span className="text-sm">Reset</span>
            </Button>
            
            <Button
              onClick={handleIncrement}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="h-16 text-lg font-semibold bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
            >
              ➕ <br />
              <span className="text-sm">Increment</span>
            </Button>
          </div>

          {/* Status Information */}
          <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p>Last updated: {counter.updated_at.toLocaleString()}</p>
            {isLoading && (
              <p className="text-blue-600 font-medium mt-1">
                ⏳ Updating counter...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
