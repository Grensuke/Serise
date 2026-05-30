export function conversationTitle(item) {
  if (!item) return 'Untitled'
  if (item.title) return item.title
  if (item.participants) return `Chat with ${item.participants}`
  return item.summary?.slice(0, 40) || 'Untitled'
}

export function energyLevelLabel(level) {
  if (level >= 75) return 'High'
  if (level >= 40) return 'Moderate'
  return 'Low'
}
