# Angular Philosophies

🧘 Things I think about when I write Angular code 🧘 inspired by [React Philosophies](https://github.com/mithi/react-philosophies/tree/main)

![Forever a work in progress!](https://img.shields.io/badge/%20🚧%20Forever%20🚧%20%20-under%20construction-yellow.svg) [![StandWithPalestineBadgeBordered](https://raw.githubusercontent.com/saedyousef/StandWithPalestine/main/badges/flat/bordered/StandWithPalestine.svg)](https://techforpalestine.org/learn-more)

    ░░░░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    ░░░░░░░░░░█░░░░░░▀█▄▀▄▀██████░░░▀█▄▀▄▀██████
    ░░░░░░░░ ░░░░░░░░░░▀█▄█▄███▀░░░░░░▀█▄█▄███▀░

> You have to think about what is the right way, even when you have the right idea of what the building blocks should be, there is huge flexibility in how you decide to put the whole system together. It is a craft... and it has a lot to do with valuing simplicity over complexity. Many people do have a tendency to make things more complicated than they need to be... The more stuff you throw into a system, the more complicated it gets and the more likely it is not going to work properly. - Barbara Liskov

## Translations to other languages

- Arabic (Soon)

## Table of Contents

0. [Introduction](#-0-introduction)
1. [The Bare Minimum](#-1-the-bare-minimum)
2. [Design for happiness](#-2-design-for-happiness)
3. [Performance tips](#-3-performance-tips)
4. [Testing principles](#-4-testing-principles)
5. [Insights shared by others](#-5-insights-shared-by-others)

## 🧘 0. Introduction

`angular-philosophies` is:

- things I think about when I write `Angular` code.
- at the back of my mind whenever I review someone else's code or my own
- just guidelines and NOT rigid rules
- a living document and will evolve over time as my experience grows
- mostly techniques which are variations of basic [refactoring](https://en.wikipedia.org/wiki/Code_refactoring) methods, [SOLID](https://en.wikipedia.org/wiki/SOLID) principles, and [extreme programming](https://en.wikipedia.org/wiki/Extreme_programming) ideas... just applied to `Angular` specifically 🙂

`Angular-philosophies` is inspired by various places I've stumbled upon at different points of my coding journey.

Here are a few of them:

- [Best Practices for a clean and performant angular applications](https://medium.freecodecamp.org/best-practices-for-a-clean-and-performant-angular-application-288e7b39eb6f)
- [Angular Best Practices](https://code-maze.com/angular-best-practices/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Kent C Dodds](https://kentcdodds.com)
- [trekhleb/state-of-the-art-shitcode](https://github.com/trekhleb/state-of-the-art-shitcode)
- [droogans/unmaintainable-code](https://github.com/Droogans/unmaintainable-code)
- [sapegin/washingcode-book](https://github.com/sapegin/washingcode-book/)

> As a seasoned developer I have certain quirks, opinions, and common patterns that I fall back on. Having to explain to another person why I am approaching a problem in a particular way is really good for helping me break bad habits and challenge my assumptions, or for providing validation for good problem solving skills. - [Coraline Ada Ehmke](https://where.coraline.codes)

## 🧘 1. The Bare Minimum

### 1.1 Recognize when the computer is smarter than you

1. Statically analyze your code with [`ESLint`](https://eslint.org/) and [`Prettier`](https://prettier.io/)
2. Enable ["strict"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) mode. It's 2024.
3. Use Latest Version
4. trackFunction
5. Signals
6. Build Size
7. Unit Tests
8. There is a reason why errors and warnings are displayed in the console.
9. Remember [`tree-shaking`](https://webpack.js.org/guides/tree-shaking/)!
10. Use Services for Three Purposes only (API, Store, [Facade](https://blog.bitsrc.io/angular-facade-design-pattern-and-how-it-can-improve-performance-65bc2aabdb26))
11. [`Typescript`](https://www.typescriptlang.org/) is your one and only guide.
12. I highly recommend [Angular Enterprise](<[https://codeclimate.com/quality/](https://angular-enterprise.com/)>).

### 1.2 Code is just a necessary evil

> "The best code is no code at all. Every new line of code you willingly bring into the world is code that has to be debugged, code that has to be read and understood, code that has to be supported." - Jeff Atwood

> "One of my most productive days was throwing away 1000 lines of code." - Eric S. Raymond

See also: [Write Less Code - Rich Harris](https://svelte.dev/blog/write-less-code), [Code is evil - Artem Sapegin](https://github.com/sapegin/washingcode-book/blob/master/manuscript/Code_is_evil.md)

#### 1.2.1 Think first before adding another dependency

Needless to say, the more you add dependencies, the more code you ship to the browser. Ask yourself, are you actually using the features which make a particular library great?

<details>
    <summary><strong><em>🙈  Do you really need it?</strong> View examples of dependencies / code you might not need</em></summary>

<br/>

1. Do you really need [`Redux`](https://redux.js.org/)? It's possible. But keep in mind that React is already a [state management library](https://kentcdodds.com/blog/application-state-management-with-react).

2. Do you really need [`Apollo client`](https://www.apollographql.com/docs/react/) ? Apollo client has many awesome features, like manual normalization. However, it will significantly increase your bundle size. If your application only makes use of features that are not unique to Apollo client , consider using a smaller library such as [`react-query`](https://react-query.tanstack.com/comparison) or [`SWR`](https://github.com/vercel/swr) (or none at all).

3. [`Axios`](https://github.com/axios/axios)? Axios is a great library with features that are not easily replicable with native `fetch`. But if the only reason for using Axios is that it has a better looking API, then consider just using a wrapper on top of fetch (such as [`redaxios`](https://github.com/developit/redaxios) or your own). Determine whether or not your application is actually using Axios's best features.

4. [`Decimal.js`](https://github.com/MikeMcl/decimal.js/)? Maybe [Big.js](https://github.com/MikeMcl/big.js/) or [other smaller libraries](https://www.npmtrends.com/big.js-vs-bignumber.js-vs-decimal.js-vs-mathjs) are sufficient.

5. [`Lodash`](https://lodash.com/)/[`underscoreJS`](https://underscorejs.org/)? [you-dont-need/You-Dont-Need-Lodash-Underscore](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore)

6. [`MomentJS`](https://momentjs.com/)? [you-dont-need/You-Dont-Need-Momentjs](https://github.com/you-dont-need/You-Dont-Need-Momentjs)

7. You might not need `Context` for theming (`light`/`dark` mode), consider using [`css variables`](https://epicreact.dev/css-variables) instead.

8. You might not even need `Javascript`. CSS is powerful. [you-dont-need/You-Dont-Need-JavaScript](https://github.com/you-dont-need/You-Dont-Need-JavaScript)
   <br/>

</details>

#### 1.2.2 Don't be clever. YAGNI!

> "What could happen with my software in the future? Oh yeah, maybe this and that. Let’s implement all these things since we are working on this part anyway. That way it’s future-proof."

**Y**ou **A**ren't **G**onna **N**eed **I**t! Always implement things when you actually need them, never when you just foresee that you may need them. The less code the better! ([Martin Fowler: YAGNI](https://martinfowler.com/bliki/Yagni.html), [C2 Wiki: You Arent Gonna Need It!](https://wiki.c2.com/?YouArentGonnaNeedIt))

Related section: [2.4 Duplication is far cheaper than the wrong abstraction](#-24-duplication-is-far-cheaper-than-the-wrong-abstraction)

### 1.3 Leave it better than you found it

**1.3.1 Detect code smells and do something about them if you need to**.

If you recognize that something is wrong, fix it right then and there. But if it's not that easy to fix or you don't have time to fix it at that moment, at least add a comment (`FIXME` or `TODO`) with a concise explanation of the identified problem. Make sure everybody knows it is broken. It shows others that you care and that they should also do the same when they encounter those kinds of things.

Keep in mind that code smells don't necessarily mean that code should be changed. A code smell just informs you that you might be able to think of a better way to implement the same functionality.

**1.3.2 Merciless Refactoring. Simple is better than complex.**

> Is the CL more complex than it should be? Check this at every level of the CL—are individual lines too complex? Are functions too complex? Are classes too complex? “Too complex” usually means “can’t be understood quickly by code readers.” It can also mean “developers are likely to introduce bugs when they try to call or modify this code.”- [Google Engineering Practices: What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html)

**💁‍♀️ TIP: Simplify [complex conditionals](https://github.com/sapegin/washingcode-book/blob/master/manuscript/Avoid_conditions.md) and exit early if you can.**

### 1.4 You can do better

**💁‍♀️ TIP: Remember that you may not need to put your `state` as a dependency because you can pass a callback function instead.**

You don't need to put `setState` (from `useState`) and `dispatch` (from `useReducer`) in your dependency array for hooks like `useEffect` and `useCallback`. ESLint will NOT complain because React guarantees their stability.

<hr>

## 🧘 2. Design for happiness

As we become better developers, structuring and organizing code becomes more and more important. We want to write code that improves readability, scalability, maintainability and performance, and minimizes the time spent debugging.

> "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live." - Martin Golding

Sounds disturbing, but it doesn’t make the message any less true. Programmers are really authors and other developers are their target audience. The time spent attempting to understand someone else’s code takes up large portion of our day to day operations. We should therefore consciously try to improve the quality of our code. It’s essential for creating a successful, maintainable product.

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler

> "The ratio of time spent reading versus writing is well over 10 to 1. We are constantly reading old code as part of the effort to write new code. So if you want to go fast, if you want to get done quickly, if you want your code to be easy to write, make it easy to read." ― Robert C. Martin [(Not saying I agree with his political views)](https://www.getrevue.co/profile/tech-bullshit/issues/tech-bullshit-explained-uncle-bob-830918)

**TL;DR**

### 2.1 Style Guide and Clean Code Checklist in Angular

The logical place to start looking for best practices in Angular is the Angular Style Guide. This is an opinionated guide on syntax, conventions, and application structuring. The style guide presents preferred conventions and explains with examples why you should use them.

### Folder Structure

As the application grows in size, it’s important to have a structure in place that allows for easy management and maintenance of your code base. Whichever structure you decide to use, it’s important to be consistent and choose a structure the entire team is happy with.

The article “How to define a highly scalable folder structure for your Angular project” discusses these topics, and can be used as a reference point when deciding on your own structure.

#### Write Readable Code

If you want the refactoring to be as efficient as possible, it’s important to have readable code. Readable code is easier to understand, which makes it easy to debug, maintain and extend.

**File names**

While adding new files, pay attention to the file-names you decide to use. File names should be consistent and describe the feature by dot separation.

**Variable- and function names**

You need to name the variables and functions so the next developer understands them. Be descriptive and use meaningful names — clarity over brevity.

This will help us avoid writing functions like this:

```
function div(x, y)) {
 const val = x / y;
 return val;
}
```

And hopefully more like this:

```
function divide(divident, divisor) {
  const quotient = divident / divisor;
  return quotient;
}
```

#### Write Small pure functions

When we write functions to execute some business logic, we should keep them small and clean. Small functions are easier to test and maintain. When you start noticing that your function is getting long and cluttered, it’s probably a good idea to abstract some of the logic to a new one.

This avoids functions like this:

```
addOrUpdateData(data: Data, status: boolean) {
  if (status) {
    return this.http.post<Data>(url, data)
      .pipe(this.catchHttpErrors());
  }
  return this.http.put<Data>(`${url}/${data.id}`, data)
    .pipe(this.catchHttpErrors());
  }
}
```

And hopefully more like this:

```
addData(data: Data) {
  return this.http.post<Data>(url, data)
    .pipe(this.catchHttpErrors());
}
updateData(data: Data) {
  return this.http.put<Data>(`${url}/${data.id}`, data)
    .pipe(this.catchHttpErrors());
}
```

#### Remove unused code

It is extremely valuable to know if a piece of code is being used or not. If you let unused code stay, then in the future, it can be hard or almost impossible to be certain if it’s actually used or not. Therefore, you should make it a high priority to remove unused code.

#### Avoid code comments

Although there are cases for comments, you should really try to avoid them. You don’t want your comments to compensate for your failure to express the message in your code. Comments should be updated as code is updated, but a better use of time would be to write code that explains itself. Inaccurate comments are worse than no comments at all, as stated by anonymous:

> Code never lies, comments do.

This avoids writing code like this:

```
// check if meal is healthy or not
if (meal.calories < 1000 &&
    meal.hasVegetables) {
  ...
}
```

And hopefully more like this:

```
if (meal.isHealthy()) {
 ...
}
```

#### Separation of Concerns

Angular is built around separation of concerns. This is a design-pattern that makes our code easier to maintain and extend, and more reusable and testable. It helps us encapsulate and limit the logic of components to satisfy what the template actually needs, and nothing more. Separation of concerns is the core of writing clean code in Angular, and uses the following rule-set:

- Split the application into multiple modules. The project becomes more organized, maintainable, readable and reusable, and we’re able to lazy load features.

```
  |-- modules
|    |-- home
|    |     |-- home.spec|module|component|scss||routing.module|.ts
|    |-- about
|    |     |-- about.spec|module|component|scss|routin.module|.ts
```

- When we find ourself in situations where we want to reuse business logic in other parts of our application, we should consider creating a service. Services are a central part of Angular and a great place for your reusable business logic. The most common use case for services are HTTP-related events. By using a service to manage our HTTP calls, we know exactly where the changes has to be made and those are the only line affected.

- You should create something like a “common frame” for your application where you will include common components. This comes in handy when you don’t want to contaminate your components with the same code. Since Angular doesn’t allow us to import component directly between different modules, we need to put these components inside the shared module.

```
// src/app/shared/components/reusable/resuable.component
...
export class ReusableComponent implements OnInit {
  @Input() title: string;
  @Input() body: string;

  @Output() buttonClick = new EventEmitter();
  constructor() { }
  ngOnInit() {}
  onButtonClick(){
    this.buttonClick.emit('Button was clicked');
  }
}
--------------------------------------------------------------------
// You can then use this component directly inside the components of
// your choice
// src/app/some/some.component
@Component({
  selector: 'app-some',
  template: `<app-reusable [title]="'Awesome title!'"
               [body]="'Lorem ipsum'"
               (buttonClick)="buttonClick($event)>
             </app-reusable>`,
})
export class SomeComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
  public buttonClick(e){
    console.log(e);
  }
}
```

- When we find our self in situations where multiple HTML elements share the same behavior (e.g. some piece of text is highlighted on click), we should consider using an attribute directive. Attribute directives are used to change the behavior or appearance of a HTML-element.

#### Utilize TypeScript

TypeScript is a superset of JavaScript which primary provides static typing, classes and interfaces. Angular is built on TypeScript, and as a result, using TypeScript with Angular becomes a pleasurable experience. It provides us with advanced autocompletion, quick navigation and refactoring. Having such a tool at your disposal shouldn’t be taken for granted.

To get the most out of TypeScript:

We should always use interfaces to force the class to implement declared functions and properties.

```
// .../burger.model.ts
export interface Burger {
  name: string;
  calories: number;
}
// .../show-burger.component.ts
this.burger: Burger;
```

We should make use of type unions and intersections. This comes extremely handy when dealing with data from an API.

```
export interface Burger {
  ...,
  bestBefore: string | Date;
}
```

#### RxJS in Angular

RxJS is a library for reactive programming that allows us to work with asynchronous data streams. Angular comes packaged with RxJS, so it’s to our great advantage to make the most of it.

#### Pipeable operators

RxJS 5.5 introduced pipeable operators. This pipe-based approach to observable-composition allows us to import on a per-operators basis, rather than importing everything. Pipeable operators does also have tree-shaking advantages and allows us to build own custom operators without extending the `Observable.prototype`.

This will help us avoid writing code like this:

```
...
const name = this.loadEmployees()
  .map(employee => employee.name)
  .catch(error => Rx.Observable.of(null));
```

And hopefully more like this:

```
const name = this.loadEmployees()
    .pipe(
      map(employee => employee.name),
      catchError(error => of(null))
    );
```

#### Subscribe in Template

Imagine a case where we need to subscribe to multiple streams. It would be a headache to manually map every single property to the corresponding value and manually unsubscribe when the component gets destroyed.

With the async pipe, we subscribe to the stream directly inside our template, without having to store the result in an intermediate property. The subscription will terminate when the component gets destroyed, which makes subscription-handling easier and contributes to cleaner code.

This will help us avoid writing code like this:

```
@Component({
  ...
  template: `<items [items]="item">`
})
class AppComponent {
  items: Item[];
  constructor(private itemService: ItemService) {}
  ngOnInit() {
    this.loadItems()
      .pipe(
        map(items => this.items = items;
      ).subscribe();
  }
  loadItems(): Observable<Item[]> {
    return this.itemService.findItems();
  }
}
```

And hopefully more like this:

```
@Component({
    ...
    template: `<items [items]="items$ | async"></items>`
})
class AppComponent {
  items$: Observable<Item[]>;

  constructor(private itemService: ItemService) {}
  ngOnInit() {
    this.items = this.loadItems();
  }
  loadItems(): Observable<Item[]> {
    return this.itemService.findItems();
  }
}
```

#### Avoid memory leaks

While Angular takes care of unsubscribing when using the async pipe, it quickly becomes a mess when we have to do this on our own. Failing to unsubscribe will lead to memory leaks, as the observable stream is left open.

The solution is to compose our subscription with the takeUntil operator, and use a subject that emits a value when the component gets destroyed. This will complete the observable-chain, causing the stream to unsubscribe.

This help us avoid writing code like this:

```
this.itemService.findItems()
  .pipe(
    map((items: Item[]) => items),
  ).subscribe()
```

And hopefully more like this:

```
  private unsubscribe$: Subject<void> = new Subject<void>();
  ...
   this.itemService.findItems()
    .pipe(
       map(value => value.item)
       takeUntil(this._destroyed$)
     )
    .subscribe();
  ...
  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.unsubscribe$.unsubscribe();
  }

```

#### Don’t use nested subscriptions

There may be situations where you need to consume data from multiple observable streams. In those cases, you should generally try to avoid socalled nested subscriptions. Nested subscriptions becomes hard to understand and may introduce unexpected side effects. We should instead use chainable methods like `witchMap`, `forkJoin` and `combineLatest` to condense our code.

This will help us avoid writing code like this:

```
this.returnsObservable1(...)
  .subscribe(
    success => {
      this.returnsObservable2(...)
        .subscribe(
          success => {
            this.returnsObservable3(...)
              .subscribe(
                success => {
                   ...
                },
```

And hopefully more like this:

```
this.returnsObservable1(...)
  .pipe(
    flatMap(success => this.returnObservable2(...),
    flatMap(success => this.returnObservable3(...)
   )
   .subscribe(success => {...});
```

#### Subjects in RxJS

A Subject acts as both an observable and an observer. Because Subjects allows us to emit data into an observable stream, people tend to abuse them. This is especially popular among developers new to RxJS. To determine when it might be a good time to use a Subject, we’re first going to see what subjects are, and what subjects are not.

What subjects are:

Subjects are multicasted, which means you can create multiple subscriptions on a single observer. You can notify all the observers in the list with the next() method. This is the primarily use of Subjects in RxJS.
Since Subjects implements Observable and Observer simultaneously, their suitable for both input and output events.
What subjects are not:

RxJS Subjects can’t be reused. You’re not allowed to call the next() method on a completed Subject.

#### Reduce final bundle size

Bundle sizes has a huge impact on the performance of the application. It’s not just about download speed, but all the JavaScript we ship to the browser needs to be parsed and compiled before it can be executed. Keeping our bundle in check can be difficult, but it’s much easier when we can see where the bloat is coming from.The webpack-bundle-analyzer plugin allows us to visualize the contents of the production build.

#### Lazy Load Your Modules

If your using a multiple-module architecture, it’s probably a good idea to lazy load your modules. Only the feature module which is used to display the initial content to the user should be loaded synchronously. The advantage of using lazy loading is that module isn’t loaded before the user actually accesses the route. This helps decrease the overall startup time by only loading the modules we’re currently presenting.

<hr>

### 2.2 Architecting Enterprise Angular Application

Let’s accept we all have been in a situation where in we are developing the application, in the initial days the development goes really fast, as the features are simple and easy to understand, But as the app size grows, the speed of development slows down drastically.
Adding a new feature or fixing a bug with large scale enterprise application without proper design and architecture becomes a nightmare.

Now we know the importance of a good architecture, lets discuss one of the elegant and commonly used pattern for architecting enterprise angular application called “Layered Architecture”

## Layered Architecture

The idea behind this pattern is to split the app into different layers and define the rules for communicating between the layers.

> In Layered architecture there is only one main rule i.e. The layers below will talk to only the layer above and it will not communicate with any other layers

Now lets discuss the different layers in this pattern. There are 3 major layers in this pattern namely

1- Core Layer : contains application core logic. e.g. data manipulation, calling APIs to get data and other business logic.
2- Abstraction Layer : intermediate layer which handles communication between presentation and core layer.
3- Presentation Layer : this layer is used for displaying UI elements and handling user interactions.

![image](https://github.com/tomavic/angular-philosophies/assets/17650005/4dba2771-e457-4d78-9ae4-22d3670562f4)

Now lets take a closer look

Presentation/UI Layer :
This is the place where all our Angular components live. This layer is responsible for application’s user interface, it presents the UI and delegates user’s actions to the core layer, through the abstraction layer. Presentation layer just knows how to display the data and it does not worry about how the data is fetched.

Presentation layer should care only for the presentation and not be putting their hands into the core logic.

Presentation layer depends on the Facade layer (above layer),to get data and it should never directly interact with core layer.

By having this kind of decoupling UI layer from core layer we get following benefits

- UI components will be much easier to test because we don’t need to inject core or async services into our tests.
- Easier to split up into multiple developer tasks.

While developing UI components, we should classify and categorize UI components into 2 categories namely

### Dumb/Presentational Components

These components does not have intelligence of their own, they depend on parent component to give them data and they pass any user interaction back to parent component.

Use @Input() to get the data from parent component and @Output() to pass events/data back to parent.

### Smart/Container Components

Container components usually wraps one or more dumb/presentational components and is responsible for providing the data and handling the interactions from children component.
Container components have a complete idea of the current functionality and they know where to get the data from and how to handle the events from children component.

Container components interact with Facade layer to get the state data and pass them to children components.

## Abstraction Layer

The Abstraction layer decouples the presentation layer from the core layer and also has it’s own defined responsibilities. This layer exposes the state data for the components in the presentational layer, playing a role of a Facade.

We should never inject API providers(services that make http calls) and state providers directly into our components in the UI layer, instead we should inject the facade service and communicate with core layer via facade layer.

Having this kind of abstraction (middle layer) gives us lots of flexibility and allows us to change the way we manage state or API data without touching the presentation/UI layer.

**We should also remember that the abstraction layer is not the place to implement business logic. Here we just connect the presentation layer to business logic, abstracting the way it is connected.**

## Core Layer

This is the top most layer, which implements the core application logic. It is responsible for all the data manipulation and outside world communication via APIs.

It majorly consists of state management & Async service(for calling rest APIs). Along with state management and async service we could also place any validators, mappers or other more advanced use-cases that requires manipulating many slices of our UI state.

Lets take a closer look at 2 of the most important parts of the core layer.

### State Management

A state is a JavaScript object which holds the application data structure. Here we can store the data needed to display in the presentation layer e.g. list of products, information about logged in user etc. Since data is shared and manipulated by lots of components it becomes very hard to track the changes.

Predictable application state is essential in order to avoid confusions and to manage different versions of state with different data across your application.

So it is very important to manage the state in our applications. To manage the state in our Angular application we can pick any state management library that support RxJS (like NgRx) or simply use BehaviorSubjects to model state.

One thing to remember with respect to State is that State objects are immutable and they are returned by a pure function.

We can start with BehaviorSubjects to manage the state, and later if there is a need to replace State management with some other library, thanks to layered architecture we can simply replace the state management with new library without impacting any other parts of the application.

### Async/API Service

API service have only one responsibility — that is to communicate with API(REST) end points and nothing else.

We should avoid any caching, business logic or data manipulation here.

**Don’t let the async service know about the state management logic.**

May be it comes naturally to save the response into the state right in the service, but in that case, we tightly coupled communication layer with data management layer, so we should always avoid updating state from this service.

<hr>

## 🧘 3. Performance Tips

### 3.1 Bigger Picture

#### State Management

Consider using @ngrx/store for maintaining the state of your application and @ngrx/effects as the side effect model for store. State changes are described by the actions and the changes are done by pure functions called reducers.

**Why?**

@ngrx/store isolates all state related logic in one place and makes it consistent across the application. It also has memoization mechanism in place when accessing the information in the store leading to a more performant application. @ngrx/store combined with the change detection strategy of Angular leads to a faster application.

#### Immutable state

When using @ngrx/store, consider using ngrx-store-freeze to make the state immutable. ngrx-store-freeze prevents the state from being mutated by throwing an exception. This avoids accidental mutation of the state leading to unwanted consequences.

**Why?**

Mutating state in components leads to the app behaving inconsistently depending on the order components are loaded. It breaks the mental model of the redux pattern. Changes can end up overridden if the store state changes and re-emits. Separation of concerns — components are view layer, they should not know how to change state.

#### Jest

Jest is Facebook’s unit testing framework for JavaScript. It makes unit testing faster by parallelising test runs across the code base. With its watch mode, only the tests related to the changes made are run, which makes the feedback loop for testing way shorter. Jest also provides code coverage of the tests and is supported on VS Code and Webstorm.

You could use a preset for Jest that will do most of the heavy lifting for you when setting up Jest in your project.

#### Karma

Karma is a test runner developed by AngularJS team. It requires a real browser/DOM to run the tests. It can also run on different browsers. Jest doesn’t need chrome headless/phantomjs to run the tests and it runs in pure Node.

#### Universal

If you haven’t made your app a Universal app, now is a good time to do it. Angular Universal lets you run your Angular application on the server and does server-side rendering (SSR) which serves up static pre-rendered html pages. This makes the app super fast as it shows content on the screen almost instantly, without having to wait for JS bundles to load and parse, or for Angular to bootstrap.

It is also SEO friendly, as Angular Universal generates static content and makes it easier for the web crawlers to index the application and make it searchable without executing JavaScript.

**Why?**

Universal improves the performance of your application drastically. We recently updated our application to do server side rendering and the site load time went from several seconds to tens of milliseconds!!

It also allows your site to correctly show up in social media preview snippets. The first meaningful paint is really fast and makes content visible to the users without any unwanted delays.

<hr>

### 3.2 Best practices for a clean and performant Angular application

**1) trackBy**

When using ngFor to loop over an array in templates, use it with a `trackBy` function which will return an unique identifier for each item.

**Why?**

When an array changes, Angular re-renders the whole DOM tree. But if you use `trackBy`, Angular will know which element has changed and will only make DOM changes for that particular element.

or a detailed explanation on this, please refer to this article by Netanel Basal

**Before**

```
<li *ngFor="let item of items;">{{ item }}</li>
```

**After**

```
// in the template

<li *ngFor="let item of items; trackBy: trackByFn">{{ item }}</li>

// in the component

trackByFn(index, item) {
   return item.id; // unique id corresponding to the item
}
```

**2) const vs let**

When declaring variables, use const when the value is not going to be reassigned.

**Why?**

Using `let` and `const` where appropriate makes the intention of the declarations clearer. It will also help in identifying issues when a value is reassigned to a constant accidentally by throwing a compile time error. It also helps improve the readability of the code.

**Before**

```
let car = 'ludicrous car';

let myCar = `My ${car}`;
let yourCar = `Your ${car};

if (iHaveMoreThanOneCar) {
   myCar = `${myCar}s`;
}

if (youHaveMoreThanOneCar) {
   yourCar = `${youCar}s`;
}
```

**After**

```
// the value of car is not reassigned, so we can make it a const
const car = 'ludicrous car';

let myCar = `My ${car}`;
let yourCar = `Your ${car};

if (iHaveMoreThanOneCar) {
   myCar = `${myCar}s`;
}

if (youHaveMoreThanOneCar) {
   yourCar = `${youCar}s`;
}
```

**3) Pipeable operators**

Use pipeable operators when using RxJs operators.

**Why?**

Pipeable operators are tree-shakeable meaning only the code we need to execute will be included when they are imported.

This also makes it easy to identify unused operators in the files.

Note: This needs Angular version 5.5+.

**Before**

```
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

iAmAnObservable
    .map(value => value.item)
    .take(1);
```

**After**

```
import { map, take } from 'rxjs/operators';

iAmAnObservable
    .pipe(
       map(value => value.item),
       take(1)
     );
```

**4) Isolate API hacks**

Not all APIs are bullet proof — sometimes we need to add some logic in the code to make up for bugs in the APIs. Instead of having the hacks in components where they are needed, it is better to isolate them in one place — like in a service and use the service from the component.

**Why?**

This helps keep the hacks “closer to the API”, so as close to where the network request is made as possible. This way, less of your code is dealing with the un-hacked code. Also, it is one place where all the hacks live and it is easier to find them. When fixing the bugs in the APIs, it is easier to look for them in one file rather than looking for the hacks that could be spread across the codebase.

You can also create custom tags like API_FIX similar to TODO and tag the fixes with it so it is easier to find.

**5) Subscribe in template**

Avoid subscribing to observables from components and instead subscribe to the observables from the template.

**Why?**

`async` pipes unsubscribe themselves automatically and it makes the code simpler by eliminating the need to manually manage subscriptions. It also reduces the risk of accidentally forgetting to unsubscribe a subscription in the component, which would cause a memory leak. This risk can also be mitigated by using a lint rule to detect unsubscribed observables.

This also stops components from being stateful and introducing bugs where the data gets mutated outside of the subscription.

**Before**

```
// // template

<p>{{ textToDisplay }}</p>

// component

iAmAnObservable
    .pipe(
       map(value => value.item),
       takeUntil(this._destroyed$)
     )
    .subscribe(item => this.textToDisplay = item);
```

**After**

```
// template

<p>{{ textToDisplay$ | async }}</p>

// component

this.textToDisplay$ = iAmAnObservable
    .pipe(
       map(value => value.item)
     );
```

**6) Clean up subscriptions**

When subscribing to observables, always make sure you unsubscribe from them appropriately by using operators like `take`, `takeUntil`, etc.

**Why?**

Failing to unsubscribe from observables will lead to unwanted memory leaks as the observable stream is left open, potentially even after a component has been destroyed / the user has navigated to another page.

Even better, make a lint rule for detecting observables that are not unsubscribed.

**Before**

```
iAmAnObservable
    .pipe(
       map(value => value.item)
     )
    .subscribe(item => this.textToDisplay = item);
```

**After**
Using `takeUntil` when you want to listen to the changes until another observable emits a value:

```
private _destroyed$ = new Subject();

public ngOnInit (): void {
    iAmAnObservable
    .pipe(
       map(value => value.item)
      // We want to listen to iAmAnObservable until the component is destroyed,
       takeUntil(this._destroyed$)
     )
    .subscribe(item => this.textToDisplay = item);
}

public ngOnDestroy (): void {
    this._destroyed$.next();
    this._destroyed$.complete();
}
```

Using a private subject like this is a pattern to manage unsubscribing many observables in the component.

Using `take` when you want only the first value emitted by the observable:

```
iAmAnObservable
    .pipe(
       map(value => value.item),
       take(1),
       takeUntil(this._destroyed$)
    )
    .subscribe(item => this.textToDisplay = item);
```

Note the usage of `takeUntil` with `take` here. This is to avoid memory leaks caused when the subscription hasn’t received a value before the component got destroyed. Without `takeUntil` here, the subscription would still hang around until it gets the first value, but since the component has already gotten destroyed, it will never get a value — leading to a memory leak.

**7) Use appropriate operators**

When using flattening operators with your observables, use the appropriate operator for the situation.

switchMap: when you want to ignore the previous emissions when there is a new emission

mergeMap: when you want to concurrently handle all the emissions

concatMap: when you want to handle the emissions one after the other as they are emitted

exhaustMap: when you want to cancel all the new emissions while processing a previous emisssion

For a more detailed explanation on this, please refer to this article by Nicholas Jamieson.

**Why?**

Using a single operator when possible instead of chaining together multiple other operators to achieve the same effect can cause less code to be shipped to the user. Using the wrong operators can lead to unwanted behaviour, as different operators handle observables in different ways.

**8) Lazy load**

When possible, try to lazy load the modules in your Angular application. Lazy loading is when you load something only when it is used, for example, loading a component only when it is to be seen.

**Why?**

This will reduce the size of the application to be loaded and can improve the application boot time by not loading the modules that are not used.

**Before**

```
// app.routing.ts

{ path: 'not-lazy-loaded', component: NotLazyLoadedComponent }
```

**After**

```
// app.routing.ts

{
  path: 'lazy-load',
  loadChildren: 'lazy-load.module#LazyLoadModule'
}

// lazy-load.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadComponent }   from './lazy-load.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
         {
             path: '',
             component: LazyLoadComponent
         }
    ])
  ],
  declarations: [
    LazyLoadComponent
  ]
})
export class LazyModule {}
```

**9) Avoid having subscriptions inside subscriptions**

Sometimes you may want values from more than one observable to perform an action. In this case, avoid subscribing to one observable in the subscribe block of another observable. Instead, use appropriate chaining operators. Chaining operators run on observables from the operator before them. Some chaining operators are: `withLatestFrom`, `combineLatest`, etc.

**Before**

```
firstObservable$.pipe(
   take(1)
)
.subscribe(firstValue => {
    secondObservable$.pipe(
        take(1)
    )
    .subscribe(secondValue => {
        console.log(`Combined values are: ${firstValue} & ${secondValue}`);
    });
});
```

**After**

```
firstObservable$.pipe(
    withLatestFrom(secondObservable$),
    first()
)
.subscribe(([firstValue, secondValue]) => {
    console.log(`Combined values are: ${firstValue} & ${secondValue}`);
});
```

**Why?**

Code smell/readability/complexity: Not using RxJs to its full extent, suggests developer is not familiar with the RxJs API surface area.

Performance: If the observables are cold, it will subscribe to firstObservable, wait for it to complete, THEN start the second observable’s work. If these were network requests it would show as synchronous/waterfall.

**10) Avoid any; type everything;**

Always declare variables or constants with a type other than `any`.

**Why?**

When declaring variables or constants in Typescript without a typing, the typing of the variable/constant will be deduced by the value that gets assigned to it. This will cause unintended problems. One classic example is:

```
const x = 1;
const y = 'a';
const z = x + y;

console.log(`Value of z is: ${z}`

// Output
Value of z is 1a
```

This can cause unwanted problems when you expect y to be a number too. These problems can be avoided by typing the variables appropriately.

```
const x: number = 1;
const y: number = 'a';
const z: number = x + y;

// This will give a compile error saying:

Type '"a"' is not assignable to type 'number'.

const y:number
```

This way, we can avoid bugs caused by missing types.

Another advantage of having good typings in your application is that it makes refactoring easier and safer.

Consider this example:

```
public ngOnInit (): void {
    let myFlashObject = {
        name: 'My cool name',
        age: 'My cool age',
        loc: 'My cool location'
    }
    this.processObject(myFlashObject);
}

public processObject(myObject: any): void {
    console.log(`Name: ${myObject.name}`);
    console.log(`Age: ${myObject.age}`);
    console.log(`Location: ${myObject.loc}`);
}

// Output
Name: My cool name
Age: My cool age
Location: My cool location
```

Let us say, we want to rename the property loc to `location` in `myFlashObject`:

```
public ngOnInit (): void {
    let myFlashObject = {
        name: 'My cool name',
        age: 'My cool age',
        location: 'My cool location'
    }
    this.processObject(myFlashObject);
}

public processObject(myObject: any): void {
    console.log(`Name: ${myObject.name}`);
    console.log(`Age: ${myObject.age}`);
    console.log(`Location: ${myObject.loc}`);
}

// Output
Name: My cool name
Age: My cool age
Location: undefined
```

If we do not have a typing on `myFlashObject`, it thinks that the property `loc` on `myFlashObject` is just undefined rather than that it is not a valid property.

If we had a typing for `myFlashObject`, we would get a nice compile time error as shown below:

```
type FlashObject = {
    name: string,
    age: string,
    location: string
}

public ngOnInit (): void {
    let myFlashObject: FlashObject = {
        name: 'My cool name',
        age: 'My cool age',
        // Compilation error
        Type '{ name: string; age: string; loc: string; }' is not assignable to type 'FlashObjectType'.
        Object literal may only specify known properties, and 'loc' does not exist in type 'FlashObjectType'.
        loc: 'My cool location'
    }
    this.processObject(myFlashObject);
}

public processObject(myObject: FlashObject): void {
    console.log(`Name: ${myObject.name}`);
    console.log(`Age: ${myObject.age}`)
    // Compilation error
    Property 'loc' does not exist on type 'FlashObjectType'.
    console.log(`Location: ${myObject.loc}`);
}
```

If you are starting a new project, it is worth setting `strict:true` in the `tsconfig.json` file to enable all strict type checking options.

**11) LINTING**

Make sure to use ESLint properly

**12) Small reusable components**

Extract the pieces that can be reused in a component and make it a new one. Make the component as dumb as possible, as this will make it work in more scenarios. Making a component dumb means that the component does not have any special logic in it and operates purely based on the inputs and outputs provided to it.

As a general rule, the last child in the component tree will be the dumbest of all.

**Why?**

Reusable components reduce duplication of code therefore making it easier to maintain and make changes.

Dumb components are simpler, so they are less likely to have bugs. Dumb components make you think harder about the public component API, and help sniff out mixed concerns.

**13) Components should only deal with display logic**

Avoid having any logic other than display logic in your component whenever you can and make the component deal only with the display logic.

**Why?**

Components are designed for presentational purposes and control what the view should do. Any business logic should be extracted into its own methods/services where appropriate, separating business logic from view logic.

Business logic is usually easier to unit test when extracted out to a service, and can be reused by any other components that need the same business logic applied.

**14) Avoid long methods**

Long methods generally indicate that they are doing too many things. Try to use the Single Responsibility Principle. The method itself as a whole might be doing one thing, but inside it, there are a few other operations that could be happening. We can extract those methods into their own method and make them do one thing each and use them instead.

**Why?**

Long methods are hard to read, understand and maintain. They are also prone to bugs, as changing one thing might affect a lot of other things in that method. They also make refactoring (which is a key thing in any application) difficult.

This is sometimes measured as “cyclomatic complexity”. There are also some TSLint rules to detect cyclomatic/cognitive complexity, which you could use in your project to avoid bugs and detect code smells and maintainability issues.

**15) DRY**

Do not Repeat Yourself. Make sure you do not have the same code copied into different places in the codebase. Extract the repeating code and use it in place of the repeated code.

**Why?**

Having the same code in multiple places means that if we want to make a change to the logic in that code, we have to do it in multiple places. This makes it difficult to maintain and also is prone to bugs where we could miss updating it in all occurrences. It takes longer to make changes to the logic and testing it is a lengthy process as well.

In those cases, extract the repeating code and use it instead. This means only one place to change and one thing to test. Having less duplicate code shipped to users means the application will be faster.

**16) Add caching mechanisms**

When making API calls, responses from some of them do not change often. In those cases, you can add a caching mechanism and store the value from the API. When another request to the same API is made, check if there is a value for it in the cache and if so, use it. Otherwise, make the API call and cache the result.

If the values change but not frequently, you can introduce a cache time where you can check when it was last cached and decide whether or not to call the API.

**Why?**

Having a caching mechanism means avoiding unwanted API calls. By only making the API calls when required and avoiding duplication, the speed of the application improves as we do not have to wait for the network. It also means we do not download the same information over and over again.

**17) Avoid logic in templates**

If you have any sort of logic in your templates, even if it is a simple && clause, it is good to extract it out into its component.

**Why?**

Having logic in the template means that it is not possible to unit test it and therefore it is more prone to bugs when changing template code.

**Before**

```
// template
<p *ngIf="role==='developer'"> Status: Developer </p>

// component
public ngOnInit (): void {
    this.role = 'developer';
}
```

**After**

```
// template
<p *ngIf="showDeveloperStatus"> Status: Developer </p>

// component
public ngOnInit (): void {
    this.role = 'developer';
    this.showDeveloperStatus = true;
}
```

**18) Strings should be safe**

If you have a variable of type string that can have only a set of values, instead of declaring it as a string type, you can declare the list of possible values as the type.

**Why?**

By declaring the type of the variable appropriately, we can avoid bugs while writing the code during compile time rather than during runtime.

**Before**

```
private myStringValue: string;

if (itShouldHaveFirstValue) {
   myStringValue = 'First';
} else {
   myStringValue = 'Second'
}
```

**After**

```
private myStringValue: 'First' | 'Second';

if (itShouldHaveFirstValue) {
   myStringValue = 'First';
} else {
   myStringValue = 'Other'
}

// This will give the below error
Type '"Other"' is not assignable to type '"First" | "Second"'
(property) AppComponent.myValue: "First" | "Second"
```
