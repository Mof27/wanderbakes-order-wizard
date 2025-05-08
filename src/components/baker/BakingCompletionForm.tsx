
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { BakingTask, ProductionLogEntry, QualityCheck } from '@/types/baker';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BakingCompletionFormProps {
  task: BakingTask;
  onComplete: (data: {
    taskId: string;
    quantity: number;
    qualityChecks: QualityCheck;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

// Form schema
const formSchema = z.object({
  quantity: z.number()
    .positive('Quantity must be positive')
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  properlyBaked: z.boolean().default(false),
  correctSize: z.boolean().default(false),
  goodTexture: z.boolean().default(false),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const BakingCompletionForm: React.FC<BakingCompletionFormProps> = ({
  task,
  onComplete,
  onCancel
}) => {
  const remainingQuantity = task.quantity - task.quantityCompleted;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: remainingQuantity,
      properlyBaked: false,
      correctSize: false,
      goodTexture: false,
      notes: ''
    }
  });

  const onSubmit = (data: FormValues) => {
    onComplete({
      taskId: task.id,
      quantity: data.quantity,
      qualityChecks: {
        properlyBaked: data.properlyBaked,
        correctSize: data.correctSize,
        goodTexture: data.goodTexture,
        notes: data.notes
      },
      notes: data.notes
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Complete Baking Task</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm">
          <div className="flex justify-between mb-2">
            <span>Task:</span>
            <span className="font-medium">{task.cakeShape} {task.cakeSize} {task.cakeFlavor}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span className="font-medium">{remainingQuantity} of {task.quantity}</span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={remainingQuantity}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <h4 className="font-medium">Quality Checks</h4>
              
              <FormField
                control={form.control}
                name="properlyBaked"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Properly baked (not raw inside)</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="correctSize"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Correct size and shape</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goodTexture"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Good texture</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about this batch..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Complete Task
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BakingCompletionForm;
