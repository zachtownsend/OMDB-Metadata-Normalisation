import React, { Component } from 'react';
import MovieForm from './components/MovieForm';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="page-header">
          <div className="container">
            <h1>Nowtilus Code Challenge</h1>
          </div>
        </header>
        <aside className="instructions">
          <div className="container">
            <div className="card">
              <div className="card-body">
                <h3>How to use:</h3>
                <ol>
                  <li>Enter the movie release year</li>
                  <li>Enter movie name and choose the desired movie</li>
                  <li>Press "Get Movie Data" button</li>
                </ol>
                <p>
                  This will populate the movie data in the Movie Data Form,
                  which you can add to and submit
                </p>
              </div>
            </div>
          </div>
        </aside>
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
