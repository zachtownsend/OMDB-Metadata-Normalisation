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
  releaseDate: Yup.number()
    .min(1850, 'The release year must be 1850 or later')
    .required('Release date is required'),
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
 * @param {array} userData Array of user data to be processed
 * @param {string|array} apiData String or array of data from the api to merge
 */
function mergeAndFormatArray(userData, apiData) {
  const apiDataArray = Array.isArray(apiData) ? apiData : apiData.split(', ');

  return apiDataArray.concat(
    userData.map(data => {
      if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
          data[key] = data[key].toLowerCase().toTitleCase();
        });

        return data;
      }

      return data.toTitleCase();
    })
  );
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
        values[key] = mergeAndFormatArray(values[key], data[fieldKey]);
      } else {
        values[key] = data[fieldKey];
      }
    }
  });

  return values;
}

export default class MovieForm extends Component {
  state = {
    movieData: {},
    modal: {
      open: false,
      content: null,
    },
  };

  handleCloseModal = () => {
    this.setState({
      modal: {
        open: false,
      },
    });
  };

  render() {
    return (
      <div>
        <Formik
          initialValues={{
            uuid: '12345',
            imdbID: '',
            title: 'arthur',
            synopsis: '',
            releaseDate: '2011',
            studio: '',
            ratings: [],
            actors: [],
            director: [],
            writer: [],
            genre: [],
          }}
          onSubmit={(values, actions) => {
            const { title, releaseDate, imdbID } = values;
            const params = {
              apikey: '834ba8fa',
              t: title,
              y: releaseDate,
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
                  const { data } = response;
                  console.log(response);
                  if (data.Response === 'False') {
                    actions.setError(data.Error);
                    this.setState({
                      modal: {
                        open: true,
                        content: (
                          <div>
                            <Modal.Header closeButton>
                              <Modal.Title>Error</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>{data.Error}</Modal.Body>
                            <Modal.Footer>
                              <Button variant="secondary">Close</Button>
                            </Modal.Footer>
                          </div>
                        ),
                      },
                    });
                    actions.setSubmitting(false);
                  } else {
                    actions.setSubmitting(false);
                    actions.setValues(normaliseData(values, data));
                  }
                },
                error => {
                  console.error(error);
                  actions.setSubmitting(false);
                  actions.setErrors(error);
                }
              );
          }}
          validationSchema={MoveFormSchema}
          render={({
            values,
            errors,
            status,
            touched,
            isSubmitting,
            setFieldValue,
          }) => {
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

            return (
              <Form data-testid="movie-form">
                <div className="form-group">
                  <label htmlFor="uuid">Nowtilus ID</label>
                  <Field className="form-control" type="text" name="uuid" />
                  <ErrorMessage name="uuid" component="div" />
                </div>

                <div className="form-group">
                  <label htmlFor="imdbID">IMDB ID</label>
                  <Field className="form-control" type="text" name="imdbID" />
                  <ErrorMessage name="imdbID" />
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <Field className="form-control" type="text" name="title" />
                  <ErrorMessage name="title" />
                </div>

                <div className="form-group">
                  <label htmlFor="synopsis">Synopsis</label>
                  <Field
                    className="form-control"
                    component="textarea"
                    name="synopsis"
                  />
                  <ErrorMessage name="synopsis" />
                </div>

                <div className="form-group">
                  <label htmlFor="releaseDate">Release Date</label>
                  <Field
                    className="form-control"
                    type="number"
                    name="releaseDate"
                  />
                  <ErrorMessage name="releaseDate" />
                </div>

                <div className="form-group">
                  <label htmlFor="studio">Studio</label>
                  <Field className="form-control" type="text" name="studio" />
                  <ErrorMessage name="studio" />
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
                              <ErrorMessage name="ratings" />
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
                  />

                  <ErrorMessage name="actors" />
                </div>

                <div className="form-group">
                  <label htmlFor="director">Director</label>
                  <FieldRepeater
                    name="director"
                    data={values.director}
                    pluralTitle="Directors"
                    singluarTitle="Director"
                    onAddItem={data => {
                      addItem('director', data);
                    }}
                    onRemoveItem={value => {
                      removeItem('director', value);
                    }}
                  />
                  <ErrorMessage name="director" />
                </div>

                <div className="form-group">
                  <label htmlFor="writer">Writer</label>
                  <FieldRepeater
                    name="writer"
                    data={values.writer}
                    pluralTitle="Writers"
                    singluarTitle="Writer"
                    onAddItem={data => {
                      addItem('writer', data);
                    }}
                    onRemoveItem={value => {
                      removeItem('writer', value);
                    }}
                  />
                  <ErrorMessage name="writer" />
                </div>

                <div className="form-group">
                  <label htmlFor="genre">Genre</label>
                  <FieldRepeater
                    name="genre"
                    data={values.genre}
                    pluralTitle="Genres"
                    singluarTitle="Genre"
                    onAddItem={data => {
                      addItem('genre', data);
                    }}
                    onRemoveItem={value => {
                      removeItem('genre', value);
                    }}
                  />
                  <ErrorMessage name="genre" />
                </div>

                {status && status.msg && <div> {status.msg} </div>}
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
              </Form>
            );
          }}
        />
        <Modal show={this.state.modal.open} onHide={this.handleCloseModal}>
          {this.state.modal.content}
        </Modal>
      </div>
    );
  }
}
