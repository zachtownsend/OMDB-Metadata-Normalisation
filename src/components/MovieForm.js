import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
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
        }) => (
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
              <Field className="form-control" type="text" name="releaseDate" />
              <ErrorMessage name="releaseDate" />
            </div>

            <div className="form-group">
              <label htmlFor="studio">Studio</label>
              <Field className="form-control" type="text" name="studio" />
              <ErrorMessage name="studio" />
            </div>

            <div className="form-group">
              <label htmlFor="ratings">Ratings</label>
              <Field className="form-control" type="text" name="ratings" />
              <ErrorMessage name="ratings" />
            </div>

            <div className="form-group">
              <label htmlFor="actors">Actors</label>
              <FieldRepeater
                name="actors"
                data={values.actors}
                pluralTitle="Actors"
                singluarTitle="Actor"
                onAddRow={data => {
                  const { actors } = values;
                  actors.push(data);
                  setFieldValue('actors', actors);
                }}
              />
              <ErrorMessage name="actors" />
            </div>

            <div className="form-group">
              <label htmlFor="director">Director</label>
              <Field className="form-control" type="text" name="director" />
              <ErrorMessage name="director" />
            </div>

            <div className="form-group">
              <label htmlFor="writer">Writer</label>
              <Field className="form-control" type="text" name="writer" />
              <ErrorMessage name="writer" />
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <Field className="form-control" type="text" name="genre" />
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
        )}
      />
    );
  }
}
