import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Formik, Field, FieldArray, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import _ from 'underscore';
import axios from 'axios';
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

export function normaliseData(values, data) {
  const keys = Object.keys(values);

  keys.forEach(key => {
    switch (key) {
      case 'uuid':
        break;
      case 'imdbID':
        values[key] = data.imdbID;
        break;
      case 'title':
        values[key] = data.Title;
        break;
      case 'synopsis':
        values[key] = data.Plot;
        break;
      case 'releaseDate':
        values[key] = data.Year;
        break;
      case 'studio':
        values[key] = data.Production;
        break;
      case 'ratings':
        values[key] = data.Ratings;
        break;
      case 'actors':
        values[key] = data.Actors.split(', ');
        break;
      case 'director':
        values[key] = data.Director.split(', ');
        break;
      case 'writer':
        values[key] = data.Writer.split(', ');
        break;
      case 'genre':
        values[key] = data.Genre.split(', ');
        break;
      default:
        console.log('didnt find');
    }
  });

  return values;
}

export default class MovieForm extends Component {
  render() {
    return (
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
          // MyImaginaryRestApiCall(user.id, values).then(
          //   updatedUser => {
          //     actions.setSubmitting(false);
          //     updateUser(updatedUser);
          //     onClose();
          //   },
          //   error => {
          //     actions.setSubmitting(false);
          //     actions.setErrors(transformMyRestApiErrorsToAnObject(error));
          //     actions.setStatus({ msg: 'Set some arbitrary status or data' });
          //   }
          // );
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
                actions.setSubmitting(false);
                console.log(values, actions, normaliseData(values, data));
                actions.setValues(normaliseData(values, data));
              },
              error => {
                console.error(error);
                actions.setSubmitting(false);
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
              entry.splice(entry.findIndex(item => _.isEqual(item, value)), 1);
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
                  type="text"
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
                    <table>
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
                              <Field name={`ratings[${index}].Source]`} />
                            </td>
                            <td>
                              <Field name={`ratings[${index}].Value]`} />
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
    );
  }
}
