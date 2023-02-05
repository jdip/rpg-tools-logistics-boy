export const hasTraits = (traits: unknown): traits is { value: string[] } => (
  typeof traits === 'object' &&
  traits !== null &&
  Object.hasOwn(traits, 'value') &&
  Array.isArray((traits as { value: unknown }).value)
)
