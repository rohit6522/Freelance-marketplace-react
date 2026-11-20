// Which of MY messages should show "Seen"? Returns the id of the last one the other person has read, or "".
// Message ids sort by time, so "read up to id X" means every message of mine with id <= X has been read.
// messages: the loaded messages. seenUpTo: the id from a live "messages:read" event (or "").
export function lastSeenOwnId(messages, myId, otherId, seenUpTo = "") {
  const mine = (m) => String(m.sender) === String(myId);

  let fromServer = "";
  for (const m of messages) {
    if (mine(m) && (m.readBy || []).some((id) => String(id) === String(otherId)) && m._id > fromServer) fromServer = m._id;
  }
  const upTo = seenUpTo > fromServer ? seenUpTo : fromServer;
  if (!upTo) return "";

  let last = "";
  for (const m of messages) {
    if (mine(m) && m._id <= upTo && m._id > last) last = m._id;
  }
  return last;
}