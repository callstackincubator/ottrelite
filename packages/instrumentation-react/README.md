# Ottrelite Instrumentation for React Babel Plugin

- [Ottrelite Instrumentation for React Babel Plugin](#ottrelite-instrumentation-for-react-babel-plugin)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Examples](#examples)
    - [Function component](#function-component)
      - [What will be the name of the tracer?](#what-will-be-the-name-of-the-tracer)
    - [Hooks](#hooks)
    - [Class component](#class-component)
      - [What will be the name of the tracer?](#what-will-be-the-name-of-the-tracer-1)

---

This Babel plugin autoinstruments React components' and hooks' lifecycle in your code, adding tracing to components & hooks using the `"use trace ..."` directive.

It is meant to be used strictly in conjunction with `@ottrelite/core`, which is required to be added as a runtime dependency & configured as you would normally do. Please consult its docs for first setup.

## Installation

First, ensure you are already using `@ottrelite/core`. Then, add this package as a dev-dependency:

```bash
npm i -D @ottrelite/instrumentation-react
# or
yarn add -D @ottrelite/instrumentation-react
# or
pnpm add -D @ottrelite/instrumentation-react
```

## Usage

First, add the plugin to your Babel configuration. If you are using a `babel.config.js` file, it should look like this:

```javascript
module.exports = {
  ...,
  plugins: ['module:@ottrelite/instrumentation-react'],
  ...
};
```

Basically, at the very first line of the functions you would like to autoinstrument tracing for, add the `"use trace"` directive. For function components, this is the first line of your component's function body, the same applies to hooks & for class components this is the first line of the class component's `render` function body.

Optionally, you may specify a name for the tracer manually (especially if the function does not carry a name).

> [!IMPORTANT]
> The implicit name or name specified explicitly after `use trace` is the name of the OTEL tracer that will be created and used for tracing. Make sure it is unique, otherwise you may obtain misleading, mixed traces.

## Examples

### Function component

> [!NOTE]
> As seen in the examples below, the components are wrapped in `memo` to prevent unnecessary re-renders. This is a common practice in React to optimize performance, but it is not compulsory - the instrumentation would still work without it. However, in such case, it would be expected that most likely the instrumentation would produce many entries, for invocations of the component which didn't actually result in an update to the shadow tree.

```typescript
export const MyComponent = memo(function MyComponent(){
    "use trace";

    ...

    return ...;
});
```

Without memoization (be warned as per the notice above):

```typescript
export const MyComponent = function() {
    "use trace";

    ...

    return ...;
};
```

_Note: arrow function components are supported as well._

With an explicit Tracer name:

> [!IMPORTANT]
> The name of the tracer is used to create a unique OTEL tracer, so make sure it is unique across your application.

```typescript
export const MyComponent = memo(function MyComponent(){
    "use trace TestLibMyComponent";

    ...

    return ...;
});
```

> [!WARNING]
> Please keep in mind that when using the `memo` helper (which is highly encouraged!), the name of the function will not be propagated from the assigned-to variable. For instance, the following code:
>
> ```typescript
> export const MyComponent = memo(function(){
>     "use trace";
>
>     ...
>
>     return ...;
> });
> ```
>
> Would result in an **error**, since the Babel plugin would not know the name of the component; for this reason, you need to either make the function a named function, or add an explicit name to the `"use trace Name"` directive.

#### What will be the name of the tracer?

| Declaration style                                   | Name                                     |
| --------------------------------------------------- | ---------------------------------------- |
| _Explicit name from the string after `"use trace"`_ | The passed string                        |
| named function                                      | Name of the function                     |
| arrow function                                      | Name of the assignment target identifier |
| anonymous function                                  | Name of the assignment target identifier |

### Hooks

TODO: Write this section

### Class component

> [!NOTE]
> As seen in the examples below, the components include an explicit implementation of `shouldComponentUpdate` to prevent unnecessary re-renders. This is a common practice in React to optimize performance, but it is not compulsory - the instrumentation would still work without it. However, in such case, it would be expected that most likely the instrumentation would produce many entries, for invocations of the component which didn't actually result in an update to the shadow tree.

```typescript
import _ from 'lodash';
import { Component } from 'react';

export class TracedClassComponent extends Component<ExternallyDrivenComponentProps> {
  render() {
    'use trace';

    ...

    return (
      ...
    );
  }

  shouldComponentUpdate(
    nextProps: Readonly<ExternallyDrivenComponentProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    // only rerender if props have changed
    return (
      !_.isEqual(this.props, nextProps) ||
      !_.isEqual(this.state, nextState) ||
      !_.isEqual(this.context, nextContext)
    );
  }
}
```

> [!IMPORTANT]
> The name of the tracer is used to create a unique OTEL tracer, so make sure it is unique across your application.

With an explicit Tracer name:

```typescript
import _ from 'lodash';
import { Component } from 'react';

export class TracedClassComponent extends Component<ExternallyDrivenComponentProps> {
  render() {
    'use trace TestLibTracedClassComponent';

    ...

    return (
      ...
    );
  }

  shouldComponentUpdate(
    nextProps: Readonly<ExternallyDrivenComponentProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    // only rerender if props have changed
    return (
      !_.isEqual(this.props, nextProps) ||
      !_.isEqual(this.state, nextState) ||
      !_.isEqual(this.context, nextContext)
    );
  }
}
```

#### What will be the name of the tracer?

| Declaration style                                   | Name                                     |
| --------------------------------------------------- | ---------------------------------------- |
| _Explicit name from the string after `"use trace"`_ | The passed string                        |
| named class                                         | Name of the class                        |
| anonymous class                                     | Name of the assignment target identifier |
