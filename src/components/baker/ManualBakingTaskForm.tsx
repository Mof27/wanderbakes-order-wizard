
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Define the form schema using zod
const manualTaskSchema = z.object({
  cakeShape: z.string({ required_error: "Cake shape is required" }),
  cakeSize: z.string({ required_error: "Cake size is required" }),
  cakeFlavor: z.string({ required_error: "Cake flavor is required" }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  notes: z.string().optional(),
});

type ManualTaskFormValues = z.infer<typeof manualTaskSchema>;

interface ManualBakingTaskFormProps {
  onSubmit: (data: ManualTaskFormValues) => void;
  onCancel: () => void;
}

const ManualBakingTaskForm: React.FC<ManualBakingTaskFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  // Get settings data for form options
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll(),
  });

  // Initialize the form
  const form = useForm<ManualTaskFormValues>({
    resolver: zodResolver(manualTaskSchema),
    defaultValues: {
      cakeShape: '',
      cakeSize: '',
      cakeFlavor: '',
      quantity: 1,
      notes: '',
    },
  });

  // Filter only enabled settings
  const cakeShapes = settings?.cakeShapes?.filter(shape => shape.enabled) || [];
  const cakeSizes = settings?.cakeSizes?.filter(size => size.enabled) || [];
  const cakeFlavors = settings?.cakeFlavors?.filter(flavor => flavor.enabled) || [];

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Create Manual Baking Task</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cakeShape"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cake Shape</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cake shape" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cakeShapes.map((shape) => (
                      <SelectItem key={shape.id} value={shape.value}>
                        {shape.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cakeSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cake Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cake size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cakeSizes.map((size) => (
                      <SelectItem key={size.id} value={size.value}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cakeFlavor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cake Flavor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cake flavor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cakeFlavors.map((flavor) => (
                      <SelectItem key={flavor.id} value={flavor.value}>
                        {flavor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add any additional notes here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ManualBakingTaskForm;
