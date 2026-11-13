// Campaign timeline and history tracking

export interface TimelineEvent {
  id: string;
  campaignId: string;
  date: string; // In-game date
  realDate: Date; // Real world date
  title: string;
  description: string;
  eventType: 'combat' | 'milestone' | 'discovery' | 'death' | 'npc-interaction' | 'custom';
  importance: 'minor' | 'normal' | 'major' | 'legendary';
  participants: string[];
  location: string;
  consequences: string[];
  relatedItems?: string[]; // IDs of related items/artifacts found
  tags: string[];
}

export interface CampaignCalendar {
  campaignId: string;
  name: string;
  monthsPerYear: number;
  daysPerMonth: number;
  hoursPerDay: number;
  currentDate: string;
  startDate: string;
  holidays: Holiday[];
}

export interface Holiday {
  name: string;
  date: string;
  type: 'religious' | 'military' | 'cultural' | 'seasonal';
  description: string;
}

export interface CampaignEra {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  events: TimelineEvent[];
}

export function createTimelineEvent(
  campaignId: string,
  title: string,
  description: string,
  eventType: TimelineEvent['eventType'],
  inGameDate: string
): TimelineEvent {
  return {
    id: `event_${Date.now()}`,
    campaignId,
    date: inGameDate,
    realDate: new Date(),
    title,
    description,
    eventType,
    importance: 'normal',
    participants: [],
    location: '',
    consequences: [],
    tags: [],
  };
}

export function createCampaignCalendar(
  campaignId: string,
  name: string
): CampaignCalendar {
  return {
    campaignId,
    name,
    monthsPerYear: 12,
    daysPerMonth: 30,
    hoursPerDay: 24,
    currentDate: '1/1/1',
    startDate: '1/1/1',
    holidays: [
      {
        name: 'New Year',
        date: '1/1',
        type: 'cultural',
        description: 'Celebration of the new year',
      },
    ],
  };
}

export function advanceCalendarDay(calendar: CampaignCalendar, days: number = 1): CampaignCalendar {
  const [month, day, year] = calendar.currentDate.split('/').map(Number);
  let newDay = day + days;
  let newMonth = month;
  let newYear = year;

  while (newDay > calendar.daysPerMonth) {
    newDay -= calendar.daysPerMonth;
    newMonth++;
  }

  while (newMonth > calendar.monthsPerYear) {
    newMonth -= calendar.monthsPerYear;
    newYear++;
  }

  return {
    ...calendar,
    currentDate: `${newMonth}/${newDay}/${newYear}`,
  };
}

export function getTimelineByImportance(
  events: TimelineEvent[],
  importance: TimelineEvent['importance']
): TimelineEvent[] {
  return events.filter((e) => e.importance === importance).sort((a, b) => {
    const aDate = parseInGameDate(a.date);
    const bDate = parseInGameDate(b.date);
    return aDate - bDate;
  });
}

export function getTimelineByType(
  events: TimelineEvent[],
  eventType: TimelineEvent['eventType']
): TimelineEvent[] {
  return events.filter((e) => e.eventType === eventType);
}

export function getTimelineByDateRange(
  events: TimelineEvent[],
  startDate: string,
  endDate: string
): TimelineEvent[] {
  const start = parseInGameDate(startDate);
  const end = parseInGameDate(endDate);
  return events.filter((e) => {
    const eDate = parseInGameDate(e.date);
    return eDate >= start && eDate <= end;
  });
}

export function createCampaignEra(
  name: string,
  startDate: string,
  endDate: string,
  description: string
): CampaignEra {
  return {
    id: `era_${Date.now()}`,
    name,
    startDate,
    endDate,
    description,
    events: [],
  };
}

export function sortTimelineChronologically(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => parseInGameDate(a.date) - parseInGameDate(b.date));
}

export function getTimelineSummary(events: TimelineEvent[]): {
  totalEvents: number;
  importantEvents: number;
  combats: number;
  npcInteractions: number;
  earliestEvent: TimelineEvent | null;
  latestEvent: TimelineEvent | null;
} {
  const sorted = sortTimelineChronologically(events);
  return {
    totalEvents: events.length,
    importantEvents: events.filter((e) => e.importance === 'major' || e.importance === 'legendary').length,
    combats: events.filter((e) => e.eventType === 'combat').length,
    npcInteractions: events.filter((e) => e.eventType === 'npc-interaction').length,
    earliestEvent: sorted[0] || null,
    latestEvent: sorted[sorted.length - 1] || null,
  };
}

export function exportTimeline(events: TimelineEvent[]): string {
  let md = '# Campaign Timeline\n\n';
  const sorted = sortTimelineChronologically(events);

  for (const event of sorted) {
    md += `## ${event.date} - ${event.title}\n`;
    md += `**Type:** ${event.eventType} | **Importance:** ${event.importance}\n`;
    if (event.location) md += `**Location:** ${event.location}\n`;
    md += `\n${event.description}\n\n`;
  }

  return md;
}

function parseInGameDate(dateStr: string): number {
  const [month, day, year] = dateStr.split('/').map(Number);
  return year * 10000 + month * 100 + day;
}
