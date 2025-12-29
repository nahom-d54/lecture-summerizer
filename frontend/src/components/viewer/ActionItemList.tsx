import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { recordingsApi } from '@/lib/api';

interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  deadline?: string;
  completed: boolean;
}

interface Props {
  recordingId: string;
  items: ActionItem[];
}

export function ActionItemList({ recordingId, items }: Props) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      recordingsApi.updateActionItem(recordingId, itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recording', recordingId] });
    },
  });

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">No action items found.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Action Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
            }`}
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={checked =>
                toggleMutation.mutate({ itemId: item.id, completed: !!checked })
              }
              disabled={toggleMutation.isPending}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
              >
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.assignee && (
                  <Badge variant="outline" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {item.assignee}
                  </Badge>
                )}
                {item.deadline && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(item.deadline).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
