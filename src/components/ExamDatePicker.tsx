
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ExamDatePickerProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

const ExamDatePicker = ({ onDateSelect, selectedDate }: ExamDatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateSelect(selectedDate);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Select Your Exam Date</CardTitle>
        <CardDescription>Choose when your exam is scheduled</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick your exam date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {date && (
          <div className="text-sm text-gray-600">
            Selected exam date: <strong>{format(date, "MMMM d, yyyy")}</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamDatePicker;
