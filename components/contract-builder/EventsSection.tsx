import { EventDefinition } from '@/types/contracts';

interface EventsSectionProps {
  events: EventDefinition[];
  onUpdate: (events: EventDefinition[]) => void;
}

export default function EventsSection({ events, onUpdate }: EventsSectionProps) {
  const removeEvent = (index: number) => {
    onUpdate(events.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium">{event.name}</h3>
            <button
              onClick={() => removeEvent(index)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
          {/* Display event parameters */}
          {event.parameters.length > 0 && (
            <div className="text-sm text-gray-600">
              <p>Parameters:</p>
              <ul className="list-disc list-inside">
                {event.parameters.map((param, i) => (
                  <li key={i}>
                    {param.name}: {param.type} {param.indexed ? '(indexed)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 