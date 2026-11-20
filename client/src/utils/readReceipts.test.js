import { describe, it, expect } from "vitest";
import { lastSeenOwnId } from "./readReceipts";

const ME = "me";
const OTHER = "other";
const msg = (n, sender, readBy) => ({ _id: `00000000000000000000000${n}`, sender, readBy });
const id = (n) => `00000000000000000000000${n}`;

describe("lastSeenOwnId", () => {
  it("is empty when there are no messages or nothing has been read", () => {
    expect(lastSeenOwnId([], ME, OTHER)).toBe("");
    expect(lastSeenOwnId([msg(1, ME, [ME]), msg(2, ME, [ME])], ME, OTHER)).toBe("");
  });

  it("points at my last message the other person has read (from the server data)", () => {
    const messages = [msg(1, ME, [ME, OTHER]), msg(2, ME, [ME, OTHER]), msg(3, ME, [ME])];
    expect(lastSeenOwnId(messages, ME, OTHER)).toBe(id(2));
  });

  it("ignores the other person's own messages", () => {
    const messages = [msg(1, ME, [ME, OTHER]), msg(2, OTHER, [OTHER, ME])];
    expect(lastSeenOwnId(messages, ME, OTHER)).toBe(id(1));
  });

  it("a live 'read up to' id marks every earlier message of mine as seen", () => {
    const messages = [msg(1, ME, [ME]), msg(2, ME, [ME]), msg(3, OTHER, [OTHER]), msg(4, ME, [ME])];
    expect(lastSeenOwnId(messages, ME, OTHER, id(2))).toBe(id(2));
    expect(lastSeenOwnId(messages, ME, OTHER, id(4))).toBe(id(4));
  });

  it("uses whichever is further along, the live id or the stored data", () => {
    const messages = [msg(1, ME, [ME, OTHER]), msg(2, ME, [ME]), msg(3, ME, [ME])];
    expect(lastSeenOwnId(messages, ME, OTHER, id(3))).toBe(id(3));
    expect(lastSeenOwnId(messages, ME, OTHER, id(1))).toBe(id(1));
    const stored = [msg(1, ME, [ME, OTHER]), msg(2, ME, [ME, OTHER])];
    expect(lastSeenOwnId(stored, ME, OTHER, id(1))).toBe(id(2));
  });

  it("works when the messages are not in order", () => {
    const messages = [msg(3, ME, [ME]), msg(1, ME, [ME, OTHER]), msg(2, ME, [ME, OTHER])];
    expect(lastSeenOwnId(messages, ME, OTHER)).toBe(id(2));
  });

  it("does not count my own entry in readBy as 'seen by them'", () => {
    expect(lastSeenOwnId([msg(1, ME, [ME])], ME, OTHER)).toBe("");
    expect(lastSeenOwnId([{ _id: id(1), sender: ME }], ME, OTHER)).toBe("");
  });
});
