import React, { useState } from 'react';
import { Calendar, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { format } from 'date-fns';

interface RequestRemoteDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export default function RequestRemoteDayDialog({
  isOpen,
  onClose,
  currentBalance
}: RequestRemoteDayDialogProps) {
  const [date, setDate] = useState('');
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      onClose();
    } catch (err) {
      console.error('Error requesting remote days:', err);
      setError('Unable to schedule remote work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  Schedule Remote Work
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Available balance: {currentBalance} days
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 text-error rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Days
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(value => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? 'day' : 'days'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Provide a reason for your remote day request..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || !date || days <= 0 || days > currentBalance}
                className="text-white"
              >
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}