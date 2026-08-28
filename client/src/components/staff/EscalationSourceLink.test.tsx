import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EscalationSourceLink } from "./EscalationSourceLink";

describe("EscalationSourceLink", () => {
  it("passes the server-authorised source entry ID to the page navigation callback", () => {
    const onOpen = vi.fn();
    const element = EscalationSourceLink({ sourceEntryId: 30002, onOpen });
    expect(renderToStaticMarkup(element)).toContain("View authorised source");
    element.props.onClick();
    expect(onOpen).toHaveBeenCalledWith(30002);
  });
});
