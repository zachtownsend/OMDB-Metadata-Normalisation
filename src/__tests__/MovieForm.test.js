import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import MovieForm, { normaliseData } from '../components/MovieForm';

afterEach(cleanup);

describe('Movie form exists', () => {
  it('has the data-testid tag', () => {
    const { getByTestId } = render(<MovieForm />);

    expect(getByTestId('movie-form')).toBeDefined();
  });
});

describe('Movie form validation', () => {
  it('displays an error message if required fields are not filled in', () => {
    const { getByTestId, queryByText } = render(<MovieForm />);
    const form = getByTestId('movie-form');
    const uuidInput = form.querySelector('input[name="uuid"]');
    const titleInput = form.querySelector('input[name="title"]');
    const dateInput = form.querySelector('input[name="releaseDate"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    fireEvent.change(uuidInput, {
      target: {
        value: '12345',
      },
    });

    fireEvent.change(titleInput, {
      target: {
        value: 'Arthur',
      },
    });

    fireEvent.change(dateInput, {
      target: {
        value: '1994',
      },
    });

    fireEvent.click(submitBtn);

    expect(queryByText('Title is required')).toBeDefined();
    expect(queryByText('Nowtilus ID is required')).toBeDefined();
    expect(queryByText('Release date is required')).toBeDefined();
  });
});

describe('Normalise Data', () => {
  it('populates the missing fields', () => {
    const dummydata = {
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
    };

    const dummyResponse = {
      Title: 'Arthur',
      Year: '2011',
      Rated: 'PG-13',
      Released: '08 Apr 2011',
      Runtime: '110 min',
      Genre: 'Comedy, Romance',
      Director: 'Jason Winer',
      Writer: 'Peter Baynham (screenplay), Steve Gordon (story)',
      Actors: 'Russell Brand, Helen Mirren, Greta Gerwig, Jennifer Garner',
      Plot:
        "A drunken playboy stands to lose a wealthy inheritance when he falls for a woman his family doesn't like.",
      Language: 'English',
      Country: 'USA',
      Awards: '3 wins & 6 nominations.',
      Poster:
        'https://m.media-amazon.com/images/M/MV5BMzMwMTUwMDkwOV5BMl5BanBnXkFtZTcwMjg1MDg0NA@@._V1_SX300.jpg',
      Ratings: [
        {
          Source: 'Internet Movie Database',
          Value: '5.7/10',
        },
        {
          Source: 'Rotten Tomatoes',
          Value: '26%',
        },
        {
          Source: 'Metacritic',
          Value: '36/100',
        },
      ],
      Metascore: '36',
      imdbRating: '5.7',
      imdbVotes: '48,655',
      imdbID: 'tt1334512',
      Type: 'movie',
      DVD: '15 Jul 2011',
      BoxOffice: '$29,200,000',
      Production: 'Warner Bros.',
      Website: 'http://www.arthurthemovie.com/',
      Response: 'True',
    };

    const values = normaliseData(dummydata, dummyResponse);
    expect(values).toEqual({
      uuid: '12345',
      imdbID: 'tt1334512',
      title: 'Arthur',
      synopsis:
        "A drunken playboy stands to lose a wealthy inheritance when he falls for a woman his family doesn't like.",
      releaseDate: '2011',
      studio: 'Warner Bros.',
      ratings: [
        {
          Source: 'Internet Movie Database',
          Value: '5.7/10',
        },
        {
          Source: 'Rotten Tomatoes',
          Value: '26%',
        },
        {
          Source: 'Metacritic',
          Value: '36/100',
        },
      ],
      actors: [
        'Russell Brand',
        'Helen Mirren',
        'Greta Gerwig',
        'Jennifer Garner',
      ],
      director: ['Jason Winer'],
      writer: ['Peter Baynham (screenplay)', 'Steve Gordon (story)'],
      genre: ['Comedy', 'Romance'],
    });
  });
});
