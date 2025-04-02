import { useState } from 'react';
import { EventDefinition, EventParameter } from '@/types/contracts';
interface VariablesSectionProps {
  variables: VariableDefinition[];
  onUpdate: (variables: VariableDefinition[]) => void;
  onAddFunction: (function_: FunctionDefinition) => void;
  onAddEvent: (event: EventDefinition) => void;
}

type SectionType = 'variable' | 'function' | 'event';

interface EventsSectionProps {
  events: EventDefinition[];
  onUpdate: (events: EventDefinition[]) => void;
}

export default function EventsSection({ events, onUpdate }: EventsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventDefinition>({
    name: '',
    parameters: [],
  });

  const addEvent = () => {
    const newEvent: EventDefinition = {
      name: '',
      parameters: [],
    };
    onUpdate([...events, newEvent]);
  };

  const addParameter = (eventIndex: number) => {
    const newParameter: EventParameter = {
      name: '',
      type: 'uint256',
      indexed: false,
    };
    const updatedEvents = [...events];
    updatedEvents[eventIndex].parameters.push(newParameter);
    onUpdate(updatedEvents);
  };

  const updateEvent = (eventIndex: number, field: keyof EventDefinition, value: any) => {
    const updatedEvents = [...events];
    updatedEvents[eventIndex] = {
      ...updatedEvents[eventIndex],
      [field]: value,
    };
    onUpdate(updatedEvents);
  };

  const updateParameter = (eventIndex: number, paramIndex: number, field: keyof EventParameter, value: any) => {
    const updatedEvents = [...events];
    updatedEvents[eventIndex].parameters[paramIndex] = {
      ...updatedEvents[eventIndex].parameters[paramIndex],
      [field]: value,
    };
    onUpdate(updatedEvents);
  };

  const removeEvent = (eventIndex: number) => {
    const updatedEvents = events.filter((_, i) => i !== eventIndex);
    onUpdate(updatedEvents);
  };

  const removeParameter = (eventIndex: number, paramIndex: number) => {
    const updatedEvents = [...events];
    updatedEvents[eventIndex].parameters = updatedEvents[eventIndex].parameters.filter((_, i) => i !== paramIndex);
    onUpdate(updatedEvents);
  };

  const saveEvent = () => {
    onUpdate([...events, currentEvent]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-2">
      {isAdding ? (
        <div className="border rounded-lg p-3">
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={currentEvent.name}
              onChange={(e) => setCurrentEvent({...currentEvent, name: e.target.value})}
            />
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Parameters</label>
              <button 
                type="button" 
                className="text-sm text-blue-600"
                onClick={() => addParameter(events.length)}
              >
                + Add Parameter
              </button>
            </div>
            
            {currentEvent.parameters.map((param, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input
                  type="text"
                  placeholder="Name"
                  className="flex-1 p-1 border rounded"
                  value={param.name}
                  onChange={(e) => updateParameter(events.length, idx, 'name', e.target.value)}
                />
                <select
                  className="flex-1 p-1 border rounded"
                  value={param.type}
                  onChange={(e) => updateParameter(events.length, idx, 'type', e.target.value)}
                >
                  <option value="uint256">uint256</option>
                  <option value="string">string</option>
                  <option value="address">address</option>
                  <option value="bool">bool</option>
                  <option value="bytes">bytes</option>
                </select>
                <select
                  className="w-24 p-1 border rounded"
                  value={param.indexed ? 'indexed' : 'not-indexed'}
                  onChange={(e) => updateParameter(events.length, idx, 'indexed', e.target.value === 'indexed')}
                >
                  <option value="not-indexed">Not Indexed</option>
                  <option value="indexed">Indexed</option>
                </select>
                <button 
                  type="button" 
                  className="text-red-500"
                  onClick={() => removeParameter(events.length, idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              className="bg-gray-200 py-1 px-3 rounded text-sm"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="bg-blue-600 text-white py-1 px-3 rounded text-sm disabled:bg-blue-300"
              disabled={!currentEvent.name}
              onClick={saveEvent}
            >
              Add Event
            </button>
          </div>
        </div>
      ) : (
        <button 
          type="button"
          className="text-blue-600 font-medium text-sm"
          onClick={() => setIsAdding(true)}
        >
          + Add Event
        </button>
      )}

      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-medium">{event.name}</span>
              </div>
              <button 
                type="button"
                className="text-red-500 text-sm"
                onClick={() => removeEvent(index)}
              >
                Remove
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Parameters: {event.parameters.map(param => 
                `${param.type} ${param.name}${param.indexed ? ' (indexed)' : ''}`
              ).join(', ') || 'none'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 