import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.css";

import Calendar from "Calendar";

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={Calendar} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
