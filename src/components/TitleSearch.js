import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Autosuggest from 'react-autosuggest';
import Autocomplete from 'react-autocomplete';
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

function getUnique(array, key) {
  const usedKeys = [];

  return array.filter(item => {
    if (usedKeys.includes(item[key])) {
      return false;
    }

    usedKeys.push(item[key]);
    return true;
  });
}

export default class TitleSearch extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    onSubmit: null,
  };

  state = {
    suggestions: [],
    selected: {},
    loading: false,
  };

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
          this.setState({
            loading: false,
            suggestions:
              results !== undefined && Array.isArray(results)
                ? getUnique(results, 'imdbID')
                : [],
          });
        });
    }, 500);
  };

  onChange = (e, values, handleChange) => {
    const { value } = e.target;
    this.onSuggestionsFetchRequested(value, values.releaseYear);
    handleChange(e);
  };

  render() {
    const { suggestions, selected } = this.state;
    const { onSubmit } = this.props;
    return (
      <div className="movie-search mb-5">
        <Formik
          initalValues={{
            title: '',
            releaseYear: '',
          }}
          validationSchema={SearchFormSchema}
          onSubmit={(values, actions) => {
            onSubmit(selected);

            actions.resetForm({
              title: '',
              releaseYear: '',
            });

            this.setState({
              selected: {},
            });
          }}
          render={({
            values,
            touched,
            errors,
            setFieldValue,
            handleChange,
            handleSubmit,
          }) => (
            <form className="form" onSubmit={handleSubmit}>
              <fieldset>
                <header>
                  <h2>Find Movie</h2>
                </header>
                <div className="form-row">
                  <div className="col-3 form-group">
                    <label htmlFor="releaseYear">Release Year</label>
                    <Field
                      className="form-control"
                      type="number"
                      name="releaseYear"
                      onChange={e => {
                        this.onChange(e, values, handleChange);
                      }}
                    />
                    <ErrorMessage name="releaseYear" />
                  </div>
                  <div className="col form-group">
                    <label htmlFor="title">Movie Title Search</label>
                    <Autocomplete
                      inputProps={{
                        id: 'title',
                        name: 'title',
                        className: 'form-control',
                        disabled:
                          values.releaseYear === undefined ||
                          errors.releaseYear !== undefined,
                      }}
                      wrapperStyle={{
                        display: 'block',
                        position: 'relative',
                      }}
                      value={values.title}
                      items={suggestions}
                      getItemValue={movie => movie.Title}
                      onSelect={(e, movie) => {
                        setFieldValue('title', movie.Title);
                        this.setState({
                          selected: movie,
                        });
                      }}
                      onChange={e => {
                        this.onChange(e, values, handleChange);
                      }}
                      renderMenu={children => (
                        <div className="menu">{children}</div>
                      )}
                      renderItem={(item, isHighlighted) => (
                        <div
                          className={`item ${
                            isHighlighted ? 'item-highlighted' : ''
                          }`}
                          key={item.imdbID}
                        >
                          {item.Title} ({item.Year})
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <button
                    disabled={_.isEmpty(selected)}
                    className="btn btn-primary"
                    type="submit"
                  >
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
