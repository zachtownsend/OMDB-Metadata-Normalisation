import React, { Component } from 'react';
import MoveForm from './components/MovieForm';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <MoveForm />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
