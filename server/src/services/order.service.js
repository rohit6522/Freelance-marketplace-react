import { ApiError } from "../utils/ApiError.js";

// from -> to -> who may do it
export const TRANSITIONS = {
  pending:            { in_progress: ["freelancer"], cancelled: ["client", "freelancer"] },
  in_progress:        { delivered: ["freelancer"], cancelled: ["freelancer"] },
  delivered:          { completed: ["client"], revision_requested: ["client"] },
  revision_requested: { delivered: ["freelancer"], cancelled: ["freelancer"] },
  completed:          {},
  cancelled:          {},
};

export function applyTransition(order, role, to, userId, note) {
  const allowed = TRANSITIONS[order.status]?.[to];
  if (!allowed) {
    throw new ApiError(409, `Order cannot move from "${order.status}" to "${to}"`);
  }
  if (!allowed.includes(role)) {
    throw new ApiError(403, `Only the ${allowed.join(" or ")} can do this`);
  }
  order.status = to;
  order.statusHistory.push({ status: to, by: userId, note });
}

export const revisionsLeft = (order) => {
  const total = order.packageSnapshot.revisions;
  return total === -1 ? null : Math.max(0, total - order.revisionsUsed); // null = unlimited
};

export const nextStatusesFor = (order, role) =>
  Object.entries(TRANSITIONS[order.status] || {})
    .filter(([, roles]) => roles.includes(role))
    .map(([to]) => to);