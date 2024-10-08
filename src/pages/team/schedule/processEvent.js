export function processEvent(events) {
  // console.log(events);
  return events.map((i) => ({
    id: i.id || i.Id,
    Subject: i.Subject,
    StartTime: i.StartTime,
    EndTime: i.EndTime,
    location: i.location,
    description: i.description,
    IsAllDay: i.IsAllDay,
    recurrenceRule: i.recurrenceRule,
    recurrenceException: i.recurrenceException,
    recurrenceID: i.recurrenceID,
    updatedAt: Date.now(),
    EventType: i.EventType,
    executor: i.executor ? {
      set: [i.executor?.id],
    } : NaN,
  }));
}
