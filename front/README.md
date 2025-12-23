🔰 Basic React Questions with Answers

1. What is React and why would you use it?
   Answer: React is a JavaScript library for building user interfaces, especially single-page applications. It allows for the creation of reusable UI components and efficiently updates and renders the right components when your data changes.

2. What are components in React?
   Answer: Components are the building blocks of a React application. They are reusable pieces of UI that can be functional or class-based.

3. Difference between functional and class components?
   Answer: Functional: Simple JS functions, can use hooks.
   Class: Use ES6 classes, use lifecycle methods (legacy style).
   Now, functional components with hooks are preferred.

4. What is JSX?
   Answer: JSX (JavaScript XML) is a syntax extension that looks like HTML and is used to describe UI in React. It gets transpiled to React.createElement() calls.

5. What is the Virtual DOM?
   Answer: The Virtual DOM is a lightweight copy of the real DOM. React uses it to detect changes and update only the affected parts in the real DOM, improving performance.

6. What are props in React?
   Answer:
   Props (short for properties) are read-only attributes used to pass data from parent to child components.

7. What is state in React?
   Answer:
   State is a built-in object to store component-specific data that may change over time and trigger re-renders.

8. How does useState work?
   Answer:
   useState is a hook that lets you add state to a functional component:

js
Copy
Edit
const [count, setCount] = useState(0); 9. How do you pass data from parent to child?
Answer:
By using props:

js
Copy
Edit
<ChildComponent data={value} /> 10. What is the key prop and why is it needed?
Answer:
The key prop helps React identify which items have changed, are added, or are removed from a list. It should be unique and stable.

⚙️ Intermediate React Questions with Answers

1. What are React hooks?
   Answer:
   Hooks are functions that let you “hook into” React state and lifecycle features from functional components. Examples: useState, useEffect.

2. Explain useEffect.
   Answer:
   useEffect runs side effects (e.g., API calls, DOM updates) after render. You can control it using a dependency array:

js
Copy
Edit
useEffect(() => {
fetchData();
}, [dependency]); 3. What is conditional rendering?
Answer:
It lets you render components or elements based on conditions using if, ternary ? :, or &&.

4. Controlled vs Uncontrolled components?
   Answer:

Controlled: Form elements controlled by React state.

Uncontrolled: Form data handled by the DOM.

5. What is lifting state up?
   Answer:
   Moving state to the closest common parent of components that need to share it.

6. What are synthetic events?
   Answer:
   React wraps native browser events in a cross-browser wrapper called SyntheticEvent to ensure consistency.

7. How are forms handled in React?
   Answer:
   Typically using controlled components:

js
Copy
Edit
<input value={name} onChange={e => setName(e.target.value)} /> 8. What is the Context API?
Answer:
Context provides a way to pass data deeply through a component tree without manually passing props at every level.

9. What are Higher-Order Components (HOCs)?
   Answer:
   Functions that take a component and return a new component with additional props or behavior.

js
Copy
Edit
const Enhanced = withLogger(OriginalComponent); 10. Why are keys important in lists?
Answer:
They help React efficiently update the UI by identifying which items changed.

🚀 Advanced React Questions with Answers

1. How does reconciliation work in React?
   Answer:
   React compares the new Virtual DOM with the previous one (diffing) and updates only the parts that changed (reconciliation).

2. What is memoization in React?
   Answer:
   Optimization technique to avoid unnecessary re-renders using:

React.memo for components.

useMemo for expensive calculations.

3. Difference between useMemo and useCallback?
   Answer:

useMemo: Caches the result of a calculation.

useCallback: Caches the function itself.

js
Copy
Edit
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedFn = useCallback(() => handleClick(), []); 4. How do you optimize performance in React?
Answer:

Use React.memo

Use useMemo, useCallback

Code-splitting (lazy load)

Avoid unnecessary re-renders

5. What are custom hooks?
   Answer:
   Custom logic extracted into a reusable function starting with "use":

js
Copy
Edit
function useFetch(url) {
const [data, setData] = useState(null);
useEffect(() => { fetch(url).then(res => res.json()).then(setData); }, [url]);
return data;
} 6. What is lazy loading in React?
Answer:
Loading components or modules only when needed using React.lazy():

js
Copy
Edit
const LazyComp = React.lazy(() => import('./MyComponent')); 7. What is React Suspense?
Answer:
Used with React.lazy to show fallback content (e.g., loader) while a component is loading.

8. What are render props?
   Answer:
   A technique where a component's children is a function that returns elements.

js
Copy
Edit
<DataProvider render={(data) => <Chart data={data} />} /> 9. Redux vs Context API?
Answer:

Redux: Centralized store, great for large-scale apps.

Context API: Built-in, simpler, but can cause re-renders if not optimized.

10. What are error boundaries?
    Answer:
    React components that catch JavaScript errors anywhere in their child tree.

js
Copy
Edit
class ErrorBoundary extends React.Component {
componentDidCatch(error, info) {
// log error
}
render() {
return this.state.hasError ? <Fallback /> : this.props.children;
}
}
