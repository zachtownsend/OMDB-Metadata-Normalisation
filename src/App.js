import React, { Component } from 'react';
import MovieForm from './components/MovieForm';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <MovieForm />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
