import { EventDefinition, EventParameter } from '@/types/contracts';

interface EventsSectionProps {
  events: EventDefinition[];
  onUpdate: (events: EventDefinition[]) => void;
}

export default function EventsSection({ events, onUpdate }: EventsSectionProps) {
  const addEvent = () => {
    const newEvent: EventDefinition = {
      name: `Event${events.length + 1}`,
      parameters: [
        { name: 'value', type: 'uint256', indexed: false }
      ]
    };
    onUpdate([...events, newEvent]);
  };

  const updateEvent = (index: number, field: keyof EventDefinition, value: any) => {
    const updatedEvents = [...events];
    updatedEvents[index] = {
      ...updatedEvents[index],
      [field]: value,
    };
    onUpdate(updatedEvents);
  };

  const addParameter = (eventIndex: number) => {
    const event = events[eventIndex];
    const newParameter: EventParameter = {
      name: `param${event.parameters.length + 1}`,
      type: 'uint256',
      indexed: false
    };
    updateEvent(eventIndex, 'parameters', [...event.parameters, newParameter]);
  };

  const updateParameter = (eventIndex: number, paramIndex: number, field: keyof EventParameter, value: any) => {
    const event = events[eventIndex];
    const updatedParameters = [...event.parameters];
    updatedParameters[paramIndex] = {
      ...updatedParameters[paramIndex],
      [field]: value,
    };
    updateEvent(eventIndex, 'parameters', updatedParameters);
  };

  const removeParameter = (eventIndex: number, paramIndex: number) => {
    const event = events[eventIndex];
    const updatedParameters = event.parameters.filter((_, i) => i !== paramIndex);
    updateEvent(eventIndex, 'parameters', updatedParameters);
  };

  const removeEvent = (index: number) => {
    onUpdate(events.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={addEvent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Event
        </button>
      </div>
      {events.map((event, eventIndex) => (
        <div key={eventIndex} className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input
                type="text"
                value={event.name}
                onChange={(e) => updateEvent(eventIndex, 'name', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => removeEvent(eventIndex)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Parameters</h4>
              <button
                onClick={() => addParameter(eventIndex)}
                className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Add Parameter
              </button>
            </div>
            
            {event.parameters.map((param, paramIndex) => (
              <div key={paramIndex} className="bg-white p-3 rounded border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => updateParameter(eventIndex, paramIndex, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={param.type}
                      onChange={(e) => updateParameter(eventIndex, paramIndex, 'type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="uint256">uint256</option>
                      <option value="int256">int256</option>
                      <option value="address">address</option>
                      <option value="bool">bool</option>
                      <option value="string">string</option>
                      <option value="bytes">bytes</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={param.indexed}
                        onChange={(e) => updateParameter(eventIndex, paramIndex, 'indexed', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Indexed</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => removeParameter(eventIndex, paramIndex)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Remove Parameter
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 