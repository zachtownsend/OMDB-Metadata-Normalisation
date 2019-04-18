import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Formik, Field, FieldArray, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import _ from 'underscore';
import FieldRepeater from './FieldRepeater';

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
  actors: Yup.array(Yup.string()),
  director: Yup.array(Yup.string()),
  writer: Yup.array(Yup.string()),
  genre: Yup.array(Yup.string()),
});

export default class MovieForm extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // }

  render() {
    return (
      <Formik
        initialValues={{
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
            <Form>
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
                <Field className="form-control" type="text" name="synopsis" />
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
                    <div>
                      {values.ratings.map((rating, index) => (
                        <div key={index}>
                          <Field name={`ratings[${index}].source]`} />
                          <Field name={`ratings[${index}].value]`} />
                          <button
                            type="button"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            -
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          arrayHelpers.push({ source: '', value: '' })
                        }
                      >
                        Add Rating
                      </button>
                    </div>
                  )}
                />
                <ErrorMessage name="ratings" />
              </div>

              <div className="form-group">
                <label htmlFor="actors">Actors</label>
                <FieldArray
                  name="actors"
                  render={arrayHelpers => (
                    <div>
                      {values.actors && values.actors.length > 0 ? (
                        values.actors.map((actor, index) => (
                          <div key={index}>
                            <Field name={`actors.${index}`} />
                            <button
                              type="button"
                              onClick={() => arrayHelpers.remove(actor)} // remove a friend from the list
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => arrayHelpers.insert(actor, '')} // insert an empty string at a position
                            >
                              +
                            </button>
                          </div>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() => arrayHelpers.push('')}
                        >
                          {/* show this when user has removed all friends from the list */}
                          Add an actor
                        </button>
                      )}
                    </div>
                  )}
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
