import { useState } from 'react';
import { EventDefinition, EventParameter } from '@/types/contracts';

interface EventsSectionProps {
  events: EventDefinition[];
  onUpdate: (events: EventDefinition[]) => void;
}

export default function EventsSection({ events, onUpdate }: EventsSectionProps) {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Contract Events</h2>
        <button
          onClick={addEvent}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Add Event
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event, eventIndex) => (
          <div key={eventIndex} className="bg-white p-4 rounded-lg shadow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                value={event.name}
                onChange={(e) => updateEvent(eventIndex, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">Parameters</h3>
                <button
                  onClick={() => addParameter(eventIndex)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Add Parameter
                </button>
              </div>

              {event.parameters.map((parameter, paramIndex) => (
                <div key={paramIndex} className="bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={parameter.name}
                        onChange={(e) => updateParameter(eventIndex, paramIndex, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={parameter.type}
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
                          checked={parameter.indexed}
                          onChange={(e) => updateParameter(eventIndex, paramIndex, 'indexed', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Indexed</span>
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => removeParameter(eventIndex, paramIndex)}
                    className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Remove Parameter
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => removeEvent(eventIndex)}
              className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Remove Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 