export type Sender = {
  name: string;
  email: string;
};

export type DateMessage = {
  date: string;
};

export type LabelMessage = {
  labels: string[];
};

export function parseSender(value: string): Sender {
  const match = value.match(/^\s*(?:"?([^"<]*)"?\s*)?<([^>]+)>\s*$/);
  if (match) {
    return {
      name: match[1]?.trim() ?? "",
      email: match[2].trim(),
    };
  }

  const emailMatch = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return {
    name: "",
    email: emailMatch?.[0] ?? value.trim(),
  };
}

export function groupByDate<T extends DateMessage>(
  messages: T[],
): Record<string, T[]> {
  return messages.reduce<Record<string, T[]>>((groups, message) => {
    const parsedDate = new Date(message.date);
    const dateKey =
      message.date && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().slice(0, 10)
        : "unknown";
    (groups[dateKey] ??= []).push(message);
    return groups;
  }, {});
}

export function countByLabel(
  messages: LabelMessage[],
): Record<string, number> {
  return messages.reduce<Record<string, number>>((counts, message) => {
    for (const label of new Set(message.labels)) {
      counts[label] = (counts[label] ?? 0) + 1;
    }
    return counts;
  }, {});
}
