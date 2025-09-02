import type {
  AttributeValue,
  HrTime,
  Link,
  SpanContext,
  SpanKind,
  SpanStatus,
} from '@opentelemetry/api';
import type { InstrumentationScope } from '@opentelemetry/core';
import { type Resource } from '@opentelemetry/resources';
import type { TimedEvent } from '@opentelemetry/sdk-trace-base';

// @ts-expect-error -- fix for Nitro
interface NitroFixedResource extends Resource {
  /**
   * @returns the Resource's attributes.
   */
  // Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
  readonly attributes: Record<string, AttributeValue>;

  /**
   * Do not call this method - it is hidden here just to make sure that Nitro does not get into an inifinite recursion parsing this
   * @internal
   * @deprecated
   */
  merge: () => void;
}

// @ts-expect-error -- fix for Nitro
interface SpanContextWithSerializedTraceState extends SpanContext {
  traceState: string;
}

// @ts-expect-error -- fix for Nitro
interface NitroFixedLink extends Link {
  /** The {@link SpanContext} of a linked span. */
  context: SpanContextWithSerializedTraceState;

  /** A set of SpanAttributes on the link. */
  // Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
  attributes?: Record<string, AttributeValue>;
}

interface NitroFixedTimedEvent extends TimedEvent {
  /** The attributes of the event. */
  // Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
  attributes?: Record<string, AttributeValue>;
}

export type SerializedReadableSpan = {
  readonly name: string;
  readonly kind: SpanKind;
  readonly spanContext: SpanContextWithSerializedTraceState;
  readonly parentSpanContext?: SpanContextWithSerializedTraceState;
  readonly startTime: HrTime;
  readonly endTime: HrTime;
  readonly status: SpanStatus;
  readonly attributes: Record<string, AttributeValue>;
  readonly links: NitroFixedLink[];
  readonly events: NitroFixedTimedEvent[];
  readonly duration: HrTime;
  readonly ended: boolean;
  readonly resource: NitroFixedResource;
  readonly instrumentationScope: InstrumentationScope;
  readonly droppedAttributesCount: number;
  readonly droppedEventsCount: number;
  readonly droppedLinksCount: number;
};
