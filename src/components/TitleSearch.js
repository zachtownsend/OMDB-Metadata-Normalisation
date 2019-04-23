import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Autosuggest from 'react-autosuggest';
import { defaultTheme } from 'react-autosuggest/dist/theme';
import axios from 'axios';

const SearchFormSchema = Yup.object().shape({
  title: Yup.string()
    .min(1)
    .required('Please type a movie title'),
  releaseYear: Yup.number()
    .min(1850, 'The release year must be 1850 or later')
    .required('Please enter movie release year'),
});

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.Title;

// Use your imagination to render suggestions.
const renderSuggestion = ({ Title, Year }) => (
  <div>
    <h4>
      {Title} ({Year})
    </h4>
  </div>
);

export default class TitleSearch extends Component {
  constructor() {
    super();

    this.state = {
      suggestions: [],
      selected: {},
      loading: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { suggestions } = this.state;
    return !_.isEqual(suggestions, nextState.suggestions);
  }

  onSuggestionsFetchRequested = (title, year) => {
    if (this.lastRequestId !== null) {
      clearTimeout(this.lastRequestId);
    }

    this.lastRequestId = setTimeout(() => {
      const { loading, suggestions } = this.state;
      const inputTitle = title.trim();

      if (loading || inputTitle.length < 2) {
        return suggestions;
      }

      this.setState({
        loading: true,
      });

      axios
        .get('http://www.omdbapi.com/', {
          params: {
            apikey: '834ba8fa',
            s: title,
            y: year,
          },
        })
        .then(res => res.data.Search)
        .then(results => {
          console.log(results);
          this.setState({
            loading: false,
            suggestions:
              results !== undefined && Array.isArray(results) ? results : [],
          });
        });
    }, 500);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  shouldRenderSuggestions = value => {
    const { selected } = this.state;
    return selected.Title === undefined || value !== selected.Title;
  };

  render() {
    const { suggestions } = this.state;

    return (
      <div className="movie-search">
        <Formik
          initalValues={{ title: '', releaseYear: '' }}
          validationSchema={SearchFormSchema}
          render={({ values, errors, handleChange, handleSubmit }) => (
            <form className="form" onSubmit={handleSubmit}>
              <fieldset>
                <div className="form-row">
                  <div className="col-3 form-group">
                    <label htmlFor="releaseYear">Release Year</label>
                    <Field
                      className="form-control"
                      type="number"
                      name="releaseYear"
                    />
                    <ErrorMessage name="releaseYear" />
                  </div>
                  <div className="col form-group">
                    <label htmlFor="title">Movie Title Search</label>
                    <Autosuggest
                      theme={defaultTheme}
                      suggestions={suggestions}
                      onSuggestionsFetchRequested={this.onSuggestionsFetchRequested(
                        values.title || '',
                        values.releaseYear || ''
                      )}
                      onSuggestionsClearRequested={
                        this.onSuggestionsClearRequested
                      }
                      onSuggestionSelected={(e, { suggestion }) => {
                        this.setState({
                          selected: suggestion,
                        });

                        values.title = suggestion.Title;
                      }}
                      getSuggestionValue={getSuggestionValue}
                      shouldRenderSuggestions={this.shouldRenderSuggestions}
                      renderSuggestion={renderSuggestion}
                      inputProps={{
                        id: 'title',
                        name: 'title',
                        onChange: handleChange,
                        value: values.title || '',
                        className: 'form-control',
                        disabled:
                          errors.releaseYear !== undefined ||
                          !values.releaseYear,
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <button className="btn btn-primary" type="submit">
                    Get Movie Data
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        />
      </div>
    );
  }
}
