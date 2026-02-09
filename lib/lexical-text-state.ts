/**
 * Shared TextStateFeature state for Lexical rich text.
 *
 * Used by:
 * - PageConfigs (merged with defaultColors for the editor)
 * - payload-rich-text.tsx (merged with defaultColors for JSX conversion)
 *
 * Lexical stores text state in serialized nodes under NODE_STATE_KEY ("$").
 * The frontend converter reads node["$"] and looks up CSS from this config
 * to apply the same styles when rendering rich text.
 */

/** Shape of one state key's values (e.g. outline, highlight). Matches TextStateFeature state value. */
type StateValues = Record<
  string,
  { css: Record<string, string>; label: string }
>

/**
 * Custom text state keys we add on top of defaultColors.
 * These are merged with defaultColors in PageConfigs and in the RichText converter.
 */
export const customTextState: {
  background: StateValues
  outline: StateValues
  highlight: StateValues
} = {
  /** Linear gradient backgrounds (in addition to default solid backgrounds). */
  background: {
    "gradient-sunset": {
      label: "Gradient: Sunset",
      css: {
        padding: "0.1em 0.45em",
        background: "linear-gradient(to right, #ff5f6d, #6a3093)",
        color: "white",
        "border-radius":"999px",
      },
    },
    "gradient-ocean": {
      label: "Gradient: Ocean",
      css: {
        padding: "0.1em 0.45em",
        background: "linear-gradient(to right, #0ea5e9, #06b6d4)",
        color: "white",
        "border-radius":"999px",
      },
    },
    "gradient-forest": {
      label: "Gradient: Forest",
      css: {
        "padding-inline": "4.25em",
        background: "linear-gradient(to right, #22c55e, #15803d)",
        color: "white",
        "border-radius":"999px",
      },
    },
    "gradient-lavender": {
      label: "Gradient: Lavender",
      css: {
        padding: "0.1em 0.45em",
        background: "linear-gradient(to right, #a78bfa, #c084fc)",
        color: "white",
        "border-radius":"999px",
        
      },
    },
    "gradient-gold": {
      label: "Gradient: Gold",
      css: {
        padding: "0.1em 0.45em",
        background: "linear-gradient(to right, #f59e0b, #eab308)",
        color: "white",
        "border-radius":"999px",
      },
    },
  },
  /**
   * Box border around the whole text (not a stroke on the characters).
   */
  outline: {
    "outline-coral": {
      label: "Outline: Coral",
      css: {
        border: "2px solid #f43f5e",
        padding: "0.1em 0.25em",
        "border-radius": "4px",
      },
    },
    "outline-blue": {
      label: "Outline: Blue",
      css: {
        border: "2px solid #3b82f6",
        padding: "0.1em 0.25em",
        "border-radius": "4px",
      },
    },
    "outline-gold": {
      label: "Outline: Gold",
      css: {
        border: "2px solid #eab308",
        padding: "0.1em 0.25em",
        "border-radius": "4px",
      },
    },
    "outline-emerald": {
      label: "Outline: Emerald",
      css: {
        border: "2px solid #10b981",
        padding: "0.1em 0.25em",
        "border-radius": "4px",
      },
    },
    "outline-purple": {
      label: "Outline: Purple",
      css: {
        border: "2px solid #8b5cf6",
        padding: "0.1em 0.25em",
        "border-radius": "4px",
      },
    },
  },
  /** Marker and glow highlights. */
  highlight: {
    "marker-yellow": {
      label: "Highlight: Marker (yellow)",
      css: {
        "background-color": "rgba(250, 204, 21, 0.4)",
        padding: "0.1em 0.2em",
        "border-radius": "2px",
      },
    },
    "marker-green": {
      label: "Highlight: Marker (green)",
      css: {
        "background-color": "rgba(34, 197, 94, 0.35)",
        padding: "0.1em 0.2em",
        "border-radius": "2px",
      },
    },
    glow: {
      label: "Highlight: Glow",
      css: {
        "text-shadow":
          "0 0 8px currentColor, 0 0 12px currentColor",
      },
    },
  },
}
