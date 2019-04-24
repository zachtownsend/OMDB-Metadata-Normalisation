import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Formik, Field, FieldArray, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import _ from 'underscore';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import '@gouch/to-title-case';
import FieldRepeater from './FieldRepeater';
import FieldArrayWrapper from './FieldArrayWrapper';
import TitleSearch from './TitleSearch';
import FormattingField from './FormattingField';

Yup.addMethod(Yup.array, 'unique', function(message) {
  return this.test('unqiue', message, function(value) {
    if (!value) {
      return true;
    }

    const { path } = this;
    const hasDuplicates = new Set(value).size !== value.length;

    if (hasDuplicates) {
      throw this.createError({
        path,
        message,
      });
    }

    return true;
  });
});

/**
 * Define the form validation
 */
export const MoveFormSchema = Yup.object().shape({
  uuid: Yup.string()
    .min(1)
    .required('Nowtilus ID is required'),
  imdbID: Yup.string().matches(/(tt|nm|co|ev|ch|ni)\d+/, {
    message: 'Wrong IMDB ID Format',
    excludeEmptyString: true,
  }),
  title: Yup.string().required('Title is required'),
  synopsis: Yup.string(),
  releaseDate: Yup.string().required('Release date is required'),
  studio: Yup.string(),
  ratings: Yup.array().of(
    Yup.object().shape({
      Source: Yup.string(),
      Value: Yup.string(),
    })
  ),
  actors: Yup.array(Yup.string()).unique('This should be unique'),
  director: Yup.array(Yup.string()),
  writer: Yup.array(Yup.string()),
  genre: Yup.array(Yup.string()),
});

/**
 *
 * @param {array} array Array whose contents you wish to format
 */
function formatArray(array) {
  return array.map(data => {
    if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        data[key] = data[key].toLowerCase().toTitleCase();
      });

      return data;
    }

    return data.toLowerCase().toTitleCase();
  });
}
/**
 *
 * @param {array} userData Array of user data to be processed
 * @param {string|array} apiData String or array of data from the api to merge
 */
function mergeAndFormatArray(data) {
  const dataArray = formatArray(Array.isArray(data) ? data : data.split(', '));

  return formatArray(dataArray);
}

export function normaliseData(values, data) {
  const dataMap = {
    uuid: false,
    imdbID: 'imdbID',
    title: 'Title',
    synopsis: 'Plot',
    releaseDate: 'Year',
    studio: 'Production',
    ratings: 'Ratings',
    actors: 'Actors',
    director: 'Director',
    writer: 'Writer',
    genre: 'Genre',
  };
  const keys = Object.keys(values);

  keys.forEach(key => {
    const fieldKey = dataMap[key];
    if (fieldKey) {
      if (Array.isArray(values[key])) {
        values[key] = mergeAndFormatArray(data[fieldKey]);
      } else {
        values[key] = data[fieldKey];
      }
    }
  });

  return values;
}

export default class MovieForm extends Component {
  state = {
    initialValues: {
      uuid: '',
      imdbID: '',
      title: '',
      synopsis: '',
      releaseDate: '',
      studio: '',
      ratings: [],
      actors: [],
      director: [],
      writer: [],
      genre: [],
    },
    initialSearchValues: {
      title: '',
      releaseYear: '',
    },
    modal: {
      open: false,
      content: null,
    },
  };

  resetForm = () => {
    this.setState({
      initialValues: {
        uuid: '',
        imdbID: '',
        title: '',
        synopsis: '',
        releaseDate: '',
        studio: '',
        ratings: [],
        actors: [],
        director: [],
        writer: [],
        genre: [],
      },
      initialSearchValues: {
        title: '',
        releaseYear: '',
      },
    });
  };

  handleCloseModal = () => {
    this.setState({
      modal: {
        open: false,
      },
    });
  };

  handleClosedModal = () => {
    this.setState({
      modal: {
        content: null,
      },
    });
  };

  fetchData = ({ title, year, imdbID }, onSuccess, onError) => {
    const params = {
      apikey: '834ba8fa',
      t: title,
      y: year,
    };

    if (imdbID) {
      params.i = imdbID;
    }

    axios
      .get(`http://www.omdbapi.com/`, {
        params,
      })
      .then(
        response => {
          if (typeof onSuccess === 'function') {
            const { data } = response;
            onSuccess(data);
          }
        },
        error => {
          console.error(error);
          if (typeof onError === 'function') {
            onError(error);
          }
        }
      );
  };

  submitSearch = ({ title, year, imdbID }) => {
    this.fetchData({ title, year, imdbID }, data => {
      this.setState(prevState => ({
        selected: true,
        initialValues: normaliseData(prevState.initialValues, data),
      }));
    });
  };

  render() {
    const { initialSearchValues, initialValues, modal, selected } = this.state;

    return (
      <div>
        <TitleSearch
          initialValues={initialSearchValues}
          onSubmit={this.submitSearch}
        />
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            this.setState(
              {
                modal: {
                  open: true,
                  content: (
                    <div>
                      <Modal.Header closeButton>
                        <Modal.Title>Success!</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <p>The movie data has been added</p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button
                          variant="secondary"
                          onClick={this.handleCloseModal}
                        >
                          Close
                        </Button>
                      </Modal.Footer>
                    </div>
                  ),
                },
              },
              () => {
                this.resetForm();
              }
            );
          }}
          validationSchema={MoveFormSchema}
          render={({ values, errors, status, isSubmitting, setFieldValue }) => {
            const addItem = (name, data) => {
              try {
                const value = values[name];
                value.push(data);
                setFieldValue(name, value);
              } catch (e) {
                console.error(e);
              }
            };

            const removeItem = (name, value, schema = false) => {
              const entry = values[name];

              if (schema) {
                entry.splice(
                  entry.findIndex(item => _.isEqual(item, value)),
                  1
                );
              } else {
                entry.splice(entry.indexOf(value), 1);
              }

              setFieldValue(name, entry);
            };

            const className = key => {
              let className = 'form-control';

              if (errors[key]) {
                className += ' is-invalid';
              }

              return className;
            };

            return (
              <Form
                className={!selected ? 'disabled' : ''}
                data-testid="movie-form"
              >
                <fieldset disabled={!selected}>
                  <header>
                    <h2>Movie Data Form</h2>
                  </header>
                  <div className="form-group">
                    <label htmlFor="uuid">Nowtilus ID</label>
                    <Field
                      className={className('uuid')}
                      type="text"
                      name="uuid"
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="uuid"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="imdbID">IMDB ID</label>
                    <Field
                      className={className('imdbID')}
                      type="text"
                      name="imdbID"
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="imdbID"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <FormattingField
                      className={className('title')}
                      type="text"
                      name="title"
                      setFieldValue={setFieldValue}
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="title"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="synopsis">Synopsis</label>
                    <Field
                      className={className('synopsis')}
                      component="textarea"
                      name="synopsis"
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="synopsis"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="releaseDate">Release Date</label>
                    <Field
                      className={className('releaseDate')}
                      type="text"
                      name="releaseDate"
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="releaseDate"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="studio">Studio</label>
                    <Field
                      className={className('studio')}
                      type="text"
                      name="studio"
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="studio"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ratings">Ratings</label>
                    <FieldArray
                      name="ratings"
                      render={arrayHelpers => (
                        <table className="table">
                          {values.ratings.length > 0 && (
                            <thead>
                              <tr>
                                <th>Source</th>
                                <th rowSpan="2">Value</th>
                              </tr>
                            </thead>
                          )}

                          <tbody>
                            {values.ratings.map((rating, index) => (
                              <tr key={index}>
                                <td>
                                  <Field
                                    className="form-control"
                                    name={`ratings[${index}].Source]`}
                                  />
                                </td>
                                <td>
                                  <Field
                                    className="form-control"
                                    name={`ratings[${index}].Value]`}
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => arrayHelpers.remove(index)}
                                  >
                                    x
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() =>
                                    arrayHelpers.push({ Source: '', Value: '' })
                                  }
                                >
                                  Add Rating
                                </button>
                                <ErrorMessage
                                  component="p"
                                  className="invalid-feedback"
                                  name="ratings"
                                />
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="actors">Actors</label>
                    <FieldArrayWrapper
                      name="actors"
                      values={values.actors}
                      addButtonText="Add an actor"
                      setFieldValue={setFieldValue}
                    />

                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="actors"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="director">Director</label>
                    <FieldArrayWrapper
                      name="director"
                      values={values.director}
                      addButtonText="Add a Director"
                      setFieldValue={setFieldValue}
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="director"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="writer">Writer</label>
                    <FieldArrayWrapper
                      name="writer"
                      values={values.writer}
                      addButtonText="Add a Writer"
                      setFieldValue={setFieldValue}
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="writer"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="genre">Genre</label>
                    <FieldArrayWrapper
                      name="genre"
                      values={values.genre}
                      addButtonText="Add a Genre"
                      setFieldValue={setFieldValue}
                    />
                    <ErrorMessage
                      component="p"
                      className="invalid-feedback"
                      name="genre"
                    />
                  </div>

                  {status && status.msg && <div> {status.msg} </div>}
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Submit
                  </button>
                </fieldset>
              </Form>
            );
          }}
        />
        <Modal
          show={modal.open}
          onHide={this.handleCloseModal}
          onExited={this.handleClosedModal}
        >
          {modal.content}
        </Modal>
      </div>
    );
  }
}
