# My solution

## 1 - How to run the solution.

Go into solution directory and run the following commands:

### `npm start`

Runs the app in the development mode.

### `npm run build`

Builds the app for production to the `build` folder.<br>
Actually, the `build` folder is ready to be deployed, to do this you need a static server, if you don't have run the following commands:

### `npm install -g serve`

And to run the solution:

### `serve -s build`

If you need to install dependencies, run the command:

### `npm install`

## 2 - How to ensure thata future modifications of the code will not break the existing functionality.

For future modifications, are possible to add them within a new class avoiding to change the RestFAPI class.<br>
In case that the RestFAPI class has to be change, I suggest to use version control and test the code before to build.

## 3 - Description of the solution.

For the solution I use [react](https://reactjs.org/) because I think is easy to code and understand.<br>
I've used a main class call RestFAPI which gets the data from the server and handle it to show on a graph and in a table to permit the user to change the values.<br>
With any change the user made, the graph is updated to make visible this changes.<br>
For the data to show, there's no limit. Just for the hours, with a restriction of 1, 3, 6 and 12 hours from the current time.

## 4 - Justification for any framework/library choice.

* [D3](https://d3js.org/) - To create the graph.
Due to the ease of the tool for the creation of graphs from data.

## 5 - Challenges I faced.

One of the major challenges of this project is the fact that I didn't knew any of the tools that we had to use for this solution.
  > Referring to [vue](https://vuejs.org/), [angular](https://angular.io/) and [react](https://reactjs.org/)

Due to that, I had to choose one of them to make the project. Before to chose, I read a little about the 3 options and finally I decided for [react](https://reactjs.org/). After my decision, I had to saw and made examples to understand how it works, and see documentation of the differents tools I used, in this case React and D3.
